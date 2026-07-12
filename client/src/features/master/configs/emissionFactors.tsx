import type { EntityConfig } from "../types";

export interface EmissionFactor {
  id: string;
  name: string;
  source: string;
  unit: string;
  factor: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export const emissionFactorsConfig: EntityConfig<EmissionFactor> = {
  title: "Emission Factors",
  singular: "Emission Factor",
  apiPath: "/emission-factors",
  searchPlaceholder: "Search by name or source…",
  columns: [
    { key: "name", label: "Name", sortable: true },
    { key: "source", label: "Source", sortable: true },
    { key: "unit", label: "Unit", sortable: true },
    { key: "factor", label: "Factor (kgCO2/unit)", sortable: true },
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
    { name: "name", label: "Name", type: "text", required: true, placeholder: "e.g. Electricity Grid" },
    { name: "source", label: "Source", type: "text", required: true, placeholder: "e.g. DEFRA, EPA" },
    { name: "unit", label: "Unit", type: "text", required: true, placeholder: "e.g. kWh, litre" },
    { name: "factor", label: "Factor (kgCO2 per unit)", type: "number", required: true, min: 0, defaultValue: 0 },
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
