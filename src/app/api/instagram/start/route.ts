import { NextResponse, type NextRequest } from "next/server";
import { randomToken } from "@/lib/server/crypto";
import { instagramReady } from "@/lib/server/env";
import { appUrl, origin } from "@/lib/server/http";
import { authUrl } from "@/lib/server/instagram";
import { currentUser, saveOAuthState } from "@/lib/server/session";

export async function GET(req: NextRequest) {
  if (!instagramReady()) return NextResponse.redirect(appUrl(req, "/accounts", { error: "instagram-setup" }));
  const user = await currentUser();
  if (!user) return NextResponse.redirect(appUrl(req, "/"));
  const state = randomToken();
  await saveOAuthState({ state, intent: "instagram", uid: user.id });
  return NextResponse.redirect(authUrl(`${origin(req)}/api/instagram/callback`, state));
}
