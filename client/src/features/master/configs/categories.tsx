import type { EntityConfig } from "../types";

export interface Category {
  id: string;
  name: string;
  type: "CSR_ACTIVITY" | "CHALLENGE";
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

const TYPE_LABEL: Record<Category["type"], string> = {
  CSR_ACTIVITY: "CSR Activity",
  CHALLENGE: "Challenge",
};

export const categoriesConfig: EntityConfig<Category> = {
  title: "Categories",
  singular: "Category",
  apiPath: "/categories",
  searchPlaceholder: "Search by name…",
  columns: [
    { key: "name", label: "Name", sortable: true },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (row) => (
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
          {TYPE_LABEL[row.type]}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            row.status === "ACTIVE"
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ],
  fields: [
    { name: "name", label: "Name", type: "text", required: true, placeholder: "e.g. Tree Planting" },
    {
      name: "type",
      label: "Type",
      type: "select",
      required: true,
      options: [
        { label: "CSR Activity", value: "CSR_ACTIVITY" },
        { label: "Challenge", value: "CHALLENGE" },
      ],
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
