import { NextResponse, type NextRequest } from "next/server";
import { encrypt } from "@/lib/server/crypto";
import { db } from "@/lib/server/db";
import { GoogleError, channelInfo, exchangeCode, idClaims } from "@/lib/server/google";
import { appUrl, origin } from "@/lib/server/http";
import { startSession, takeOAuthState } from "@/lib/server/session";

type UserRow = { id: string; google_sub: string | null };

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const s = await takeOAuthState(p.get("state"));
  const back = (path: string, params?: Record<string, string>) => NextResponse.redirect(appUrl(req, path, params));
  if (!s) return back("/", { error: "expired" });
  const page = s.intent === "youtube" ? "/accounts" : "/";
  if (p.get("error") || !p.get("code")) return back(page, { error: p.get("error") === "access_denied" ? "denied" : "google" });

  try {
    const t = await exchangeCode(p.get("code")!, `${origin(req)}/api/google/callback`, s.verifier!);
    const claims = t.id_token ? idClaims(t.id_token) : null;

    if (s.intent === "login") {
      if (!claims?.sub || !claims.email || claims.email_verified === false) return back("/", { error: "google" });
      const email = claims.email.toLowerCase();
      const [bySub] = await db.select<UserRow>("app_users", `google_sub=${db.eq(claims.sub)}&select=id,google_sub`);
      let id = bySub?.id;
      if (!id) {
        const [byEmail] = await db.select<UserRow>("app_users", `email=${db.eq(email)}&select=id,google_sub`);
        if (byEmail) {
          await db.update("app_users", `id=${db.eq(byEmail.id)}`, { google_sub: claims.sub });
          id = byEmail.id;
        } else {
          [{ id }] = await db.insert<UserRow>("app_users", { email, name: claims.name ?? null, google_sub: claims.sub });
        }
      }
      await startSession(id!);
      return back("/");
    }

    // Connect YouTube.
    const granted = t.scope.split(" ");
    if (!granted.includes("https://www.googleapis.com/auth/youtube.upload")) return back(page, { error: "youtube-scope" });
    const ch = await channelInfo(t.access_token);
    await db.upsert("connections", {
      user_id: s.uid,
      platform: "youtube",
      external_id: ch.id,
      display_name: ch.title,
      avatar_url: ch.avatar,
      access_token_enc: encrypt(t.access_token),
      ...(t.refresh_token ? { refresh_token_enc: encrypt(t.refresh_token) } : {}),
      expires_at: new Date(Date.now() + t.expires_in * 1000).toISOString(),
      scopes: t.scope,
      updated_at: new Date().toISOString(),
    }, "user_id,platform");
    return back(page, { connected: "youtube" });
  } catch (e) {
    if (!(e instanceof GoogleError)) console.error("[google] callback", e);
    return back(page, { error: e instanceof GoogleError && e.message !== "reconnect" ? "youtube-channel" : "google" });
  }
}
