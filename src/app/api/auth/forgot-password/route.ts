import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't leak whether the email exists or not
      return NextResponse.json({ message: "If an account with that email exists, a password reset link has been sent." }, { status: 200 });
    }

    // Generate token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Save token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Send Email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json({ message: "If an account with that email exists, a password reset link has been sent." }, { status: 200 });
  } catch (error) {
    console.error("Forgot password API error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
