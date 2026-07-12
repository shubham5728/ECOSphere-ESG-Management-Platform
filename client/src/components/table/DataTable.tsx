import type { ColumnConfig } from "../../features/master/types";

interface Props<T> {
  columns: ColumnConfig<T>[];
  rows: T[];
  loading: boolean;
  sortBy: string;
  order: "asc" | "desc";
  onSort: (key: string) => void;
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  loading,
  sortBy,
  order,
  onSort,
  onEdit,
  onDelete,
}: Props<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium">
                {col.sortable ? (
                  <button
                    onClick={() => onSort(col.key)}
                    className="inline-flex items-center gap-1 hover:text-gray-800"
                  >
                    {col.label}
                    {sortBy === col.key && <span>{order === "asc" ? "▲" : "▼"}</span>}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {loading ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-gray-400">
                Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-gray-400">
                No records found.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/60">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-gray-700">
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? "—")}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(row)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(row)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
