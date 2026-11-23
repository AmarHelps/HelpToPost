import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { signedUploadUrl } from "@/lib/server/db";
import { fail, withUser } from "@/lib/server/http";

// Hands the browser one-time upload links so photos and videos go straight to storage, not through this server.
export function POST(req: NextRequest) {
  return withUser(async (u) => {
    const body = await req.json().catch(() => ({}));
    const files: { type?: string }[] = Array.isArray(body.files) ? body.files.slice(0, 10) : [];
    if (!files.length) return fail(400, "No files.");
    const batchId = randomUUID();
    const out = [];
    for (const [i, f] of files.entries()) {
      const type = String(f.type ?? "");
      const kind = type === "image/jpeg" ? "image" : type.startsWith("video/") ? "video" : null;
      if (!kind) return fail(400, "Only JPEG photos and videos can be uploaded.");
      const ext = kind === "image" ? "jpg" : type.includes("quicktime") ? "mov" : type.split("/")[1]?.replace(/[^a-z0-9]/g, "") || "mp4";
      const path = `${u.id}/${batchId}/${i + 1}.${ext}`;
      out.push({ path, kind, uploadUrl: await signedUploadUrl(path) });
    }
    return NextResponse.json({ batchId, files: out });
  });
}
