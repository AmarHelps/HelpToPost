import { NextResponse, type NextRequest } from "next/server";
import { encrypt } from "@/lib/server/crypto";
import { db } from "@/lib/server/db";
import { appUrl, origin } from "@/lib/server/http";
import { InstagramError, connect } from "@/lib/server/instagram";
import { takeOAuthState } from "@/lib/server/session";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const back = (params: Record<string, string>) => NextResponse.redirect(appUrl(req, "/accounts", params));
  const s = await takeOAuthState(p.get("state"));
  if (!s || s.intent !== "instagram" || !s.uid) return back({ error: "expired" });
  if (p.get("error") || !p.get("code")) return back({ error: (p.get("error_reason") === "user_denied" || p.get("error") === "access_denied") ? "denied" : "instagram" });

  try {
    const ig = await connect(p.get("code")!, `${origin(req)}/api/instagram/callback`);
    await db.upsert("connections", {
      user_id: s.uid,
      platform: "instagram",
      external_id: ig.userId,
      display_name: ig.username,
      avatar_url: ig.avatar,
      access_token_enc: encrypt(ig.token),
      refresh_token_enc: null,
      expires_at: ig.expiresAt,
      scopes: "instagram_basic,instagram_content_publish",
      meta_business_id: ig.businessId,
      meta_user_id: ig.metaUserId,
      updated_at: new Date().toISOString(),
    }, "user_id,platform");
    return back({ connected: "instagram" });
  } catch (e) {
    if (!(e instanceof InstagramError)) console.error("[instagram] callback", e);
    return back({ error: e instanceof InstagramError && e.message === "no-account" ? "instagram-account" : "instagram" });
  }
}
