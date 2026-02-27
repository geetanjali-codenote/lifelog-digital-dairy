import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuthUserId()
    const { id } = await params

    const habit = await prisma.habit.findFirst({ where: { id, userId } })
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingLog = await prisma.habitLog.findUnique({
      where: { habitId_logDate: { habitId: id, logDate: today } },
    })

    if (existingLog) {
      const updated = await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: { isCompleted: !existingLog.isCompleted },
      })
      return NextResponse.json(updated)
    }

    const log = await prisma.habitLog.create({
      data: { habitId: id, logDate: today, isCompleted: true },
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    console.error("POST /api/habits/[id]/log error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
