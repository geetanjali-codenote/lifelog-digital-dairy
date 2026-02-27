import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils"

const createHabitSchema = z.object({
  name: z.string().min(1).max(255),
})

export async function GET() {
  try {
    const userId = await requireAuthUserId()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const habits = await prisma.habit.findMany({
      where: { userId, isActive: true },
      include: {
        habitLogs: {
          where: { logDate: today },
          take: 1,
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(
      habits.map((habit) => ({
        ...habit,
        completedToday: habit.habitLogs.length > 0 && habit.habitLogs[0].isCompleted,
      }))
    )
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    console.error("GET /api/habits error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuthUserId()
    const body = await request.json()
    const data = createHabitSchema.parse(body)

    const habit = await prisma.habit.create({
      data: { userId, name: data.name },
    })

    return NextResponse.json(habit, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("POST /api/habits error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
