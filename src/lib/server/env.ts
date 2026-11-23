import "server-only";

/** Reads a required server setting. Throws a clear message when it is missing so setup gaps are obvious in logs. */
export function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new ConfigError(name);
  return v;
}

export class ConfigError extends Error {
  constructor(public setting: string) {
    super(`Missing setting ${setting}. Add it in Vercel → Project → Settings → Environment Variables.`);
  }
}

export const has = (...names: string[]) => names.every((n) => !!process.env[n]);

export const googleReady = () => has("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "APP_SECRET");
export const instagramReady = () => has("INSTAGRAM_APP_ID", "INSTAGRAM_APP_SECRET", "APP_SECRET");
