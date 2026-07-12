import { useNavigate } from "react-router-dom";
import {
  mockManagerKpis,
  mockDeptEsgTrend,
  mockTeamParticipation,
  mockGoalProgress,
  mockCsrStatus,
  mockActivityFeed,
  mockUpcomingEvents,
  CHART_COLORS,
} from "../data/mockData";
import { KpiCard } from "../components/KpiCard";
import { ChartCard } from "../components/ChartCard";
import { ActivityFeed } from "../components/ActivityFeed";
import { GoalProgressCards } from "../components/GoalProgressCards";
import { QuickActions } from "../components/QuickActions";
import { EmissionLineChart } from "../charts/EmissionLineChart";
import { DonutChart } from "../charts/DonutChart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

const QUICK_ACTIONS = [
  { icon: "📝", label: "Log Activity", to: "/operations", color: "#16a34a" },
  { icon: "🌳", label: "CSR Activities", to: "/csr-activities", color: "#0d9488" },
  { icon: "✅", label: "Review Submissions", to: "/participations", color: "#2563eb" },
  { icon: "📋", label: "Carbon Ledger", to: "/carbon-ledger", color: "#7c3aed" },
  { icon: "⚖️", label: "Compliance Issues", to: "/compliance-issues", color: "#d97706" },
  { icon: "📊", label: "Social Metrics", to: "/social-metrics", color: "#ec4899" },
  { icon: "📜", label: "Policy Sign-off", to: "/policy-acknowledgements", color: "#6366f1" },
  { icon: "🔍", label: "Audit Logs", to: "/audits", color: "#14b8a6" },
];

export function ManagerDashboard() {
  const navigate = useNavigate();
  const kpis = mockManagerKpis;

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Department performance & team overview</p>
        </div>
        <button
          onClick={() => navigate("/esg-scores")}
          className="self-start rounded-lg bg-teal-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
        >
          View ESG Scores →
        </button>
      </div>

      {/* ── Department ESG Score hero ─────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-blue-600 p-6 text-white shadow-lg">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 items-center">
          <div className="text-center">
            <div className="text-5xl font-bold">{kpis.deptEsgScore}</div>
            <div className="text-sm text-white/70 mt-1">Department ESG Score</div>
            <div className="mt-2 h-1.5 w-24 mx-auto rounded-full bg-white/20 overflow-hidden">
              <div className="h-1.5 rounded-full bg-white/80" style={{ width: `${kpis.deptEsgScore}%` }} />
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{kpis.csrParticipation}%</div>
            <div className="text-sm text-white/70 mt-1">CSR Participation Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{kpis.goalCompletion}%</div>
            <div className="text-sm text-white/70 mt-1">Goal Completion</div>
          </div>
        </div>
      </div>

      {/* ── KPIs ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard icon="⭐" label="Dept ESG Score" value={kpis.deptEsgScore} unit="/ 100" accent="bg-teal-50" delta={3} />
        <KpiCard icon="🏭" label="Dept Emissions" value={kpis.deptEmissions.toFixed(0)} unit="kgCO₂e" accent="bg-red-50" delta={-4} />
        <KpiCard icon="📋" label="Pending Approvals" value={kpis.pendingApprovals} accent="bg-amber-50" onClick={() => navigate("/participations")} />
        <KpiCard icon="🌳" label="CSR Participation" value={`${kpis.csrParticipation}%`} accent="bg-green-50" />
        <KpiCard icon="🎯" label="Active Challenges" value={kpis.activeChallenges} accent="bg-purple-50" onClick={() => navigate("/challenges")} />
        <KpiCard icon="📈" label="Goal Completion" value={`${kpis.goalCompletion}%`} accent="bg-blue-50" />
      </div>

      {/* ── Charts Row 1 ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Monthly Dept ESG Trend" subtitle="Department score over last 7 months">
          <EmissionLineChart
            data={mockDeptEsgTrend}
            dataKey="score"
            label="ESG Score"
            color={CHART_COLORS[1]}
            unit=""
          />
        </ChartCard>

        <ChartCard title="CSR Activity Status" subtitle="Activity breakdown by status">
          <DonutChart data={mockCsrStatus} colors={["#16a34a", "#d97706", "#2563eb"]} />
        </ChartCard>
      </div>

      {/* ── Team Participation Chart ──────────────────────────────────── */}
      <ChartCard title="Team Participation" subtitle="Challenges & CSR completed per team member">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={mockTeamParticipation} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="challenges" name="Challenges" fill={CHART_COLORS[3]} radius={[3, 3, 0, 0]} />
            <Bar dataKey="csr" name="CSR Activities" fill={CHART_COLORS[0]} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Goal Progress ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Goal Completion Progress</h3>
          <GoalProgressCards items={mockGoalProgress} />
        </div>

        {/* Upcoming events */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Upcoming Events 📅</h3>
          <div className="space-y-3">
            {mockUpcomingEvents.slice(0, 4).map((ev) => (
              <div key={ev.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                <div className="flex-shrink-0 text-lg">{ev.type === "CSR" ? "🌳" : ev.type === "Audit" ? "🔍" : ev.type === "Challenge" ? "🎯" : "📜"}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                  <p className="text-xs text-gray-400">{ev.date}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{ev.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
        <QuickActions actions={QUICK_ACTIONS} />
      </div>

      {/* ── Recent Activity ──────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Department Activity</h3>
        <ActivityFeed items={mockActivityFeed.slice(0, 5)} />
      </div>

    </div>
  );
}
