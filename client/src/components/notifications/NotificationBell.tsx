import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Award,
  CheckCircle2,
  XCircle,
  Lock,
  ShieldAlert,
  Gift,
  type LucideIcon,
} from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import "./NotificationBell.css";

const TYPE_ICON: Record<string, LucideIcon> = {
  BADGE_AWARDED: Award,
  CHALLENGE_APPROVED: CheckCircle2,
  CHALLENGE_REJECTED: XCircle,
  CHALLENGE_CLOSED: Lock,
  COMPLIANCE_OVERDUE: ShieldAlert,
  REWARD_REDEEMED: Gift,
  GENERAL: Bell,
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = async (n: {
    id: string;
    isRead: boolean;
    link?: string | null;
  }) => {
    if (!n.isRead) await markRead(n.id);
    if (n.link) navigate(n.link);
    setOpen(false);
  };

  return (
    <div className="notif-bell-wrapper" ref={dropRef}>
      <button
        id="notif-bell-btn"
        className="notif-bell-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications – ${unreadCount} unread`}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span className="notif-header-title">Notifications</span>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">You're all caught up! 🎉</div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  className={`notif-item ${n.isRead ? "notif-item--read" : "notif-item--unread"}`}
                  onClick={() => handleClick(n)}
                >
                  <span className="notif-item-icon">
                    {(() => {
                      const Icon = TYPE_ICON[n.type] ?? Bell;
                      return <Icon size={18} />;
                    })()}
                  </span>
                  <div className="notif-item-body">
                    <p className="notif-item-title">{n.title}</p>
                    <p className="notif-item-msg">{n.message}</p>
                    <p className="notif-item-time">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.isRead && <span className="notif-dot" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
