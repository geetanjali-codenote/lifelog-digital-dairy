"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  RefreshCw,
  Brain,
  Heart,
  PenLine,
  Wallet,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Plus,
  Clock,
} from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/motion/StaggeredList";
import type { InsightsResponse, InsightsApiResponse } from "@/types/insights";

const MOOD_EMOJIS: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  excited: "🤩",
  anxious: "😰",
  peaceful: "😌",
  angry: "😠",
  grateful: "🙏",
  confused: "😕",
  motivated: "💪",
  tired: "😴",
  loved: "🥰",
  neutral: "😐",
};

function getTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function TrendBadge({ trend }: { trend: "improving" | "stable" | "declining" }) {
  const config = {
    improving: {
      icon: TrendingUp,
      label: "Improving",
      bg: "bg-emerald-100 dark:bg-emerald-500/15",
      text: "text-emerald-700 dark:text-emerald-400",
    },
    stable: {
      icon: Minus,
      label: "Stable",
      bg: "bg-gray-100 dark:bg-gray-500/15",
      text: "text-gray-600 dark:text-gray-400",
    },
    declining: {
      icon: TrendingDown,
      label: "Needs attention",
      bg: "bg-amber-100 dark:bg-amber-500/15",
      text: "text-amber-700 dark:text-amber-400",
    },
  };
  const c = config[trend];
  const Icon = c.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

function InsightCard({
  icon: Icon,
  title,
  accentColor,
  children,
}: {
  icon: React.ElementType;
  title: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-surface border border-border rounded-2xl overflow-hidden`}>
      <div className={`h-1 ${accentColor}`} />
      <div className="p-5 lg:p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentColor.replace("bg-", "bg-").replace("-500", "-100")} bg-opacity-20`}>
            <Icon className={`w-4.5 h-4.5 ${accentColor.replace("bg-", "text-")}`} />
          </div>
          <h3 className="font-bold text-foreground">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}

function SuggestionBox({ text }: { text: string }) {
  return (
    <div className="mt-4 bg-brand-light dark:bg-brand/10 rounded-xl p-4 flex gap-3">
      <Lightbulb className="w-5 h-5 text-brand shrink-0 mt-0.5" />
      <p className="text-sm text-brand-dark dark:text-brand font-medium leading-relaxed">{text}</p>
    </div>
  );
}

function PatternsList({ patterns }: { patterns: string[] }) {
  if (!patterns || patterns.length === 0) return null;
  return (
    <ul className="mt-3 space-y-2">
      {patterns.map((pattern, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-brand/40 shrink-0 mt-1.5" />
          {pattern}
        </li>
      ))}
    </ul>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-full pb-6 px-4 pt-6 w-full lg:px-8 lg:pt-10 lg:max-w-4xl lg:mx-auto">
      <div className="flex items-center gap-3 mb-6 lg:hidden">
        <div className="w-9 h-9 bg-gray-100 dark:bg-white/10 rounded-full animate-pulse" />
        <div className="h-6 w-32 bg-gray-100 dark:bg-white/10 rounded-lg animate-pulse" />
      </div>
      <div className="hidden lg:block mb-8">
        <div className="h-8 w-48 bg-gray-100 dark:bg-white/10 rounded-xl animate-pulse mb-2" />
        <div className="h-4 w-72 bg-gray-100 dark:bg-white/10 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="h-1 bg-gray-100 dark:bg-white/10 animate-pulse" />
            <div className="p-5 lg:p-6 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/10 animate-pulse" />
                <div className="h-5 w-36 bg-gray-100 dark:bg-white/10 rounded-lg animate-pulse" />
              </div>
              <div className="h-4 w-full bg-gray-100 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-100 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-100 dark:bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsufficientData() {
  return (
    <div className="flex flex-col min-h-full pb-6 px-4 pt-6 w-full lg:px-8 lg:pt-10 lg:max-w-4xl lg:mx-auto">
      <div className="flex items-center gap-3 mb-6 lg:hidden">
        <Link href="/dashboard" className="w-9 h-9 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">AI Insights</h1>
      </div>
      <div className="text-center py-16 px-4">
        <div className="w-20 h-20 bg-brand-light dark:bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Brain className="w-10 h-10 text-brand" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">Not enough data yet</h3>
        <p className="text-text-muted text-sm mb-6 max-w-sm mx-auto leading-relaxed">
          Keep journaling! We need at least 3 diary entries to generate personalized AI insights about your mood, activities, and spending.
        </p>
        <Link
          href="/memory/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white font-semibold rounded-xl hover:bg-brand-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Write a Memory
        </Link>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [insufficientData, setInsufficientData] = useState(false);
  const [error, setError] = useState("");

  const fetchInsights = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const url = refresh ? "/api/insights?refresh=true" : "/api/insights";
      const res = await fetch(url);
      const data: InsightsApiResponse = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load insights");
        return;
      }

      if (data.insufficientData) {
        setInsufficientData(true);
        return;
      }

      if (data.error) {
        setError(data.error);
        return;
      }

      setInsights(data.insights);
      setInsufficientData(false);
    } catch {
      setError("Failed to load insights. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (insufficientData) return <InsufficientData />;

  return (
    <div className="flex flex-col min-h-full pb-6 px-4 pt-6 overflow-y-auto w-full lg:px-8 lg:pt-10 lg:max-w-4xl lg:mx-auto">
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between mb-6 lg:hidden">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="w-9 h-9 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/15 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <h1 className="text-lg font-bold text-foreground">AI Insights</h1>
        </div>
        <button
          onClick={() => fetchInsights(true)}
          disabled={refreshing}
          className="w-9 h-9 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/15 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-300 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Desktop Header */}
      <FadeIn>
        <div className="hidden lg:flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Brain className="w-7 h-7 text-brand" />
              <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
            </div>
            <p className="text-text-muted text-sm">
              Personalized analysis of your mood, activities, and spending patterns.
            </p>
          </div>
          <button
            onClick={() => fetchInsights(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm font-medium text-text-muted hover:bg-surface-hover hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Regenerate
          </button>
        </div>
      </FadeIn>

      {/* Error State */}
      {error && (
        <FadeIn>
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        </FadeIn>
      )}

      {insights && (
        <>
          {/* Generated timestamp */}
          <FadeIn delay={0.05}>
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-3.5 h-3.5 text-text-subtle" />
              <span className="text-xs text-text-subtle">
                Generated {getTimeAgo(insights.generatedAt)} &middot; {insights.periodLabel}
              </span>
            </div>
          </FadeIn>

          {/* Data Points Ribbon */}
          <FadeIn delay={0.08}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Entries", value: insights.dataPoints.totalEntries },
                { label: "Days Active", value: insights.dataPoints.daysWithEntries },
                { label: "Transactions", value: insights.dataPoints.totalTransactions },
                { label: "Habits Tracked", value: insights.dataPoints.totalHabitsTracked },
              ].map((stat) => (
                <div key={stat.label} className="bg-surface border border-border rounded-xl px-4 py-3 text-center">
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Insight Cards */}
          <StaggeredList className="space-y-4" staggerDelay={0.08}>
            {/* Mood Analysis */}
            <StaggeredItem>
              <InsightCard icon={Heart} title="Mood Analysis" accentColor="bg-amber-500">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-2xl">{MOOD_EMOJIS[insights.moodAnalysis.dominantMood] || "😐"}</span>
                  <span className="text-sm font-semibold text-foreground capitalize">
                    {insights.moodAnalysis.dominantMood}
                  </span>
                  <TrendBadge trend={insights.moodAnalysis.moodTrend} />
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{insights.moodAnalysis.summary}</p>
                <PatternsList patterns={insights.moodAnalysis.patterns} />
                <SuggestionBox text={insights.moodAnalysis.suggestion} />
              </InsightCard>
            </StaggeredItem>

            {/* Activity Insights */}
            <StaggeredItem>
              <InsightCard icon={PenLine} title="Activity & Journaling" accentColor="bg-brand">
                <div className="flex flex-wrap gap-3 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-light dark:bg-brand/10 rounded-lg text-sm font-medium text-brand">
                    <PenLine className="w-3.5 h-3.5" />
                    {insights.activityInsights.journalingConsistency}
                  </span>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{insights.activityInsights.summary}</p>
                <p className="text-sm text-text-muted leading-relaxed mt-2 italic">{insights.activityInsights.streakComment}</p>
                <PatternsList patterns={insights.activityInsights.patterns} />
                <SuggestionBox text={insights.activityInsights.suggestion} />
              </InsightCard>
            </StaggeredItem>

            {/* Spending Analysis */}
            <StaggeredItem>
              <InsightCard icon={Wallet} title="Spending Analysis" accentColor="bg-emerald-500">
                <div className="flex flex-wrap gap-3 mb-3">
                  <div className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 rounded-lg">
                    <p className="text-xs text-text-muted">Spent</p>
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">
                      {insights.spendingAnalysis.totalSpent.toLocaleString()}
                    </p>
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                    <p className="text-xs text-text-muted">Income</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {insights.spendingAnalysis.totalIncome.toLocaleString()}
                    </p>
                  </div>
                  {insights.spendingAnalysis.topCategory && (
                    <div className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 rounded-lg">
                      <p className="text-xs text-text-muted">Top Category</p>
                      <p className="text-sm font-bold text-foreground">{insights.spendingAnalysis.topCategory}</p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{insights.spendingAnalysis.summary}</p>
                <PatternsList patterns={insights.spendingAnalysis.patterns} />
                <SuggestionBox text={insights.spendingAnalysis.suggestion} />
              </InsightCard>
            </StaggeredItem>

            {/* Habit Insights */}
            <StaggeredItem>
              <InsightCard icon={Target} title="Habit Tracking" accentColor="bg-violet-500">
                <div className="flex flex-wrap gap-3 mb-3">
                  {insights.habitInsights.bestHabit && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 dark:bg-violet-500/15 rounded-lg text-sm font-medium text-violet-700 dark:text-violet-400">
                      <Target className="w-3.5 h-3.5" />
                      {insights.habitInsights.bestHabit}
                    </span>
                  )}
                  <span className="inline-flex items-center px-3 py-1.5 bg-gray-50 dark:bg-white/5 rounded-lg text-sm font-medium text-foreground">
                    {insights.habitInsights.completionRate} completion
                  </span>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{insights.habitInsights.summary}</p>
                <PatternsList patterns={insights.habitInsights.patterns} />
                <SuggestionBox text={insights.habitInsights.suggestion} />
              </InsightCard>
            </StaggeredItem>

            {/* Overall Recommendations */}
            <StaggeredItem>
              <div className="bg-surface border border-border rounded-2xl p-5 lg:p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-light dark:bg-brand/10 flex items-center justify-center">
                    <Sparkles className="w-4.5 h-4.5 text-brand" />
                  </div>
                  <h3 className="font-bold text-foreground">Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {insights.overallRecommendations.map((tip, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 bg-gradient-to-r from-brand/5 to-violet-500/5 dark:from-brand/10 dark:to-violet-500/10 rounded-xl p-4"
                    >
                      <span className="w-7 h-7 bg-brand text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm text-foreground leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </StaggeredItem>

            {/* Motivational Note */}
            {insights.motivationalNote && (
              <StaggeredItem>
                <div className="relative overflow-hidden bg-gradient-to-br from-brand via-brand-dark to-indigo-700 rounded-2xl p-6 text-white">
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
                  <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-white/80" />
                      <span className="text-sm font-semibold text-white/80">A note for you</span>
                    </div>
                    <p className="text-base leading-relaxed font-medium">{insights.motivationalNote}</p>
                  </div>
                </div>
              </StaggeredItem>
            )}
          </StaggeredList>

          {/* Bottom action */}
          <FadeIn delay={0.4}>
            <div className="mt-6 text-center">
              <Link
                href="/memory/new"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-dark transition-colors"
              >
                Write a new memory to improve your insights
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>
        </>
      )}
    </div>
  );
}
