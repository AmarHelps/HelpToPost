// Single place for names and contact details used across the site and the legal pages.
export const site = {
  name: "Amar Helps",
  appName: "Amar Helps Post",
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

// Where the app lives. In production set NEXT_PUBLIC_APP_URL=https://app.amarhelps.com and
// NEXT_PUBLIC_APP_BASE="" (empty). Locally and on preview deploys the app is served under /app.
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "/app";
export const APP_BASE = process.env.NEXT_PUBLIC_APP_BASE ?? "/app";

/** Link to a page inside the app, from inside the app. */
export function appPath(path = "/") {
  const p = path === "/" ? "" : path;
  return `${APP_BASE}${p}` || "/";
}
