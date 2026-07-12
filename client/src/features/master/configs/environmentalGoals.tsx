import type { EntityConfig } from "../types";

export interface EnvironmentalGoal {
  id: string;
  title: string;
  description: string | null;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string | null;
  departmentId: string | null;
  department?: { id: string; name: string } | null;
  status: "ON_TRACK" | "AT_RISK" | "COMPLETED";
  createdAt: string;
}

const STATUS_STYLE: Record<EnvironmentalGoal["status"], string> = {
  ON_TRACK: "bg-green-50 text-green-700",
  AT_RISK: "bg-amber-50 text-amber-700",
  COMPLETED: "bg-blue-50 text-blue-700",
};

export const environmentalGoalsConfig: EntityConfig<EnvironmentalGoal> = {
  title: "Environmental Goals",
  singular: "Environmental Goal",
  apiPath: "/environmental-goals",
  searchPlaceholder: "Search by title…",
  columns: [
    { key: "title", label: "Title", sortable: true },
    {
      key: "progress",
      label: "Progress",
      render: (row) => (
        <span>
          {row.currentValue} / {row.targetValue} {row.unit}
        </span>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (row) => row.department?.name ?? "Company-wide",
    },
    {
      key: "deadline",
      label: "Deadline",
      sortable: true,
      render: (row) => (row.deadline ? new Date(row.deadline).toLocaleDateString() : "—"),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[row.status]}`}
        >
          {row.status.replace("_", " ")}
        </span>
      ),
    },
  ],
  fields: [
    { name: "title", label: "Title", type: "text", required: true, placeholder: "e.g. Reduce Carbon Footprint" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Goal description details…" },
    { name: "targetValue", label: "Target Value", type: "number", required: true, min: 0, defaultValue: 0 },
    { name: "currentValue", label: "Current Value", type: "number", required: true, min: 0, defaultValue: 0 },
    { name: "unit", label: "Unit", type: "text", required: true, placeholder: "e.g. tonnes CO2, kWh" },
    { name: "deadline", label: "Deadline", type: "text", placeholder: "YYYY-MM-DD" },
    {
      name: "departmentId",
      label: "Department",
      type: "select",
      optionsSource: { apiPath: "/departments", labelKey: "name", valueKey: "id" },
      helpText: "Select department or leave blank for Company-wide.",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      defaultValue: "ON_TRACK",
      options: [
        { label: "On Track", value: "ON_TRACK" },
        { label: "At Risk", value: "AT_RISK" },
        { label: "Completed", value: "COMPLETED" },
      ],
    },
  ],
};
