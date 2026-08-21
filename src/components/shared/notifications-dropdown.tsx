"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getUserNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
  NotificationRecord,
} from "@/actions/notifications";
import { formatDate } from "@/lib/utils";

export function NotificationsDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const res = await getUserNotificationsAction();
      if (res.success && res.data) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();

    // Close on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [fetchNotifications]);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notif: NotificationRecord) => {
    if (!notif.isRead) {
      await markNotificationReadAction(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsReadAction();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className="relative h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border bg-card p-4 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-foreground">Notifications</h4>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                  {unreadCount} unread
                </Badge>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
              >
                <CheckCheck className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y pt-2">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-start gap-2.5 ${
                    notif.isRead
                      ? "hover:bg-muted/40 text-muted-foreground"
                      : "bg-primary/5 hover:bg-primary/10 text-foreground font-medium"
                  }`}
                >
                  <div
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      notif.isRead ? "bg-transparent" : "bg-primary"
                    }`}
                  />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-xs font-semibold leading-tight">
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[9px] text-muted-foreground/60 block pt-0.5">
                      {new Date(notif.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      • {formatDate(notif.createdAt)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
