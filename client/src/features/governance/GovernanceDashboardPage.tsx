import { useEffect, useState } from "react";
import { Scale, ScrollText, FileSearch, ShieldAlert, Siren, type LucideIcon } from "lucide-react";
import { api, getApiError } from "../../api/client";

interface Summary {
  totalPolicies: number;
  totalAcknowledgements: number;
  policyCoverageRatePct: number;
  totalAudits: number;
  avgAuditScore: number;
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  overdueIssues: number;
}

interface ComplianceIssue {
  id: string;
  title: string;
  severity: string;
  status: string;
  dueDate: string;
  isOverdue: boolean;
  owner: { name: string };
  department: { name: string };
}

interface DashboardData {
  summary: Summary;
  recentIssues: ComplianceIssue[];
}

export default function GovernanceDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<{ data: DashboardData }>("/governance/dashboard")
      .then((res) => setData(res.data.data))
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center text-sm text-gray-400 py-12">Loading governance dashboard...</div>;
  if (error) return <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Scale className="text-green-600" /> Governance Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">ESG Policy acknowledgement tracking, internal audits, and compliance issues.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {([
          { label: "Policy Coverage", value: `${data.summary.policyCoverageRatePct}%`, icon: ScrollText, color: "text-blue-600", desc: "Ack rate across staff" },
          { label: "Audit Rating", value: data.summary.avgAuditScore > 0 ? `${data.summary.avgAuditScore}/100` : "N/A", icon: FileSearch, color: "text-teal-600", desc: "Average audit score" },
          { label: "Open Issues", value: data.summary.openIssues + data.summary.inProgressIssues, icon: ShieldAlert, color: "text-amber-600", desc: `${data.summary.resolvedIssues} resolved` },
          { label: "Overdue Issues", value: data.summary.overdueIssues, icon: Siren, color: "text-red-600", desc: "Past deadline date", isAlert: data.summary.overdueIssues > 0 }
        ] as { label: string; value: string | number; icon: LucideIcon; color: string; desc: string; isAlert?: boolean }[]).map((c, i) => {
          const Icon = c.icon;
          return (
          <div key={i} className={`rounded-xl border p-4 shadow-sm bg-white ${c.isAlert ? "border-red-200 bg-red-50/20" : "border-gray-100"}`}>
            <Icon size={22} className={c.color} />
            <p className="mt-1 text-xs text-gray-400 font-medium uppercase">{c.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${c.isAlert ? "text-red-600" : "text-gray-900"}`}>{c.value}</p>
            <p className="text-[10px] text-gray-400">{c.desc}</p>
          </div>
          );
        })}
      </div>

      {/* Recent Issues List */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Compliance Issues</h2>
        {data.recentIssues.length === 0 ? (
          <p className="text-sm text-gray-400">No active compliance issues logged.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase">
                  <th className="py-2">Issue Title</th>
                  <th className="py-2">Dept</th>
                  <th className="py-2">Severity</th>
                  <th className="py-2">Due Date</th>
                  <th className="py-2">Owner</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {data.recentIssues.map((issue) => (
                  <tr key={issue.id} className={issue.isOverdue ? "bg-red-50/10" : ""}>
                    <td className="py-2.5 font-medium flex items-center gap-1">
                      {issue.title}
                      {issue.isOverdue && <span className="text-[9px] bg-red-100 text-red-700 px-1 py-0.2 rounded font-semibold">OVERDUE</span>}
                    </td>
                    <td className="py-2.5">{issue.department.name}</td>
                    <td className="py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        issue.severity === "CRITICAL" ? "bg-red-100 text-red-800" :
                        issue.severity === "HIGH" ? "bg-orange-100 text-orange-850" :
                        issue.severity === "MEDIUM" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-700"
                      }`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="py-2.5">{new Date(issue.dueDate).toLocaleDateString()}</td>
                    <td className="py-2.5">{issue.owner.name}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        issue.status === "RESOLVED" ? "bg-green-50 text-green-700" :
                        issue.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {issue.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
