import type { EntityConfig } from "../types";

export interface Department {
  id: string;
  name: string;
  code: string;
  employeeCount: number;
  status: "ACTIVE" | "INACTIVE";
  parentId: string | null;
  parent?: { id: string; name: string } | null;
  head?: { id: string; name: string } | null;
  createdAt: string;
}

function StatusBadge({ status }: { status: Department["status"] }) {
  const active = status === "ACTIVE";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {status}
    </span>
  );
}

export const departmentsConfig: EntityConfig<Department> = {
  title: "Departments",
  singular: "Department",
  apiPath: "/departments",
  searchPlaceholder: "Search by name or code…",
  columns: [
    { key: "name", label: "Name", sortable: true },
    { key: "code", label: "Code", sortable: true },
    {
      key: "parent",
      label: "Parent",
      render: (row) => row.parent?.name ?? "—",
    },
    { key: "employeeCount", label: "Employees", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
  ],
  fields: [
    { name: "name", label: "Name", type: "text", required: true, placeholder: "e.g. Human Resources" },
    {
      name: "code",
      label: "Code",
      type: "text",
      required: true,
      placeholder: "e.g. HR",
      helpText: "Short unique code (auto-uppercased).",
    },
    { name: "employeeCount", label: "Employee Count", type: "number", min: 0, defaultValue: 0 },
    {
      name: "parentId",
      label: "Parent Department",
      type: "select",
      optionsSource: { apiPath: "/departments", labelKey: "name", valueKey: "id" },
      helpText: "Optional — for department hierarchy.",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      defaultValue: "ACTIVE",
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
      ],
    },
  ],
};
