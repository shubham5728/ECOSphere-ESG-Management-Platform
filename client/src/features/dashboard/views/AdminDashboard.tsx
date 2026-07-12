import { useNavigate } from "react-router-dom";
import {
  mockAdminKpis,
  mockRadarData,
  mockDeptEsgData,
  mockMonthlyEmissions,
  mockCsrByDept,
  mockChallengeParticipation,
  mockBadgeDistribution,
  mockComplianceIssues,
  mockDeptRanking,
  mockActivityFeed,
  mockLeaderboard,
  mockUpcomingEvents,
  CHART_COLORS,
} from "../data/mockData";
import { KpiCard } from "../components/KpiCard";
import { ChartCard } from "../components/ChartCard";
import { ActivityFeed } from "../components/ActivityFeed";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { EsgGauge } from "../charts/EsgGauge";
import { EsgRadarChart } from "../charts/EsgRadarChart";
import { DeptBarChart } from "../charts/DeptBarChart";
import { EmissionLineChart } from "../charts/EmissionLineChart";
import { SimpleBarChart } from "../charts/SimpleBarChart";
import { DonutChart } from "../charts/DonutChart";
import { ComplianceBarChart } from "../charts/ComplianceBarChart";
import { DeptRankingChart } from "../charts/DeptRankingChart";

const EVENT_TYPE_COLOR: Record<string, string> = {
  CSR: "#16a34a",
  Audit: "#2563eb",
  Governance: "#7c3aed",
  Challenge: "#d97706",
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const kpis = mockAdminKpis;

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Organization-wide ESG analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 border border-green-100">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Live Data
          </span>
          <button
            onClick={() => navigate("/reports")}
            className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* ── ESG Score Hero ───────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-green-600 to-teal-600 p-6 text-white shadow-lg">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 items-center">
          {/* Overall gauge */}
          <div className="col-span-2 sm:col-span-1 flex justify-center">
            <div className="text-center">
              <EsgGauge score={kpis.esgScore} label="" size={160} />
              <p className="text-sm font-semibold text-white/90 mt-2">Overall ESG Score</p>
            </div>
          </div>
          {/* E / S / G sub-scores */}
          {[
            { label: "Environmental", score: kpis.envScore, icon: "🌍" },
            { label: "Social", score: kpis.socialScore, icon: "🤝" },
            { label: "Governance", score: kpis.govScore, icon: "⚖️" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center">
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-4xl font-bold">{s.score}</div>
              <div className="text-sm text-white/70 mt-1">{s.label}</div>
              {/* Mini progress bar */}
              <div className="mt-2 h-1.5 w-20 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-white/80 transition-all duration-700"
                  style={{ width: `${s.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── KPI Cards Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
        <KpiCard icon="🏢" label="Departments" value={kpis.totalDepartments} accent="bg-blue-50" onClick={() => navigate("/departments")} />
        <KpiCard icon="👥" label="Total Employees" value={kpis.totalEmployees} accent="bg-teal-50" onClick={() => navigate("/users")} />
        <KpiCard icon="🌳" label="Active CSR Activities" value={kpis.activeCsr} accent="bg-green-50" delta={8} onClick={() => navigate("/csr-activities")} />
        <KpiCard icon="🎯" label="Active Challenges" value={kpis.activeChallenges} accent="bg-purple-50" onClick={() => navigate("/challenges")} />
        <KpiCard icon="🏭" label="Total CO₂ Emissions" value={kpis.totalEmissions.toFixed(0)} unit="kgCO₂e" accent="bg-red-50" delta={-6} deltaLabel="reduced vs last month" />
        <KpiCard icon="⚠️" label="Compliance Issues" value={kpis.complianceIssues} accent="bg-orange-50" onClick={() => navigate("/compliance-issues")} />
        <KpiCard icon="📜" label="Pending Policies" value={kpis.pendingPolicies} accent="bg-amber-50" onClick={() => navigate("/policy-acknowledgements")} />
        <KpiCard icon="⭐" label="ESG Score" value={kpis.esgScore} unit="/ 100" accent="bg-green-50" delta={3} />
      </div>

      {/* ── Charts Row 1 ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="ESG Score Distribution" subtitle="Radar view of all ESG dimensions">
          <EsgRadarChart data={mockRadarData} />
        </ChartCard>
        <ChartCard title="Department ESG Comparison" subtitle="Env / Social / Gov scores by department">
          <DeptBarChart data={mockDeptEsgData} />
        </ChartCard>
      </div>

      {/* ── Charts Row 2 ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Monthly Carbon Emissions" subtitle="Last 12 months (kgCO₂e)">
          <EmissionLineChart data={mockMonthlyEmissions} refValue={500} />
        </ChartCard>
        <ChartCard title="CSR Participation by Department" subtitle="Number of activities completed">
          <SimpleBarChart data={mockCsrByDept} xKey="dept" dataKey="count" label="Activities" color={CHART_COLORS[1]} />
        </ChartCard>
      </div>

      {/* ── Charts Row 3 ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ChartCard title="Challenge Participation" className="lg:col-span-1">
          <DonutChart data={mockChallengeParticipation} />
        </ChartCard>
        <ChartCard title="Badge Distribution" className="lg:col-span-1">
          <DonutChart data={mockBadgeDistribution} colors={["#16a34a", "#0d9488", "#2563eb", "#7c3aed", "#d97706"]} />
        </ChartCard>
        <ChartCard title="Compliance Issues by Severity" className="sm:col-span-2">
          <ComplianceBarChart data={mockComplianceIssues} />
        </ChartCard>
      </div>

      {/* ── Department Ranking ───────────────────────────────────────── */}
      <ChartCard title="Department ESG Ranking" subtitle="Overall composite ESG score">
        <DeptRankingChart data={mockDeptRanking} />
      </ChartCard>

      {/* ── Bottom Row: Activity + Leaderboard + Events ─────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Activity Feed */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <ActivityFeed items={mockActivityFeed} />
        </div>

        {/* Leaderboard */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Top Employees 🏆</h3>
            <button onClick={() => navigate("/leaderboard")} className="text-xs text-green-600 hover:underline">View all</button>
          </div>
          <LeaderboardTable entries={mockLeaderboard} />
        </div>

        {/* Upcoming Events */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Upcoming Events 📅</h3>
          <div className="space-y-3">
            {mockUpcomingEvents.map((ev) => (
              <div key={ev.id} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                <div
                  className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ background: EVENT_TYPE_COLOR[ev.type] ?? "#6b7280" }}
                >
                  {ev.type[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                  <p className="text-xs text-gray-400">{ev.date} · {ev.dept}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
