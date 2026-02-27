import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils"

const createTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be positive"),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
  date: z.string().optional(),
  entryId: z.string().uuid().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuthUserId()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const type = searchParams.get("type") || ""
    const category = searchParams.get("category") || ""
    const dateFrom = searchParams.get("dateFrom") || ""
    const dateTo = searchParams.get("dateTo") || ""
    const q = searchParams.get("q") || ""
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { userId }

    if (type) where.type = type
    if (category) where.category = category
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ]
    }
    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom)
      if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo)
    }

    const [transactions, total, summaryData] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
        include: {
          entry: { select: { id: true, title: true, mood: true } },
        },
      }),
      prisma.transaction.count({ where }),
      prisma.transaction.groupBy({
        by: ["type"],
        where: { userId },
        _sum: { amount: true },
      }),
    ])

    // Get category breakdown
    const categoryBreakdown = await prisma.transaction.groupBy({
      by: ["category", "type"],
      where: { userId },
      _sum: { amount: true },
      _count: true,
    })

    // Get monthly totals for the current year
    const currentYear = new Date().getFullYear()
    const monthlyRaw = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: new Date(`${currentYear}-01-01`),
          lte: new Date(`${currentYear}-12-31`),
        },
      },
      select: { type: true, amount: true, date: true },
    })

    const monthly: Record<string, { income: number; expense: number }> = {}
    for (let m = 0; m < 12; m++) {
      const key = String(m + 1).padStart(2, "0")
      monthly[key] = { income: 0, expense: 0 }
    }
    monthlyRaw.forEach((t) => {
      const month = String(new Date(t.date).getMonth() + 1).padStart(2, "0")
      monthly[month][t.type as "income" | "expense"] += Number(t.amount)
    })

    const totalIncome = summaryData.find((s) => s.type === "income")?._sum?.amount || 0
    const totalExpense = summaryData.find((s) => s.type === "expense")?._sum?.amount || 0

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      summary: {
        totalIncome: Number(totalIncome),
        totalExpense: Number(totalExpense),
        balance: Number(totalIncome) - Number(totalExpense),
      },
      categoryBreakdown: categoryBreakdown.map((c) => ({
        category: c.category || "Uncategorized",
        type: c.type,
        total: Number(c._sum.amount),
        count: c._count,
      })),
      monthly,
    })
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    console.error("GET /api/transactions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuthUserId()
    const body = await request.json()
    const data = createTransactionSchema.parse(body)

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: data.type,
        amount: data.amount,
        title: data.title,
        description: data.description,
        category: data.category,
        date: data.date ? new Date(data.date) : new Date(),
        entryId: data.entryId,
      },
    })

    return NextResponse.json(
      { ...transaction, amount: Number(transaction.amount) },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("POST /api/transactions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
