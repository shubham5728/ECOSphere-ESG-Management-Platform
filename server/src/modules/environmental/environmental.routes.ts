import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { sendSuccess } from "../../utils/apiResponse";
import { AppError } from "../../middleware/errorHandler";
import { parseListQuery, buildMeta } from "../../utils/pagination";
import {
  createOperationalRecordSchema,
  updateOperationalRecordSchema,
  createCarbonTransactionSchema,
  updateCarbonTransactionSchema,
} from "./environmental.schema";
import * as envService from "./environmental.service";

const router = Router();

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────
router.get("/dashboard", authenticate, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await envService.getDashboard();
    return sendSuccess(res, data, "Dashboard data fetched");
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// Operational Records
// ──────────────────────────────────────────────
router.get("/operations", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip, search, sortBy, order } = parseListQuery(req.query);
    const sortableFields = ["type", "description", "quantity", "createdAt"];
    const orderField = sortBy && sortableFields.includes(sortBy) ? sortBy : "createdAt";

    const where = search
      ? { OR: [{ description: { contains: search, mode: "insensitive" as const } }] }
      : {};

    const [items, total] = await Promise.all([
      prisma.operationalRecord.findMany({
        where,
        orderBy: { [orderField]: order },
        skip,
        take: limit,
        include: {
          emissionFactor: { select: { id: true, name: true, unit: true, factor: true } },
          department: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
          carbonTransaction: { select: { id: true, emissions: true } },
        },
      }),
      prisma.operationalRecord.count({ where }),
    ]);

    return sendSuccess(res, items, "OK", 200, buildMeta(page, limit, total));
  } catch (err) {
    next(err);
  }
});

router.get("/operations/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.operationalRecord.findUnique({
      where: { id: req.params.id },
      include: {
        emissionFactor: true,
        department: true,
        user: { select: { id: true, name: true, email: true } },
        carbonTransaction: true,
      },
    });
    if (!item) throw new AppError("Operational record not found", 404);
    return sendSuccess(res, item);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/operations",
  authenticate,
  validate(createOperationalRecordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const record = await envService.createOperationalRecord(req.user!.sub, req.body);
      return sendSuccess(res, record, "Operational record created", 201);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/operations/:id",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validate(updateOperationalRecordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await prisma.operationalRecord.update({
        where: { id: req.params.id },
        data: req.body,
        include: {
          emissionFactor: true,
          department: true,
          user: { select: { id: true, name: true } },
        },
      });
      return sendSuccess(res, item, "Operational record updated");
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/operations/:id",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.operationalRecord.delete({ where: { id: req.params.id } });
      return sendSuccess(res, null, "Operational record deleted");
    } catch (err) {
      next(err);
    }
  }
);

// ──────────────────────────────────────────────
// Carbon Transactions (manual + auto-linked)
// ──────────────────────────────────────────────
router.get("/transactions", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip, search, sortBy, order } = parseListQuery(req.query);
    const sortableFields = ["emissions", "recordedAt", "createdAt"];
    const orderField = sortBy && sortableFields.includes(sortBy) ? sortBy : "recordedAt";

    const where = search
      ? { OR: [{ description: { contains: search, mode: "insensitive" as const } }] }
      : {};

    const [items, total] = await Promise.all([
      prisma.carbonTransaction.findMany({
        where,
        orderBy: { [orderField]: order },
        skip,
        take: limit,
        include: {
          department: { select: { id: true, name: true } },
          operationalRecord: { select: { id: true, type: true, description: true } },
        },
      }),
      prisma.carbonTransaction.count({ where }),
    ]);

    return sendSuccess(res, items, "OK", 200, buildMeta(page, limit, total));
  } catch (err) {
    next(err);
  }
});

router.get("/transactions/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.carbonTransaction.findUnique({
      where: { id: req.params.id },
      include: { department: true, operationalRecord: true },
    });
    if (!item) throw new AppError("Carbon transaction not found", 404);
    return sendSuccess(res, item);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/transactions",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validate(createCarbonTransactionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await prisma.carbonTransaction.create({ data: req.body, include: { department: true } });
      return sendSuccess(res, item, "Carbon transaction created", 201);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/transactions/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateCarbonTransactionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await prisma.carbonTransaction.update({
        where: { id: req.params.id },
        data: req.body,
        include: { department: true },
      });
      return sendSuccess(res, item, "Carbon transaction updated");
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/transactions/:id",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.carbonTransaction.delete({ where: { id: req.params.id } });
      return sendSuccess(res, null, "Carbon transaction deleted");
    } catch (err) {
      next(err);
    }
  }
);

export default router;
