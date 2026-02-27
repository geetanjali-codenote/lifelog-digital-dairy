import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-utils";
import { z } from "zod";

const lockSchema = z.object({
  attachmentIds: z.array(z.string().uuid()).min(1),
  isLocked: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const userId = await requireAuthUserId();
    const body = await request.json();
    const data = lockSchema.parse(body);

    // Verify all attachments belong to the user
    const attachments = await prisma.attachment.findMany({
      where: {
        id: { in: data.attachmentIds },
        entry: { userId },
      },
    });

    if (attachments.length === 0) {
      return NextResponse.json({ error: "No valid attachments found" }, { status: 404 });
    }

    const validAttachmentIds = attachments.map(a => a.id);

    // Update lock status
    const result = await prisma.attachment.updateMany({
      where: { id: { in: validAttachmentIds } },
      data: { isLocked: data.isLocked },
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Successfully ${data.isLocked ? "locked" : "unlocked"} ${result.count} items`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update lock status" }, { status: 500 });
  }
}
