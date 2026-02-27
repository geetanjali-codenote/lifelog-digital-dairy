import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils"

const transactionSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
})

const updateEntrySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  mood: z.string().min(1).max(50).optional(),
  highlight: z.string().nullable().optional(),
  gratitude: z.string().nullable().optional(),
  expense: z.number().min(0).nullable().optional(),
  expenseTitle: z.string().nullable().optional(),
  expenseDesc: z.string().nullable().optional(),
  expenseType: z.string().nullable().optional(),
  entryDate: z.string().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  images: z.array(z.string()).optional(),
  transactions: z.array(transactionSchema).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuthUserId()
    const { id } = await params

    const entry = await prisma.diaryEntry.findFirst({
      where: { id, userId },
      include: {
        entryTags: { include: { tag: true } },
        attachments: true,
        transactions: true,
      },
    })

    if (!entry) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...entry,
      tags: entry.entryTags.map((et) => et.tag),
      expense: entry.expense ? Number(entry.expense) : null,
      transactions: entry.transactions.map((t) => ({ ...t, amount: Number(t.amount) })),
    })
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    console.error("GET /api/memories/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuthUserId()
    const { id } = await params
    const body = await request.json()
    const data = updateEntrySchema.parse(body)

    const existing = await prisma.diaryEntry.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 })
    }

    // Handle tag updates
    if (data.tagIds !== undefined) {
      await prisma.entryTag.deleteMany({ where: { entryId: id } })
      if (data.tagIds.length > 0) {
        await prisma.entryTag.createMany({
          data: data.tagIds.map((tagId) => ({ entryId: id, tagId })),
        })
      }
    }

    // Handle image updates
    if (data.images !== undefined) {
      if (data.images.length > 0) {
        await prisma.attachment.createMany({
          data: data.images.map((url) => ({ entryId: id, fileUrl: url })),
        })
      }
    }

    // Handle transaction updates: delete old, create new
    if (data.transactions !== undefined) {
      await prisma.transaction.deleteMany({ where: { entryId: id } })
      if (data.transactions.length > 0) {
        const entryDate = data.entryDate ? new Date(data.entryDate) : existing.entryDate
        await prisma.transaction.createMany({
          data: data.transactions.map((t) => ({
            userId,
            entryId: id,
            type: t.type,
            amount: t.amount,
            title: t.title,
            description: t.description,
            category: t.category,
            date: entryDate,
          })),
        })
      }
    }

    const { tagIds, images, expenseType, transactions, ...updateData } = data
    const entry = await prisma.diaryEntry.update({
      where: { id },
      data: {
        ...updateData,
        expenseType: expenseType ?? undefined,
        entryDate: updateData.entryDate ? new Date(updateData.entryDate) : undefined,
      },
      include: {
        entryTags: { include: { tag: true } },
        attachments: true,
        transactions: true,
      },
    })

    return NextResponse.json({
      ...entry,
      tags: entry.entryTags.map((et) => et.tag),
      expense: entry.expense ? Number(entry.expense) : null,
      transactions: entry.transactions.map((t) => ({ ...t, amount: Number(t.amount) })),
    })
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("PUT /api/memories/[id] error:", error)
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

    const existing = await prisma.diaryEntry.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 })
    }

    await prisma.diaryEntry.delete({ where: { id } })

    return NextResponse.json({ message: "Memory deleted" })
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    console.error("DELETE /api/memories/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
