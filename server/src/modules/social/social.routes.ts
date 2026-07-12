import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { sendSuccess } from "../../utils/apiResponse";
import { AppError } from "../../middleware/errorHandler";
import { parseListQuery, buildMeta } from "../../utils/pagination";
import {
  createCsrActivitySchema,
  updateCsrActivitySchema,
  submitParticipationSchema,
  reviewParticipationSchema,
  createSocialMetricSchema,
  updateSocialMetricSchema,
} from "./social.schema";
import * as socialService from "./social.service";

const router = Router();

// ════════════════════════════════════════
// Social Dashboard
// ════════════════════════════════════════
router.get("/dashboard", authenticate, async (_req, res, next) => {
  try {
    const data = await socialService.getSocialDashboard();
    return sendSuccess(res, data, "Social dashboard fetched");
  } catch (err) { next(err); }
});

// ════════════════════════════════════════
// CSR Activities
// ════════════════════════════════════════
router.get("/activities", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip, search, sortBy, order } = parseListQuery(req.query);
    const sortFields = ["title", "startDate", "xpReward", "pointsReward", "createdAt"];
    const orderField = sortBy && sortFields.includes(sortBy) ? sortBy : "startDate";

    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { location: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.csrActivity.findMany({
        where,
        orderBy: { [orderField]: order },
        skip,
        take: limit,
        include: {
          department: { select: { id: true, name: true } },
          _count: { select: { participations: true } },
        },
      }),
      prisma.csrActivity.count({ where }),
    ]);

    return sendSuccess(res, items, "OK", 200, buildMeta(page, limit, total));
  } catch (err) { next(err); }
});

router.get("/activities/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.csrActivity.findUnique({
      where: { id: req.params.id },
      include: {
        department: true,
        participations: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { submittedAt: "desc" },
        },
      },
    });
    if (!item) throw new AppError("CSR activity not found", 404);
    return sendSuccess(res, item);
  } catch (err) { next(err); }
});

router.post(
  "/activities",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validate(createCsrActivitySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await prisma.csrActivity.create({
        data: req.body,
        include: { department: { select: { id: true, name: true } } },
      });
      return sendSuccess(res, item, "CSR activity created", 201);
    } catch (err) { next(err); }
  }
);

router.patch(
  "/activities/:id",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validate(updateCsrActivitySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await prisma.csrActivity.update({
        where: { id: req.params.id },
        data: req.body,
        include: { department: { select: { id: true, name: true } } },
      });
      return sendSuccess(res, item, "CSR activity updated");
    } catch (err) { next(err); }
  }
);

router.delete(
  "/activities/:id",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.csrActivity.delete({ where: { id: req.params.id } });
      return sendSuccess(res, null, "CSR activity deleted");
    } catch (err) { next(err); }
  }
);

// ════════════════════════════════════════
// Participations (Employee submits + Manager/Admin reviews)
// ════════════════════════════════════════
router.get("/participations", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip, sortBy, order } = parseListQuery(req.query);
    const statusFilter = typeof req.query.status === "string" ? req.query.status : undefined;
    const activityFilter = typeof req.query.activityId === "string" ? req.query.activityId : undefined;

    const where: Record<string, unknown> = {};
    if (statusFilter) where.status = statusFilter;
    if (activityFilter) where.csrActivityId = activityFilter;

    // Employees can only see their own; managers/admin see all
    if (req.user?.role === "EMPLOYEE") {
      where.userId = req.user.sub;
    }

    const sortFields = ["submittedAt", "reviewedAt", "status"];
    const orderField = sortBy && sortFields.includes(sortBy) ? sortBy : "submittedAt";

    const [items, total] = await Promise.all([
      prisma.participation.findMany({
        where,
        orderBy: { [orderField]: order },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          csrActivity: { select: { id: true, title: true, xpReward: true, pointsReward: true } },
        },
      }),
      prisma.participation.count({ where }),
    ]);

    return sendSuccess(res, items, "OK", 200, buildMeta(page, limit, total));
  } catch (err) { next(err); }
});

// Employee submits participation
router.post(
  "/participations",
  authenticate,
  validate(submitParticipationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check activity exists and is active
      const activity = await prisma.csrActivity.findUnique({ where: { id: req.body.csrActivityId } });
      if (!activity) throw new AppError("CSR activity not found", 404);
      if (activity.status !== "ACTIVE") throw new AppError("CSR activity is not active", 400);

      // Check max participants
      if (activity.maxParticipants) {
        const count = await prisma.participation.count({ where: { csrActivityId: activity.id } });
        if (count >= activity.maxParticipants) throw new AppError("Activity is full", 400);
      }

      // Check evidence requirement from settings
      const settings = await prisma.setting.findUnique({ where: { id: 1 } });
      if (settings?.evidenceRequired && !req.body.proofUrl && !req.body.proofNote) {
        throw new AppError("Proof (URL or note) is required as per platform settings", 400);
      }

      const item = await prisma.participation.create({
        data: {
          csrActivityId: req.body.csrActivityId,
          userId: req.user!.sub,
          proofUrl: req.body.proofUrl || null,
          proofNote: req.body.proofNote || null,
        },
        include: {
          user: { select: { id: true, name: true } },
          csrActivity: { select: { id: true, title: true } },
        },
      });
      return sendSuccess(res, item, "Participation submitted — awaiting review", 201);
    } catch (err) { next(err); }
  }
);

// Manager/Admin reviews participation
router.patch(
  "/participations/:id/review",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validate(reviewParticipationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await socialService.reviewParticipation(req.params.id, req.body);
      return sendSuccess(res, updated, `Participation ${req.body.status.toLowerCase()}`);
    } catch (err) { next(err); }
  }
);

router.delete(
  "/participations/:id",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.participation.delete({ where: { id: req.params.id } });
      return sendSuccess(res, null, "Participation deleted");
    } catch (err) { next(err); }
  }
);

// ════════════════════════════════════════
// Social Metrics (diversity, training, safety)
// ════════════════════════════════════════
router.get("/metrics", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip, sortBy, order } = parseListQuery(req.query);
    const deptFilter = typeof req.query.departmentId === "string" ? req.query.departmentId : undefined;

    const where: Record<string, unknown> = {};
    if (deptFilter) where.departmentId = deptFilter;

    const sortFields = ["period", "totalEmployees", "trainingHours", "createdAt"];
    const orderField = sortBy && sortFields.includes(sortBy) ? sortBy : "period";

    const [items, total] = await Promise.all([
      prisma.socialMetric.findMany({
        where,
        orderBy: { [orderField]: order },
        skip,
        take: limit,
        include: { department: { select: { id: true, name: true } } },
      }),
      prisma.socialMetric.count({ where }),
    ]);

    return sendSuccess(res, items, "OK", 200, buildMeta(page, limit, total));
  } catch (err) { next(err); }
});

router.post(
  "/metrics",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validate(createSocialMetricSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await prisma.socialMetric.create({
        data: req.body,
        include: { department: { select: { id: true, name: true } } },
      });
      return sendSuccess(res, item, "Social metric created", 201);
    } catch (err) { next(err); }
  }
);

router.patch(
  "/metrics/:id",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validate(updateSocialMetricSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await prisma.socialMetric.update({
        where: { id: req.params.id },
        data: req.body,
        include: { department: { select: { id: true, name: true } } },
      });
      return sendSuccess(res, item, "Social metric updated");
    } catch (err) { next(err); }
  }
);

router.delete(
  "/metrics/:id",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.socialMetric.delete({ where: { id: req.params.id } });
      return sendSuccess(res, null, "Social metric deleted");
    } catch (err) { next(err); }
  }
);

export default router;
