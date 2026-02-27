import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-utils";
import bcrypt from "bcrypt";
import { z } from "zod";

const setupSchema = z.object({
  pin: z.string().length(4).regex(/^\d+$/, "PIN must be strictly 4 digits"),
});

export async function POST(request: Request) {
  try {
    const userId = await requireAuthUserId();
    const body = await request.json();
    const data = setupSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.vaultPin) return NextResponse.json({ error: "Vault PIN already exists" }, { status: 400 });

    const saltRounds = 10;
    const hashedPin = await bcrypt.hash(data.pin, saltRounds);

    await prisma.user.update({
      where: { id: userId },
      data: { vaultPin: hashedPin },
    });

    return NextResponse.json({ success: true, message: "Vault PIN setup successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to setup PIN" }, { status: 500 });
  }
}
