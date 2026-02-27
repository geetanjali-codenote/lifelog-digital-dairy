import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils"

const updateTransactionSchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  amount: z.number().positive().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  date: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuthUserId()
    const { id } = await params
    const body = await request.json()
    const data = updateTransactionSchema.parse(body)

    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    })

    return NextResponse.json({ ...transaction, amount: Number(transaction.amount) })
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("PUT /api/transactions/[id] error:", error)
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

    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    await prisma.transaction.delete({ where: { id } })
    return NextResponse.json({ message: "Transaction deleted" })
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    console.error("DELETE /api/transactions/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
