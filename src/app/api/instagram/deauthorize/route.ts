import { NextResponse, type NextRequest } from "next/server";
import { parseSignedRequest } from "@/lib/server/crypto";
import { db } from "@/lib/server/db";

// Meta calls this when someone removes HelpToPost from their Instagram settings. The stored token is deleted.
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const data = parseSignedRequest(String(form?.get("signed_request") ?? ""), process.env.INSTAGRAM_APP_SECRET ?? "");
  if (!data?.user_id) return NextResponse.json({ error: "bad request" }, { status: 400 });
  await db.remove("connections", `platform=eq.instagram&external_id=${db.eq(String(data.user_id))}`);
  return NextResponse.json({ ok: true });
}
