import { NextResponse, type NextRequest } from "next/server";
import { parseSignedRequest } from "@/lib/server/crypto";
import { db } from "@/lib/server/db";

// Meta sends the app-scoped id of the person who removed the app; older connections may carry the Instagram id.
const match = (id: string) => `or=(meta_user_id.eq.${encodeURIComponent(id)},external_id.eq.${encodeURIComponent(id)})`;

// Meta calls this when someone removes HelpToPost from their Facebook or Instagram settings. The stored token is deleted.
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const data = parseSignedRequest(String(form?.get("signed_request") ?? ""), process.env.META_APP_SECRET ?? "");
  if (!data?.user_id) return NextResponse.json({ error: "bad request" }, { status: 400 });
  await db.remove("connections", `platform=eq.instagram&${match(String(data.user_id))}`);
  return NextResponse.json({ ok: true });
}
