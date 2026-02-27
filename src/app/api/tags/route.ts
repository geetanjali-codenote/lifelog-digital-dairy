import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils"

const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

export async function GET() {
  try {
    const userId = await requireAuthUserId()

    const tags = await prisma.tag.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(tags)
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    console.error("GET /api/tags error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuthUserId()
    const body = await request.json()
    const data = createTagSchema.parse(body)

    const tag = await prisma.tag.create({
      data: {
        userId,
        name: data.name,
        color: data.color,
      },
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    // Unique constraint violation
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Tag with this name already exists" }, { status: 409 })
    }
    console.error("POST /api/tags error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
