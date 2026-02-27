import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils"

export async function POST() {
  try {
    const userId = await requireAuthUserId()

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })

    return NextResponse.json({ message: "All notifications marked as read" })
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    console.error("POST /api/notifications/read-all error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
