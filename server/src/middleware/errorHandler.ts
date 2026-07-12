import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { sendError } from "../utils/apiResponse";

/** Custom application error carrying an HTTP status. */
export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

// 404 handler for unknown routes.
export function notFound(_req: Request, res: Response) {
  return sendError(res, "Route not found", 404);
}

// Central error handler — keep last in the middleware chain.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return sendError(res, "Validation failed", 422, details);
  }

  if (err instanceof AppError) {
    return sendError(res, err.message, err.status);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[])?.join(", ") ?? "field";
      return sendError(res, `A record with this ${target} already exists`, 409);
    }
    if (err.code === "P2025") {
      return sendError(res, "Record not found", 404);
    }
  }

  console.error("[UNHANDLED ERROR]", err);
  return sendError(res, "Internal server error", 500);
}
