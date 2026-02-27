"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Book, BarChart3, User, Plus, BookOpen, LogOut, Bell, Sparkles, Settings, Sun, Chrome as Moon, Wallet, Image as ImageIcon } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Memories", href: "/timeline", icon: Book },
  { name: "Highlights", href: "/highlight", icon: Sparkles },
  { name: "Gallery", href: "/gallery", icon: ImageIcon },
  { name: "Transactions", href: "/transactions", icon: Wallet },
  { name: "Stats", href: "/stats", icon: BarChart3 },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Profile", href: "/profile", icon: User },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setUnreadCount(data.unreadCount || 0))
      .catch(() => { });
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/signin");
  };

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image;

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[260px] bg-white dark:bg-sidebar-bg border-r border-gray-100 z-40 px-4 py-6">
      {/* Logo */}
      <div className="flex items-center space-x-3 px-3 mb-8">
        <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-sm shadow-brand/20">
          <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-gray-900 text-xl tracking-tight">LifeLog</span>
      </div>

      {/* New Memory Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.push("/memory/new")}
        className="flex items-center justify-center space-x-2 w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold shadow-md shadow-brand/20 transition-colors mb-8"
      >
        <Plus className="w-5 h-5" strokeWidth={2.5} />
        <span>New Memory</span>
      </motion.button>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href) && item.href !== "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative",
                isActive
                  ? "bg-brand-light text-brand"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <IconComponent className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.name}</span>
              {item.name === "Notifications" && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              {isActive && item.name !== "Notifications" && (
                <motion.div
                  layoutId="sidebar-active-dot"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-brand"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="mt-auto border-t border-gray-100 pt-4 pb-2 space-y-4">
        <div className="flex items-center justify-between px-3">
          <ThemeToggle />
        </div>
        <Link href="/profile" className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors group">
          <div className="w-9 h-9 bg-brand-light rounded-full flex items-center justify-center border border-brand/20 overflow-hidden shrink-0">
            {userImage ? (
              <img src={userImage} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-brand">
                {userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 group-hover:text-brand transition-colors truncate">{userName}</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </aside>
  );
}
