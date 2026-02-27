"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  PenLine,
  Wallet,
} from "lucide-react";
import { HoverLift } from "@/components/motion/HoverLift";
import type { InsightsApiResponse } from "@/types/insights";

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

const trendIcons = {
  improving: TrendingUp,
  stable: Minus,
  declining: TrendingDown,
};

export function InsightsPreviewCard() {
  const [data, setData] = useState<InsightsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insights")
      .then((res) => res.json())
      .then((d: InsightsApiResponse) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-violet-500 via-brand to-indigo-600 rounded-2xl p-5 lg:p-6 mb-6 lg:mb-8 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-white/20 rounded-lg" />
          <div className="h-5 w-28 bg-white/20 rounded-lg" />
        </div>
        <div className="h-4 w-3/4 bg-white/15 rounded mb-4" />
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-white/15 rounded-xl" />
          <div className="h-9 w-24 bg-white/15 rounded-xl" />
          <div className="h-9 w-24 bg-white/15 rounded-xl" />
        </div>
      </div>
    );
  }

  // Insufficient data — gentle prompt
  if (!data || data.insufficientData || data.error || !data.insights) {
    if (data?.error) return null; // Don't show card if AI service is down

    return (
      <div className="mb-6 lg:mb-8">
        <HoverLift>
          <Link href="/memory/new" className="block">
            <div className="bg-gradient-to-br from-violet-500 via-brand to-indigo-600 rounded-2xl p-5 lg:p-6 text-white relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-white/80" />
                  <span className="text-sm font-semibold text-white/80">AI Insights</span>
                </div>
                <p className="text-white font-medium mb-1">Keep journaling to unlock AI insights</p>
                <p className="text-white/60 text-sm">
                  We need at least 3 diary entries to analyze your mood, activities, and spending.
                </p>
              </div>
            </div>
          </Link>
        </HoverLift>
      </div>
    );
  }

  const { insights } = data;
  const TrendIcon = trendIcons[insights.moodAnalysis.moodTrend];
  const moodEmoji = MOOD_EMOJIS[insights.moodAnalysis.dominantMood] || "😐";

  return (
    <div className="mb-6 lg:mb-8">
      <HoverLift>
        <Link href="/insights" className="block">
          <div className="bg-gradient-to-br from-violet-500 via-brand to-indigo-600 rounded-2xl p-5 lg:p-6 text-white relative overflow-hidden group">
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/5 rounded-full" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-white/80" />
                  <span className="text-sm font-semibold text-white/80">AI Insights</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-white/60 group-hover:text-white/80 transition-colors">
                  View All
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              {/* Summary */}
              <p className="text-white font-medium text-sm leading-relaxed mb-4 line-clamp-2">
                {insights.moodAnalysis.summary}
              </p>

              {/* Quick Chips */}
              <div className="flex flex-wrap gap-2">
                {/* Mood chip */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-xl">
                  <span className="text-sm">{moodEmoji}</span>
                  <span className="text-xs font-medium capitalize">{insights.moodAnalysis.dominantMood}</span>
                  <TrendIcon className="w-3 h-3 text-white/70" />
                </div>

                {/* Journaling chip */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-xl">
                  <PenLine className="w-3 h-3 text-white/70" />
                  <span className="text-xs font-medium">
                    {insights.dataPoints.daysWithEntries}/{30} days
                  </span>
                </div>

                {/* Spending chip */}
                {insights.spendingAnalysis.topCategory && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-xl">
                    <Wallet className="w-3 h-3 text-white/70" />
                    <span className="text-xs font-medium">{insights.spendingAnalysis.topCategory}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </HoverLift>
    </div>
  );
}
