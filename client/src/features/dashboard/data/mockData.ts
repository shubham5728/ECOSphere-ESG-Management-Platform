// ─────────────────────────────────────────────────────────────────────────────
// EcoSphere Dashboard — Typed mock data
// All fetch* functions return Promises so they can be swapped for real API calls
// ─────────────────────────────────────────────────────────────────────────────

export const CHART_COLORS = [
  "#16a34a", "#0d9488", "#2563eb", "#7c3aed", "#d97706", "#dc2626", "#ec4899",
];

// ─── Admin KPIs ──────────────────────────────────────────────────────────────
export interface AdminKpis {
  esgScore: number;
  envScore: number;
  socialScore: number;
  govScore: number;
  totalDepartments: number;
  totalEmployees: number;
  activeCsr: number;
  activeChallenges: number;
  totalEmissions: number;
  complianceIssues: number;
  pendingPolicies: number;
}

export const mockAdminKpis: AdminKpis = {
  esgScore: 74,
  envScore: 71,
  socialScore: 78,
  govScore: 73,
  totalDepartments: 8,
  totalEmployees: 142,
  activeCsr: 12,
  activeChallenges: 6,
  totalEmissions: 4820.5,
  complianceIssues: 5,
  pendingPolicies: 18,
};

// ─── Manager KPIs ────────────────────────────────────────────────────────────
export interface ManagerKpis {
  deptEsgScore: number;
  deptEmissions: number;
  pendingApprovals: number;
  csrParticipation: number;
  activeChallenges: number;
  goalCompletion: number;
}

export const mockManagerKpis: ManagerKpis = {
  deptEsgScore: 68,
  deptEmissions: 612.4,
  pendingApprovals: 4,
  csrParticipation: 73,
  activeChallenges: 3,
  goalCompletion: 61,
};

// ─── Employee KPIs ───────────────────────────────────────────────────────────
export interface EmployeeKpis {
  myEsgScore: number;
  myXp: number;
  badgesEarned: number;
  rewardsAvailable: number;
  joinedChallenges: number;
  csrCompleted: number;
  policiesPending: number;
  carbonSavings: number;
}

export const mockEmployeeKpis: EmployeeKpis = {
  myEsgScore: 82,
  myXp: 1340,
  badgesEarned: 5,
  rewardsAvailable: 3,
  joinedChallenges: 4,
  csrCompleted: 7,
  policiesPending: 2,
  carbonSavings: 48.2,
};

// ─── Chart Data ──────────────────────────────────────────────────────────────
export const mockRadarData = [
  { subject: "Environmental", score: 71, fullMark: 100 },
  { subject: "Social", score: 78, fullMark: 100 },
  { subject: "Governance", score: 73, fullMark: 100 },
  { subject: "Engagement", score: 80, fullMark: 100 },
  { subject: "Compliance", score: 69, fullMark: 100 },
];

export const mockDeptEsgData = [
  { dept: "Engineering", env: 68, social: 75, gov: 70 },
  { dept: "Operations", env: 55, social: 70, gov: 65 },
  { dept: "HR", env: 80, social: 90, gov: 85 },
  { dept: "Finance", env: 72, social: 68, gov: 80 },
  { dept: "Marketing", env: 78, social: 82, gov: 74 },
  { dept: "IT", env: 74, social: 76, gov: 72 },
];

export const mockMonthlyEmissions = [
  { month: "Jan", emissions: 520 },
  { month: "Feb", emissions: 480 },
  { month: "Mar", emissions: 610 },
  { month: "Apr", emissions: 545 },
  { month: "May", emissions: 490 },
  { month: "Jun", emissions: 530 },
  { month: "Jul", emissions: 410 },
  { month: "Aug", emissions: 395 },
  { month: "Sep", emissions: 440 },
  { month: "Oct", emissions: 465 },
  { month: "Nov", emissions: 500 },
  { month: "Dec", emissions: 435 },
];

export const mockCsrByDept = [
  { dept: "Engineering", count: 18 },
  { dept: "Operations", count: 12 },
  { dept: "HR", count: 25 },
  { dept: "Finance", count: 9 },
  { dept: "Marketing", count: 22 },
  { dept: "IT", count: 16 },
];

export const mockChallengeParticipation = [
  { name: "Approved", value: 48 },
  { name: "Pending", value: 22 },
  { name: "Rejected", value: 8 },
  { name: "Not Joined", value: 64 },
];

export const mockBadgeDistribution = [
  { name: "Green Pioneer", value: 32 },
  { name: "CSR Champion", value: 24 },
  { name: "Eco Warrior", value: 18 },
  { name: "Compliance Star", value: 15 },
  { name: "Challenge Master", value: 11 },
];

export const mockComplianceIssues = [
  { severity: "Critical", count: 1 },
  { severity: "High", count: 2 },
  { severity: "Medium", count: 8 },
  { severity: "Low", count: 14 },
];

export const mockDeptRanking = [
  { dept: "HR", score: 85 },
  { dept: "Marketing", score: 78 },
  { dept: "IT", score: 74 },
  { dept: "Engineering", score: 71 },
  { dept: "Finance", score: 73 },
  { dept: "Operations", score: 63 },
];

// ─── Manager charts ──────────────────────────────────────────────────────────
export const mockDeptEsgTrend = [
  { month: "Jan", score: 60 },
  { month: "Feb", score: 63 },
  { month: "Mar", score: 61 },
  { month: "Apr", score: 65 },
  { month: "May", score: 68 },
  { month: "Jun", score: 66 },
  { month: "Jul", score: 71 },
];

export const mockTeamParticipation = [
  { name: "Alice", challenges: 4, csr: 6 },
  { name: "Bob", challenges: 2, csr: 3 },
  { name: "Carol", challenges: 5, csr: 8 },
  { name: "David", challenges: 3, csr: 4 },
  { name: "Eva", challenges: 6, csr: 7 },
];

export const mockGoalProgress = [
  { goal: "Reduce Carbon 20%", progress: 72, status: "ON_TRACK" },
  { goal: "100% Policy Coverage", progress: 85, status: "ON_TRACK" },
  { goal: "CSR Hrs Target", progress: 54, status: "AT_RISK" },
  { goal: "Zero Critical Issues", progress: 90, status: "ON_TRACK" },
];

export const mockCsrStatus = [
  { name: "Completed", value: 14 },
  { name: "Ongoing", value: 7 },
  { name: "Planned", value: 5 },
];

// ─── Employee charts ─────────────────────────────────────────────────────────
export const mockXpProgress = [
  { month: "Jan", xp: 200 },
  { month: "Feb", xp: 320 },
  { month: "Mar", xp: 410 },
  { month: "Apr", xp: 520 },
  { month: "May", xp: 680 },
  { month: "Jun", xp: 820 },
  { month: "Jul", xp: 1340 },
];

export const mockChallengeCompletion = [
  { name: "Completed", value: 7 },
  { name: "In Progress", value: 3 },
  { name: "Not Started", value: 2 },
];

export const mockMonthlyParticipation = [
  { month: "Jan", activities: 1 },
  { month: "Feb", activities: 2 },
  { month: "Mar", activities: 1 },
  { month: "Apr", activities: 3 },
  { month: "May", activities: 2 },
  { month: "Jun", activities: 4 },
  { month: "Jul", activities: 3 },
];

export const mockBadgeProgress = [
  { badge: "Green Pioneer", current: 1340, target: 1500 },
  { badge: "CSR Champion", current: 7, target: 10 },
  { badge: "Eco Warrior", current: 48, target: 60 },
  { badge: "Challenge Master", current: 7, target: 10 },
];

// ─── Activity Feed ───────────────────────────────────────────────────────────
export interface ActivityItem {
  id: string;
  icon: string;
  text: string;
  sub: string;
  time: string;
  color: string;
}

export const mockActivityFeed: ActivityItem[] = [
  { id: "1", icon: "🏅", text: "Alice earned the Green Pioneer badge", sub: "Gamification", time: "2 min ago", color: "#16a34a" },
  { id: "2", icon: "⚠️", text: "Critical compliance issue raised in Finance", sub: "Governance", time: "18 min ago", color: "#dc2626" },
  { id: "3", icon: "✅", text: "Bob's challenge submission approved", sub: "Challenges", time: "1 hr ago", color: "#0d9488" },
  { id: "4", icon: "🌳", text: "New CSR Activity: Tree Planting Drive", sub: "CSR", time: "3 hr ago", color: "#16a34a" },
  { id: "5", icon: "📜", text: "HR Policy updated — 8 pending sign-offs", sub: "Governance", time: "5 hr ago", color: "#7c3aed" },
  { id: "6", icon: "🎁", text: "Carol redeemed Eco Water Bottle reward", sub: "Rewards", time: "Yesterday", color: "#d97706" },
  { id: "7", icon: "🏭", text: "Operations logged 210 kgCO₂e emissions", sub: "Environmental", time: "Yesterday", color: "#2563eb" },
];

// ─── Leaderboard ─────────────────────────────────────────────────────────────
export interface LeaderEntry {
  rank: number;
  name: string;
  dept: string;
  xp: number;
  points: number;
  badges: number;
}

export const mockLeaderboard: LeaderEntry[] = [
  { rank: 1, name: "Carol Singh", dept: "HR", xp: 2840, points: 3200, badges: 8 },
  { rank: 2, name: "Eva Patel", dept: "Marketing", xp: 2610, points: 2900, badges: 7 },
  { rank: 3, name: "Alice Chen", dept: "IT", xp: 2340, points: 2700, badges: 6 },
  { rank: 4, name: "David Kumar", dept: "Engineering", xp: 1980, points: 2100, badges: 5 },
  { rank: 5, name: "Bob Sharma", dept: "Finance", xp: 1720, points: 1900, badges: 4 },
];

// ─── Upcoming Events ─────────────────────────────────────────────────────────
export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  dept: string;
  type: string;
}

export const mockUpcomingEvents: UpcomingEvent[] = [
  { id: "1", title: "Tree Planting Drive", date: "Jul 15, 2026", dept: "All Departments", type: "CSR" },
  { id: "2", title: "Carbon Audit Q3", date: "Jul 20, 2026", dept: "Operations", type: "Audit" },
  { id: "3", title: "Policy Acknowledgement Deadline", date: "Jul 25, 2026", dept: "All Departments", type: "Governance" },
  { id: "4", title: "Zero-Waste Challenge End", date: "Jul 31, 2026", dept: "Engineering", type: "Challenge" },
];
