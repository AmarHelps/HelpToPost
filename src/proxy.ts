import { NextResponse, type NextRequest } from "next/server";

// Paths that are shared by both hosts and are never rewritten.
const SHARED = ["/privacy", "/terms", "/data-deletion", "/api", "/manifest.webmanifest", "/icons", "/favicon.ico", "/robots.txt"];

// The legal pages cover every Amar Helps product, so they live at the company level. These product-level
// paths are accepted too and point at the one canonical copy.
const LEGAL_ALIASES: Record<string, string> = {
  "/helptopost/privacy": "/privacy",
  "/helptopost/terms": "/terms",
  "/helptopost/data-deletion": "/data-deletion",
};

// app.amarhelps.com/* is served from the /app route tree; amarhelps.com serves everything else.
export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const { pathname } = request.nextUrl;

  if (host.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = host.slice(4);
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  const legal = LEGAL_ALIASES[pathname.replace(/\/$/, "")];
  if (legal) {
    const url = request.nextUrl.clone();
    url.pathname = legal;
    return NextResponse.redirect(url, 308);
  }

  const isAppHost = host.startsWith("app.");
  if (!isAppHost) {
    // On the main domain, send /app/... to the app subdomain once it is configured.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl?.startsWith("http") && (pathname === "/app" || pathname.startsWith("/app/"))) {
      return NextResponse.redirect(new URL(pathname.slice(4) || "/", appUrl));
    }
    return NextResponse.next();
  }

  if (SHARED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return NextResponse.next();

  // Old /app/... links on the app host: drop the prefix.
  if (pathname === "/app" || pathname.startsWith("/app/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(4) || "/";
    return NextResponse.redirect(url);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/app${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/|.*\\.(?:png|jpg|svg|ico|webp|txt|xml|js)$).*)"],
};
