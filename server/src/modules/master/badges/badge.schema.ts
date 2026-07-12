import { z } from "zod";

export const createBadgeSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  description: z.string().trim().min(5, "Description must be at least 5 characters"),
  unlockRule: z.enum(["XP_THRESHOLD", "CHALLENGE_COUNT"], {
    errorMap: () => ({ message: "Unlock rule must be XP_THRESHOLD or CHALLENGE_COUNT" }),
  }),
  threshold: z.number().int().min(1, "Threshold must be at least 1"),
  icon: z.string().trim().min(1, "Icon is required").default("🏅"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const updateBadgeSchema = createBadgeSchema.partial();
