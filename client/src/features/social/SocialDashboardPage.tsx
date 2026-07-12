import { useEffect, useState } from "react";
import { HeartHandshake, Trees, Clock, Users, BookOpen, type LucideIcon } from "lucide-react";
import { api, getApiError } from "../../api/client";

interface Summary {
  totalActivities: number;
  totalParticipations: number;
  pendingApprovals: number;
  genderRatioPct: number;
  avgTrainingHours: number;
  totalVolunteerHours: number;
  safetyIncidents: number;
}

interface RecentParticipation {
  id: string;
  submittedAt: string;
  status: string;
  user: { name: string };
  csrActivity: { title: string };
}

interface SocialMetric {
  id: string;
  period: string;
  totalEmployees: number;
  femaleCount: number;
  trainingHours: number;
  safetyIncidents: number;
  volunteerHours: number;
  department: { name: string };
}

interface DashboardData {
  summary: Summary;
  recentParticipations: RecentParticipation[];
  latestMetrics: SocialMetric[];
}

export default function SocialDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<{ data: DashboardData }>("/social/dashboard")
      .then((res) => setData(res.data.data))
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center text-gray-400 text-sm">Loading social dashboard...</div>;
  if (error) return <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <HeartHandshake className="text-green-600" /> Social Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">CSR activities, employee volunteering, and diversity metrics.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {([
          { label: "Active CSR Activities", value: data.summary.totalActivities, icon: Trees, color: "text-green-600" },
          { label: "Total Volunteering Hours", value: `${data.summary.totalVolunteerHours} hrs`, icon: Clock, color: "text-teal-600" },
          { label: "Female Ratio", value: `${data.summary.genderRatioPct}%`, icon: Users, color: "text-blue-600" },
          { label: "Avg Training", value: `${data.summary.avgTrainingHours} hrs`, icon: BookOpen, color: "text-purple-600" }
        ] as { label: string; value: string | number; icon: LucideIcon; color: string }[]).map((c, i) => {
          const Icon = c.icon;
          return (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <Icon size={22} className={c.color} />
            <p className="mt-1 text-xs text-gray-400 font-medium uppercase">{c.label}</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{c.value}</p>
          </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Participations */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Participations</h2>
          {data.recentParticipations.length === 0 ? (
            <p className="text-sm text-gray-400">No participations yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.recentParticipations.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-gray-800">{p.csrActivity.title}</p>
                    <p className="text-xs text-gray-400">{p.user.name} · {new Date(p.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    p.status === "APPROVED" ? "bg-green-50 text-green-700" :
                    p.status === "REJECTED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Social Metrics */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Department Metrics</h2>
          {data.latestMetrics.length === 0 ? (
            <p className="text-sm text-gray-400">No metrics logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase">
                    <th className="py-2">Dept</th>
                    <th className="py-2">Period</th>
                    <th className="py-2">Employees</th>
                    <th className="py-2">Female Ratio</th>
                    <th className="py-2">Incidents</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {data.latestMetrics.map((m) => (
                    <tr key={m.id}>
                      <td className="py-2 font-medium">{m.department.name}</td>
                      <td className="py-2">{m.period}</td>
                      <td className="py-2">{m.totalEmployees}</td>
                      <td className="py-2">{m.totalEmployees > 0 ? `${Math.round((m.femaleCount / m.totalEmployees) * 100)}%` : "0%"}</td>
                      <td className="py-2 text-red-600 font-semibold">{m.safetyIncidents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
