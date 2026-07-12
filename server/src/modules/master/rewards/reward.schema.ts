import { z } from "zod";

export const createRewardSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().trim().min(5, "Description must be at least 5 characters"),
  pointsRequired: z.number().int().min(1, "Points required must be at least 1"),
  stock: z.number().int().min(0, "Stock cannot be negative").default(0),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const updateRewardSchema = createRewardSchema.partial();
