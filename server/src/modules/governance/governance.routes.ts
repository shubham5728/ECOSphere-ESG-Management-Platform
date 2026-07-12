import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { sendSuccess } from "../../utils/apiResponse";
import { AppError } from "../../middleware/errorHandler";
import { parseListQuery, buildMeta } from "../../utils/pagination";
import {
  acknowledgePolicySchema,
  createAuditSchema,
  updateAuditSchema,
  createComplianceIssueSchema,
  updateComplianceIssueSchema,
} from "./governance.schema";
import * as govService from "./governance.service";

const router = Router();

// ════════════════════════════════════════
// Governance Dashboard
// ════════════════════════════════════════
router.get("/dashboard", authenticate, async (_req, res, next) => {
  try {
    const data = await govService.getGovernanceDashboard();
    return sendSuccess(res, data, "Governance dashboard fetched");
  } catch (err) { next(err); }
});

// ════════════════════════════════════════
// Policy Acknowledgement Flow
// ════════════════════════════════════════
router.get("/my-acknowledgements", authenticate, async (req, res, next) => {
  try {
    const items = await prisma.policyAcknowledgement.findMany({
      where: { userId: req.user!.sub },
      select: { policyId: true, acknowledgedAt: true }
    });
    return sendSuccess(res, items);
  } catch (err) { next(err); }
});

router.post(
  "/acknowledge",
  authenticate,
  validate(acknowledgePolicySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { policyId } = req.body;
      const userId = req.user!.sub;

      const policy = await prisma.eSGPolicy.findUnique({ where: { id: policyId } });
      if (!policy) throw new AppError("Policy not found", 404);
      if (policy.status !== "ACTIVE") throw new AppError("Policy is not active", 400);

      const ack = await prisma.policyAcknowledgement.upsert({
        where: { policyId_userId: { policyId, userId } },
        update: {},
        create: { policyId, userId }
      });

      return sendSuccess(res, ack, "Policy successfully acknowledged", 201);
    } catch (err) { next(err); }
  }
);

// ════════════════════════════════════════
// Audits Log CRUD
// ════════════════════════════════════════
router.get("/audits", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip, search, sortBy, order } = parseListQuery(req.query);
    const sortFields = ["title", "auditor", "auditDate", "score", "createdAt"];
    const orderField = sortBy && sortFields.includes(sortBy) ? sortBy : "auditDate";

    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { auditor: { contains: search, mode: "insensitive" as const } },
            { findings: { contains: search, mode: "insensitive" as const } }
          ]
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.audit.findMany({
        where,
        orderBy: { [orderField]: order },
        skip,
        take: limit,
        include: { department: { select: { id: true, name: true } } }
      }),
      prisma.audit.count({ where })
    ]);

    return sendSuccess(res, items, "OK", 200, buildMeta(page, limit, total));
  } catch (err) { next(err); }
});

router.post(
  "/audits",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validate(createAuditSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await prisma.audit.create({
        data: req.body,
        include: { department: { select: { id: true, name: true } } }
      });
      return sendSuccess(res, item, "Audit record logged successfully", 201);
    } catch (err) { next(err); }
  }
);

router.patch(
  "/audits/:id",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validate(updateAuditSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await prisma.audit.update({
        where: { id: req.params.id },
        data: req.body,
        include: { department: { select: { id: true, name: true } } }
      });
      return sendSuccess(res, item, "Audit record updated");
    } catch (err) { next(err); }
  }
);

router.delete(
  "/audits/:id",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.audit.delete({ where: { id: req.params.id } });
      return sendSuccess(res, null, "Audit record deleted");
    } catch (err) { next(err); }
  }
);

// ════════════════════════════════════════
// Compliance Issues CRUD
// ════════════════════════════════════════
router.get("/compliance-issues", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip, search, sortBy, order } = parseListQuery(req.query);
    const sortFields = ["title", "severity", "status", "dueDate", "createdAt"];
    const orderField = sortBy && sortFields.includes(sortBy) ? sortBy : "dueDate";

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } }
      ];
    }

    // Normal employees can only view issues assigned to them
    if (req.user?.role === "EMPLOYEE") {
      where.ownerId = req.user.sub;
    }

    const [items, total] = await Promise.all([
      prisma.complianceIssue.findMany({
        where,
        orderBy: { [orderField]: order },
        skip,
        take: limit,
        include: {
          owner: { select: { id: true, name: true, email: true } },
          department: { select: { id: true, name: true } }
        }
      }),
      prisma.complianceIssue.count({ where })
    ]);

    const now = new Date();
    const enrichedItems = items.map((item) => ({
      ...item,
      isOverdue: item.status !== "RESOLVED" && new Date(item.dueDate) < now
    }));

    return sendSuccess(res, enrichedItems, "OK", 200, buildMeta(page, limit, total));
  } catch (err) { next(err); }
});

router.post(
  "/compliance-issues",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validate(createComplianceIssueSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await prisma.complianceIssue.create({
        data: req.body,
        include: {
          owner: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } }
        }
      });
      return sendSuccess(res, item, "Compliance issue created successfully", 201);
    } catch (err) { next(err); }
  }
);

router.patch(
  "/compliance-issues/:id",
  authenticate,
  validate(updateComplianceIssueSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await prisma.complianceIssue.findUnique({ where: { id: req.params.id } });
      if (!existing) throw new AppError("Compliance issue not found", 404);

      // Employees can only update status to RESOLVED for their own issues, managers/admin can update anything
      if (req.user?.role === "EMPLOYEE") {
        if (existing.ownerId !== req.user.sub) {
          throw new AppError("You do not own this compliance issue", 403);
        }
        if (req.body.status && req.body.status !== "RESOLVED" && req.body.status !== "IN_PROGRESS") {
          throw new AppError("Employees can only transition status to IN_PROGRESS or RESOLVED", 400);
        }
      }

      const updateData: any = { ...req.body };
      if (updateData.status === "RESOLVED") {
        updateData.resolvedAt = new Date();
      } else if (updateData.status && updateData.status !== "RESOLVED") {
        updateData.resolvedAt = null;
      }

      const item = await prisma.complianceIssue.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
          owner: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } }
        }
      });
      return sendSuccess(res, item, "Compliance issue updated");
    } catch (err) { next(err); }
  }
);

router.delete(
  "/compliance-issues/:id",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.complianceIssue.delete({ where: { id: req.params.id } });
      return sendSuccess(res, null, "Compliance issue deleted");
    } catch (err) { next(err); }
  }
);

export default router;
