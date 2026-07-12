import { z } from "zod";

export const createEnvironmentalGoalSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(120),
  description: z.string().trim().max(500).nullable().optional(),
  targetValue: z.number().min(0, "Target value must be non-negative"),
  currentValue: z.number().min(0, "Current value must be non-negative").default(0),
  unit: z.string().trim().min(1, "Unit is required").max(30),
  deadline: z.coerce.date().nullable().optional(),
  departmentId: z.string().nullable().optional(),
  status: z.enum(["ON_TRACK", "AT_RISK", "COMPLETED"]).default("ON_TRACK"),
});

export const updateEnvironmentalGoalSchema = createEnvironmentalGoalSchema.partial();
