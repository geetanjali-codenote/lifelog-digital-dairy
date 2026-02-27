import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuthUserId()
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.notification.findFirst({ where: { id, userId } })
    if (!existing) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: body.isRead ?? true },
    })

    return NextResponse.json(notification)
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    console.error("PUT /api/notifications/[id] error:", error)
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

    const existing = await prisma.notification.findFirst({ where: { id, userId } })
    if (!existing) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    await prisma.notification.delete({ where: { id } })

    return NextResponse.json({ message: "Notification deleted" })
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    console.error("DELETE /api/notifications/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
