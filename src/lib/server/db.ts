import "server-only";
import { env } from "./env";

// Thin client for Supabase's REST and Storage APIs using the server's secret key. Nothing here runs in the browser.

function headers(extra: Record<string, string> = {}) {
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  return {
    apikey: key,
    // New sb_secret_ keys go only in the apikey header; legacy service_role JWTs also need Bearer.
    ...(key.startsWith("sb_") ? {} : { Authorization: `Bearer ${key}` }),
    ...extra,
  };
}

export class DbError extends Error {}

async function rest<T>(method: string, path: string, body?: unknown, prefer = "return=representation"): Promise<T> {
  const res = await fetch(`${env("SUPABASE_URL")}/rest/v1/${path}`, {
    method,
    headers: headers({ "Content-Type": "application/json", Prefer: prefer }),
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`[db] ${method} ${path.split("?")[0]} failed`, res.status, text);
    throw new DbError(`Database error ${res.status}`);
  }
  if (res.status === 204) return [] as T;
  return (await res.json()) as T;
}

const q = encodeURIComponent;

export const db = {
  select: <T>(table: string, query: string) => rest<T[]>("GET", `${table}?${query}`),
  insert: <T>(table: string, row: object | object[]) => rest<T[]>("POST", table, row),
  upsert: <T>(table: string, row: object, onConflict: string) =>
    rest<T[]>("POST", `${table}?on_conflict=${onConflict}`, row, "return=representation,resolution=merge-duplicates"),
  update: <T>(table: string, query: string, patch: object) => rest<T[]>("PATCH", `${table}?${query}`, patch),
  remove: (table: string, query: string) => rest<unknown[]>("DELETE", `${table}?${query}`, undefined, "return=minimal"),
  eq: (v: string) => `eq.${q(v)}`,
};

// ---- Storage (bucket "media", private) ----

const BUCKET = "media";
const storage = (p: string) => `${env("SUPABASE_URL")}/storage/v1${p}`;
const encPath = (path: string) => path.split("/").map(q).join("/");

/** A one-time URL the browser can PUT a file to, without any key. Valid for two hours. */
export async function signedUploadUrl(path: string): Promise<string> {
  const res = await fetch(storage(`/object/upload/sign/${BUCKET}/${encPath(path)}`), { method: "POST", headers: headers(), cache: "no-store" });
  if (!res.ok) {
    console.error("[storage] sign upload failed", res.status, await res.text());
    throw new DbError("Storage error");
  }
  const { url } = (await res.json()) as { url: string };
  return storage(url);
}

/** A temporary public link to a stored file. Instagram fetches media from this. */
export async function signedDownloadUrl(path: string, seconds = 3600): Promise<string> {
  const res = await fetch(storage(`/object/sign/${BUCKET}/${encPath(path)}`), {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ expiresIn: seconds }),
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("[storage] sign download failed", res.status, await res.text());
    throw new DbError("Storage error");
  }
  const { signedURL } = (await res.json()) as { signedURL: string };
  return storage(signedURL);
}

/** Streams a stored file (used to pass video on to YouTube). */
export async function openObject(path: string): Promise<Response> {
  const res = await fetch(storage(`/object/authenticated/${BUCKET}/${encPath(path)}`), { headers: headers(), cache: "no-store" });
  if (!res.ok || !res.body) throw new DbError(`Could not read the uploaded file (${res.status}).`);
  return res;
}

export async function objectInfo(path: string): Promise<{ size: number; type: string } | null> {
  const res = await fetch(storage(`/object/authenticated/${BUCKET}/${encPath(path)}`), { method: "HEAD", headers: headers(), cache: "no-store" });
  if (!res.ok) return null;
  return { size: Number(res.headers.get("content-length") ?? 0), type: res.headers.get("content-type") ?? "" };
}

export async function deleteObjects(paths: string[]) {
  if (!paths.length) return;
  const res = await fetch(storage(`/object/${BUCKET}`), {
    method: "DELETE",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prefixes: paths }),
    cache: "no-store",
  });
  if (!res.ok) console.error("[storage] delete failed", res.status, await res.text());
}

export async function listObjects(prefix: string): Promise<string[]> {
  const res = await fetch(storage(`/object/list/${BUCKET}`), {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prefix, limit: 1000 }),
    cache: "no-store",
  });
  if (!res.ok) return [];
  const items = (await res.json()) as { name: string; id: string | null }[];
  return items.map((i) => `${prefix}/${i.name}`);
}
