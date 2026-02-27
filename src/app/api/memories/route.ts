import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils"

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be positive"),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
})

const createEntrySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1, "Content is required"),
  mood: z.string().min(1).max(50),
  highlight: z.string().optional(),
  gratitude: z.string().optional(),
  expense: z.number().min(0).optional(),
  expenseTitle: z.string().optional(),
  expenseDesc: z.string().optional(),
  expenseType: z.string().optional(),
  entryDate: z.string().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  images: z.array(z.string()).optional(),
  transactions: z.array(transactionSchema).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuthUserId()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const q = searchParams.get("q") || ""
    const mood = searchParams.get("mood") || ""
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { userId }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ]
    }

    if (mood) {
      where.mood = mood
    }

    const [entries, total] = await Promise.all([
      prisma.diaryEntry.findMany({
        where,
        include: {
          entryTags: { include: { tag: true } },
          attachments: true,
          transactions: true,
        },
        orderBy: { entryDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.diaryEntry.count({ where }),
    ])

    return NextResponse.json({
      entries: entries.map((entry) => ({
        ...entry,
        tags: entry.entryTags.map((et: { tag: unknown }) => et.tag),
        expense: entry.expense ? Number(entry.expense) : null,
        transactions: entry.transactions.map((t) => ({ ...t, amount: Number(t.amount) })),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    console.error("GET /api/memories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuthUserId()
    const body = await request.json()
    const data = createEntrySchema.parse(body)

    const entryDate = data.entryDate ? new Date(data.entryDate) : new Date()

    const entry = await prisma.diaryEntry.create({
      data: {
        userId,
        title: data.title,
        content: data.content,
        mood: data.mood,
        highlight: data.highlight,
        gratitude: data.gratitude,
        expense: data.expense,
        expenseTitle: data.expenseTitle,
        expenseDesc: data.expenseDesc,
        expenseType: data.expenseType || "expense",
        entryDate,
        ...(data.tagIds && data.tagIds.length > 0
          ? {
            entryTags: {
              create: data.tagIds.map((tagId) => ({ tagId })),
            },
          }
          : {}),
        ...(data.images && data.images.length > 0
          ? {
            attachments: {
              create: data.images.map((url) => ({ fileUrl: url })),
            },
          }
          : {}),
        ...(data.transactions && data.transactions.length > 0
          ? {
            transactions: {
              create: data.transactions.map((t) => ({
                userId,
                type: t.type,
                amount: t.amount,
                title: t.title,
                description: t.description,
                category: t.category,
                date: entryDate,
              })),
            },
          }
          : {}),
      },
      include: {
        entryTags: { include: { tag: true } },
        attachments: true,
        transactions: true,
      },
    })

    return NextResponse.json(
      {
        ...entry,
        tags: entry.entryTags ? entry.entryTags.map((et: { tag: unknown }) => et.tag) : [],
        expense: entry.expense ? Number(entry.expense) : null,
        transactions: entry.transactions.map((t) => ({ ...t, amount: Number(t.amount) })),
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("POST /api/memories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
