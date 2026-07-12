import { api } from "./client";
import type { PaginationMeta } from "../features/master/types";

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface ListResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Generic CRUD calls against any master-data endpoint. */
export function crudApi<T extends { id: string }>(apiPath: string) {
  return {
    async list(params: ListParams): Promise<ListResult<T>> {
      const { data } = await api.get(apiPath, { params });
      return { data: data.data, meta: data.meta };
    },
    async create(payload: Partial<T>): Promise<T> {
      const { data } = await api.post(apiPath, payload);
      return data.data;
    },
    async update(id: string, payload: Partial<T>): Promise<T> {
      const { data } = await api.patch(`${apiPath}/${id}`, payload);
      return data.data;
    },
    async remove(id: string): Promise<void> {
      await api.delete(`${apiPath}/${id}`);
    },
  };
}
