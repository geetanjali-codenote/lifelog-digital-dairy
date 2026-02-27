import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils"

const updateProfileSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  image: z.string().refine(
    (val) => val.startsWith("data:image/") || val.startsWith("http://") || val.startsWith("https://"),
    { message: "Must be a valid image URL or data URL" }
  ).nullable().optional(),
})

export async function GET() {
  try {
    const userId = await requireAuthUserId()

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        _count: {
          select: { diaryEntries: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate total expenses
    const expenseResult = await prisma.diaryEntry.aggregate({
      where: { userId },
      _sum: { expense: true },
    })

    // Calculate streak
    const streak = await calculateStreak(userId)

    return NextResponse.json({
      ...user,
      entryCount: user._count.diaryEntries,
      totalExpenses: expenseResult._sum.expense ? Number(expenseResult._sum.expense) : 0,
      streak,
    })
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    console.error("GET /api/profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await requireAuthUserId()
    const body = await request.json()
    const data = updateProfileSchema.parse(body)

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("PUT /api/profile error:", error)
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

  // If no entry today, start checking from yesterday
  const latestEntry = new Date(entries[0].entryDate)
  latestEntry.setHours(0, 0, 0, 0)

  if (latestEntry.getTime() < today.getTime()) {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (latestEntry.getTime() < yesterday.getTime()) {
      return 0 // No entry today or yesterday
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
