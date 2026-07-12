import type { EntityConfig } from "../types";

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  stock: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export const rewardsConfig: EntityConfig<Reward> = {
  title: "Rewards",
  singular: "Reward",
  apiPath: "/rewards",
  searchPlaceholder: "Search by name…",
  columns: [
    { key: "name", label: "Name", sortable: true },
    { key: "pointsRequired", label: "Points Required", sortable: true },
    { key: "stock", label: "Stock", sortable: true },
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
    { name: "name", label: "Name", type: "text", required: true, placeholder: "e.g. Tree Planting Certificate" },
    { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Reward description…" },
    { name: "pointsRequired", label: "Points Required", type: "number", required: true, min: 1, defaultValue: 50 },
    { name: "stock", label: "Stock Available", type: "number", required: true, min: 0, defaultValue: 10 },
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
