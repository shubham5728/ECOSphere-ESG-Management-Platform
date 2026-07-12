import { useCallback, useEffect, useState } from "react";
import { crudApi } from "../../api/crud";
import { getApiError } from "../../api/client";
import type { PaginationMeta } from "./types";

interface Query {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  order: "asc" | "desc";
}

const DEFAULT_QUERY: Query = {
  page: 1,
  limit: 10,
  search: "",
  sortBy: "createdAt",
  order: "desc",
};

/** Stateful list + CRUD controller for one master-data endpoint. */
export function useCrud<T extends { id: string }>(apiPath: string) {
  const apiRef = crudApi<T>(apiPath);
  const [rows, setRows] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [query, setQuery] = useState<Query>(DEFAULT_QUERY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiRef.list(query);
      setRows(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
    // apiRef is re-created each render but is stateless; depend on apiPath+query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath, query]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // --- query controls ---
  const setPage = (page: number) => setQuery((q) => ({ ...q, page }));
  const setSearch = (search: string) => setQuery((q) => ({ ...q, search, page: 1 }));
  const toggleSort = (key: string) =>
    setQuery((q) => ({
      ...q,
      sortBy: key,
      order: q.sortBy === key && q.order === "asc" ? "desc" : "asc",
    }));

  // --- mutations (return void; throw on error for the caller to show) ---
  const create = async (payload: Partial<T>) => {
    await apiRef.create(payload);
    await fetchList();
  };
  const update = async (id: string, payload: Partial<T>) => {
    await apiRef.update(id, payload);
    await fetchList();
  };
  const remove = async (id: string) => {
    await apiRef.remove(id);
    // If we deleted the last row on a page, step back a page.
    if (rows.length === 1 && query.page > 1) setPage(query.page - 1);
    else await fetchList();
  };

  return {
    rows,
    meta,
    query,
    loading,
    error,
    setPage,
    setSearch,
    toggleSort,
    create,
    update,
    remove,
    refetch: fetchList,
  };
}
