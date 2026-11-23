import "server-only";
import { decrypt } from "./crypto";
import { env } from "./env";

// Instagram API with Unified Login (Meta's login for new apps). The person logs in with Facebook or Instagram,
// picks their business portfolio and Instagram professional account, and the app receives a Business Integration
// System User access token for that portfolio. No Facebook Page is needed. All calls go to graph.facebook.com.
const VERSION = "v26.0";
const GRAPH = `https://graph.facebook.com/${VERSION}`;

export class InstagramError extends Error {}

export function authUrl(redirectUri: string, state: string) {
  const u = new URL(`https://www.facebook.com/${VERSION}/dialog/oauth`);
  u.search = new URLSearchParams({
    client_id: env("META_APP_ID"),
    config_id: env("META_CONFIG_ID"),
    redirect_uri: redirectUri,
    response_type: "code",
    // Always offer both the Facebook and the Instagram login options.
    prompt: "login",
    state,
  }).toString();
  return u.toString();
}

async function json(res: Response, what: string) {
  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.error) {
    console.error(`[instagram] ${what}`, res.status, JSON.stringify(j));
    const msg: string = j?.error?.error_user_msg || j?.error?.message || "";
    if (j?.error?.code === 190 || res.status === 401) throw new InstagramError("reconnect");
    throw new InstagramError(msg ? `Instagram: ${msg}` : `Instagram ${what} failed (${res.status}).`);
  }
  return j;
}

const get = async (path: string, token: string, what: string, params: Record<string, string> = {}) =>
  json(await fetch(`${GRAPH}/${path}?${new URLSearchParams({ ...params, access_token: token })}`, { cache: "no-store" }), what);

/** Code → token, then the Instagram professional account the person shared. */
export async function connect(code: string, redirectUri: string) {
  const t = await json(
    await fetch(`${GRAPH}/oauth/access_token?${new URLSearchParams({
      client_id: env("META_APP_ID"),
      client_secret: env("META_APP_SECRET"),
      redirect_uri: redirectUri,
      code,
    })}`, { cache: "no-store" }),
    "token exchange",
  );
  const token: string = t.access_token;
  const accounts = await get("me/assigned_instagram_accounts", token, "accounts", { fields: "id,username" });
  const ig = accounts.data?.[0] as { id: string; username?: string } | undefined;
  if (!ig) throw new InstagramError("no-account");

  let avatar: string | null = null;
  try {
    avatar = (await get(ig.id, token, "profile", { fields: "profile_picture_url" })).profile_picture_url ?? null;
  } catch {}
  let business: { id?: string; client_business_id?: string } = {};
  try {
    business = await get("me", token, "business", { fields: "client_business_id" });
  } catch {}

  return {
    token,
    // Configured to never expire; a value here means the configuration set an expiry.
    expiresAt: t.expires_in ? new Date(Date.now() + t.expires_in * 1000).toISOString() : null,
    userId: String(ig.id),
    username: ig.username ?? "your account",
    avatar,
    businessId: business.client_business_id ?? null,
    metaUserId: business.id ?? null,
  };
}

type Conn = { access_token_enc: string; expires_at: string | null };

export async function instagramToken(conn: Conn): Promise<string> {
  if (conn.expires_at && new Date(conn.expires_at).getTime() < Date.now()) throw new InstagramError("reconnect");
  return decrypt(conn.access_token_enc);
}

async function post(path: string, token: string, params: Record<string, string>) {
  return json(
    await fetch(`${GRAPH}/${path}`, { method: "POST", body: new URLSearchParams({ ...params, access_token: token }), cache: "no-store" }),
    path.split("/").pop() ?? path,
  );
}

export type IgItem = { url: string; kind: "image" | "video" };

/** Creates the media container Instagram publishes from. Single photo, single video (Reel), or carousel of up to 10. */
export async function createContainer(token: string, igUserId: string, items: IgItem[], caption: string): Promise<string> {
  if (items.length === 1) {
    const [it] = items;
    const p: Record<string, string> = it.kind === "image"
      ? { image_url: it.url, caption }
      : { media_type: "REELS", video_url: it.url, caption, share_to_feed: "true" };
    return (await post(`${igUserId}/media`, token, p)).id;
  }
  const children: string[] = [];
  for (const it of items.slice(0, 10)) {
    const p: Record<string, string> = it.kind === "image" ? { image_url: it.url, is_carousel_item: "true" } : { media_type: "VIDEO", video_url: it.url, is_carousel_item: "true" };
    children.push((await post(`${igUserId}/media`, token, p)).id);
  }
  // Carousel video children must finish processing before the parent container can be made.
  for (const id of children) await waitFinished(token, id, 240e3);
  return (await post(`${igUserId}/media`, token, { media_type: "CAROUSEL", children: children.join(","), caption })).id;
}

export async function containerStatus(token: string, id: string): Promise<{ code: string; message?: string }> {
  const j = await get(id, token, "status", { fields: "status_code,status" });
  return { code: j.status_code ?? "IN_PROGRESS", message: j.status };
}

async function waitFinished(token: string, id: string, ms: number) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    const s = await containerStatus(token, id);
    if (s.code === "FINISHED") return;
    if (s.code === "ERROR" || s.code === "EXPIRED") throw new InstagramError(`Instagram could not process this media. ${s.message ?? ""}`.trim());
    await new Promise((r) => setTimeout(r, 4000));
  }
  throw new InstagramError("Instagram took too long to process this media.");
}

export async function publish(token: string, igUserId: string, containerId: string) {
  const { id } = await post(`${igUserId}/media_publish`, token, { creation_id: containerId });
  let permalink: string | null = null;
  try {
    permalink = (await get(String(id), token, "permalink", { fields: "permalink" })).permalink ?? null;
  } catch {}
  return { id: String(id), permalink };
}
