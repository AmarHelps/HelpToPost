// Single place for names and contact details used across the site and the legal pages.
export const site = {
  name: "Amar Helps",
  appName: "HelpToPost",
  domain: "amarhelps.com",
  url: "https://amarhelps.com",
  appUrl: "https://app.amarhelps.com",
  email: "hello@amarhelps.com",
  // Who runs the service, as it appears in the legal pages.
  operator: "Amar Helps LLC",
  // US state whose laws govern the Terms. Leave null until confirmed.
  governingState: "Texas" as string | null,
  legalEffectiveDate: "November 23, 2026",
};

// Where the app lives. In production set NEXT_PUBLIC_APP_URL=https://app.amarhelps.com; the app then
// sits at the root of its subdomain. Locally and on preview deploys it is served under /app.
// NEXT_PUBLIC_APP_BASE overrides the path prefix if ever needed.
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "/app";
export const APP_BASE = process.env.NEXT_PUBLIC_APP_BASE ?? (APP_URL.startsWith("http") ? "" : "/app");

/** Link to a page inside the app, from inside the app. */
export function appPath(path = "/") {
  const p = path === "/" ? "" : path;
  return `${APP_BASE}${p}` || "/";
}
