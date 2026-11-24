import { NextResponse, type NextRequest } from "next/server";
import { parseSignedRequest, randomToken } from "@/lib/server/crypto";
import { db } from "@/lib/server/db";

// Meta sends the app-scoped id of the person who removed the app; older connections may carry the Instagram id.
const match = (id: string) => `or=(meta_user_id.eq.${encodeURIComponent(id)},external_id.eq.${encodeURIComponent(id)})`;
import { site } from "@/lib/site";

// Meta's data deletion callback. Deletes the Instagram connection and the posts made through it, then returns
// a confirmation code and a page where the person can read what was deleted.
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const data = parseSignedRequest(String(form?.get("signed_request") ?? ""), process.env.META_APP_SECRET ?? "");
  if (!data?.user_id) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const conns = await db.select<{ user_id: string }>("connections", `platform=eq.instagram&${match(String(data.user_id))}&select=user_id`);
  for (const c of conns) await db.remove("posts", `user_id=${db.eq(c.user_id)}&platform=eq.instagram`);
  await db.remove("connections", `platform=eq.instagram&${match(String(data.user_id))}`);
  const code = randomToken(9);
  return NextResponse.json({ url: `${site.url}/data-deletion?code=${code}`, confirmation_code: code });
}
