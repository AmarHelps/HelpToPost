"use client";

import { createContext, use, useCallback, useEffect, useState } from "react";
import { SignIn } from "./SignIn";

export type Me = { user: { id: string; email: string; name: string | null } | null; google: boolean; instagram: boolean };
type Ctx = Me & { reload: () => Promise<void> };

const SessionContext = createContext<Ctx | null>(null);

export function useSession() {
  const c = use(SessionContext);
  if (!c) throw new Error("useSession must be used inside AuthGate");
  return c;
}

async function fetchMe(): Promise<Me | null> {
  try {
    const r = await fetch("/api/me", { cache: "no-store" });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

/** Shows the sign-in screen until the person is signed in, then the app. */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [failed, setFailed] = useState(false);

  const apply = useCallback((m: Me | null) => {
    if (m) setMe(m);
    setFailed(!m);
  }, []);
  const reload = useCallback(() => fetchMe().then(apply), [apply]);

  useEffect(() => {
    fetchMe().then(apply);
  }, [apply]);

  if (failed) return <p className="mt-10 text-center text-secondary">HelpToPost could not load. Check your connection and refresh.</p>;
  if (!me) return <p className="mt-10 text-center text-muted" aria-live="polite">Loading…</p>;
  return (
    <SessionContext value={{ ...me, reload }}>
      {me.user ? children : <SignIn google={me.google} onDone={reload} />}
    </SessionContext>
  );
}
