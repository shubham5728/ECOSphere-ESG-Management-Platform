import { z } from "zod";

// ──── CSR Activity ────
export const createCsrActivitySchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().trim().min(5, "Description too short"),
  categoryId: z.string().optional(),
  startDate: z.coerce.date({ required_error: "Start date is required" }),
  endDate: z.coerce.date().optional(),
  location: z.string().trim().optional(),
  maxParticipants: z.number().int().positive().optional(),
  xpReward: z.number().int().min(0).default(50),
  pointsReward: z.number().int().min(0).default(100),
  departmentId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const updateCsrActivitySchema = createCsrActivitySchema.partial();

// ──── Participation ────
export const submitParticipationSchema = z.object({
  csrActivityId: z.string().min(1, "Activity ID is required"),
  proofUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  proofNote: z.string().trim().max(500).optional(),
});

export const reviewParticipationSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().trim().max(500).optional(),
});

// ──── Social Metric ────
export const createSocialMetricSchema = z.object({
  departmentId: z.string().min(1, "Department is required"),
  period: z.string().trim().min(1, "Period is required (e.g. 2024-Q1)"),
  totalEmployees: z.number().int().min(0).default(0),
  femaleCount: z.number().int().min(0).default(0),
  trainingHours: z.number().min(0).default(0),
  safetyIncidents: z.number().int().min(0).default(0),
  volunteerHours: z.number().min(0).default(0),
  notes: z.string().trim().optional(),
});

export const updateSocialMetricSchema = createSocialMetricSchema.partial();
