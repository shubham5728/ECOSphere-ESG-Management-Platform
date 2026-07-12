import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../store/AuthContext";

interface DashboardData {
  summary: { totalEmissions: number };
  recentTransactions: { id: string; description: string; emissions: number; department: { name: string } }[];
  goalProgress: { id: string; title: string; progressPct: number; status: string }[];
}

const STATUS_STYLE: Record<string, string> = {
  ON_TRACK: "text-green-700 bg-green-50",
  AT_RISK: "text-amber-700 bg-amber-50",
  COMPLETED: "text-blue-700 bg-blue-50",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [envData, setEnvData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api
      .get<{ data: DashboardData }>("/environmental/dashboard")
      .then((r) => setEnvData(r.data.data))
      .catch(() => {});
  }, []);

  const quickLinks = [
    { label: "Environmental Dashboard", to: "/environmental-dashboard", icon: "🌍", desc: "CO₂ footprint & goals" },
    { label: "Log Activities", to: "/operations", icon: "🏭", desc: "Record emissions-generating activities" },
    { label: "Carbon Ledger", to: "/carbon-ledger", icon: "📋", desc: "All emission transactions" },
  ];

  const adminLinks = [
    { label: "Users", to: "/users", icon: "👥" },
    { label: "Departments", to: "/departments", icon: "🏢" },
    { label: "Emission Factors", to: "/emission-factors", icon: "⚡" },
    { label: "ESG Policies", to: "/esg-policies", icon: "📜" },
    { label: "Badges", to: "/badges", icon: "🏅" },
    { label: "Rewards", to: "/rewards", icon: "🎁" },
    { label: "Env. Goals", to: "/environmental-goals", icon: "🎯" },
    { label: "Settings", to: "/settings", icon: "⚙️" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name} 👋</h1>
        <p className="text-sm text-gray-500 mt-1">
          EcoSphere ESG Platform — Phase 2 Environmental Module is live.
        </p>
      </div>

      {/* User stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Your Role", value: user?.role, icon: "🛡️" },
          { label: "XP Points", value: user?.xp ?? 0, icon: "⚡" },
          { label: "Reward Points", value: user?.points ?? 0, icon: "🎁" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-2xl">{c.icon}</div>
            <p className="mt-2 text-sm text-gray-500">{c.label}</p>
            <p className="text-xl font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Environmental summary */}
      {envData && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Total CO₂ Emissions</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {envData.summary.totalEmissions.toFixed(2)}{" "}
              <span className="text-sm font-normal text-gray-400">kgCO₂e</span>
            </p>
            <button
              onClick={() => navigate("/environmental-dashboard")}
              className="mt-3 text-xs text-brand-600 hover:underline"
            >
              View full dashboard →
            </button>
          </div>

          {envData.goalProgress.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-3">Goal Progress</p>
              <div className="space-y-2">
                {envData.goalProgress.slice(0, 3).map((g) => (
                  <div key={g.id}>
                    <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                      <span className="truncate max-w-[160px]">{g.title}</span>
                      <span className={`rounded-full px-1.5 ${STATUS_STYLE[g.status] ?? ""}`}>
                        {g.progressPct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full bg-green-500"
                        style={{ width: `${Math.min(g.progressPct, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick links */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Environmental Module</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickLinks.map((l) => (
            <button
              key={l.to}
              onClick={() => navigate(l.to)}
              className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm text-left hover:border-brand-200 hover:shadow-md transition-all"
            >
              <span className="text-2xl">{l.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{l.label}</p>
                <p className="text-xs text-gray-400">{l.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Admin master data shortcuts */}
      {user?.role === "ADMIN" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Admin · Master Data</p>
          <div className="flex flex-wrap gap-2">
            {adminLinks.map((l) => (
              <button
                key={l.to}
                onClick={() => navigate(l.to)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm hover:bg-gray-50 hover:shadow transition-all"
              >
                <span>{l.icon}</span>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
