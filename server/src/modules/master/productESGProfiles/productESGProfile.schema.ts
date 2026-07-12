import { z } from "zod";

export const createProductESGProfileSchema = z.object({
  productName: z.string().trim().min(2, "Product name must be at least 2 characters").max(100),
  category: z.string().trim().min(2, "Category must be at least 2 characters").max(60),
  carbonPerUnit: z.number().min(0, "Carbon per unit must be non-negative"),
  recyclablePct: z.number().min(0).max(100, "Recyclable percentage must be between 0 and 100").nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const updateProductESGProfileSchema = createProductESGProfileSchema.partial();
