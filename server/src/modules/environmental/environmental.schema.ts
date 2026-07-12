import { z } from "zod";

export const createOperationalRecordSchema = z.object({
  type: z.enum(["PURCHASE", "MANUFACTURING", "EXPENSE", "FLEET"], {
    errorMap: () => ({ message: "Type must be PURCHASE, MANUFACTURING, EXPENSE, or FLEET" }),
  }),
  description: z.string().trim().min(3, "Description must be at least 3 characters"),
  quantity: z.number().min(0, "Quantity must be non-negative"),
  unit: z.string().trim().min(1, "Unit is required"),
  emissionFactorId: z.string().min(1, "Emission factor is required"),
  departmentId: z.string().min(1, "Department is required"),
});

export const updateOperationalRecordSchema = createOperationalRecordSchema.partial();

export const createCarbonTransactionSchema = z.object({
  description: z.string().trim().min(3, "Description must be at least 3 characters"),
  emissions: z.number().min(0, "Emissions must be non-negative"),
  departmentId: z.string().min(1, "Department is required"),
  recordedAt: z.coerce.date().optional(),
});

export const updateCarbonTransactionSchema = createCarbonTransactionSchema.partial();
