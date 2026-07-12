import { z } from "zod";

export const createEmissionFactorSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  source: z.string().trim().min(2, "Source must be at least 2 characters").max(100),
  unit: z.string().trim().min(1, "Unit is required").max(30),
  factor: z.number().min(0, "Factor must be non-negative"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const updateEmissionFactorSchema = createEmissionFactorSchema.partial();
