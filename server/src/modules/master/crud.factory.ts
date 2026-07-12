import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { parseListQuery, buildMeta } from "../../utils/pagination";
import { AppError } from "../../middleware/errorHandler";

/**
 * A minimal shape of a Prisma model delegate — just the methods the
 * factory needs. Using `any` for args keeps this generic across models.
 */
export interface ModelDelegate {
  findMany: (args: any) => Promise<unknown[]>;
  findUnique: (args: any) => Promise<unknown>;
  count: (args: any) => Promise<number>;
  create: (args: any) => Promise<unknown>;
  update: (args: any) => Promise<unknown>;
  delete: (args: any) => Promise<unknown>;
}

export interface CrudOptions {
  /** String fields searched with case-insensitive `contains`. */
  searchFields?: string[];
  /** Fields allowed in `sortBy` (anything else falls back to defaultSort). */
  sortableFields?: string[];
  /** Default order field when none/invalid provided. */
  defaultSort?: string;
  /** Prisma `include` applied to list/getOne (e.g. relations). */
  include?: Record<string, unknown>;
  /** Human label used in "<label> not found" messages. */
  label?: string;
}

/**
 * Build a set of Express handlers (list, getOne, create, update, remove)
 * for any Prisma model. Validation is applied at the route level via Zod,
 * so handlers trust req.body.
 */
export function createCrud(delegate: ModelDelegate, options: CrudOptions = {}) {
  const {
    searchFields = [],
    sortableFields = [],
    defaultSort = "createdAt",
    include,
    label = "Record",
  } = options;

  async function list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip, search, sortBy, order } = parseListQuery(req.query);

      const where =
        search && searchFields.length
          ? {
              OR: searchFields.map((field) => ({
                [field]: { contains: search, mode: "insensitive" },
              })),
            }
          : {};

      const orderField =
        sortBy && sortableFields.includes(sortBy) ? sortBy : defaultSort;

      const [items, total] = await Promise.all([
        delegate.findMany({
          where,
          orderBy: { [orderField]: order },
          skip,
          take: limit,
          include,
        }),
        delegate.count({ where }),
      ]);

      return sendSuccess(res, items, "OK", 200, buildMeta(page, limit, total));
    } catch (err) {
      next(err);
    }
  }

  async function getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await delegate.findUnique({ where: { id: req.params.id }, include });
      if (!item) throw new AppError(`${label} not found`, 404);
      return sendSuccess(res, item);
    } catch (err) {
      next(err);
    }
  }

  async function create(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await delegate.create({ data: req.body });
      return sendSuccess(res, item, `${label} created successfully`, 201);
    } catch (err) {
      next(err);
    }
  }

  async function update(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await delegate.update({
        where: { id: req.params.id },
        data: req.body,
      });
      return sendSuccess(res, item, `${label} updated successfully`);
    } catch (err) {
      next(err);
    }
  }

  async function remove(req: Request, res: Response, next: NextFunction) {
    try {
      await delegate.delete({ where: { id: req.params.id } });
      return sendSuccess(res, null, `${label} deleted successfully`);
    } catch (err) {
      next(err);
    }
  }

  return { list, getOne, create, update, remove };
}
