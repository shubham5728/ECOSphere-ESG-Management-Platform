import { api } from "./client";

export interface LeaderRow {
  rank: number;
  name: string;
  dept: string;
  xp: number;
  points: number;
  badges: number;
}
export interface EventRow {
  id: string;
  title: string;
  date: string;
  dept: string;
  type: string;
}
export interface ActivityRow {
  id: string;
  text: string;
  sub: string;
  time: string;
  color: string;
}

export interface AdminOverview {
  role: "ADMIN";
  kpis: {
    esgScore: number; envScore: number; socialScore: number; govScore: number;
    totalDepartments: number; totalEmployees: number; activeCsr: number;
    activeChallenges: number; totalEmissions: number; complianceIssues: number; pendingPolicies: number;
  };
  radar: { subject: string; score: number; fullMark: number }[];
  deptEsg: { dept: string; env: number; social: number; gov: number }[];
  monthlyEmissions: { month: string; emissions: number }[];
  csrByDept: { dept: string; count: number }[];
  challengeParticipation: { name: string; value: number }[];
  badgeDistribution: { name: string; value: number }[];
  complianceBySeverity: { severity: string; count: number }[];
  deptRanking: { dept: string; score: number }[];
  activityFeed: ActivityRow[];
  leaderboard: LeaderRow[];
  upcomingEvents: EventRow[];
}

export interface ManagerOverview {
  role: "MANAGER";
  deptName: string;
  kpis: {
    deptEsgScore: number; deptEmissions: number; pendingApprovals: number;
    csrParticipation: number; activeChallenges: number; goalCompletion: number;
  };
  deptEsgTrend: { month: string; score: number }[];
  csrStatus: { name: string; value: number }[];
  teamParticipation: { name: string; challenges: number; csr: number }[];
  goalProgress: { goal: string; progress: number; status: string }[];
  upcomingEvents: EventRow[];
}

export interface EmployeeOverview {
  role: "EMPLOYEE";
  userName: string;
  kpis: {
    myEsgScore: number; myXp: number; badgesEarned: number; rewardsAvailable: number;
    joinedChallenges: number; csrCompleted: number; policiesPending: number; carbonSavings: number;
  };
  xpProgress: { month: string; xp: number }[];
  challengeCompletion: { name: string; value: number }[];
  monthlyParticipation: { month: string; activities: number }[];
  badgeProgress: { badge: string; current: number; target: number }[];
  leaderboard: LeaderRow[];
  upcomingEvents: EventRow[];
}

export type Overview = AdminOverview | ManagerOverview | EmployeeOverview;

export async function getOverview(): Promise<Overview> {
  const { data } = await api.get("/dashboard/overview");
  return data.data;
}
