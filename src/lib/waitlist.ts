"use server";

export type WaitlistState = { ok: boolean; message: string } | null;

const TRADES = new Set(["market-vendor", "musician", "maker", "food", "other"]);
const PLATFORMS = new Set(["youtube", "instagram", "facebook", "tiktok", "other"]);

export async function joinWaitlist(_prev: WaitlistState, formData: FormData): Promise<WaitlistState> {
  // Honeypot: real people never fill this hidden field.
  if (String(formData.get("company") ?? "").trim()) return { ok: true, message: "Thanks! You're on the list." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return { ok: false, message: "Please enter a valid email address." };
  }
  const tradeRaw = String(formData.get("trade") ?? "");
  const trade = TRADES.has(tradeRaw) ? tradeRaw : null;
  const platforms = formData.getAll("platforms").map(String).filter((p) => PLATFORMS.has(p));

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("[waitlist] Supabase is not configured; signup not stored:", { trade, platforms });
    return { ok: false, message: "The waitlist isn't open yet. Please email us instead." };
  }

  const res = await fetch(`${url}/rest/v1/waitlist`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates,return=minimal",
    },
    body: JSON.stringify({ email, trade, platforms }),
    cache: "no-store",
  });

  if (!res.ok && res.status !== 409) {
    console.error("[waitlist] insert failed", res.status, await res.text());
    return { ok: false, message: "Something went wrong. Please try again in a minute." };
  }
  return { ok: true, message: "Thanks! You're on the list. We'll email you when your invite is ready." };
}
