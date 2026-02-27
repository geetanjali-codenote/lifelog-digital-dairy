import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils";
import { z } from "zod";

const uploadSchema = z.object({
  urls: z.array(z.string().min(1)).min(1),
  entryDate: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuthUserId();
    const body = await request.json();
    const data = uploadSchema.parse(body);

    const entryDate = data.entryDate ? new Date(data.entryDate) : new Date();
    const count = data.urls.length;

    // Create a diary entry with the uploaded media
    const entry = await prisma.diaryEntry.create({
      data: {
        userId,
        content: `Uploaded ${count} ${count === 1 ? "file" : "files"} to gallery`,
        mood: "neutral",
        entryDate,
        attachments: {
          create: data.urls.map((url) => ({ fileUrl: url })),
        },
        ...(data.tagIds && data.tagIds.length > 0
          ? {
            entryTags: {
              create: data.tagIds.map((tagId) => ({ tagId })),
            },
          }
          : {}),
      },
    });

    return NextResponse.json({ entryId: entry.id, count });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("POST /api/gallery/upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
