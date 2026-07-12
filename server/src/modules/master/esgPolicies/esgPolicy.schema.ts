import { z } from "zod";

export const createEsgPolicySchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(120),
  description: z.string().trim().min(5, "Description must be at least 5 characters"),
  version: z.string().trim().min(1, "Version is required").default("1.0"),
  effectiveDate: z.coerce.date().default(() => new Date()),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const updateEsgPolicySchema = createEsgPolicySchema.partial();
