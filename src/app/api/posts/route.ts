import { NextResponse, after, type NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { fail, withUser } from "@/lib/server/http";
import { type MediaItem, type Post, publicPost, refreshPosts, runPost } from "@/lib/server/posts";

// Long enough for a YouTube upload or Instagram video processing to finish after the response.
export const maxDuration = 300;

const UUID = /^[0-9a-f-]{36}$/;

// GET /api/posts            the signed-in person's recent posts
// GET /api/posts?batch=<id> the posts made together in one go (the composer polls this)
export function GET(req: NextRequest) {
  return withUser(async (u) => {
    const batch = req.nextUrl.searchParams.get("batch");
    const filter = batch && UUID.test(batch) ? `&batch_id=${db.eq(batch)}` : "";
    const rows = await db.select<Post>("posts", `user_id=${db.eq(u.id)}${filter}&select=*&order=created_at.desc&limit=50`);
    const posts = await refreshPosts(rows);
    return NextResponse.json({ posts: posts.map(publicPost) });
  });
}

export function POST(req: NextRequest) {
  return withUser(async (u) => {
    const b = await req.json().catch(() => ({}));
    const batchId = String(b.batchId ?? "");
    if (!UUID.test(batchId)) return fail(400, "Upload the media first.");
    const media: MediaItem[] = (Array.isArray(b.media) ? b.media : []).slice(0, 10).map((m: MediaItem) => ({ path: String(m.path), kind: m.kind === "video" ? "video" : "image" }));
    // Only paths this person was given for this batch.
    if (!media.length || media.some((m) => !m.path.startsWith(`${u.id}/${batchId}/`) || m.path.includes(".."))) return fail(400, "Upload the media first.");

    const platforms = (Array.isArray(b.platforms) ? b.platforms : []).filter((p: string) => p === "youtube" || p === "instagram") as Post["platform"][];
    if (!platforms.length) return fail(400, "Pick where to post.");
    const connected = await db.select<{ platform: string }>("connections", `user_id=${db.eq(u.id)}&select=platform`);
    const missing = platforms.filter((p) => !connected.some((c) => c.platform === p));
    if (missing.length) return fail(400, `Connect ${missing.map((p) => (p === "youtube" ? "YouTube" : "Instagram")).join(" and ")} in Accounts first.`);
    if (platforms.includes("youtube") && !media.some((m) => m.kind === "video")) return fail(400, "YouTube needs a video.");

    const caption = String(b.caption ?? "").slice(0, 5000);
    const privacy = ["public", "unlisted", "private"].includes(b.privacy) ? b.privacy : "public";
    const rows = await db.insert<Post>("posts", platforms.map((platform) => ({
      user_id: u.id, batch_id: batchId, platform, status: "queued",
      // YouTube takes the first video only.
      media: platform === "youtube" ? [media.find((m) => m.kind === "video")] : media,
      caption: platform === "instagram" ? caption.slice(0, 2200) : caption,
      title: platform === "youtube" ? String(b.title ?? "").slice(0, 100) || null : null,
      privacy: platform === "youtube" ? privacy : null,
      made_for_kids: platform === "youtube" && b.madeForKids === true,
    })));

    after(() => Promise.all(rows.map(runPost)));
    return NextResponse.json({ batchId, posts: rows.map(publicPost) });
  });
}
