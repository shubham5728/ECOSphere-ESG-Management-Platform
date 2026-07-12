import { useEffect, useState, useCallback } from "react";
import type { FormEvent } from "react";
import { api, getApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";

interface EmissionFactor {
  id: string;
  name: string;
  unit: string;
  factor: number;
}
interface Department {
  id: string;
  name: string;
}
interface OperationalRecord {
  id: string;
  type: string;
  description: string;
  quantity: number;
  unit: string;
  emissionFactor: { id: string; name: string; unit: string; factor: number };
  department: { id: string; name: string };
  user: { id: string; name: string };
  carbonTransaction?: { id: string; emissions: number } | null;
  createdAt: string;
}

const TYPES = ["PURCHASE", "MANUFACTURING", "EXPENSE", "FLEET"] as const;
const TYPE_ICON: Record<string, string> = {
  PURCHASE: "🛒",
  MANUFACTURING: "🏭",
  EXPENSE: "💳",
  FLEET: "🚛",
};

const emptyForm = {
  type: "PURCHASE" as (typeof TYPES)[number],
  description: "",
  quantity: "",
  unit: "",
  emissionFactorId: "",
  departmentId: "",
};

export default function OperationsPage() {
  const [records, setRecords] = useState<OperationalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (search) params.search = search;
      const res = await api.get<{ data: OperationalRecord[]; meta: { totalPages: number } }>(
        "/environmental/operations",
        { params }
      );
      setRecords(res.data.data);
      setTotalPages(res.data.meta?.totalPages ?? 1);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  useEffect(() => {
    api.get<{ data: EmissionFactor[] }>("/emission-factors", { params: { limit: 100 } }).then((r) =>
      setFactors(r.data.data.filter((f: any) => f.status === "ACTIVE"))
    ).catch(() => {});
    api.get<{ data: Department[] }>("/departments", { params: { limit: 100 } }).then((r) =>
      setDepartments(r.data.data)
    ).catch(() => {});
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.post("/environmental/operations", {
        ...form,
        quantity: Number(form.quantity),
      });
      setShowModal(false);
      setForm({ ...emptyForm });
      fetchRecords();
    } catch (err) {
      setFormError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this record?")) return;
    try {
      await api.delete(`/environmental/operations/${id}`);
      fetchRecords();
    } catch {
      alert("Delete failed");
    }
  }

  const selectedFactor = factors.find((f) => f.id === form.emissionFactorId);
  const estimatedEmissions =
    selectedFactor && form.quantity ? (Number(form.quantity) * selectedFactor.factor).toFixed(3) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏭 Operational Records</h1>
          <p className="text-sm text-gray-500">Log activities that generate carbon emissions.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Log Activity</Button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by description…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full max-w-sm rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/40"
      />

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-400">Loading…</div>
        ) : records.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-400">
            No records yet. Log your first activity!
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                {["Type", "Description", "Quantity", "Emission Factor", "Department", "CO₂ (kg)", "Date", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <span className="text-base">{TYPE_ICON[r.type]}</span>{" "}
                    <span className="text-xs text-gray-500">{r.type}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-800 max-w-[200px] truncate">{r.description}</td>
                  <td className="px-4 py-3 text-gray-700">{r.quantity} {r.unit}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.emissionFactor.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.department.name}</td>
                  <td className="px-4 py-3">
                    {r.carbonTransaction ? (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                        {r.carbonTransaction.emissions.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border px-3 py-1 text-sm disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-gray-500 px-2 py-1">Page {page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border px-3 py-1 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Log Operational Activity</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Type <span className="text-red-500">*</span></label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as typeof form.type }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    required
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>{TYPE_ICON[t]} {t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Department <span className="text-red-500">*</span></label>
                  <select
                    value={form.departmentId}
                    onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    required
                  >
                    <option value="">— Select —</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Monthly diesel purchase for fleet"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Emission Factor <span className="text-red-500">*</span></label>
                <select
                  value={form.emissionFactorId}
                  onChange={(e) => {
                    const factor = factors.find((f) => f.id === e.target.value);
                    setForm((f) => ({ ...f, emissionFactorId: e.target.value, unit: factor?.unit ?? f.unit }));
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  required
                >
                  <option value="">— Select —</option>
                  {factors.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.factor} kgCO₂/{f.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Quantity <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    placeholder="auto-filled from factor"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {estimatedEmissions && (
                <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                  📊 Estimated CO₂: <strong>{estimatedEmissions} kgCO₂e</strong>
                  {" "}(auto-created if <em>autoEmission</em> is enabled in Settings)
                </div>
              )}

              {formError && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormError(""); }}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <div className="w-32">
                  <Button type="submit" loading={submitting}>Log Activity</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
