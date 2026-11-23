import "server-only";
import { cookies } from "next/headers";
import { sign, verify } from "./crypto";
import { db } from "./db";

const COOKIE = "htp_session";
const DAYS = 30;

export type User = { id: string; email: string; name: string | null };
type Session = { uid: string; exp: number };

const secure = process.env.NODE_ENV === "production";

export async function startSession(uid: string) {
  const exp = Date.now() + DAYS * 864e5;
  (await cookies()).set(COOKIE, sign({ uid, exp } satisfies Session, "session"), {
    httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: DAYS * 86400,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const s = verify<Session>((await cookies()).get(COOKIE)?.value, "session");
  if (!s || s.exp < Date.now()) return null;
  const [u] = await db.select<User>("app_users", `id=${db.eq(s.uid)}&select=id,email,name`);
  return u ? { id: u.id, email: u.email, name: u.name } : null;
}

/** Short-lived cookie that carries OAuth state across the redirect to Google or Instagram. */
const OAUTH = "htp_oauth";
export type OAuthState = { state: string; intent: string; verifier?: string; uid?: string; exp: number };

export async function saveOAuthState(s: Omit<OAuthState, "exp">) {
  (await cookies()).set(OAUTH, sign({ ...s, exp: Date.now() + 600e3 }, "oauth"), {
    httpOnly: true, secure, sameSite: "lax", path: "/api", maxAge: 600,
  });
}

export async function takeOAuthState(state: string | null): Promise<OAuthState | null> {
  const jar = await cookies();
  const s = verify<OAuthState>(jar.get(OAUTH)?.value, "oauth");
  jar.delete({ name: OAUTH, path: "/api" });
  if (!s || !state || s.state !== state || s.exp < Date.now()) return null;
  return s;
}
