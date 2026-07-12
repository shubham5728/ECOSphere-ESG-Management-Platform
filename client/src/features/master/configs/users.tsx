import type { EntityConfig } from "../types";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  status: "ACTIVE" | "INACTIVE";
  departmentId: string | null;
  department?: { id: string; name: string } | null;
  createdAt: string;
}

const ROLE_LABEL: Record<User["role"], string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
};

export const usersConfig: EntityConfig<User> = {
  title: "Users",
  singular: "User",
  apiPath: "/users",
  searchPlaceholder: "Search by name or email…",
  columns: [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (row) => (
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
          {ROLE_LABEL[row.role]}
        </span>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (row) => row.department?.name ?? "—",
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
    { name: "name", label: "Name", type: "text", required: true, placeholder: "e.g. John Doe" },
    { name: "email", label: "Email", type: "text", required: true, placeholder: "e.g. john@ecosphere.local" },
    {
      name: "password",
      label: "Password",
      type: "text",
      placeholder: "Enter new password (optional on edit)",
      helpText: "Must be at least 8 characters, containing letters and numbers.",
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      options: [
        { label: "Admin", value: "ADMIN" },
        { label: "Manager", value: "MANAGER" },
        { label: "Employee", value: "EMPLOYEE" },
      ],
    },
    {
      name: "departmentId",
      label: "Department",
      type: "select",
      optionsSource: { apiPath: "/departments", labelKey: "name", valueKey: "id" },
      helpText: "Select user department.",
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
