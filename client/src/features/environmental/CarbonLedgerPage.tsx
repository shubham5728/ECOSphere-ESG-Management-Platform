import { useEffect, useState, useCallback } from "react";
import { ClipboardList } from "lucide-react";
import type { FormEvent } from "react";
import { api, getApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";

interface Department {
  id: string;
  name: string;
}
interface CarbonTransaction {
  id: string;
  description: string;
  emissions: number;
  recordedAt: string;
  department: { id: string; name: string };
  operationalRecord?: { id: string; type: string; description: string } | null;
}

const emptyForm = {
  description: "",
  emissions: "",
  departmentId: "",
  recordedAt: "",
};

export default function CarbonLedgerPage() {
  const [transactions, setTransactions] = useState<CarbonTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (search) params.search = search;
      const res = await api.get<{
        data: CarbonTransaction[];
        meta: { totalPages: number; total: number };
      }>("/environmental/transactions", { params });
      setTransactions(res.data.data);
      setTotalPages(res.data.meta?.totalPages ?? 1);
      setTotal(res.data.meta?.total ?? 0);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  useEffect(() => {
    api
      .get<{ data: Department[] }>("/departments", { params: { limit: 100 } })
      .then((r) => setDepartments(r.data.data))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.post("/environmental/transactions", {
        description: form.description,
        emissions: Number(form.emissions),
        departmentId: form.departmentId,
        recordedAt: form.recordedAt || undefined,
      });
      setShowModal(false);
      setForm({ ...emptyForm });
      fetchTransactions();
    } catch (err) {
      setFormError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/environmental/transactions/${id}`);
      fetchTransactions();
    } catch {
      alert("Delete failed");
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <ClipboardList className="text-green-600" /> Carbon Ledger
          </h1>
          <p className="text-sm text-gray-500">
            All carbon emission transactions — auto-calculated and manual.{" "}
            <span className="font-medium text-gray-700">{total} entries total.</span>
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Manual Entry</Button>
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
        ) : transactions.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-400">
            No carbon transactions yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                {["Description", "Department", "Emissions (kgCO₂)", "Type", "Recorded At", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-800 max-w-[220px] truncate">{tx.description}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{tx.department.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                      {tx.emissions.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {tx.operationalRecord ? (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                        Auto · {tx.operationalRecord.type}
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        Manual
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(tx.recordedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {!tx.operationalRecord && (
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    )}
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

      {/* Manual entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Manual Carbon Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Estimated scope 3 travel emissions"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Emissions (kgCO₂e) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={form.emissions}
                  onChange={(e) => setForm((f) => ({ ...f, emissions: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  required
                />
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
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Recorded Date</label>
                <input
                  type="date"
                  value={form.recordedAt}
                  onChange={(e) => setForm((f) => ({ ...f, recordedAt: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

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
                  <Button type="submit" loading={submitting}>Save</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
