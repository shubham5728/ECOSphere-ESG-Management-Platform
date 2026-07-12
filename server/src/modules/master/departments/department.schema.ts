import { z } from "zod";

// Empty strings from form selects should become null (optional relations).
const optionalId = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v === "" || v === undefined ? null : v));

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(20, "Code must be at most 20 characters")
    .toUpperCase(),
  headId: optionalId,
  parentId: optionalId,
  employeeCount: z.coerce
    .number({ invalid_type_error: "Employee count must be a number" })
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .default(0),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

// All fields optional for PATCH; keeps the same transforms/validation.
export const updateDepartmentSchema = createDepartmentSchema.partial();
