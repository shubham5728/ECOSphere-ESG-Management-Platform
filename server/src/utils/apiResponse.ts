import { Response } from "express";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "OK",
  status = 200,
  meta?: PaginationMeta
) {
  return res.status(status).json({ success: true, message, data, meta });
}

export function sendError(res: Response, message: string, status = 400, details?: unknown) {
  return res.status(status).json({ success: false, message, details });
}
