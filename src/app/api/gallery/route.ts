import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuthUserId();
    const { searchParams } = new URL(request.url);

    const mood = searchParams.get("mood");
    const tag = searchParams.get("tag");
    const month = searchParams.get("month"); // format: "2026-02"
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 60);
    const skip = (page - 1) * limit;

    // Build where clause for entries that belong to this user and have attachments
    const entryWhere: Record<string, unknown> = { userId };
    if (mood) entryWhere.mood = mood;
    if (tag) {
      entryWhere.entryTags = { some: { tag: { name: tag } } };
    }
    if (month) {
      const [year, mon] = month.split("-").map(Number);
      const startDate = new Date(year, mon - 1, 1);
      const endDate = new Date(year, mon, 1);
      entryWhere.entryDate = { gte: startDate, lt: endDate };
    }

    // Count total attachments matching filters
    const total = await prisma.attachment.count({
      where: {
        entry: entryWhere,
      },
    });

    // Fetch attachments with entry data
    const attachments = await prisma.attachment.findMany({
      where: {
        entry: entryWhere,
      },
      include: {
        entry: {
          select: {
            id: true,
            title: true,
            entryDate: true,
            mood: true,
            entryTags: {
              include: {
                tag: {
                  select: { id: true, name: true, color: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const media = attachments.map((a) => ({
      id: a.id,
      fileUrl: a.fileUrl,
      createdAt: a.createdAt.toISOString(),
      entry: {
        id: a.entry.id,
        title: a.entry.title,
        entryDate: a.entry.entryDate.toISOString().split("T")[0],
        mood: a.entry.mood,
        tags: a.entry.entryTags.map((et) => ({
          id: et.tag.id,
          name: et.tag.name,
          color: et.tag.color,
        })),
      },
    }));

    // Get available filters (moods, tags, months that have attachments)
    const allEntryIdsWithAttachments = await prisma.attachment.findMany({
      where: { entry: { userId } },
      select: { entry: { select: { mood: true, entryDate: true, entryTags: { select: { tag: { select: { id: true, name: true } } } } } } },
      distinct: ["entryId"],
    });

    const moods = Array.from(new Set(allEntryIdsWithAttachments.map((a) => a.entry.mood)));
    const tagsSet = new Map<string, { id: string; name: string }>();
    const monthsSet = new Set<string>();

    for (const a of allEntryIdsWithAttachments) {
      const d = a.entry.entryDate;
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthsSet.add(m);
      for (const et of a.entry.entryTags) {
        tagsSet.set(et.tag.id, { id: et.tag.id, name: et.tag.name });
      }
    }

    return NextResponse.json({
      media,
      filters: {
        moods: moods.sort(),
        tags: Array.from(tagsSet.values()).sort((a, b) => a.name.localeCompare(b.name)),
        months: Array.from(monthsSet).sort().reverse(),
      },
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    console.error("GET /api/gallery error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
