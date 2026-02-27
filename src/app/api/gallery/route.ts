import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthUserId, AuthError, unauthorizedResponse } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuthUserId();
    const { searchParams } = new URL(request.url);

    const tag = searchParams.get("tag");
    const filterDate = searchParams.get("date"); // "this_month", "this_year", "this_week", "all", or "YYYY-MM-DD"
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 60);
    const skip = (page - 1) * limit;

    const entryWhere: Record<string, unknown> = { userId };
    if (tag) {
      entryWhere.entryTags = { some: { tag: { name: tag } } };
    }
    if (filterDate && filterDate !== "all") {
      const now = new Date();
      if (filterDate === "this_year") {
        entryWhere.entryDate = { gte: new Date(now.getFullYear(), 0, 1) };
      } else if (filterDate === "this_month") {
        entryWhere.entryDate = { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
      } else if (filterDate === "this_week") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);
        entryWhere.entryDate = { gte: startOfWeek };
      } else if (filterDate === "last_30_days") {
        const last30 = new Date(now);
        last30.setDate(now.getDate() - 30);
        entryWhere.entryDate = { gte: last30 };
      } else if (filterDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = filterDate.split("-").map(Number);
        const startDate = new Date(year, month - 1, day);
        const endDate = new Date(year, month - 1, day + 1);
        entryWhere.entryDate = { gte: startDate, lt: endDate };
      }
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
      select: {
        id: true,
        fileUrl: true,
        createdAt: true,
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

    // Get available tags
    const tagsSet = await prisma.tag.findMany({
      where: {
        entryTags: {
          some: {
            entry: {
              userId,
              attachments: { some: {} }
            }
          }
        }
      },
      select: { id: true, name: true }
    });

    return NextResponse.json({
      media,
      filters: {
        tags: tagsSet.sort((a, b) => a.name.localeCompare(b.name)),
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
