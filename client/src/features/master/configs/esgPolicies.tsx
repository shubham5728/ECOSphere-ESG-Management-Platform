import type { EntityConfig } from "../types";

export interface EsgPolicy {
  id: string;
  title: string;
  description: string;
  version: string;
  effectiveDate: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export const esgPoliciesConfig: EntityConfig<EsgPolicy> = {
  title: "ESG Policies",
  singular: "ESG Policy",
  apiPath: "/esg-policies",
  searchPlaceholder: "Search by title…",
  columns: [
    { key: "title", label: "Title", sortable: true },
    { key: "version", label: "Version", sortable: true },
    {
      key: "effectiveDate",
      label: "Effective Date",
      sortable: true,
      render: (row) => new Date(row.effectiveDate).toLocaleDateString(),
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
    { name: "title", label: "Title", type: "text", required: true, placeholder: "e.g. Environmental Sustainability Policy" },
    { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Policy content details…" },
    { name: "version", label: "Version", type: "text", required: true, defaultValue: "1.0", placeholder: "e.g. 1.0" },
    {
      name: "effectiveDate",
      label: "Effective Date",
      type: "text",
      required: true,
      defaultValue: new Date().toISOString().split("T")[0],
      placeholder: "YYYY-MM-DD",
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
