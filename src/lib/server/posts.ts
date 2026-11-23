import "server-only";
import { db, deleteObjects, signedDownloadUrl } from "./db";
import { GoogleError, uploadVideo, videoTitle, youtubeToken } from "./google";
import { InstagramError, containerStatus, createContainer, instagramToken, publish } from "./instagram";

export type MediaItem = { path: string; kind: "image" | "video" };
export type Post = {
  id: string; user_id: string; batch_id: string; platform: "youtube" | "instagram"; status: string;
  media: MediaItem[]; caption: string; title: string | null; privacy: string | null; made_for_kids: boolean;
  container_id: string | null; external_id: string | null; external_url: string | null; error: string | null;
  media_deleted: boolean; created_at: string; updated_at: string;
};
type Conn = {
  id: string; platform: string; external_id: string; access_token_enc: string; refresh_token_enc: string | null;
  expires_at: string | null; updated_at: string;
};

const now = () => new Date().toISOString();
const TERMINAL = new Set(["published", "failed"]);

async function patch(id: string, p: Partial<Post>, onlyIfStatus?: string) {
  const filter = `id=${db.eq(id)}${onlyIfStatus ? `&status=${db.eq(onlyIfStatus)}` : ""}`;
  return db.update<Post>("posts", filter, { ...p, updated_at: now() });
}

function message(e: unknown, platform: string) {
  const m = e instanceof GoogleError || e instanceof InstagramError ? e.message : "";
  if (m === "reconnect") return `${platform === "youtube" ? "YouTube" : "Instagram"} needs to be connected again. Open Accounts and reconnect.`;
  if (!m) console.error(`[posts] ${platform} failed`, e);
  return m || "Something went wrong while posting. Try again.";
}

async function connection(userId: string, platform: string): Promise<Conn> {
  const [c] = await db.select<Conn>("connections", `user_id=${db.eq(userId)}&platform=${db.eq(platform)}&select=*`);
  if (!c) throw platform === "youtube" ? new GoogleError("reconnect") : new InstagramError("reconnect");
  return c;
}

/** Does the slow part of a post, after the request that created it has answered. */
export async function runPost(post: Post) {
  try {
    if (post.platform === "youtube") await runYouTube(post);
    else await runInstagram(post);
  } catch (e) {
    await patch(post.id, { status: "failed", error: message(e, post.platform) });
  }
  await cleanupBatch(post.batch_id);
}

async function runYouTube(post: Post) {
  const video = post.media.find((m) => m.kind === "video");
  if (!video) throw new GoogleError("YouTube needs a video.");
  await patch(post.id, { status: "uploading" });
  const conn = await connection(post.user_id, "youtube");
  const token = await youtubeToken(conn);
  const v = await uploadVideo(token, video.path, {
    title: videoTitle(post.title, post.caption),
    description: post.caption,
    privacy: post.privacy ?? "public",
    madeForKids: post.made_for_kids,
  });
  const lockedPrivate = v.privacy && v.privacy !== (post.privacy ?? "public");
  await patch(post.id, {
    status: "published", external_id: v.id, external_url: `https://youtu.be/${v.id}`,
    // Until the Google project passes YouTube's audit, YouTube keeps API uploads private.
    error: lockedPrivate ? "YouTube set this video to private. That lifts once HelpToPost passes YouTube's review." : null,
  });
}

async function runInstagram(post: Post) {
  await patch(post.id, { status: "uploading" });
  const conn = await connection(post.user_id, "instagram");
  const token = await instagramToken(conn);
  const items = await Promise.all(post.media.slice(0, 10).map(async (m) => ({ kind: m.kind, url: await signedDownloadUrl(m.path, 3 * 3600) })));
  const containerId = await createContainer(token, conn.external_id, items, post.caption.slice(0, 2200));
  await patch(post.id, { status: "processing", container_id: containerId });
  // Videos take a while to process. Keep checking for up to four minutes; the Queue picks it up after that.
  const until = Date.now() + 240e3;
  while (Date.now() < until) {
    if (await advanceInstagram({ ...post, status: "processing", container_id: containerId }, token)) return;
    await new Promise((r) => setTimeout(r, 5000));
  }
}

/** Checks an Instagram container and publishes it once ready. Returns true when the post is finished. Safe to call twice. */
export async function advanceInstagram(post: Post, token?: string): Promise<boolean> {
  if (post.status !== "processing" || !post.container_id) return TERMINAL.has(post.status);
  try {
    const conn = await connection(post.user_id, "instagram");
    token ??= await instagramToken(conn);
    const s = await containerStatus(token, post.container_id);
    if (s.code === "IN_PROGRESS") return false;
    if (s.code !== "FINISHED") throw new InstagramError(`Instagram could not process this media. ${s.message ?? ""}`.trim());
    // Claim the post first so two checks running at once cannot publish it twice.
    const claimed = await patch(post.id, { status: "publishing" }, "processing");
    if (!claimed.length) return true;
    const r = await publish(token, conn.external_id, post.container_id);
    await patch(post.id, { status: "published", external_id: r.id, external_url: r.permalink });
  } catch (e) {
    await patch(post.id, { status: "failed", error: message(e, "instagram") });
  }
  await cleanupBatch(post.batch_id);
  return true;
}

/** Brings stale posts up to date when someone looks at them: Instagram processing, or uploads cut off mid-way. */
export async function refreshPosts(posts: Post[]): Promise<Post[]> {
  const out: Post[] = [];
  for (const p of posts) {
    const age = Date.now() - new Date(p.updated_at).getTime();
    if (p.platform === "instagram" && p.status === "processing" && age > 20e3) {
      await advanceInstagram(p);
      const [fresh] = await db.select<Post>("posts", `id=${db.eq(p.id)}&select=*`);
      out.push(fresh ?? p);
    } else if (!TERMINAL.has(p.status) && p.status !== "processing" && age > 6 * 60e3) {
      const [f] = await patch(p.id, { status: "failed", error: "The upload stopped before it finished. Try posting again." }, p.status);
      if (f) await cleanupBatch(p.batch_id);
      out.push(f ?? p);
    } else out.push(p);
  }
  return out;
}

/** Deletes a batch's media from storage once every post that uses it is done. */
async function cleanupBatch(batchId: string) {
  const posts = await db.select<Post>("posts", `batch_id=${db.eq(batchId)}&select=id,status,media,media_deleted`);
  if (!posts.length || posts.some((p) => !TERMINAL.has(p.status)) || posts.every((p) => p.media_deleted)) return;
  await deleteObjects([...new Set(posts.flatMap((p) => p.media.map((m) => m.path)))]);
  await db.update("posts", `batch_id=${db.eq(batchId)}`, { media_deleted: true });
}

export const publicPost = (p: Post) => ({
  id: p.id, batchId: p.batch_id, platform: p.platform, status: p.status, caption: p.caption, title: p.title,
  url: p.external_url, error: p.error, kinds: p.media.map((m) => m.kind), createdAt: p.created_at,
});
