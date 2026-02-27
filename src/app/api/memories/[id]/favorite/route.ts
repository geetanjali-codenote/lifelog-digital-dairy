import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuthUserId()
    const { id: entryId } = await params

    const entry = await prisma.diaryEntry.findFirst({
      where: { id: entryId, userId },
    })

    if (!entry) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 })
    }

    // Find or create the Favorite tag for this user
    let favoriteTag = await prisma.tag.findUnique({
      where: { userId_name: { userId, name: "Favorite" } },
    })

    if (!favoriteTag) {
      favoriteTag = await prisma.tag.create({
        data: {
          userId,
          name: "Favorite",
          color: "#EAB308", // Yellow
        },
      })
    }

    // Check if the memory is already favorited
    const existingEntryTag = await prisma.entryTag.findUnique({
      where: {
        entryId_tagId: {
          entryId,
          tagId: favoriteTag.id,
        },
      },
    })

    if (existingEntryTag) {
      // Unfavorite
      await prisma.entryTag.delete({
        where: {
          entryId_tagId: {
            entryId,
            tagId: favoriteTag.id,
          },
        },
      })
      return NextResponse.json({ favorited: false })
    } else {
      // Favorite
      await prisma.entryTag.create({
        data: {
          entryId,
          tagId: favoriteTag.id,
        },
      })
      return NextResponse.json({ favorited: true })
    }
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    console.error("POST /api/memories/[id]/favorite error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
