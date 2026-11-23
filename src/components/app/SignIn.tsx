"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { site } from "@/lib/site";

const ERRORS: Record<string, string> = {
  denied: "Google sign-in was cancelled.",
  google: "Google sign-in did not go through. Try again.",
  expired: "That sign-in took too long. Try again.",
  "google-setup": "Google sign-in is not switched on yet. Use email for now.",
};

export function SignIn({ google, onDone }: { google: boolean; onDone: () => Promise<void> }) {
  const params = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(ERRORS[params.get("error") ?? ""] ?? "");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const r = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, email: f.get("email"), password: f.get("password"), name: f.get("name") }),
    }).catch(() => null);
    if (r?.ok) {
      await onDone();
      return;
    }
    setError((await r?.json().catch(() => null))?.error ?? "That did not go through. Try again.");
    setBusy(false);
  }

  return (
    <div className="mt-2">
      <h1 className="text-[30px] leading-[1.1]">{mode === "signin" ? "Sign in" : "Create your account"}</h1>
      <p className="mt-2 text-secondary">Post your photos and videos to YouTube and Instagram from one place.</p>

      {google && (
        <>
          <a href="/api/google/start?intent=login" className="ah-btn ah-btn-primary mt-6 w-full">Continue with Google</a>
          <p className="ah-eyebrow my-5 text-center">or with email</p>
        </>
      )}

      <form onSubmit={submit} className={`space-y-4 ${google ? "" : "mt-6"}`}>
        {mode === "signup" && (
          <div>
            <label htmlFor="name" className="ah-label">Name or business</label>
            <input id="name" name="name" autoComplete="name" className="ah-input" />
          </div>
        )}
        <div>
          <label htmlFor="email" className="ah-label">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="ah-input" />
        </div>
        <div>
          <label htmlFor="password" className="ah-label">Password</label>
          <input id="password" name="password" type="password" required minLength={10}
            autoComplete={mode === "signin" ? "current-password" : "new-password"} className="ah-input" />
          {mode === "signup" && <p className="ah-hint mt-1.5">At least 10 characters.</p>}
        </div>
        {error && <p className="ah-error" role="alert">{error}</p>}
        <button disabled={busy} className={`ah-btn w-full ${google ? "" : "ah-btn-primary"}`}>
          {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
        className="ah-btn ah-btn-ghost ah-btn-sm mt-4 w-full">
        {mode === "signin" ? "New here? Create an account" : "Have an account? Sign in"}
      </button>

      <p className="ah-hint mt-6 text-center">
        By continuing you agree to the <a href={`${site.url}/terms`} className="underline">Terms</a> and{" "}
        <a href={`${site.url}/privacy`} className="underline">Privacy Policy</a>. Forgot your password? Email {site.email}.
      </p>
    </div>
  );
}
