import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Factory,
  ClipboardList,
  ClipboardCheck,
  Trees,
  Target,
  TrendingUp,
  PenLine,
  Scale,
  BarChart3,
  FileSignature,
  FileSearch,
  Calendar,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { CHART_COLORS } from "../data/mockData";
import { getOverview, type ManagerOverview } from "../../../api/dashboard";
import { getApiError } from "../../../api/client";
import { KpiCard } from "../components/KpiCard";
import { ChartCard } from "../components/ChartCard";
import { GoalProgressCards } from "../components/GoalProgressCards";
import { QuickActions } from "../components/QuickActions";
import { EmissionLineChart } from "../charts/EmissionLineChart";
import { DonutChart } from "../charts/DonutChart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

const QUICK_ACTIONS = [
  { icon: PenLine, label: "Log Activity", to: "/operations", color: "#16a34a" },
  { icon: Trees, label: "CSR Activities", to: "/csr-activities", color: "#0d9488" },
  { icon: ClipboardCheck, label: "Review Submissions", to: "/participations", color: "#2563eb" },
  { icon: ClipboardList, label: "Carbon Ledger", to: "/carbon-ledger", color: "#7c3aed" },
  { icon: Scale, label: "Compliance Issues", to: "/compliance-issues", color: "#d97706" },
  { icon: BarChart3, label: "Social Metrics", to: "/social-metrics", color: "#ec4899" },
  { icon: FileSignature, label: "Policy Sign-off", to: "/policy-acknowledgements", color: "#6366f1" },
  { icon: FileSearch, label: "Audit Logs", to: "/audits", color: "#14b8a6" },
];

function eventIcon(type: string): LucideIcon {
  if (type === "CSR") return Trees;
  if (type === "Audit") return FileSearch;
  if (type === "Challenge") return Target;
  return ScrollText;
}

export function ManagerDashboard() {
  const navigate = useNavigate();
  const [d, setD] = useState<ManagerOverview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getOverview()
      .then((res) => setD(res as ManagerOverview))
      .catch((e) => setError(getApiError(e)));
  }, []);

  if (error) return <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>;
  if (!d) return <div className="flex h-64 items-center justify-center text-sm text-gray-400">Loading dashboard…</div>;

  const kpis = d.kpis;

  return (
    <div className="space-y-8">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{d.deptName} · performance & team overview</p>
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
        <KpiCard icon={Star} iconColor="text-teal-600" label="Dept ESG Score" value={kpis.deptEsgScore} unit="/ 100" accent="bg-teal-50" />
        <KpiCard icon={Factory} iconColor="text-red-600" label="Dept Emissions" value={kpis.deptEmissions.toFixed(0)} unit="kgCO₂e" accent="bg-red-50" />
        <KpiCard icon={ClipboardList} iconColor="text-amber-600" label="Pending Approvals" value={kpis.pendingApprovals} accent="bg-amber-50" onClick={() => navigate("/participations")} />
        <KpiCard icon={Trees} iconColor="text-green-600" label="CSR Participation" value={`${kpis.csrParticipation}%`} accent="bg-green-50" />
        <KpiCard icon={Target} iconColor="text-purple-600" label="Active Challenges" value={kpis.activeChallenges} accent="bg-purple-50" onClick={() => navigate("/challenges")} />
        <KpiCard icon={TrendingUp} iconColor="text-blue-600" label="Goal Completion" value={`${kpis.goalCompletion}%`} accent="bg-blue-50" />
      </div>

      {/* ── Charts Row 1 ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Monthly Dept ESG Trend" subtitle="Environmental score trend (last 7 months)">
          <EmissionLineChart data={d.deptEsgTrend} dataKey="score" label="ESG Score" color={CHART_COLORS[1]} unit="" />
        </ChartCard>

        <ChartCard title="CSR Activity Status" subtitle="Activity breakdown by status">
          {d.csrStatus.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-400">No CSR activities yet.</div>
          ) : (
            <DonutChart data={d.csrStatus} colors={["#16a34a", "#d97706", "#2563eb"]} />
          )}
        </ChartCard>
      </div>

      {/* ── Team Participation Chart ──────────────────────────────────── */}
      <ChartCard title="Team Participation" subtitle="Challenges & CSR completed per team member">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={d.teamParticipation} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="challenges" name="Challenges" fill={CHART_COLORS[3]} radius={[3, 3, 0, 0]} />
            <Bar dataKey="csr" name="CSR Activities" fill={CHART_COLORS[0]} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Goal Progress + Events ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Goal Completion Progress</h3>
          {d.goalProgress.length === 0 ? (
            <p className="text-sm text-gray-400">No goals set for this department.</p>
          ) : (
            <GoalProgressCards items={d.goalProgress} />
          )}
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 mb-4">
            <Calendar size={16} className="text-gray-400" /> Upcoming Events
          </h3>
          <div className="space-y-3">
            {d.upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-400">No upcoming events.</p>
            ) : (
              d.upcomingEvents.slice(0, 4).map((ev) => {
                const EvIcon = eventIcon(ev.type);
                return (
                  <div key={ev.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <div className="flex-shrink-0 text-gray-500"><EvIcon size={18} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                      <p className="text-xs text-gray-400">{ev.date}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{ev.type}</span>
                  </div>
                );
              })
            )}
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
