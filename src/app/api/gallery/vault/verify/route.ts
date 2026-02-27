import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-utils";
import bcrypt from "bcrypt";
import { z } from "zod";

const verifySchema = z.object({
  pin: z.string().length(4).regex(/^\d+$/, "PIN must be strictly 4 digits"),
});

export async function POST(request: Request) {
  try {
    const userId = await requireAuthUserId();
    const body = await request.json();
    const data = verifySchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (!user.vaultPin) {
      return NextResponse.json({ error: "No Vault PIN set" }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(data.pin, user.vaultPin);
    if (!isMatch) {
      return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
    }

    // In a highly secure app, we might set a signed cookie here. 
    // For this implementation, returning a simple 200 OK serves as verification for the client state.
    return NextResponse.json({ success: true, message: "PIN Verified" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to verify PIN" }, { status: 500 });
  }
}
