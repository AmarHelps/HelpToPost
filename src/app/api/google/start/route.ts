import { NextResponse, type NextRequest } from "next/server";
import { randomToken } from "@/lib/server/crypto";
import { LOGIN_SCOPES, YOUTUBE_SCOPES, authUrl, pkce } from "@/lib/server/google";
import { googleReady } from "@/lib/server/env";
import { appUrl, origin } from "@/lib/server/http";
import { currentUser, saveOAuthState } from "@/lib/server/session";

// /api/google/start?intent=login signs in with Google. ?intent=youtube connects a YouTube channel to the signed-in account.
export async function GET(req: NextRequest) {
  const youtube = req.nextUrl.searchParams.get("intent") === "youtube";
  if (!googleReady()) return NextResponse.redirect(appUrl(req, youtube ? "/accounts" : "/", { error: "google-setup" }));
  const user = youtube ? await currentUser() : null;
  if (youtube && !user) return NextResponse.redirect(appUrl(req, "/"));

  const state = randomToken();
  const { verifier, challenge } = pkce();
  await saveOAuthState({ state, verifier, intent: youtube ? "youtube" : "login", uid: user?.id });
  return NextResponse.redirect(authUrl({
    redirectUri: `${origin(req)}/api/google/callback`,
    state, challenge,
    scopes: youtube ? YOUTUBE_SCOPES : LOGIN_SCOPES,
    offline: youtube,
  }));
}
