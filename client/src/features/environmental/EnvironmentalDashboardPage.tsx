import { useEffect, useState } from "react";
import { api, getApiError } from "../../api/client";

interface DeptEmissions {
  departmentId: string;
  departmentName: string;
  totalEmissions: number;
}
interface TypeStat {
  type: string;
  count: number;
  totalQuantity: number;
}
interface RecentTx {
  id: string;
  description: string;
  emissions: number;
  recordedAt: string;
  department: { name: string };
}
interface GoalProgress {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  status: string;
  progressPct: number;
  department?: { name: string } | null;
}
interface DashboardData {
  summary: { totalEmissions: number };
  byDepartment: DeptEmissions[];
  byType: TypeStat[];
  recentTransactions: RecentTx[];
  goalProgress: GoalProgress[];
}

const TYPE_ICON: Record<string, string> = {
  PURCHASE: "🛒",
  MANUFACTURING: "🏭",
  EXPENSE: "💳",
  FLEET: "🚛",
};

const STATUS_STYLE: Record<string, string> = {
  ON_TRACK: "text-green-700 bg-green-50",
  AT_RISK: "text-amber-700 bg-amber-50",
  COMPLETED: "text-blue-700 bg-blue-50",
};

export default function EnvironmentalDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<{ data: DashboardData }>("/environmental/dashboard")
      .then((res) => setData(res.data.data))
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 text-sm">
        Loading dashboard…
      </div>
    );
  if (error)
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
    );
  if (!data) return null;

  const maxEmission = Math.max(...data.byDepartment.map((d) => d.totalEmissions), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🌍 Environmental Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Carbon footprint tracking and environmental goals progress.</p>
      </div>

      {/* Summary card */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Total CO₂ Emissions</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {data.summary.totalEmissions.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">kgCO₂e</p>
        </div>
        {data.byType.map((t) => (
          <div key={t.type} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xl">{TYPE_ICON[t.type] ?? "📊"}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mt-1">
              {t.type.toLowerCase().replace("_", " ")}
            </p>
            <p className="text-2xl font-bold text-gray-900">{t.count}</p>
            <p className="text-xs text-gray-400">records</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Emissions by Department */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Emissions by Department</h2>
          {data.byDepartment.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {data.byDepartment.map((d) => (
                <div key={d.departmentId}>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>{d.departmentName}</span>
                    <span className="font-medium">{d.totalEmissions.toFixed(2)} kg</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-green-500 transition-all"
                      style={{ width: `${(d.totalEmissions / maxEmission) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Carbon Transactions */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Transactions</h2>
          {data.recentTransactions.length === 0 ? (
            <p className="text-sm text-gray-400">No transactions yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-gray-800 truncate max-w-[180px]">{tx.description}</p>
                    <p className="text-xs text-gray-400">{tx.department.name} · {new Date(tx.recordedAt).toLocaleDateString()}</p>
                  </div>
                  <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                    {tx.emissions.toFixed(2)} kg
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Environmental Goals Progress */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Environmental Goals Progress</h2>
        {data.goalProgress.length === 0 ? (
          <p className="text-sm text-gray-400">No goals defined yet. Add them in Environmental Goals.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {data.goalProgress.map((g) => (
              <div key={g.id} className="rounded-lg border border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{g.title}</p>
                    <p className="text-xs text-gray-400">{g.department?.name ?? "Company-wide"}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[g.status] ?? ""}`}>
                    {g.status.replace("_", " ")}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{g.currentValue} / {g.targetValue} {g.unit}</span>
                    <span>{g.progressPct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        g.status === "COMPLETED"
                          ? "bg-blue-500"
                          : g.status === "AT_RISK"
                          ? "bg-amber-400"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(g.progressPct, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
