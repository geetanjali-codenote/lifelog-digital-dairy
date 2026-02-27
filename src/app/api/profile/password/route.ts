import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcrypt"
import prisma from "@/lib/prisma"
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils"

const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
})

export async function PUT(request: NextRequest) {
  try {
    const userId = await requireAuthUserId()
    const body = await request.json()
    const data = changePasswordSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    })

    if (user?.passwordHash) {
      if (!data.currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 })
      }
      const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash)
      if (!isValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }
    }

    const newHash = await bcrypt.hash(data.newPassword, 10)
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    })

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("PUT /api/profile/password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
