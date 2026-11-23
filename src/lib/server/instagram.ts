import "server-only";
import { decrypt, encrypt } from "./crypto";
import { db } from "./db";
import { env } from "./env";

// Instagram API with Instagram Login (professional accounts, no Facebook Page needed).
const GRAPH = "https://graph.instagram.com/v24.0";
export const IG_SCOPES = ["instagram_business_basic", "instagram_business_content_publish"];

export class InstagramError extends Error {}

export function authUrl(redirectUri: string, state: string) {
  const u = new URL("https://www.instagram.com/oauth/authorize");
  u.search = new URLSearchParams({
    enable_fb_login: "0",
    force_reauth: "true",
    client_id: env("INSTAGRAM_APP_ID"),
    redirect_uri: redirectUri,
    response_type: "code",
    scope: IG_SCOPES.join(","),
    state,
  }).toString();
  return u.toString();
}

async function json(res: Response, what: string) {
  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.error) {
    console.error(`[instagram] ${what}`, res.status, JSON.stringify(j));
    const msg: string = j?.error?.error_user_msg || j?.error?.message || j?.error_message || "";
    if (j?.error?.code === 190 || res.status === 401) throw new InstagramError("reconnect");
    throw new InstagramError(msg ? `Instagram: ${msg}` : `Instagram ${what} failed (${res.status}).`);
  }
  return j;
}

/** Code → long-lived (60 day) token, plus the account's id and username. */
export async function connect(code: string, redirectUri: string) {
  const short = await json(
    await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: env("INSTAGRAM_APP_ID"),
        client_secret: env("INSTAGRAM_APP_SECRET"),
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code: code.replace(/#_$/, ""),
      }),
      cache: "no-store",
    }),
    "token exchange",
  );
  const first = short.data?.[0] ?? short;
  const long = await json(
    await fetch(
      `https://graph.instagram.com/access_token?${new URLSearchParams({
        grant_type: "ig_exchange_token",
        client_secret: env("INSTAGRAM_APP_SECRET"),
        access_token: first.access_token,
      })}`,
      { cache: "no-store" },
    ),
    "long-lived token",
  );
  const me = await json(
    await fetch(`${GRAPH}/me?fields=user_id,username,account_type,profile_picture_url&access_token=${encodeURIComponent(long.access_token)}`, { cache: "no-store" }),
    "profile",
  );
  return {
    token: long.access_token as string,
    expiresAt: new Date(Date.now() + (long.expires_in ?? 5184000) * 1000).toISOString(),
    userId: String(me.user_id ?? first.user_id),
    username: me.username as string,
    avatar: (me.profile_picture_url ?? null) as string | null,
    scopes: String(first.permissions ?? IG_SCOPES.join(",")),
  };
}

type Conn = { id: string; external_id: string; access_token_enc: string; expires_at: string | null; updated_at: string };

/** A valid token for a stored connection. Long-lived tokens are refreshed once they are a day old, which resets their 60 days. */
export async function instagramToken(conn: Conn): Promise<string> {
  const token = decrypt(conn.access_token_enc);
  const exp = conn.expires_at ? new Date(conn.expires_at).getTime() : 0;
  if (exp && exp < Date.now()) throw new InstagramError("reconnect");
  if (Date.now() - new Date(conn.updated_at).getTime() < 864e5) return token;
  try {
    const r = await json(await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`, { cache: "no-store" }), "token refresh");
    await db.update("connections", `id=${db.eq(conn.id)}`, {
      access_token_enc: encrypt(r.access_token),
      expires_at: new Date(Date.now() + (r.expires_in ?? 5184000) * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });
    return r.access_token;
  } catch (e) {
    console.warn("[instagram] refresh skipped", e);
    return token;
  }
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
  const j = await json(await fetch(`${GRAPH}/${id}?fields=status_code,status&access_token=${encodeURIComponent(token)}`, { cache: "no-store" }), "status");
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
    const j = await json(await fetch(`${GRAPH}/${id}?fields=permalink&access_token=${encodeURIComponent(token)}`, { cache: "no-store" }), "permalink");
    permalink = j.permalink ?? null;
  } catch {}
  return { id: String(id), permalink };
}
