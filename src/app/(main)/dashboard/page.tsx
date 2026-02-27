"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Plus,
  PenLine,
  Clock,
  Image as ImageIcon,
  Wallet,
  BarChart3,
  Bell,
  Sparkles,
  ArrowRight,
  Flame,
  FileText,
  LogIn,
  UserPlus,
} from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/motion/StaggeredList";
import { HoverLift } from "@/components/motion/HoverLift";

interface DashboardStats {
  totalMemories: number;
  streak: number;
}

const dailyQuotes = [
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", emoji: "🌱" },
  { text: "Every day is a new beginning. Take a deep breath and start again.", emoji: "🌅" },
  { text: "Your life is your story. Write well. Edit often.", emoji: "✍️" },
  { text: "Be yourself; everyone else is already taken.", emoji: "💫" },
  { text: "The only way to do great work is to love what you do.", emoji: "❤️" },
  { text: "Today is a good day to have a good day.", emoji: "☀️" },
  { text: "Small steps every day lead to big changes.", emoji: "👣" },
  { text: "You are braver than you believe, stronger than you seem.", emoji: "🦁" },
  { text: "Happiness is not by chance, but by choice.", emoji: "🌻" },
  { text: "What you do today can improve all your tomorrows.", emoji: "🚀" },
  { text: "Life is 10% what happens and 90% how you react.", emoji: "🎯" },
  { text: "The journey of a thousand miles begins with one step.", emoji: "🏔️" },
  { text: "Be the change you wish to see in the world.", emoji: "🌍" },
  { text: "Collect moments, not things.", emoji: "📸" },
  { text: "Every moment is a fresh beginning.", emoji: "🌸" },
  { text: "Turn your wounds into wisdom.", emoji: "🦋" },
  { text: "Breathe. It's just a bad day, not a bad life.", emoji: "🍃" },
  { text: "Stars can't shine without darkness.", emoji: "✨" },
  { text: "Do more of what makes you happy.", emoji: "🎉" },
  { text: "You are enough, just as you are.", emoji: "💜" },
  { text: "Make today so awesome, yesterday gets jealous.", emoji: "🔥" },
  { text: "Progress, not perfection.", emoji: "📈" },
  { text: "Be gentle with yourself. You're doing the best you can.", emoji: "🤗" },
  { text: "Every ending is a new beginning in disguise.", emoji: "🌈" },
  { text: "Your vibe attracts your tribe.", emoji: "🫶" },
  { text: "Dream big. Start small. Act now.", emoji: "💭" },
  { text: "Gratitude turns what we have into enough.", emoji: "🙏" },
  { text: "Let your light shine bright.", emoji: "🌟" },
  { text: "Adventures await around every corner.", emoji: "🗺️" },
  { text: "You're one step closer than you were yesterday.", emoji: "🎯" },
  { text: "Create the life you can't wait to wake up to.", emoji: "🌞" },
];

function getDailyQuote() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return dailyQuotes[dayOfYear % dailyQuotes.length];
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

const features = [
  {
    title: "Write a Memory",
    description: "Capture your thoughts, feelings, and moments in a diary entry.",
    icon: PenLine,
    href: "/memory/new",
    color: "bg-brand text-white",
    iconBg: "bg-white/20",
    primary: true,
  },
  {
    title: "My Memories",
    description: "Browse and revisit all your past memories on the timeline.",
    icon: Clock,
    href: "/timeline",
    color: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-100 dark:bg-violet-500/15",
  },
  {
    title: "Photo Gallery",
    description: "View and upload your photos & videos, organized by date and mood.",
    icon: ImageIcon,
    href: "/gallery",
    color: "text-pink-600 dark:text-pink-400",
    iconBg: "bg-pink-100 dark:bg-pink-500/15",
  },
  {
    title: "Transactions",
    description: "Track your income and expenses to stay on top of your finances.",
    icon: Wallet,
    href: "/transactions",
    color: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/15",
  },
  {
    title: "Financial Stats",
    description: "Analyze spending trends, view charts, and download reports.",
    icon: BarChart3,
    href: "/stats",
    color: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-500/15",
  },
  {
    title: "Highlights",
    description: "See your most meaningful and favorited moments at a glance.",
    icon: Sparkles,
    href: "/highlight",
    color: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-500/15",
  },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setStatsLoading(false);
      return;
    }
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats({
          totalMemories: data.totalMemories ?? data.totalEntries ?? 0,
          streak: data.streak ?? 0,
        });
      })
      .catch(console.error)
      .finally(() => setStatsLoading(false));
  }, [isAuthenticated]);

  const firstName = session?.user?.name?.split(" ")[0] || "";
  const quote = getDailyQuote();

  return (
    <div className="flex flex-col min-h-full pb-6 px-4 pt-6 overflow-y-auto w-full lg:px-8 lg:pt-10 lg:max-w-5xl lg:mx-auto">
      {/* Mobile Top App Bar */}
      <div className="flex justify-between items-center mb-6 lg:hidden">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">LifeLog</span>
        </div>
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/notifications"
                className="w-8 h-8 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
              >
                <Bell className="w-4 h-4" />
              </Link>
              <Link href="/profile" className="w-8 h-8 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center overflow-hidden border border-orange-200 dark:border-orange-500/30">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                    {firstName.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </Link>
            </>
          ) : !isLoading ? (
            <Link
              href="/signin"
              className="flex items-center space-x-1.5 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-dark transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          ) : null}
        </div>
      </div>

      {/* Hero / Welcome Section */}
      <FadeIn>
        <div className="relative overflow-hidden bg-gradient-to-br from-brand via-brand-dark to-indigo-700 rounded-2xl lg:rounded-3xl p-6 lg:p-10 mb-6 lg:mb-8 text-white">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/5 rounded-full" />

          <div className="relative z-10">
            <p className="text-white/70 text-sm font-medium mb-1 lg:mb-2">
              {getGreeting()}
            </p>
            <h1 className="text-2xl lg:text-4xl font-bold mb-2 lg:mb-3 tracking-tight">
              {isAuthenticated
                ? `Welcome back, ${firstName} 👋`
                : "Welcome to LifeLog 👋"}
            </h1>
            <p className="text-white/70 text-sm lg:text-base max-w-lg leading-relaxed mb-5 lg:mb-6">
              {isAuthenticated
                ? "Your personal space to journal memories, track finances, and capture life\u2019s moments. What would you like to do today?"
                : "Your personal diary to journal memories, track finances, capture photos, and reflect on life\u2019s best moments. Get started for free."}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <Link
                  href="/memory/new"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 lg:px-6 lg:py-3 bg-white text-brand font-semibold rounded-xl hover:bg-white/90 transition-colors text-sm lg:text-base shadow-lg shadow-black/10"
                >
                  <Plus className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={2.5} />
                  <span>New Memory</span>
                </Link>
              ) : !isLoading ? (
                <>
                  <Link
                    href="/signin"
                    className="inline-flex items-center space-x-2 px-5 py-2.5 lg:px-6 lg:py-3 bg-white text-brand font-semibold rounded-xl hover:bg-white/90 transition-colors text-sm lg:text-base shadow-lg shadow-black/10"
                  >
                    <LogIn className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>Sign In</span>
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Daily Inspiration */}
      <FadeIn delay={0.05}>
        <div className="bg-surface border border-border rounded-2xl p-4 lg:p-5 mb-6 lg:mb-8">
          <div className="flex items-start space-x-3">
            <span className="text-2xl shrink-0">{quote.emoji}</span>
            <div>
              <p className="text-sm lg:text-base text-text-muted italic leading-relaxed">
                &ldquo;{quote.text}&rdquo;
              </p>
              <p className="text-[10px] font-semibold text-brand/60 mt-1.5 tracking-wider">
                DAILY INSPIRATION
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Quick Stats Ribbon — only for authenticated users */}
      {isAuthenticated && (
        <FadeIn delay={0.1}>
          <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl">
              <FileText className="w-4 h-4 text-brand" />
              <span className="text-sm font-semibold text-foreground">
                {statsLoading ? "—" : stats?.totalMemories ?? 0}
              </span>
              <span className="text-xs text-text-muted">memories</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-foreground">
                {statsLoading ? "—" : stats?.streak ?? 0}
              </span>
              <span className="text-xs text-text-muted">day streak</span>
            </div>
          </div>
        </FadeIn>
      )}

      {/* Section Title */}
      <FadeIn delay={0.15}>
        <div className="mb-4 lg:mb-5 px-1">
          <h2 className="text-lg lg:text-xl font-bold text-foreground">
            {isAuthenticated ? "Explore LifeLog" : "What you can do"}
          </h2>
          <p className="text-sm text-text-muted mt-0.5">
            {isAuthenticated
              ? "Everything you need to manage your personal journal."
              : "LifeLog helps you organize your life in one place."}
          </p>
        </div>
      </FadeIn>

      {/* Feature Cards Grid */}
      <StaggeredList
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4"
        staggerDelay={0.06}
      >
        {features.map((feature) => {
          const Icon = feature.icon;

          if (feature.primary) {
            return (
              <StaggeredItem key={feature.href}>
                <Link href={feature.href} className="block sm:col-span-2 lg:col-span-1">
                  <HoverLift>
                    <div className="bg-brand rounded-2xl p-5 lg:p-6 text-white group transition-all h-full">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-base lg:text-lg mb-1">{feature.title}</h3>
                      <p className="text-white/70 text-sm leading-relaxed mb-4">
                        {feature.description}
                      </p>
                      <div className="flex items-center text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                        <span>{isAuthenticated ? "Get started" : "Try it"}</span>
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </HoverLift>
                </Link>
              </StaggeredItem>
            );
          }

          return (
            <StaggeredItem key={feature.href}>
              <Link href={feature.href} className="block h-full">
                <HoverLift className="h-full">
                  <div className="bg-surface border border-border rounded-2xl p-5 lg:p-6 group transition-all h-full flex flex-col">
                    <div className={`w-10 h-10 ${feature.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <h3 className="font-bold text-base text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-text-muted text-sm leading-relaxed mb-4 flex-1">
                      {feature.description}
                    </p>
                    <div className={`flex items-center text-sm font-medium ${feature.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
                      <span>{isAuthenticated ? "Open" : "Learn more"}</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </HoverLift>
              </Link>
            </StaggeredItem>
          );
        })}
      </StaggeredList>

      {/* FAB — mobile only, authenticated only */}
      {isAuthenticated && (
        <div className="fixed bottom-24 right-5 z-[60] lg:hidden">
          <Link
            href="/memory/new"
            className="w-14 h-14 bg-brand hover:bg-brand-dark text-white rounded-full flex items-center justify-center shadow-lg shadow-brand/30 transition-transform active:scale-95"
          >
            <Plus className="w-8 h-8" strokeWidth={2} />
          </Link>
        </div>
      )}
    </div>
  );
}
