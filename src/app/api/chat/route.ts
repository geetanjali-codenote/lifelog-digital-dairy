import { NextRequest, NextResponse } from "next/server"
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"
import { GoogleGenAI } from "@google/genai"

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuthUserId()
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Fetch user context for personalized responses
    const totalMemories = await prisma.diaryEntry.count({ where: { userId } })
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } })

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: "I am ready to help, but the GEMINI_API_KEY environment variable is not configured." })
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build the system prompt with user context
    const systemInstruction = `You are the LifeLog AI assistant. You help the user reflect on their journaling, habits, and digital diary.
The user's name is ${user?.name || "LifeLog User"}.
They currently have ${totalMemories} memories logged in their diary.
Be concise, friendly, and thoughtful. Answer any questions they have.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return NextResponse.json({ reply: response.text })
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse()
    console.error("POST /api/chat error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

