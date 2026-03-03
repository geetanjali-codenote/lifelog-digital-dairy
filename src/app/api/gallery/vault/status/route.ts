import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-utils";

export async function GET() {
  try {
    const userId = await requireAuthUserId();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { vaultPin: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ hasPin: !!user.vaultPin });
  } catch {
    return NextResponse.json({ error: "Failed to check vault status" }, { status: 500 });
  }
}
