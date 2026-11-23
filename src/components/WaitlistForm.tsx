"use client";

import { useActionState } from "react";
import { joinWaitlist, type WaitlistState } from "@/lib/waitlist";

const trades = [
  ["market-vendor", "Market vendor"],
  ["musician", "Musician or band"],
  ["maker", "Maker or crafter"],
  ["food", "Food or farm"],
  ["other", "Something else"],
];
const platforms = [
  ["youtube", "YouTube"],
  ["instagram", "Instagram"],
  ["facebook", "Facebook"],
  ["tiktok", "TikTok"],
];

export function WaitlistForm() {
  const [state, action, pending] = useActionState<WaitlistState, FormData>(joinWaitlist, null);

  if (state?.ok) {
    return <p role="status" className="rounded-2xl bg-soft p-6 text-lg font-medium">{state.message}</p>;
  }

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com"
          className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base outline-none focus:border-brand" />
      </div>
      <div>
        <label htmlFor="trade" className="mb-1 block text-sm font-medium">What do you do?</label>
        <select id="trade" name="trade" defaultValue=""
          className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base outline-none focus:border-brand">
          <option value="" disabled>Pick one</option>
          {trades.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Where do you want to post?</legend>
        <div className="flex flex-wrap gap-2">
          {platforms.map(([v, l]) => (
            <label key={v} className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm has-[:checked]:border-brand has-[:checked]:bg-soft">
              <input type="checkbox" name="platforms" value={v} className="accent-[var(--brand)]" />
              {l}
            </label>
          ))}
        </div>
      </fieldset>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <button disabled={pending} className="w-full rounded-xl bg-brand px-6 py-3 text-base font-semibold text-brand-ink disabled:opacity-60 sm:w-auto">
        {pending ? "Joining…" : "Join the waitlist"}
      </button>
      {state && !state.ok && <p role="alert" className="text-sm text-accent">{state.message}</p>}
      <p className="text-xs text-muted">We&apos;ll only email you about Amar Helps. See our <a href="/privacy" className="underline">Privacy Policy</a>.</p>
    </form>
  );
}
