import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Prevent path traversal
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return new NextResponse(null, { status: 400 });
  }

  const filepath = path.join(UPLOAD_DIR, filename);

  try {
    const fileStat = await stat(filepath);
    if (!fileStat.isFile()) {
      return new NextResponse(null, { status: 404 });
    }

    const buffer = await readFile(filepath);
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
