import { z } from "zod";

export const getDepartmentScoreQuerySchema = z.object({
  departmentId: z.string().optional(),
});
