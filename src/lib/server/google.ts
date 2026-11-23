import "server-only";
import { createHash } from "node:crypto";
import { decrypt, encrypt, randomToken } from "./crypto";
import { db, objectInfo, openObject } from "./db";
import { env } from "./env";

export const LOGIN_SCOPES = ["openid", "email", "profile"];
// youtube.upload: upload videos. youtube.readonly: show which channel is connected (name and picture).
export const YOUTUBE_SCOPES = ["openid", "email", "https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"];

export function pkce() {
  const verifier = randomToken(48);
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function authUrl(opts: { redirectUri: string; state: string; challenge: string; scopes: string[]; offline: boolean }) {
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.search = new URLSearchParams({
    client_id: env("GOOGLE_CLIENT_ID"),
    redirect_uri: opts.redirectUri,
    response_type: "code",
    scope: opts.scopes.join(" "),
    state: opts.state,
    code_challenge: opts.challenge,
    code_challenge_method: "S256",
    include_granted_scopes: "true",
    ...(opts.offline ? { access_type: "offline", prompt: "consent" } : { prompt: "select_account" }),
  }).toString();
  return u.toString();
}

type TokenResponse = { access_token: string; refresh_token?: string; expires_in: number; scope: string; id_token?: string };

async function tokenRequest(params: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: env("GOOGLE_CLIENT_ID"), client_secret: env("GOOGLE_CLIENT_SECRET"), ...params }),
    cache: "no-store",
  });
  const j = await res.json();
  if (!res.ok) {
    console.error("[google] token error", j);
    throw new GoogleError(j.error === "invalid_grant" ? "reconnect" : "Google sign-in failed. Try again.");
  }
  return j as TokenResponse;
}

export class GoogleError extends Error {}

export const exchangeCode = (code: string, redirectUri: string, verifier: string) =>
  tokenRequest({ grant_type: "authorization_code", code, redirect_uri: redirectUri, code_verifier: verifier });

/** Identity from the ID token. It came straight from Google's token endpoint over TLS, so the signature check is not needed. */
export function idClaims(idToken: string): { sub: string; email?: string; email_verified?: boolean; name?: string } {
  return JSON.parse(Buffer.from(idToken.split(".")[1], "base64url").toString());
}

export async function channelInfo(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
    headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store",
  });
  const j = await res.json();
  if (!res.ok) {
    console.error("[youtube] channels error", j);
    throw new GoogleError("Could not read your YouTube channel.");
  }
  const ch = j.items?.[0];
  if (!ch) throw new GoogleError("This Google account has no YouTube channel yet. Create one at youtube.com, then connect again.");
  return { id: ch.id as string, title: ch.snippet?.title as string, avatar: (ch.snippet?.thumbnails?.default?.url ?? null) as string | null };
}

export async function revoke(token: string) {
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, { method: "POST", cache: "no-store" }).catch(() => {});
}

type Conn = { id: string; access_token_enc: string; refresh_token_enc: string | null; expires_at: string | null };

/** A valid access token for a stored YouTube connection, refreshing it when it is about to expire. */
export async function youtubeToken(conn: Conn): Promise<string> {
  if (conn.expires_at && new Date(conn.expires_at).getTime() > Date.now() + 120e3) return decrypt(conn.access_token_enc);
  if (!conn.refresh_token_enc) throw new GoogleError("reconnect");
  const t = await tokenRequest({ grant_type: "refresh_token", refresh_token: decrypt(conn.refresh_token_enc) });
  await db.update("connections", `id=${db.eq(conn.id)}`, {
    access_token_enc: encrypt(t.access_token),
    expires_at: new Date(Date.now() + t.expires_in * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  });
  return t.access_token;
}

// YouTube rejects < and > in titles and descriptions.
const clean = (s: string) => s.replace(/[<>]/g, "");

export function videoTitle(title: string | null, caption: string) {
  const t = clean((title || caption.split("\n")[0] || "New video").trim());
  return t.length > 100 ? `${t.slice(0, 97)}...` : t;
}

/** Uploads a stored video to YouTube with a resumable upload, streaming it from storage. Returns the video id. */
export async function uploadVideo(token: string, path: string, meta: { title: string; description: string; privacy: string; madeForKids: boolean }) {
  const info = await objectInfo(path);
  if (!info?.size) throw new GoogleError("The uploaded video could not be found. Try posting again.");

  const init = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Length": String(info.size),
      "X-Upload-Content-Type": info.type || "video/*",
    },
    body: JSON.stringify({
      snippet: { title: meta.title, description: clean(meta.description).slice(0, 5000), categoryId: "22" },
      status: { privacyStatus: meta.privacy, selfDeclaredMadeForKids: meta.madeForKids },
    }),
    cache: "no-store",
  });
  if (!init.ok) throw new GoogleError(await youtubeErrorMessage(init));
  const location = init.headers.get("location");
  if (!location) throw new GoogleError("YouTube did not accept the upload.");

  const file = await openObject(path);
  const put = await fetch(location, {
    method: "PUT",
    headers: { "Content-Type": info.type || "video/*", "Content-Length": String(info.size) },
    body: file.body,
    // @ts-expect-error Node's fetch needs duplex for a streamed body; the DOM types do not list it.
    duplex: "half",
    cache: "no-store",
  });
  if (!put.ok) throw new GoogleError(await youtubeErrorMessage(put));
  const video = (await put.json()) as { id: string; status?: { privacyStatus?: string } };
  return { id: video.id, privacy: video.status?.privacyStatus };
}

async function youtubeErrorMessage(res: Response) {
  const j = await res.json().catch(() => ({}));
  console.error("[youtube] upload error", res.status, JSON.stringify(j));
  const reason: string = j?.error?.errors?.[0]?.reason ?? "";
  if (reason === "uploadLimitExceeded" || reason === "quotaExceeded") return "YouTube's daily upload limit was reached. Try again tomorrow.";
  if (reason === "youtubeSignupRequired") return "This Google account has no YouTube channel yet. Create one at youtube.com first.";
  if (res.status === 401) return "reconnect";
  return j?.error?.message ? `YouTube: ${j.error.message}` : `YouTube upload failed (${res.status}).`;
}
