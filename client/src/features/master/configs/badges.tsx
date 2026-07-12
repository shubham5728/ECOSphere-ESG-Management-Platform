import type { EntityConfig } from "../types";

export interface Badge {
  id: string;
  name: string;
  description: string;
  unlockRule: "XP_THRESHOLD" | "CHALLENGE_COUNT";
  threshold: number;
  icon: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

const RULE_LABEL: Record<Badge["unlockRule"], string> = {
  XP_THRESHOLD: "XP Threshold",
  CHALLENGE_COUNT: "Challenge Count",
};

export const badgesConfig: EntityConfig<Badge> = {
  title: "Badges",
  singular: "Badge",
  apiPath: "/badges",
  searchPlaceholder: "Search by name…",
  columns: [
    {
      key: "icon",
      label: "Icon",
      render: (row) => <span className="text-xl">{row.icon}</span>,
    },
    { key: "name", label: "Name", sortable: true },
    {
      key: "unlockRule",
      label: "Unlock Rule",
      sortable: true,
      render: (row) => RULE_LABEL[row.unlockRule],
    },
    { key: "threshold", label: "Threshold", sortable: true },
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
    { name: "name", label: "Name", type: "text", required: true, placeholder: "e.g. Eco Warrior" },
    { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Unlock criteria description…" },
    {
      name: "unlockRule",
      label: "Unlock Rule",
      type: "select",
      required: true,
      options: [
        { label: "XP Threshold", value: "XP_THRESHOLD" },
        { label: "Challenge Count", value: "CHALLENGE_COUNT" },
      ],
    },
    { name: "threshold", label: "Threshold Value", type: "number", required: true, min: 1, defaultValue: 100 },
    { name: "icon", label: "Icon Emoji", type: "text", required: true, defaultValue: "🏅", placeholder: "e.g. 🍀, 🚴" },
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
