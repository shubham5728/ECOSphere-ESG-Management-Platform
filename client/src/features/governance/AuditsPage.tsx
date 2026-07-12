import { useEffect, useState } from "react";
import { FileSearch } from "lucide-react";
import { api, getApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";

interface Department {
  id: string;
  name: string;
}

interface Audit {
  id: string;
  title: string;
  auditor: string;
  auditDate: string;
  rating: string;
  score?: number;
  findings: string;
  department: { name: string };
}

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    title: "",
    auditor: "",
    auditDate: "",
    rating: "SATISFACTORY",
    score: "",
    findings: "",
    departmentId: ""
  });

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Audit[] }>("/governance/audits");
      setAudits(res.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
    api.get<{ data: Department[] }>("/departments", { params: { limit: 100 } }).then((res) => {
      setDepartments(res.data.data);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.post("/governance/audits", {
        ...form,
        score: form.score ? Number(form.score) : undefined
      });
      setShowModal(false);
      setForm({
        title: "",
        auditor: "",
        auditDate: "",
        rating: "SATISFACTORY",
        score: "",
        findings: "",
        departmentId: ""
      });
      fetchAudits();
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
            <FileSearch className="text-green-600" /> Audits Log
          </h1>
          <p className="text-sm text-gray-500">Record of internal and external compliance audits for all departments.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Log Audit</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="text-center text-sm text-gray-400 py-12">Loading audits...</div>
        ) : audits.length === 0 ? (
          <div className="text-center text-sm text-gray-400 py-12">No audit reports logged yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-400 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Audit Title</th>
                <th className="px-4 py-3 text-left">Auditor</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Dept</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-left">Score</th>
                <th className="px-4 py-3 text-left">Findings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {audits.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-semibold">{a.title}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{a.auditor}</td>
                  <td className="px-4 py-3 text-xs">{new Date(a.auditDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-xs">{a.department.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      a.rating === "EXCELLENT" ? "bg-green-50 text-green-700" :
                      a.rating === "SATISFACTORY" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"
                    }`}>
                      {a.rating}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{a.score !== undefined ? `${a.score}/100` : "—"}</td>
                  <td className="px-4 py-3 text-xs max-w-[200px] truncate" title={a.findings}>{a.findings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Log Audit Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Audit Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q1 Waste Management Audit"
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Auditor Agency</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PwC, Internal Team"
                    value={form.auditor}
                    onChange={(e) => setForm(f => ({ ...f, auditor: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Audit Date</label>
                  <input
                    type="date"
                    required
                    value={form.auditDate}
                    onChange={(e) => setForm(f => ({ ...f, auditDate: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700">Overall Rating</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm(f => ({ ...f, rating: e.target.value }))}
                    className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                  >
                    <option value="EXCELLENT">EXCELLENT</option>
                    <option value="SATISFACTORY">SATISFACTORY</option>
                    <option value="NEEDS_IMPROVEMENT">NEEDS IMPROVEMENT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Score (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.score}
                    onChange={(e) => setForm(f => ({ ...f, score: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  />
                </div>
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

              <div>
                <label className="block text-xs font-medium text-gray-700">Audit Findings</label>
                <textarea
                  required
                  placeholder="Summarize findings, suggestions, and corrections..."
                  value={form.findings}
                  onChange={(e) => setForm(f => ({ ...f, findings: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm h-20"
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
                <Button type="submit" loading={submitting}>Save Audit Log</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
