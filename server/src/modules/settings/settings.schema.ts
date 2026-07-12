import { z } from "zod";

const weight = z.coerce.number().int().min(0).max(100);

export const updateSettingsSchema = z
  .object({
    autoEmission: z.boolean().optional(),
    evidenceRequired: z.boolean().optional(),
    badgeAutoAward: z.boolean().optional(),
    weightEnv: weight.optional(),
    weightSocial: weight.optional(),
    weightGov: weight.optional(),
  })
  .refine(
    (data) => {
      // If any weight is provided, all three must be present and sum to 100.
      const anyWeight =
        data.weightEnv !== undefined ||
        data.weightSocial !== undefined ||
        data.weightGov !== undefined;
      if (!anyWeight) return true;
      const { weightEnv, weightSocial, weightGov } = data;
      if (weightEnv === undefined || weightSocial === undefined || weightGov === undefined)
        return false;
      return weightEnv + weightSocial + weightGov === 100;
    },
    {
      message: "ESG weightages must all be provided and sum to exactly 100",
      path: ["weightEnv"],
    }
  );

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
