import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils"

const updateHabitSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  isActive: z.boolean().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuthUserId()
    const { id } = await params
    const body = await request.json()
    const data = updateHabitSchema.parse(body)

    const existing = await prisma.habit.findFirst({ where: { id, userId } })
    if (!existing) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    const habit = await prisma.habit.update({
      where: { id },
      data,
    })

    return NextResponse.json(habit)
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("PUT /api/habits/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuthUserId()
    const { id } = await params

    const existing = await prisma.habit.findFirst({ where: { id, userId } })
    if (!existing) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    await prisma.habit.delete({ where: { id } })

    return NextResponse.json({ message: "Habit deleted" })
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    console.error("DELETE /api/habits/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
