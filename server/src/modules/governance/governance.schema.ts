import { z } from "zod";

// ──── Policy Acknowledgement ────
export const acknowledgePolicySchema = z.object({
  policyId: z.string().min(1, "Policy ID is required"),
});

// ──── Audits ────
export const createAuditSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  auditor: z.string().trim().min(2, "Auditor name is required"),
  auditDate: z.coerce.date({ required_error: "Audit date is required" }),
  rating: z.enum(["EXCELLENT", "SATISFACTORY", "NEEDS_IMPROVEMENT"], {
    errorMap: () => ({ message: "Rating must be EXCELLENT, SATISFACTORY, or NEEDS_IMPROVEMENT" }),
  }),
  score: z.number().min(0).max(100).optional(),
  findings: z.string().trim().min(5, "Findings summary must be at least 5 characters"),
  departmentId: z.string().min(1, "Department is required"),
});

export const updateAuditSchema = createAuditSchema.partial();

// ──── Compliance Issues ────
export const createComplianceIssueSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().trim().min(5, "Description too short"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"], {
    errorMap: () => ({ message: "Severity must be LOW, MEDIUM, HIGH, or CRITICAL" }),
  }),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).default("OPEN"),
  dueDate: z.coerce.date({ required_error: "Due date is required" }),
  ownerId: z.string().min(1, "Owner is required"),
  departmentId: z.string().min(1, "Department is required"),
});

export const updateComplianceIssueSchema = createComplianceIssueSchema.partial();
