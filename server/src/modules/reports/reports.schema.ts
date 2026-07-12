import { z } from "zod";

export const generateReportSchema = z.object({
  module: z.enum(["ENVIRONMENTAL", "SOCIAL", "GOVERNANCE", "SUMMARY"]),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  departmentId: z.string().optional().or(z.literal("")),
});
