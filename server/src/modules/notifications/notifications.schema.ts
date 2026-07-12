import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.string(),
  type: z
    .enum([
      "BADGE_AWARDED",
      "CHALLENGE_CLOSED",
      "CHALLENGE_APPROVED",
      "CHALLENGE_REJECTED",
      "COMPLIANCE_OVERDUE",
      "REWARD_REDEEMED",
      "GENERAL",
    ])
    .default("GENERAL"),
  title: z.string().min(1),
  message: z.string().min(1),
  link: z.string().optional(),
});

export type CreateNotificationDto = z.infer<typeof createNotificationSchema>;
