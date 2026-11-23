import { NextResponse, connection } from "next/server";
import { googleReady, instagramReady } from "@/lib/server/env";
import { handle } from "@/lib/server/http";
import { currentUser } from "@/lib/server/session";

export async function GET() {
  await connection();
  try {
    const user = await currentUser();
    return NextResponse.json({ user, google: googleReady(), instagram: instagramReady() });
  } catch (e) {
    return handle(e);
  }
}
