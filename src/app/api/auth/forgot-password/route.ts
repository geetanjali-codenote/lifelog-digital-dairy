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

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const isDev = process.env.NODE_ENV === "development" || appUrl.includes("localhost");
    const successMessage = "If an account with that email exists, a password reset link has been sent.";

    if (!user) {
      // In dev mode, still generate a token and return the link for testing the UI flow
      if (isDev) {
        const token = crypto.randomUUID();
        const resetLink = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
        return NextResponse.json({ message: successMessage, resetLink }, { status: 200 });
      }
      // In production, don't leak whether the email exists
      return NextResponse.json({ message: successMessage }, { status: 200 });
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
    const result = await sendPasswordResetEmail(email, token);

    const response: Record<string, string> = { message: successMessage };

    // In dev mode, include the reset link in the response for easy testing
    if (isDev && result?.resetLink) {
      response.resetLink = result.resetLink;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Forgot password API error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
