import { PaginationMeta } from "./apiResponse";

export interface ParsedQuery {
  page: number;
  limit: number;
  skip: number;
  search: string;
  sortBy?: string;
  order: "asc" | "desc";
}

/** Safely parse list query params with sane defaults and bounds. */
export function parseListQuery(query: Record<string, unknown>): ParsedQuery {
  const page = Math.max(1, Number(query.page) || 1);
  const rawLimit = Number(query.limit) || 10;
  const limit = Math.min(100, Math.max(1, rawLimit));
  const search = typeof query.search === "string" ? query.search.trim() : "";
  const sortBy = typeof query.sortBy === "string" ? query.sortBy : undefined;
  const order = query.order === "asc" ? "asc" : "desc";

  return { page, limit, skip: (page - 1) * limit, search, sortBy, order };
}

export function buildMeta(page: number, limit: number, total: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
