import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils";
import { z } from "zod";

const deleteSchema = z.object({
  mediaIds: z.array(z.string()).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuthUserId();
    const body = await request.json();
    const data = deleteSchema.parse(body);

    // Verify ownership indirectly by checking if the attachment belongs to an entry owned by the user
    const attachments = await prisma.attachment.findMany({
      where: {
        id: { in: data.mediaIds },
        entry: { userId },
      },
      select: { id: true },
    });

    const validIds = attachments.map(a => a.id);

    if (validIds.length === 0) {
      return NextResponse.json({ error: "No valid media found to delete" }, { status: 404 });
    }

    // Delete attachments
    await prisma.attachment.deleteMany({
      where: { id: { in: validIds } },
    });

    return NextResponse.json({ success: true, count: validIds.length });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("POST /api/gallery/delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
