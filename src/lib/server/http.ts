import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { ConfigError } from "./env";
import { currentUser, type User } from "./session";

/** The address the browser used to reach us. OAuth redirect URIs are built from it, so they match the host the cookies live on. */
export function origin(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? new URL(req.url).host;
  const proto = req.headers.get("x-forwarded-proto") ?? new URL(req.url).protocol.replace(":", "");
  return `${proto}://${host}`;
}

/** A page inside the app, for redirects from API routes. On the app subdomain the app sits at the root; elsewhere under /app. */
export function appUrl(req: NextRequest, path: string, params?: Record<string, string>) {
  const o = origin(req);
  const base = new URL(o).host.startsWith("app.") ? path : `/app${path === "/" ? "" : path}`;
  const u = new URL(base, o);
  if (params) Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  return u;
}

export const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

export async function withUser(fn: (user: User) => Promise<Response>): Promise<Response> {
  try {
    const user = await currentUser();
    if (!user) return fail(401, "Sign in first.");
    return await fn(user);
  } catch (e) {
    return handle(e);
  }
}

export function handle(e: unknown) {
  if (e instanceof ConfigError) {
    console.error(`[config] ${e.message}`);
    return fail(503, "HelpToPost is still being set up. Try again later.");
  }
  console.error("[api]", e);
  return fail(500, "Something went wrong. Try again.");
}
