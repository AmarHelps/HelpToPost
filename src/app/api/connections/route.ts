import { NextResponse, connection, type NextRequest } from "next/server";
import { decrypt } from "@/lib/server/crypto";
import { db } from "@/lib/server/db";
import { revoke } from "@/lib/server/google";
import { fail, withUser } from "@/lib/server/http";

type Row = { platform: string; display_name: string | null; avatar_url: string | null; created_at: string };

export async function GET() {
  await connection();
  return withUser(async (u) => {
    const rows = await db.select<Row>("connections", `user_id=${db.eq(u.id)}&select=platform,display_name,avatar_url,created_at`);
    return NextResponse.json({ connections: rows.map((r) => ({ platform: r.platform, name: r.display_name, avatar: r.avatar_url, since: r.created_at })) });
  });
}

// DELETE /api/connections?platform=youtube|instagram disconnects and deletes the stored token.
export function DELETE(req: NextRequest) {
  return withUser(async (u) => {
    const platform = req.nextUrl.searchParams.get("platform");
    if (platform !== "youtube" && platform !== "instagram") return fail(400, "Unknown platform.");
    const filter = `user_id=${db.eq(u.id)}&platform=${db.eq(platform)}`;
    if (platform === "youtube") {
      const [c] = await db.select<{ access_token_enc: string; refresh_token_enc: string | null }>("connections", `${filter}&select=access_token_enc,refresh_token_enc`);
      if (c) await revoke(decrypt(c.refresh_token_enc ?? c.access_token_enc)).catch(() => {});
    }
    await db.remove("connections", filter);
    return NextResponse.json({ ok: true });
  });
}
