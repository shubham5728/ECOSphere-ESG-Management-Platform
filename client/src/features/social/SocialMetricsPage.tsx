import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { api, getApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";

interface Department {
  id: string;
  name: string;
}

interface SocialMetric {
  id: string;
  period: string;
  totalEmployees: number;
  femaleCount: number;
  trainingHours: number;
  safetyIncidents: number;
  volunteerHours: number;
  notes?: string;
  department: { name: string };
}

export default function SocialMetricsPage() {
  const [metrics, setMetrics] = useState<SocialMetric[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    departmentId: "",
    period: "",
    totalEmployees: "",
    femaleCount: "",
    trainingHours: "",
    safetyIncidents: "",
    volunteerHours: "",
    notes: ""
  });

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: SocialMetric[] }>("/social/metrics");
      setMetrics(res.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    api.get<{ data: Department[] }>("/departments", { params: { limit: 100 } }).then((res) => {
      setDepartments(res.data.data);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.post("/social/metrics", {
        departmentId: form.departmentId,
        period: form.period,
        totalEmployees: Number(form.totalEmployees),
        femaleCount: Number(form.femaleCount),
        trainingHours: Number(form.trainingHours),
        safetyIncidents: Number(form.safetyIncidents),
        volunteerHours: Number(form.volunteerHours),
        notes: form.notes || undefined
      });
      setShowModal(false);
      fetchMetrics();
    } catch (err) {
      setFormError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <BarChart3 className="text-green-600" /> Social Metrics
          </h1>
          <p className="text-sm text-gray-500">Record and report social metrics like training hours and diversity rates.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Add Social Metric</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="text-center text-sm text-gray-400 py-12">Loading metrics...</div>
        ) : metrics.length === 0 ? (
          <div className="text-center text-sm text-gray-400 py-12">No metrics recorded yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-400 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Dept</th>
                <th className="px-4 py-3 text-left">Period</th>
                <th className="px-4 py-3 text-left">Total Employees</th>
                <th className="px-4 py-3 text-left">Diversity (Female)</th>
                <th className="px-4 py-3 text-left">Training Hours</th>
                <th className="px-4 py-3 text-left">Volunteering</th>
                <th className="px-4 py-3 text-left">Safety Incidents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {metrics.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium">{m.department.name}</td>
                  <td className="px-4 py-3">{m.period}</td>
                  <td className="px-4 py-3">{m.totalEmployees}</td>
                  <td className="px-4 py-3">{m.totalEmployees > 0 ? `${Math.round((m.femaleCount / m.totalEmployees) * 100)}% (${m.femaleCount})` : "0%"}</td>
                  <td className="px-4 py-3">{m.trainingHours} hrs</td>
                  <td className="px-4 py-3">{m.volunteerHours} hrs</td>
                  <td className="px-4 py-3 font-semibold text-red-600">{m.safetyIncidents}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Department Social Metric</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-xs font-medium text-gray-700">Period</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2024-Q1"
                    value={form.period}
                    onChange={(e) => setForm(f => ({ ...f, period: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Total Employees</label>
                  <input
                    type="number"
                    required
                    value={form.totalEmployees}
                    onChange={(e) => setForm(f => ({ ...f, totalEmployees: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Female Employee Count</label>
                  <input
                    type="number"
                    required
                    value={form.femaleCount}
                    onChange={(e) => setForm(f => ({ ...f, femaleCount: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Training (hrs)</label>
                  <input
                    type="number"
                    required
                    value={form.trainingHours}
                    onChange={(e) => setForm(f => ({ ...f, trainingHours: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Volunteer (hrs)</label>
                  <input
                    type="number"
                    required
                    value={form.volunteerHours}
                    onChange={(e) => setForm(f => ({ ...f, volunteerHours: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Safety Incidents</label>
                  <input
                    type="number"
                    required
                    value={form.safetyIncidents}
                    onChange={(e) => setForm(f => ({ ...f, safetyIncidents: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                />
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
                <Button type="submit" loading={submitting}>Log Metric</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
