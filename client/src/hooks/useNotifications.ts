import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../api/client";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [nRes, cRes] = await Promise.all([
        api.get<AppNotification[]>("/notifications/me"),
        api.get<{ count: number }>("/notifications/me/unread-count"),
      ]);
      setNotifications(nRes.data);
      setUnreadCount(cRes.data.count);
    } catch {
      // silent – notifications are non-critical
    }
  }, []);

  useEffect(() => {
    fetchAll();
    // Poll every 30 s for new notifications
    intervalRef.current = setInterval(fetchAll, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAll]);

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await api.patch("/notifications/me/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markRead, markAllRead, refresh: fetchAll };
}
