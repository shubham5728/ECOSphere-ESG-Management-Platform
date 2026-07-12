import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";
import { createNotification } from "../notifications/notifications.service";

/** Check and award badges based on user stats */
export async function evaluateAndAwardBadges(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      challengeSignups: { where: { status: "APPROVED" } },
      badges: true,
    },
  });
  if (!user) return [];

  const activeBadges = await prisma.badge.findMany({ where: { status: "ACTIVE" } });
  const alreadyUnlocked = new Set(user.badges.map((b) => b.badgeId));
  const newAwards: string[] = [];

  const approvedChallengeCount = user.challengeSignups.length;

  for (const badge of activeBadges) {
    if (alreadyUnlocked.has(badge.id)) continue;

    let qualifies = false;
    if (badge.unlockRule === "XP_THRESHOLD" && user.xp >= badge.threshold) {
      qualifies = true;
    } else if (badge.unlockRule === "CHALLENGE_COUNT" && approvedChallengeCount >= badge.threshold) {
      qualifies = true;
    }

    if (qualifies) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
      newAwards.push(badge.name);
      // Fire notification
      createNotification({
        userId,
        type: "BADGE_AWARDED",
        title: "🏅 Badge Unlocked!",
        message: `Congratulations! You've earned the "${badge.name}" badge.`,
        link: "/leaderboard",
      }).catch(() => {});
    }
  }
  return newAwards;
}

/** Submit challenge participation - validates settings for evidence */
export async function submitChallengeParticipation(
  userId: string,
  data: { challengeId: string; proofUrl?: string; proofNote?: string }
) {
  const challenge = await prisma.challenge.findUnique({ where: { id: data.challengeId } });
  if (!challenge) throw new AppError("Challenge not found", 404);
  if (challenge.status !== "ACTIVE") throw new AppError("Challenge is not active", 400);

  const settings = await prisma.setting.findUnique({ where: { id: 1 } });
  if (settings?.evidenceRequired && !data.proofUrl && !data.proofNote) {
    throw new AppError("Proof of completion is required by admin settings", 400);
  }

  const signup = await prisma.challengeParticipation.upsert({
    where: { challengeId_userId: { challengeId: data.challengeId, userId } },
    update: {
      proofUrl: data.proofUrl || null,
      proofNote: data.proofNote || null,
      status: "PENDING",
    },
    create: {
      challengeId: data.challengeId,
      userId,
      proofUrl: data.proofUrl || null,
      proofNote: data.proofNote || null,
    },
  });

  return signup;
}

/** Review challenge participation - awards rewards and triggers badge checks */
export async function reviewChallengeParticipation(
  participationId: string,
  data: { status: "APPROVED" | "REJECTED"; reviewNote?: string }
) {
  const participation = await prisma.challengeParticipation.findUnique({
    where: { id: participationId },
    include: { challenge: true },
  });
  if (!participation) throw new AppError("Participation not found", 404);
  if (participation.status !== "PENDING") {
    throw new AppError("Participation has already been reviewed", 400);
  }

  const xpAwarded = data.status === "APPROVED" ? participation.challenge.xpReward : 0;
  const pointsAwarded = data.status === "APPROVED" ? participation.challenge.pointsReward : 0;

  const [updated] = await prisma.$transaction([
    prisma.challengeParticipation.update({
      where: { id: participationId },
      data: {
        status: data.status,
        reviewNote: data.reviewNote,
        reviewedAt: new Date(),
      },
    }),
    ...(data.status === "APPROVED"
      ? [
          prisma.user.update({
            where: { id: participation.userId },
            data: {
              xp: { increment: xpAwarded },
              points: { increment: pointsAwarded },
            },
          }),
        ]
      : []),
  ]);

  let newBadges: string[] = [];
  if (data.status === "APPROVED") {
    newBadges = await evaluateAndAwardBadges(participation.userId);
    createNotification({
      userId: participation.userId,
      type: "CHALLENGE_APPROVED",
      title: "✅ Challenge Approved!",
      message: `Your submission for "${participation.challenge.title}" was approved. You earned ${xpAwarded} XP and ${pointsAwarded} points!`,
      link: "/challenges",
    }).catch(() => {});
  } else {
    createNotification({
      userId: participation.userId,
      type: "CHALLENGE_REJECTED",
      title: "❌ Challenge Rejected",
      message: `Your submission for "${participation.challenge.title}" was not approved.${
        data.reviewNote ? ` Note: ${data.reviewNote}` : ""
      }`,
      link: "/challenges",
    }).catch(() => {});
  }

  return { updated, newBadges };
}

/** Redeem points for rewards - handles inventory stock check */
export async function redeemReward(userId: string, rewardId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);

  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!reward) throw new AppError("Reward not found", 404);
  if (reward.status !== "ACTIVE") throw new AppError("Reward is inactive", 400);
  if (reward.stock <= 0) throw new AppError("Reward out of stock", 400);
  if (user.points < reward.pointsRequired) {
    throw new AppError(`Insufficient points. Requires ${reward.pointsRequired} points.`, 400);
  }

  const [redemption] = await prisma.$transaction([
    prisma.rewardRedemption.create({
      data: {
        userId,
        rewardId,
        pointsSpent: reward.pointsRequired,
      },
    }),
    prisma.reward.update({
      where: { id: rewardId },
      data: { stock: { decrement: 1 } },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { points: { decrement: reward.pointsRequired } },
    }),
  ]);

  createNotification({
    userId,
    type: "REWARD_REDEEMED",
    title: "🎁 Reward Redeemed!",
    message: `You have redeemed "${reward.name}" for ${reward.pointsRequired} points. Enjoy!`,
    link: "/rewards-store",
  }).catch(() => {});

  return redemption;
}

/** Renders leaderboards for both departments and employees */
export async function getLeaderboards() {
  const [employeeLeaderboard, departments] = await Promise.all([
    prisma.user.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ xp: "desc" }, { points: "desc" }],
      select: { id: true, name: true, xp: true, points: true, department: { select: { name: true } } },
      take: 20,
    }),
    prisma.department.findMany({
      where: { status: "ACTIVE" },
      include: {
        members: { select: { xp: true, points: true } },
      },
    }),
  ]);

  // Aggregate department total scores
  const deptLeaderboard = departments
    .map((dept) => {
      const totalXp = dept.members.reduce((acc, m) => acc + m.xp, 0);
      const totalPoints = dept.members.reduce((acc, m) => acc + m.points, 0);
      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        totalXp,
        totalPoints,
      };
    })
    .sort((a, b) => b.totalXp - a.totalXp);

  return {
    employees: employeeLeaderboard,
    departments: deptLeaderboard,
  };
}
