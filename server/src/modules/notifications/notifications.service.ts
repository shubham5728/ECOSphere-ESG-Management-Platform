import { prisma } from "../../lib/prisma";
import type { CreateNotificationDto } from "./notifications.schema";
import type { NotificationType } from "@prisma/client";

/** Create a single notification for a user */
export async function createNotification(dto: CreateNotificationDto) {
  return prisma.notification.create({
    data: {
      userId: dto.userId,
      type: dto.type as NotificationType,
      title: dto.title,
      message: dto.message,
      link: dto.link,
    },
  });
}

/** Broadcast a notification to every admin */
export async function notifyAdmins(
  payload: Omit<CreateNotificationDto, "userId">
) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  return Promise.all(
    admins.map((a: { id: string }) => createNotification({ ...payload, userId: a.id }))
  );
}

/** Get all notifications for a user, newest first */
export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

/** Count unread notifications for a user */
export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

/** Mark a single notification as read */
export async function markRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

/** Mark ALL notifications as read for a user */
export async function markAllRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
