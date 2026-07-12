import { prisma } from "../../lib/prisma";
import { calculateEsgScores } from "../scoring/scoring.service";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const keyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

/** Build ordered month buckets for the last `n` months (oldest → newest). */
function monthBuckets(n: number) {
  const now = new Date();
  const buckets: { key: string; label: string; value: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: keyOf(d), label: MONTHS[d.getMonth()], value: 0 });
  }
  return buckets;
}

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

const NOTIF_META: Record<string, { sub: string; color: string }> = {
  BADGE_AWARDED: { sub: "Gamification", color: "#16a34a" },
  CHALLENGE_APPROVED: { sub: "Challenges", color: "#0d9488" },
  CHALLENGE_REJECTED: { sub: "Challenges", color: "#dc2626" },
  CHALLENGE_CLOSED: { sub: "Challenges", color: "#7c3aed" },
  COMPLIANCE_OVERDUE: { sub: "Governance", color: "#dc2626" },
  REWARD_REDEEMED: { sub: "Rewards", color: "#d97706" },
  GENERAL: { sub: "General", color: "#2563eb" },
};

/** Upcoming events derived from challenges, CSR activities, compliance & audits. */
async function upcomingEvents() {
  const now = new Date();
  const [challenges, csr, issues] = await Promise.all([
    prisma.challenge.findMany({ where: { endDate: { gte: now } }, orderBy: { endDate: "asc" }, take: 3 }),
    prisma.csrActivity.findMany({ where: { startDate: { gte: now } }, orderBy: { startDate: "asc" }, take: 2 }),
    prisma.complianceIssue.findMany({ where: { status: { not: "RESOLVED" }, dueDate: { gte: now } }, orderBy: { dueDate: "asc" }, take: 2, include: { department: true } }),
  ]);
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const events = [
    ...challenges.map((c) => ({ id: c.id, title: c.title, date: fmt(c.endDate), dept: "All Departments", type: "Challenge" })),
    ...csr.map((c) => ({ id: c.id, title: c.title, date: fmt(c.startDate), dept: c.location ?? "—", type: "CSR" })),
    ...issues.map((i) => ({ id: i.id, title: i.title, date: fmt(i.dueDate), dept: i.department.name, type: "Governance" })),
  ];
  return events.slice(0, 5);
}

async function leaderboardTop(limit = 5) {
  const users = await prisma.user.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ xp: "desc" }, { points: "desc" }],
    take: limit,
    include: { department: { select: { name: true } }, _count: { select: { badges: true } } },
  });
  return users.map((u, i) => ({
    rank: i + 1,
    name: u.name,
    dept: u.department?.name ?? "Unassigned",
    xp: u.xp,
    points: u.points,
    badges: u._count.badges,
  }));
}

// ══════════════════════════════════════════════════════════
// ADMIN
// ══════════════════════════════════════════════════════════
export async function getAdminOverview() {
  const scores = await calculateEsgScores();

  const [
    totalDepartments,
    totalEmployees,
    activeCsr,
    activeChallenges,
    emissionsAgg,
    openIssues,
    activePolicies,
    totalAcks,
    carbonTx,
    approvedParts,
    challengeParts,
    userBadges,
    issuesBySeverity,
    recentNotifs,
  ] = await Promise.all([
    prisma.department.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.csrActivity.count({ where: { status: "ACTIVE" } }),
    prisma.challenge.count({ where: { status: "ACTIVE" } }),
    prisma.carbonTransaction.aggregate({ _sum: { emissions: true } }),
    prisma.complianceIssue.count({ where: { status: { not: "RESOLVED" } } }),
    prisma.eSGPolicy.count({ where: { status: "ACTIVE" } }),
    prisma.policyAcknowledgement.count(),
    prisma.carbonTransaction.findMany({ select: { emissions: true, recordedAt: true } }),
    prisma.participation.findMany({ where: { status: "APPROVED" }, include: { csrActivity: { select: { departmentId: true } } } }),
    prisma.challengeParticipation.findMany({ select: { status: true, userId: true } }),
    prisma.userBadge.findMany({ include: { badge: { select: { name: true } } } }),
    prisma.complianceIssue.groupBy({ by: ["severity"], _count: { id: true } }),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 7 }),
  ]);

  // Monthly emissions (real, last 8 months)
  const emBuckets = monthBuckets(8);
  const emIndex = new Map(emBuckets.map((b) => [b.key, b]));
  for (const tx of carbonTx) {
    const b = emIndex.get(keyOf(tx.recordedAt));
    if (b) b.value += tx.emissions;
  }
  const monthlyEmissions = emBuckets.map((b) => ({ month: b.label, emissions: Math.round(b.value) }));

  // CSR participation count by department (approved)
  const deptNameById = new Map(scores.departments.map((d) => [d.id, d.name]));
  const csrCount = new Map<string, number>();
  for (const p of approvedParts) {
    const dId = p.csrActivity.departmentId;
    if (!dId) continue;
    csrCount.set(dId, (csrCount.get(dId) ?? 0) + 1);
  }
  const csrByDept = [...csrCount.entries()].map(([id, count]) => ({ dept: deptNameById.get(id) ?? "—", count }));

  // Challenge participation split
  const cpApproved = challengeParts.filter((c) => c.status === "APPROVED").length;
  const cpPending = challengeParts.filter((c) => c.status === "PENDING").length;
  const cpRejected = challengeParts.filter((c) => c.status === "REJECTED").length;
  const joinedUsers = new Set(challengeParts.map((c) => c.userId)).size;
  const challengeParticipation = [
    { name: "Approved", value: cpApproved },
    { name: "Pending", value: cpPending },
    { name: "Rejected", value: cpRejected },
    { name: "Not Joined", value: Math.max(0, totalEmployees - joinedUsers) },
  ].filter((x) => x.value > 0);

  // Badge distribution
  const badgeCount = new Map<string, number>();
  for (const ub of userBadges) badgeCount.set(ub.badge.name, (badgeCount.get(ub.badge.name) ?? 0) + 1);
  const badgeDistribution = [...badgeCount.entries()].map(([name, value]) => ({ name, value }));

  // Compliance by severity
  const sevOrder = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const complianceBySeverity = sevOrder.map((sev) => ({
    severity: sev.charAt(0) + sev.slice(1).toLowerCase(),
    count: issuesBySeverity.find((s) => s.severity === sev)?._count.id ?? 0,
  }));

  // Engagement + compliance proxies for the radar
  const engagement = totalEmployees > 0 ? Math.min(100, Math.round((joinedUsers / totalEmployees) * 100)) : 0;
  const complianceScore = Math.max(0, 100 - openIssues * 8);

  return {
    role: "ADMIN",
    kpis: {
      esgScore: scores.company.totalScore,
      envScore: scores.company.envScore,
      socialScore: scores.company.socialScore,
      govScore: scores.company.govScore,
      totalDepartments,
      totalEmployees,
      activeCsr,
      activeChallenges,
      totalEmissions: emissionsAgg._sum.emissions ?? 0,
      complianceIssues: openIssues,
      pendingPolicies: Math.max(0, activePolicies * totalEmployees - totalAcks),
    },
    radar: [
      { subject: "Environmental", score: scores.company.envScore, fullMark: 100 },
      { subject: "Social", score: scores.company.socialScore, fullMark: 100 },
      { subject: "Governance", score: scores.company.govScore, fullMark: 100 },
      { subject: "Engagement", score: engagement, fullMark: 100 },
      { subject: "Compliance", score: complianceScore, fullMark: 100 },
    ],
    deptEsg: scores.departments.map((d) => ({ dept: d.name, env: d.envScore, social: d.socialScore, gov: d.govScore })),
    monthlyEmissions,
    csrByDept,
    challengeParticipation,
    badgeDistribution,
    complianceBySeverity,
    deptRanking: [...scores.departments].sort((a, b) => b.totalScore - a.totalScore).map((d) => ({ dept: d.name, score: d.totalScore })),
    activityFeed: recentNotifs.map((n) => ({
      id: n.id,
      text: n.title + " — " + n.message,
      sub: (NOTIF_META[n.type] ?? NOTIF_META.GENERAL).sub,
      time: timeAgo(n.createdAt),
      color: (NOTIF_META[n.type] ?? NOTIF_META.GENERAL).color,
    })),
    leaderboard: await leaderboardTop(5),
    upcomingEvents: await upcomingEvents(),
  };
}

// ══════════════════════════════════════════════════════════
// MANAGER (scoped to their department)
// ══════════════════════════════════════════════════════════
export async function getManagerOverview(userId: string) {
  const me = await prisma.user.findUnique({ where: { id: userId }, include: { department: true } });
  const scores = await calculateEsgScores();
  const deptId = me?.departmentId ?? null;
  const deptScore = scores.departments.find((d) => d.id === deptId);

  const [members, deptCarbon, activeChallenges, goals] = await Promise.all([
    prisma.user.findMany({ where: { departmentId: deptId ?? undefined, status: "ACTIVE" }, select: { id: true, name: true } }),
    prisma.carbonTransaction.findMany({ where: { departmentId: deptId ?? undefined }, select: { emissions: true, recordedAt: true } }),
    prisma.challenge.count({ where: { status: "ACTIVE" } }),
    prisma.environmentalGoal.findMany({ where: { departmentId: deptId ?? undefined } }),
  ]);
  const memberIds = members.map((m) => m.id);

  const [pendingCsr, pendingChallenge, approvedCsr, approvedChallenge, csrActivities] = await Promise.all([
    prisma.participation.count({ where: { status: "PENDING", userId: { in: memberIds } } }),
    prisma.challengeParticipation.count({ where: { status: "PENDING", userId: { in: memberIds } } }),
    prisma.participation.findMany({ where: { status: "APPROVED", userId: { in: memberIds } }, select: { userId: true } }),
    prisma.challengeParticipation.findMany({ where: { status: "APPROVED", userId: { in: memberIds } }, select: { userId: true } }),
    prisma.csrActivity.findMany({ where: { departmentId: deptId ?? undefined }, select: { startDate: true, endDate: true } }),
  ]);

  const deptEmissions = deptCarbon.reduce((a, t) => a + t.emissions, 0);
  const participatingMembers = new Set(approvedCsr.map((p) => p.userId)).size;
  const csrParticipation = memberIds.length > 0 ? Math.round((participatingMembers / memberIds.length) * 100) : 0;
  const goalCompletion = goals.length > 0
    ? Math.round(goals.reduce((a, g) => a + Math.min(100, g.targetValue > 0 ? (g.currentValue / g.targetValue) * 100 : 0), 0) / goals.length)
    : 0;

  // Dept ESG trend proxy: monthly env score from that month's dept emissions
  const trendBuckets = monthBuckets(7);
  const trendIndex = new Map(trendBuckets.map((b) => [b.key, b]));
  for (const t of deptCarbon) {
    const b = trendIndex.get(keyOf(t.recordedAt));
    if (b) b.value += t.emissions;
  }
  const deptEsgTrend = trendBuckets.map((b) => ({ month: b.label, score: Math.max(20, Math.round(100 - b.value / 500)) }));

  // CSR status split from activity dates
  const now = new Date();
  let completed = 0, ongoing = 0, planned = 0;
  for (const a of csrActivities) {
    if (a.startDate > now) planned++;
    else if (a.endDate && a.endDate < now) completed++;
    else ongoing++;
  }
  const csrStatus = [
    { name: "Completed", value: completed },
    { name: "Ongoing", value: ongoing },
    { name: "Planned", value: planned },
  ].filter((x) => x.value > 0);

  // Team participation per member
  const csrByUser = new Map<string, number>();
  approvedCsr.forEach((p) => csrByUser.set(p.userId, (csrByUser.get(p.userId) ?? 0) + 1));
  const chByUser = new Map<string, number>();
  approvedChallenge.forEach((p) => chByUser.set(p.userId, (chByUser.get(p.userId) ?? 0) + 1));
  const teamParticipation = members.slice(0, 8).map((m) => ({
    name: m.name.split(" ")[0],
    challenges: chByUser.get(m.id) ?? 0,
    csr: csrByUser.get(m.id) ?? 0,
  }));

  const goalProgress = goals.map((g) => {
    const progress = g.targetValue > 0 ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : 0;
    return { goal: g.title, progress, status: g.status };
  });

  return {
    role: "MANAGER",
    deptName: me?.department?.name ?? "Your Department",
    kpis: {
      deptEsgScore: deptScore?.totalScore ?? 0,
      deptEmissions: Math.round(deptEmissions),
      pendingApprovals: pendingCsr + pendingChallenge,
      csrParticipation,
      activeChallenges,
      goalCompletion,
    },
    deptEsgTrend,
    csrStatus,
    teamParticipation,
    goalProgress,
    upcomingEvents: await upcomingEvents(),
  };
}

// ══════════════════════════════════════════════════════════
// EMPLOYEE (personal)
// ══════════════════════════════════════════════════════════
export async function getEmployeeOverview(userId: string) {
  const me = await prisma.user.findUnique({ where: { id: userId } });
  const scores = await calculateEsgScores();
  const deptScore = scores.departments.find((d) => d.id === me?.departmentId);

  const [badgesEarned, activeRewards, myParts, myChallengeParts, activePolicies, myAcks] = await Promise.all([
    prisma.userBadge.count({ where: { userId } }),
    prisma.reward.count({ where: { status: "ACTIVE", stock: { gt: 0 } } }),
    prisma.participation.findMany({ where: { userId }, select: { status: true, xpAwarded: true, submittedAt: true, reviewedAt: true } }),
    prisma.challengeParticipation.findMany({ where: { userId }, include: { challenge: { select: { xpReward: true } } } }),
    prisma.eSGPolicy.count({ where: { status: "ACTIVE" } }),
    prisma.policyAcknowledgement.count({ where: { userId } }),
  ]);

  const csrCompleted = myParts.filter((p) => p.status === "APPROVED").length;
  const joinedChallenges = myChallengeParts.length;

  // Cumulative XP by month (real, from awarded XP)
  const xpBuckets = monthBuckets(7);
  const xpIndex = new Map(xpBuckets.map((b) => [b.key, b]));
  myParts.filter((p) => p.status === "APPROVED" && p.reviewedAt).forEach((p) => {
    const b = xpIndex.get(keyOf(p.reviewedAt!));
    if (b) b.value += p.xpAwarded;
  });
  myChallengeParts.filter((c) => c.status === "APPROVED").forEach((c) => {
    const b = xpIndex.get(keyOf(new Date()));
    if (b) b.value += c.challenge.xpReward;
  });
  let cumulative = 0;
  const xpProgress = xpBuckets.map((b) => { cumulative += b.value; return { month: b.label, xp: cumulative }; });

  // Monthly participation counts
  const partBuckets = monthBuckets(7);
  const partIndex = new Map(partBuckets.map((b) => [b.key, b]));
  myParts.forEach((p) => { const b = partIndex.get(keyOf(p.submittedAt)); if (b) b.value += 1; });
  const monthlyParticipation = partBuckets.map((b) => ({ month: b.label, activities: b.value }));

  const challengeCompletion = [
    { name: "Approved", value: myChallengeParts.filter((c) => c.status === "APPROVED").length },
    { name: "Pending", value: myChallengeParts.filter((c) => c.status === "PENDING").length },
    { name: "Rejected", value: myChallengeParts.filter((c) => c.status === "REJECTED").length },
  ].filter((x) => x.value > 0);

  // Badge progress
  const badges = await prisma.badge.findMany({ where: { status: "ACTIVE" } });
  const approvedChallengeCount = myChallengeParts.filter((c) => c.status === "APPROVED").length;
  const badgeProgress = badges.slice(0, 4).map((b) => ({
    badge: b.name,
    current: b.unlockRule === "XP_THRESHOLD" ? (me?.xp ?? 0) : approvedChallengeCount,
    target: b.threshold,
  }));

  return {
    role: "EMPLOYEE",
    userName: me?.name ?? "",
    kpis: {
      myEsgScore: deptScore?.totalScore ?? scores.company.totalScore,
      myXp: me?.xp ?? 0,
      badgesEarned,
      rewardsAvailable: activeRewards,
      joinedChallenges,
      csrCompleted,
      policiesPending: Math.max(0, activePolicies - myAcks),
      carbonSavings: Math.round((me?.points ?? 0) * 0.12 * 10) / 10, // proxy from points
    },
    xpProgress,
    challengeCompletion,
    monthlyParticipation,
    badgeProgress,
    leaderboard: await leaderboardTop(5),
    upcomingEvents: await upcomingEvents(),
  };
}
