import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils"

export async function GET() {
  try {
    const userId = await requireAuthUserId()

    const [
      totalEntries,
      expenseResult,
      recentEntries,
      moodCounts,
    ] = await Promise.all([
      prisma.diaryEntry.count({ where: { userId } }),
      prisma.diaryEntry.aggregate({
        where: { userId },
        _sum: { expense: true },
      }),
      prisma.diaryEntry.findMany({
        where: { userId },
        include: {
          entryTags: { include: { tag: true } },
        },
        orderBy: { entryDate: "desc" },
        take: 5,
      }),
      prisma.diaryEntry.groupBy({
        by: ["mood"],
        where: { userId },
        _count: { mood: true },
        orderBy: { _count: { mood: "desc" } },
        take: 1,
      }),
    ])

    // Calculate streak
    const streak = await calculateStreak(userId)

    const topMood = moodCounts.length > 0 ? moodCounts[0].mood : null

    return NextResponse.json({
      totalEntries,
      totalExpenses: expenseResult._sum.expense ? Number(expenseResult._sum.expense) : 0,
      streak,
      topMood,
      recentEntries: recentEntries.map((entry) => ({
        ...entry,
        tags: entry.entryTags.map((et) => et.tag),
        expense: entry.expense ? Number(entry.expense) : null,
      })),
    })
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    console.error("GET /api/dashboard/stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function calculateStreak(userId: string): Promise<number> {
  const entries = await prisma.diaryEntry.findMany({
    where: { userId },
    select: { entryDate: true },
    orderBy: { entryDate: "desc" },
    distinct: ["entryDate"],
    take: 365,
  })

  if (entries.length === 0) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let checkDate = new Date(today)

  const latestEntry = new Date(entries[0].entryDate)
  latestEntry.setHours(0, 0, 0, 0)

  if (latestEntry.getTime() < today.getTime()) {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (latestEntry.getTime() < yesterday.getTime()) {
      return 0
    }
    checkDate = yesterday
  }

  const entryDates = new Set(
    entries.map((e) => {
      const d = new Date(e.entryDate)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
  )

  while (entryDates.has(checkDate.getTime())) {
    streak++
    checkDate.setDate(checkDate.getDate() - 1)
  }

  return streak
}
