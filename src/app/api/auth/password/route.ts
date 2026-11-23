import { NextResponse, type NextRequest } from "next/server";
import { checkPassword, hashPassword } from "@/lib/server/crypto";
import { db } from "@/lib/server/db";
import { fail, handle } from "@/lib/server/http";
import { startSession } from "@/lib/server/session";

type Row = { id: string; password_hash: string | null };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const signup = body.mode === "signup";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return fail(400, "Enter a valid email address.");
    if (password.length < 10 || password.length > 200) return fail(400, "Use a password of at least 10 characters.");

    const [existing] = await db.select<Row>("app_users", `email=${db.eq(email)}&select=id,password_hash`);
    if (signup) {
      if (existing) return fail(409, "That email already has an account. Sign in instead.");
      const name = String(body.name ?? "").trim().slice(0, 100) || null;
      const [u] = await db.insert<Row>("app_users", { email, name, password_hash: await hashPassword(password) });
      await startSession(u.id);
      return NextResponse.json({ ok: true });
    }
    if (!existing || !(await checkPassword(password, existing.password_hash))) {
      return fail(401, existing && !existing.password_hash ? "This account signs in with Google." : "Email or password is not right.");
    }
    await startSession(existing.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handle(e);
  }
}
