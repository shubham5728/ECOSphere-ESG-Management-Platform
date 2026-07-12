import { z } from "zod";

// ──── Challenges ────
export const createChallengeSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().trim().min(5, "Description too short"),
  startDate: z.coerce.date({ required_error: "Start date is required" }),
  endDate: z.coerce.date({ required_error: "End date is required" }),
  xpReward: z.number().int().nonnegative().default(100),
  pointsReward: z.number().int().nonnegative().default(200),
  status: z.enum(["DRAFT", "ACTIVE", "UNDER_REVIEW", "COMPLETED", "ARCHIVED"]).default("DRAFT"),
});

export const updateChallengeSchema = createChallengeSchema.partial();

// ──── Challenge Submission ────
export const submitChallengeSchema = z.object({
  challengeId: z.string().min(1, "Challenge ID is required"),
  proofUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  proofNote: z.string().trim().max(500).optional(),
});

export const reviewChallengeSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().trim().max(500).optional(),
});

// ──── Rewards Redemption ────
export const redeemRewardSchema = z.object({
  rewardId: z.string().min(1, "Reward ID is required"),
});
