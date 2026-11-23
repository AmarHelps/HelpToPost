import "server-only";
import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { env } from "./env";

// Every key the app needs is derived from one secret (APP_SECRET), so there is a single value to set and rotate.
function key(purpose: string): Buffer {
  return Buffer.from(hkdfSync("sha256", env("APP_SECRET"), "helptopost", purpose, 32));
}

const b64u = (b: Buffer) => b.toString("base64url");

export function randomToken(bytes = 32) {
  return b64u(randomBytes(bytes));
}

/** Signs a small JSON payload: `<payload>.<signature>`. Used for the session and OAuth state cookies. */
export function sign(data: object, purpose: string): string {
  const body = b64u(Buffer.from(JSON.stringify(data)));
  const sig = b64u(createHmac("sha256", key(purpose)).update(body).digest());
  return `${body}.${sig}`;
}

export function verify<T>(value: string | undefined, purpose: string): T | null {
  if (!value) return null;
  const [body, sig] = value.split(".");
  if (!body || !sig) return null;
  const want = createHmac("sha256", key(purpose)).update(body).digest();
  const got = Buffer.from(sig, "base64url");
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString()) as T;
  } catch {
    return null;
  }
}

/** Encrypts a platform token for storage (AES-256-GCM). */
export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key("token-encryption"), iv);
  const out = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return `v1.${b64u(iv)}.${b64u(c.getAuthTag())}.${b64u(out)}`;
}

export function decrypt(stored: string): string {
  const [v, iv, tag, data] = stored.split(".");
  if (v !== "v1") throw new Error("Unknown token format");
  const d = createDecipheriv("aes-256-gcm", key("token-encryption"), Buffer.from(iv, "base64url"));
  d.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([d.update(Buffer.from(data, "base64url")), d.final()]).toString("utf8");
}

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(pw, salt, 64);
  return `scrypt.${b64u(salt)}.${b64u(hash)}`;
}

export async function checkPassword(pw: string, stored: string | null): Promise<boolean> {
  if (!stored) return false;
  const [kind, salt, hash] = stored.split(".");
  if (kind !== "scrypt") return false;
  const want = Buffer.from(hash, "base64url");
  const got = await scryptAsync(pw, Buffer.from(salt, "base64url"), want.length);
  return timingSafeEqual(got, want);
}

/** Verifies a Meta `signed_request` (deauthorize and data deletion callbacks). */
export function parseSignedRequest(signed: string, secret: string): { user_id?: string } | null {
  const [sig, payload] = signed.split(".");
  if (!sig || !payload) return null;
  const want = createHmac("sha256", secret).update(payload).digest();
  const got = Buffer.from(sig, "base64url");
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return null;
  }
}
