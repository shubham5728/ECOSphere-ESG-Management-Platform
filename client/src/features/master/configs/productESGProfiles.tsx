import type { EntityConfig } from "../types";

export interface ProductESGProfile {
  id: string;
  productName: string;
  category: string;
  carbonPerUnit: number;
  recyclablePct: number | null;
  notes: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export const productESGProfilesConfig: EntityConfig<ProductESGProfile> = {
  title: "Product ESG Profiles",
  singular: "Product ESG Profile",
  apiPath: "/product-esg-profiles",
  searchPlaceholder: "Search by product name or category…",
  columns: [
    { key: "productName", label: "Product Name", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { key: "carbonPerUnit", label: "Carbon/Unit (kgCO2)", sortable: true },
    {
      key: "recyclablePct",
      label: "Recyclable %",
      sortable: true,
      render: (row) => (row.recyclablePct !== null ? `${row.recyclablePct}%` : "—"),
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
    { name: "productName", label: "Product Name", type: "text", required: true, placeholder: "e.g. EcoLaptop Gen 2" },
    { name: "category", label: "Category", type: "text", required: true, placeholder: "e.g. Electronics, Packaging" },
    { name: "carbonPerUnit", label: "Carbon per Unit (kgCO2)", type: "number", required: true, min: 0, defaultValue: 0 },
    { name: "recyclablePct", label: "Recyclable Percentage (0-100)", type: "number", min: 0, defaultValue: 0, helpText: "Optional percentage of materials recyclable." },
    { name: "notes", label: "Notes", type: "textarea", placeholder: "General notes on materials, certification details, etc." },
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
