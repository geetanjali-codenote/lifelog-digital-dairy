import { NextRequest, NextResponse } from "next/server"
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"
import { GoogleGenAI } from "@google/genai"
import type { InsightsResponse } from "@/types/insights"

// In-memory cache: key = "userId:YYYY-MM-DD", value = { data, timestamp }
const insightsCache = new Map<string, { data: InsightsResponse; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

function getCacheKey(userId: string): string {
  const today = new Date().toISOString().split("T")[0]
  return `${userId}:${today}`
}

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuthUserId()
    const forceRefresh = new URL(request.url).searchParams.get("refresh") === "true"

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cacheKey = getCacheKey(userId)
      const cached = insightsCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json({ insights: cached.data, cached: true })
      }
    }

    // Gather data from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [entries, transactions, habits, user] = await Promise.all([
      prisma.diaryEntry.findMany({
        where: { userId, entryDate: { gte: thirtyDaysAgo } },
        include: { entryTags: { include: { tag: true } } },
        orderBy: { entryDate: "desc" },
      }),
      prisma.transaction.findMany({
        where: { userId, date: { gte: thirtyDaysAgo } },
        orderBy: { date: "desc" },
      }),
      prisma.habit.findMany({
        where: { userId, isActive: true },
        include: {
          habitLogs: { where: { logDate: { gte: thirtyDaysAgo } } },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, currency: true },
      }),
    ])

    // Insufficient data guard
    if (entries.length < 3 && transactions.length === 0) {
      return NextResponse.json({
        insights: null,
        cached: false,
        insufficientData: true,
      })
    }

    // Check for Gemini API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        insights: null,
        cached: false,
        error: "AI service is not configured",
      })
    }

    // Build summarized context for AI (privacy-conscious, truncated content)
    const uniqueDays = new Set(
      entries.map((e) => e.entryDate.toISOString().split("T")[0])
    )

    const moodCounts: Record<string, number> = {}
    for (const e of entries) {
      if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1
    }

    const spendingByCategory: Record<string, number> = {}
    let totalSpent = 0
    let totalIncome = 0
    for (const t of transactions) {
      const amount = Number(t.amount)
      if (t.type === "expense") {
        totalSpent += amount
        const cat = t.category || "Uncategorized"
        spendingByCategory[cat] = (spendingByCategory[cat] || 0) + amount
      } else {
        totalIncome += amount
      }
    }

    const contextForAI = {
      userName: user?.name || "User",
      currency: user?.currency || "INR",
      period: "Last 30 Days",
      entries: entries.map((e) => ({
        date: e.entryDate.toISOString().split("T")[0],
        mood: e.mood,
        hasHighlight: !!e.highlight,
        hasGratitude: !!e.gratitude,
        contentPreview: e.content.substring(0, 200),
        tags: e.entryTags.map((et) => et.tag.name),
      })),
      transactions: transactions.map((t) => ({
        date: t.date.toISOString().split("T")[0],
        type: t.type,
        amount: Number(t.amount),
        category: t.category || "Uncategorized",
        title: t.title,
      })),
      habits: habits.map((h) => ({
        name: h.name,
        totalLogs: h.habitLogs.length,
        completedLogs: h.habitLogs.filter((l) => l.isCompleted).length,
      })),
      summaryStats: {
        totalEntries: entries.length,
        uniqueDaysJournaled: uniqueDays.size,
        moodCounts,
        totalSpent,
        totalIncome,
        spendingByCategory,
      },
    }

    // Build Gemini system prompt
    const systemInstruction = `You are the LifeLog Insights Analyst. You analyze a user's diary entries, transactions, and habit tracking data to provide thoughtful, personalized insights.

The user's name is ${contextForAI.userName}. Their preferred currency is ${contextForAI.currency}.

You MUST respond with valid JSON matching this exact structure:
{
  "moodAnalysis": {
    "summary": "2-3 sentence overview of their emotional patterns",
    "dominantMood": "the most frequent mood as a single word",
    "moodTrend": "improving" | "stable" | "declining",
    "patterns": ["pattern 1", "pattern 2", "pattern 3"],
    "suggestion": "one actionable suggestion"
  },
  "activityInsights": {
    "summary": "2-3 sentence overview of journaling habits",
    "journalingConsistency": "e.g. Journaled 22 out of 30 days",
    "streakComment": "comment on their consistency",
    "patterns": ["pattern 1", "pattern 2"],
    "suggestion": "one actionable suggestion"
  },
  "spendingAnalysis": {
    "summary": "2-3 sentence overview of financial patterns",
    "totalSpent": number,
    "totalIncome": number,
    "topCategory": "highest spending category name",
    "patterns": ["pattern 1", "pattern 2"],
    "suggestion": "one actionable financial suggestion"
  },
  "habitInsights": {
    "summary": "2-3 sentence overview of habit tracking",
    "bestHabit": "name of most consistent habit or null",
    "completionRate": "overall percentage as string like 73%",
    "patterns": ["pattern 1", "pattern 2"],
    "suggestion": "one actionable suggestion"
  },
  "overallRecommendations": ["tip 1", "tip 2", "tip 3", "tip 4"],
  "motivationalNote": "A warm, personalized closing message"
}

Rules:
- Be warm, encouraging, and non-judgmental
- Reference specific data points (dates, moods, amounts) when possible
- Keep patterns concise (max 15 words each)
- Provide actionable, specific suggestions, not generic advice
- If habit data is empty, set habitInsights.bestHabit to null and note they haven't started tracking habits yet
- Format currency values as plain numbers (the frontend handles formatting)
- Do NOT wrap the JSON in markdown code blocks. Return raw JSON only.`

    // Call Gemini
    const ai = new GoogleGenAI({ apiKey })

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: JSON.stringify(contextForAI),
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    })

    const aiText = response.text ?? "{}"
    const parsed = JSON.parse(aiText)

    // Assemble full insights response
    const fullInsights: InsightsResponse = {
      generatedAt: new Date().toISOString(),
      periodLabel: "Last 30 Days",
      dataPoints: {
        totalEntries: entries.length,
        totalTransactions: transactions.length,
        totalHabitsTracked: habits.length,
        daysWithEntries: uniqueDays.size,
      },
      moodAnalysis: parsed.moodAnalysis,
      activityInsights: parsed.activityInsights,
      spendingAnalysis: parsed.spendingAnalysis,
      habitInsights: parsed.habitInsights,
      overallRecommendations: parsed.overallRecommendations || [],
      motivationalNote: parsed.motivationalNote || "",
    }

    // Cache the result
    insightsCache.set(getCacheKey(userId), {
      data: fullInsights,
      timestamp: Date.now(),
    })

    return NextResponse.json({ insights: fullInsights, cached: false })
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    console.error("GET /api/insights error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
