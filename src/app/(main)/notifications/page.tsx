"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Bell, BellRing, Settings, Circle, CheckCircle2,
  Trash2, X, Wallet, BookOpen, Trophy, Info
} from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/motion/StaggeredList";
import toast from "react-hot-toast";

interface NotificationData {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  reminder: <BellRing className="w-5 h-5" />,
  memory: <BookOpen className="w-5 h-5" />,
  transaction: <Wallet className="w-5 h-5" />,
  achievement: <Trophy className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
  system: <Bell className="w-5 h-5" />,
};

const typeRoutes: Record<string, string> = {
  memory: "/timeline",
  transaction: "/transactions",
  reminder: "/dashboard",
  achievement: "/stats",
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    memories: true,
    transactions: true,
    reminders: true,
    achievements: true,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lifelog-notification-settings");
      if (stored) setSettings(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem("lifelog-notification-settings", JSON.stringify(newSettings));
    toast.success("Settings saved");
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      toast.error("Failed to load notifications");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      if (!res.ok) throw new Error();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      const wasUnread = notifications.find((n) => n.id === id && !n.isRead);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleNotificationClick = (notification: NotificationData) => {
    if (!notification.isRead) handleMarkRead(notification.id);
    const route = typeRoutes[notification.type];
    if (route) router.push(route);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="flex flex-col min-h-full pb-6 px-4 pt-6 overflow-y-auto w-full lg:px-8 lg:pt-10 lg:max-w-3xl lg:mx-auto">
      {/* Mobile Top App Bar */}
      <div className="flex justify-between items-center mb-6 h-8 lg:hidden">
        <Link href="/dashboard" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <span className="font-bold text-gray-900 text-lg">
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </span>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Settings className="w-6 h-6 text-gray-900" />
        </button>
      </div>

      {/* Desktop Header */}
      <FadeIn className="hidden lg:flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Notifications {unreadCount > 0 && <span className="text-brand">({unreadCount})</span>}
          </h1>
          <p className="text-gray-500 text-sm">Stay updated with your latest alerts and reminders.</p>
        </div>
        <div className="flex space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </FadeIn>

      {/* Mobile Mark All Read */}
      {unreadCount > 0 && (
        <div className="flex justify-end mb-3 lg:hidden">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center space-x-1 text-sm font-medium text-brand"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="bg-white lg:bg-transparent lg:shadow-none lg:border-none rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <StaggeredList className="divide-y divide-gray-100 lg:space-y-3 lg:divide-y-0" staggerDelay={0.05}>
            {notifications.map((notification) => (
              <StaggeredItem key={notification.id}>
                <div
                  className={`p-4 lg:p-5 flex items-start space-x-4 lg:rounded-2xl lg:border lg:border-transparent lg:hover:border-gray-200 lg:bg-white lg:shadow-sm transition-colors cursor-pointer group ${
                    !notification.isRead ? "bg-brand/5 lg:bg-brand/5" : "hover:bg-gray-50 lg:hover:bg-white"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    !notification.isRead ? "bg-brand text-white shadow-md shadow-brand/20" : "bg-gray-100 text-gray-500"
                  }`}>
                    {typeIcons[notification.type] || <Bell className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-sm font-bold truncate pr-4 ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}>
                        {notification.title}
                      </h3>
                      <span className="shrink-0 text-[11px] font-medium text-gray-400 mt-1">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm line-clamp-2 ${!notification.isRead ? "text-gray-700 font-medium" : "text-gray-500"}`}>
                      {notification.message}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center space-x-2 pt-2">
                    {!notification.isRead && (
                      <Circle className="w-2.5 h-2.5 fill-brand text-brand" />
                    )}
                    <button
                      onClick={(e) => handleDelete(notification.id, e)}
                      className="p-1 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </div>
      ) : (
        <FadeIn>
          <div className="text-center py-20 px-4">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              You have no notifications right now. We&apos;ll let you know when something new happens.
            </p>
          </div>
        </FadeIn>
      )}

      {/* Notification Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-white dark:bg-surface rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Notification Settings</h3>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-5">Choose which notifications you&apos;d like to receive.</p>

            <div className="space-y-1">
              {[
                { key: "memories", label: "Memory Reminders", desc: "Daily reminders to log your memories", icon: "📝" },
                { key: "transactions", label: "Transaction Alerts", desc: "Spending summaries and budget alerts", icon: "💰" },
                { key: "reminders", label: "Habit Reminders", desc: "Reminders for your daily habits", icon: "⏰" },
                { key: "achievements", label: "Achievements", desc: "Streak milestones and badges", icon: "🏆" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => saveSettings({ ...settings, [item.key]: !settings[item.key as keyof typeof settings] })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      settings[item.key as keyof typeof settings] ? "bg-brand" : "bg-gray-300"
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      settings[item.key as keyof typeof settings] ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-6 py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand-dark transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
