"use client";

import Link from "next/link";
import { BookOpen, LogIn, UserPlus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function PublicNavbar() {
  return (
    <header className="hidden lg:block fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-surface/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center shadow-sm shadow-brand/20">
            <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">
            LifeLog
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <Link
            href="/signin"
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
          <Link
            href="/signup"
            className="flex items-center space-x-2 px-4 py-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-brand/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Get Started</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
