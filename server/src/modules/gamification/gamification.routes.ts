import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { sendSuccess } from "../../utils/apiResponse";
import { AppError } from "../../middleware/errorHandler";
import { parseListQuery, buildMeta } from "../../utils/pagination";
import {
  createChallengeSchema,
  updateChallengeSchema,
  submitChallengeSchema,
  reviewChallengeSchema,
  redeemRewardSchema,
} from "./gamification.schema";
import * as gamificationService from "./gamification.service";

const router = Router();

// ════════════════════════════════════════
// Leaderboards
// ════════════════════════════════════════
router.get("/leaderboard", authenticate, async (_req, res, next) => {
  try {
    const data = await gamificationService.getLeaderboards();
    return sendSuccess(res, data, "Leaderboard data fetched");
  } catch (err) { next(err); }
});

// ════════════════════════════════════════
// Challenges CRUD & Submissions
// ════════════════════════════════════════
router.get("/challenges", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip, search, sortBy, order } = parseListQuery(req.query);
    const sortFields = ["title", "startDate", "endDate", "xpReward", "pointsReward"];
    const orderField = sortBy && sortFields.includes(sortBy) ? sortBy : "startDate";

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ];
    }

    // Non-elevated staff can't see DRAFT challenges
    if (req.user?.role === "EMPLOYEE") {
      where.status = { not: "DRAFT" };
    }

    const [items, total] = await Promise.all([
      prisma.challenge.findMany({
        where,
        orderBy: { [orderField]: order },
        skip,
        take: limit,
        include: {
          _count: { select: { participations: true } },
        },
      }),
      prisma.challenge.count({ where }),
    ]);

    return sendSuccess(res, items, "OK", 200, buildMeta(page, limit, total));
  } catch (err) { next(err); }
});

router.post(
  "/challenges",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validate(createChallengeSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await prisma.challenge.create({ data: req.body });
      return sendSuccess(res, item, "Challenge created successfully", 201);
    } catch (err) { next(err); }
  }
);

router.patch(
  "/challenges/:id",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validate(updateChallengeSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await prisma.challenge.update({ where: { id: req.params.id }, data: req.body });
      return sendSuccess(res, item, "Challenge updated successfully");
    } catch (err) { next(err); }
  }
);

router.delete(
  "/challenges/:id",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.challenge.delete({ where: { id: req.params.id } });
      return sendSuccess(res, null, "Challenge deleted successfully");
    } catch (err) { next(err); }
  }
);

// ════════════════════════════════════════
// Challenge Participations
// ════════════════════════════════════════
router.get("/participations", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip, sortBy, order } = parseListQuery(req.query);
    const where: any = {};

    // Filter by user role
    if (req.user?.role === "EMPLOYEE") {
      where.userId = req.user.sub;
    }

    const sortFields = ["submittedAt", "status"];
    const orderField = sortBy && sortFields.includes(sortBy) ? sortBy : "submittedAt";

    const [items, total] = await Promise.all([
      prisma.challengeParticipation.findMany({
        where,
        orderBy: { [orderField]: order },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          challenge: { select: { id: true, title: true, xpReward: true, pointsReward: true } },
        },
      }),
      prisma.challengeParticipation.count({ where }),
    ]);

    return sendSuccess(res, items, "OK", 200, buildMeta(page, limit, total));
  } catch (err) { next(err); }
});

router.post(
  "/participations",
  authenticate,
  validate(submitChallengeSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await gamificationService.submitChallengeParticipation(req.user!.sub, req.body);
      return sendSuccess(res, item, "Challenge submission received", 201);
    } catch (err) { next(err); }
  }
);

router.patch(
  "/participations/:id/review",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validate(reviewChallengeSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await gamificationService.reviewChallengeParticipation(req.params.id, req.body);
      return sendSuccess(
        res,
        result.updated,
        `Submission ${req.body.status.toLowerCase()}. ${
          result.newBadges.length > 0 ? `Unlocks: ${result.newBadges.join(", ")}` : ""
        }`
      );
    } catch (err) { next(err); }
  }
);

// ════════════════════════════════════════
// Reward Redemptions & Badges List
// ════════════════════════════════════════
router.get("/redemptions", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parseListQuery(req.query);
    const where: any = {};
    if (req.user?.role === "EMPLOYEE") {
      where.userId = req.user.sub;
    }

    const [items, total] = await Promise.all([
      prisma.rewardRedemption.findMany({
        where,
        orderBy: { redeemedAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true } },
          reward: { select: { id: true, name: true, pointsRequired: true } },
        },
      }),
      prisma.rewardRedemption.count({ where }),
    ]);

    return sendSuccess(res, items, "OK", 200, buildMeta(page, limit, total));
  } catch (err) { next(err); }
});

router.post(
  "/redeem",
  authenticate,
  validate(redeemRewardSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await gamificationService.redeemReward(req.user!.sub, req.body.rewardId);
      return sendSuccess(res, item, "Reward successfully redeemed!", 201);
    } catch (err) { next(err); }
  }
);

router.get("/my-badges", authenticate, async (req, res, next) => {
  try {
    const items = await prisma.userBadge.findMany({
      where: { userId: req.user!.sub },
      include: { badge: true },
      orderBy: { unlockedAt: "desc" },
    });
    return sendSuccess(res, items);
  } catch (err) { next(err); }
});

export default router;
