import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { api, getApiError } from "../../api/client";
import { useAuth } from "../../store/AuthContext";
import { Button } from "../../components/ui/Button";

interface Department {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
}

interface ComplianceIssue {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  dueDate: string;
  isOverdue: boolean;
  owner: { id: string; name: string };
  department: { name: string };
}

export default function ComplianceIssuesPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<ComplianceIssue[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "MEDIUM",
    dueDate: "",
    ownerId: "",
    departmentId: ""
  });

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: ComplianceIssue[] }>("/governance/compliance-issues");
      setIssues(res.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    api.get<{ data: Department[] }>("/departments", { params: { limit: 100 } }).then((res) => setDepartments(res.data.data)).catch(() => {});
    api.get<{ data: User[] }>("/users", { params: { limit: 100 } }).then((res) => setUsers(res.data.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.post("/governance/compliance-issues", form);
      setShowModal(false);
      setForm({ title: "", description: "", severity: "MEDIUM", dueDate: "", ownerId: "", departmentId: "" });
      fetchIssues();
    } catch (err) {
      setFormError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id: string, status: "RESOLVED" | "IN_PROGRESS") => {
    try {
      await api.patch(`/governance/compliance-issues/${id}`, { status });
      alert(`Issue status set to ${status.toLowerCase()}`);
      fetchIssues();
    } catch (err) {
      alert(getApiError(err));
    }
  };

  const isElevated = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <ShieldAlert className="text-green-600" /> Compliance Issues
          </h1>
          <p className="text-sm text-gray-500">Track regulatory, environmental, and workplace safety compliance violations.</p>
        </div>
        {isElevated && <Button onClick={() => setShowModal(true)}>+ Report Issue</Button>}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="text-center text-sm text-gray-400 py-12">Loading issues...</div>
        ) : issues.length === 0 ? (
          <div className="text-center text-sm text-gray-400 py-12">No compliance issues logged.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-400 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Issue Title</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Severity</th>
                <th className="px-4 py-3 text-left">Due Date</th>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {issues.map((i) => (
                <tr key={i.id} className={`${i.isOverdue ? "bg-red-50/10 hover:bg-red-50/20" : "hover:bg-gray-50/50"}`}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                      {i.title}
                      {i.isOverdue && <span className="bg-red-100 text-red-700 text-[9px] px-1 py-0.2 rounded font-bold">OVERDUE</span>}
                    </p>
                    <p className="text-xs text-gray-500 max-w-[200px] truncate" title={i.description}>{i.description}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{i.department.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      i.severity === "CRITICAL" ? "bg-red-100 text-red-800" :
                      i.severity === "HIGH" ? "bg-orange-100 text-orange-850" :
                      i.severity === "MEDIUM" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-700"
                    }`}>
                      {i.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{new Date(i.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-xs font-medium">{i.owner.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      i.status === "RESOLVED" ? "bg-green-50 text-green-700" :
                      i.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {i.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {i.status !== "RESOLVED" && (i.owner.id === user?.id || isElevated) ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolve(i.id, "RESOLVED")}
                          className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                          Resolve
                        </button>
                        {i.status === "OPEN" && (
                          <button
                            onClick={() => handleResolve(i.id, "IN_PROGRESS")}
                            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                          >
                            Work
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">No action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Compliance Issue</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Minor hazardous chemical spill in Yard B"
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Detailed Description</label>
                <textarea
                  required
                  placeholder="Detail the issue, immediate risk, and corrective action required..."
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Severity</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm(f => ({ ...f, severity: e.target.value }))}
                    className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    required
                    value={form.dueDate}
                    onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Assigned Owner</label>
                  <select
                    required
                    value={form.ownerId}
                    onChange={(e) => setForm(f => ({ ...f, ownerId: e.target.value }))}
                    className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                  >
                    <option value="">— Select Staff —</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Department</label>
                  <select
                    required
                    value={form.departmentId}
                    onChange={(e) => setForm(f => ({ ...f, departmentId: e.target.value }))}
                    className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                  >
                    <option value="">— Select —</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              {formError && <p className="text-xs text-red-500">{formError}</p>}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <Button type="submit" loading={submitting}>Log Violation / Issue</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
