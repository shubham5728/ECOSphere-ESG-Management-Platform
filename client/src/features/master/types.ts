import type { ReactNode } from "react";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type FieldType = "text" | "number" | "select" | "textarea";

export interface SelectOption {
  label: string;
  value: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  /** Load options from an API list endpoint (e.g. parent department). */
  optionsSource?: { apiPath: string; labelKey: string; valueKey: string };
  defaultValue?: string | number;
  min?: number;
  helpText?: string;
}

export interface ColumnConfig<T = Record<string, unknown>> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
}

export interface EntityConfig<T = Record<string, unknown>> {
  title: string;
  singular: string;
  apiPath: string;
  columns: ColumnConfig<T>[];
  fields: FieldConfig[];
  searchPlaceholder?: string;
}
