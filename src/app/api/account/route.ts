import { NextResponse } from "next/server";
import { decrypt } from "@/lib/server/crypto";
import { db, deleteObjects, listObjects } from "@/lib/server/db";
import { revoke } from "@/lib/server/google";
import { withUser } from "@/lib/server/http";
import { endSession } from "@/lib/server/session";

// Deletes the signed-in account: revokes Google access, removes media, posts, connections and the user row.
export function DELETE() {
  return withUser(async (u) => {
    const conns = await db.select<{ platform: string; access_token_enc: string; refresh_token_enc: string | null }>(
      "connections", `user_id=${db.eq(u.id)}&select=platform,access_token_enc,refresh_token_enc`);
    for (const c of conns) if (c.platform === "youtube") await revoke(decrypt(c.refresh_token_enc ?? c.access_token_enc)).catch(() => {});
    for (const folder of await listObjects(u.id)) await deleteObjects(await listObjects(folder));
    await db.remove("app_users", `id=${db.eq(u.id)}`); // connections and posts go with it (on delete cascade)
    await endSession();
    return NextResponse.json({ ok: true });
  });
}
