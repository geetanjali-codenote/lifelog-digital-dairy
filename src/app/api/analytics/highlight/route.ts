import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuthUserId()
    const { searchParams } = new URL(request.url)

    const moodFilter = searchParams.get("mood") || ""
    const favorite = searchParams.get("favorite") === "true"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = { userId }

    if (moodFilter) {
      where.mood = moodFilter
    }

    if (favorite) {
      where.entryTags = {
        some: {
          tag: {
            name: "Favorite"
          }
        }
      }
    }

    if (startDate || endDate) {
      where.entryDate = {}
      if (startDate) where.entryDate.gte = new Date(startDate)
      if (endDate) where.entryDate.lte = new Date(endDate)
    }

    // 1. Total memories
    const totalMemories = await prisma.diaryEntry.count({ where })

    // 2. Mood summary
    const moodCounts = await prisma.diaryEntry.groupBy({
      by: ["mood"],
      where,
      _count: { mood: true },
      orderBy: { _count: { mood: "desc" } },
    })

    const emojiMap: Record<string, string> = {
      happy: "😊",
      peaceful: "😌",
      excited: "🤩",
      creative: "🎨",
      reflective: "🤔",
      sad: "😢",
      anxious: "😰",
      angry: "😠",
      tired: "😴",
    }

    const moodSummary = moodCounts.map((m) => ({
      mood: m.mood,
      emoji: emojiMap[m.mood.toLowerCase()] || "🔹",
      count: m._count.mood,
    }))

    const topMood = moodSummary.length > 0 ? moodSummary[0].mood : "None"

    // 3. Monthly breakdown (Current Year)
    const currentYear = new Date().getFullYear()

    const entries = await prisma.diaryEntry.findMany({
      where: { userId },
      select: { entryDate: true },
    })

    const monthCounts = new Array(12).fill(0)
    entries.forEach((entry) => {
      if (entry.entryDate.getFullYear() === currentYear) {
        monthCounts[entry.entryDate.getMonth()]++
      }
    })

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const fullMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    const monthlyBreakdown = monthCounts.map((count, index) => ({
      month: monthNames[index],
      count,
    }))

    // Calculate most active month
    let maxCount = 0
    let mostActiveMonthIndex = 0
    monthCounts.forEach((count, index) => {
      if (count > maxCount) {
        maxCount = count
        mostActiveMonthIndex = index
      }
    })

    // Fall back to "None" if there are no memories this year
    const mostActiveMonth = maxCount > 0 ? fullMonthNames[mostActiveMonthIndex] : "None"

    // 4. Placeholder Top Place
    const topPlace = "Earth"

    return NextResponse.json({
      totalMemories,
      mostActiveMonth,
      topMood,
      topPlace,
      monthlyBreakdown,
      moodSummary,
    })
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    console.error("GET /api/analytics/highlight error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
