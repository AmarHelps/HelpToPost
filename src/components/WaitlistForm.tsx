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
    return (
      <div role="status">
        <p className="ah-badge ah-badge-ok">On the list</p>
        <p className="mt-3 text-lg">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      <div>
        <label htmlFor="email" className="ah-label">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="ah-input" />
      </div>
      <div>
        <label htmlFor="trade" className="ah-label">What you do</label>
        <select id="trade" name="trade" defaultValue="" className="ah-input">
          <option value="" disabled>Pick one</option>
          {trades.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <fieldset>
        <legend className="ah-label">Where you post</legend>
        <div className="flex flex-wrap gap-2">
          {platforms.map(([v, l]) => (
            <label key={v} className="ah-tag">
              <input type="checkbox" name="platforms" value={v} className="sr-only" />
              {l}
            </label>
          ))}
        </div>
      </fieldset>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div>
        <button disabled={pending} className="ah-btn w-full !border-ink-line sm:w-auto">
          {pending ? "Joining" : "Join the waitlist"}
        </button>
        {state && !state.ok && <p role="alert" className="ah-error">{state.message}</p>}
        <p className="ah-hint">Email only about Amar Helps. No newsletter. See the <a href="/privacy" className="underline">privacy policy</a>.</p>
      </div>
    </form>
  );
}
