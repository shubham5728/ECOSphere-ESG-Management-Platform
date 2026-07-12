import { useState } from "react";
import { useCrud } from "./useCrud";
import { DataTable } from "../../components/table/DataTable";
import { Pagination } from "../../components/table/Pagination";
import { Modal } from "../../components/ui/Modal";
import { EntityForm } from "./EntityForm";
import type { EntityConfig } from "./types";

interface Props<T extends { id: string }> {
  config: EntityConfig<T>;
}

export function MasterDataPage<T extends { id: string }>({ config }: Props<T>) {
  const crud = useCrud<T>(config.apiPath);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(row: T) {
    setEditing(row);
    setModalOpen(true);
  }

  async function handleSubmit(values: Record<string, unknown>) {
    setSubmitting(true);
    try {
      if (editing) await crud.update(editing.id, values as Partial<T>);
      else await crud.create(values as Partial<T>);
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(row: T) {
    if (!window.confirm(`Delete this ${config.singular.toLowerCase()}?`)) return;
    await crud.remove(row.id);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
          <p className="text-sm text-gray-500">{crud.meta.total} total</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + New {config.singular}
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-3">
          <input
            value={crud.query.search}
            onChange={(e) => crud.setSearch(e.target.value)}
            placeholder={config.searchPlaceholder ?? "Search…"}
            className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        </div>

        {crud.error && (
          <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-600">
            {crud.error}
          </div>
        )}

        <DataTable<T>
          columns={config.columns}
          rows={crud.rows}
          loading={crud.loading}
          sortBy={crud.query.sortBy}
          order={crud.query.order}
          onSort={crud.toggleSort}
          onEdit={openEdit}
          onDelete={handleDelete}
        />

        <Pagination meta={crud.meta} onPage={crud.setPage} />
      </div>

      <Modal
        open={modalOpen}
        title={`${editing ? "Edit" : "New"} ${config.singular}`}
        onClose={() => setModalOpen(false)}
      >
        <EntityForm<T>
          fields={config.fields}
          initial={editing}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
