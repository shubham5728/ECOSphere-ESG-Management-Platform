import { useNavigate } from "react-router-dom";
import {
  Target,
  Trees,
  Gift,
  ScrollText,
  Trophy,
  BarChart3,
  Wind,
  Award,
  Calendar,
} from "lucide-react";
import { useAuth } from "../../../store/AuthContext";
import {
  mockEmployeeKpis,
  mockXpProgress,
  mockChallengeCompletion,
  mockMonthlyParticipation,
  mockBadgeProgress,
  mockLeaderboard,
  mockUpcomingEvents,
  CHART_COLORS,
} from "../data/mockData";
import { KpiCard } from "../components/KpiCard";
import { ChartCard } from "../components/ChartCard";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { QuickActions } from "../components/QuickActions";
import { EmissionLineChart } from "../charts/EmissionLineChart";
import { DonutChart } from "../charts/DonutChart";
import { SimpleBarChart } from "../charts/SimpleBarChart";

const QUICK_ACTIONS = [
  { icon: Target, label: "View Challenges", to: "/challenges", color: "#7c3aed" },
  { icon: Trees, label: "CSR Activities", to: "/csr-activities", color: "#16a34a" },
  { icon: Gift, label: "Rewards Store", to: "/rewards-store", color: "#d97706" },
  { icon: ScrollText, label: "Sign Policies", to: "/policy-acknowledgements", color: "#2563eb" },
  { icon: Trophy, label: "Leaderboard", to: "/leaderboard", color: "#0d9488" },
  { icon: BarChart3, label: "ESG Scores", to: "/esg-scores", color: "#ec4899" },
];

export function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const kpis = mockEmployeeKpis;

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Your personal ESG progress dashboard</p>
        </div>
        <button
          onClick={() => navigate("/rewards-store")}
          className="self-start flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
        >
          <Gift size={15} /> Redeem Rewards
        </button>
      </div>

      {/* ── Personal Score Hero ───────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 p-6 text-white shadow-lg">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div className="text-center">
            <div className="text-5xl font-bold">{kpis.myEsgScore}</div>
            <div className="text-sm text-white/70 mt-1">My ESG Score</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{kpis.myXp.toLocaleString()}</div>
            <div className="text-sm text-white/70 mt-1">Total XP</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{kpis.badgesEarned}</div>
            <div className="flex items-center justify-center gap-1 text-sm text-white/70 mt-1">
              <Award size={14} /> Badges Earned
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{kpis.rewardsAvailable}</div>
            <div className="flex items-center justify-center gap-1 text-sm text-white/70 mt-1">
              <Gift size={14} /> Rewards Available
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard icon={Target} iconColor="text-purple-600" label="Joined Challenges" value={kpis.joinedChallenges} accent="bg-purple-50" onClick={() => navigate("/challenges")} />
        <KpiCard icon={Trees} iconColor="text-green-600" label="CSR Completed" value={kpis.csrCompleted} accent="bg-green-50" delta={2} />
        <KpiCard icon={ScrollText} iconColor="text-amber-600" label="Policies Pending" value={kpis.policiesPending} accent="bg-amber-50" onClick={() => navigate("/policy-acknowledgements")} />
        <KpiCard icon={Wind} iconColor="text-teal-600" label="Carbon Savings" value={kpis.carbonSavings.toFixed(1)} unit="kgCO₂e" accent="bg-teal-50" delta={12} deltaLabel="vs last month" />
      </div>

      {/* ── Charts Row 1 ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="XP Progress" subtitle="Cumulative XP earned over time">
          <EmissionLineChart
            data={mockXpProgress}
            dataKey="xp"
            label="XP"
            color={CHART_COLORS[3]}
            unit=""
          />
        </ChartCard>
        <ChartCard title="Challenge Completion" subtitle="Status of your challenge submissions">
          <DonutChart data={mockChallengeCompletion} colors={["#16a34a", "#d97706", "#9ca3af"]} />
        </ChartCard>
      </div>

      {/* ── Monthly Participation ─────────────────────────────────────── */}
      <ChartCard title="Monthly Activity Participation" subtitle="Number of CSR / challenge activities per month">
        <SimpleBarChart
          data={mockMonthlyParticipation}
          xKey="month"
          dataKey="activities"
          label="Activities"
          color={CHART_COLORS[0]}
        />
      </ChartCard>

      {/* ── Badge Progress ────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Badge Progress</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {mockBadgeProgress.map((b, i) => {
            const pct = Math.min(Math.round((b.current / b.target) * 100), 100);
            const color = CHART_COLORS[i % CHART_COLORS.length];
            return (
              <div key={b.badge} className="rounded-xl bg-gray-50 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-800">{b.badge}</span>
                  <span className="text-xs font-semibold text-gray-600">{b.current} / {b.target}</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{pct}% complete</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Leaderboard + Upcoming Events ───────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
              <Trophy size={16} className="text-amber-500" /> Leaderboard
            </h3>
            <button onClick={() => navigate("/leaderboard")} className="text-xs text-green-600 hover:underline">Full board</button>
          </div>
          <LeaderboardTable entries={mockLeaderboard} />
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 mb-4">
            <Calendar size={16} className="text-gray-400" /> Upcoming CSR Events
          </h3>
          <div className="space-y-3">
            {mockUpcomingEvents.filter((e) => e.type === "CSR" || e.type === "Challenge").map((ev) => {
              const EvIcon = ev.type === "CSR" ? Trees : Target;
              return (
              <div key={ev.id} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                <div className="flex-shrink-0 mt-0.5 text-gray-500"><EvIcon size={18} /></div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                  <p className="text-xs text-gray-400">{ev.date} · {ev.dept}</p>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
        <QuickActions actions={QUICK_ACTIONS} />
      </div>

    </div>
  );
}
