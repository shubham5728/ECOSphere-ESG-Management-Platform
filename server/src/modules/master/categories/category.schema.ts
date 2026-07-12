import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  type: z.enum(["CSR_ACTIVITY", "CHALLENGE"], {
    errorMap: () => ({ message: "Type must be CSR_ACTIVITY or CHALLENGE" }),
  }),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const updateCategorySchema = createCategorySchema.partial();
