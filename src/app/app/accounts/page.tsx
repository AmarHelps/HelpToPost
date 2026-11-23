import type { Metadata } from "next";

export const metadata: Metadata = { title: "Accounts" };

const accounts = [
  { name: "YouTube", note: "Post videos and Shorts to your channel.", color: "#ff0000" },
  { name: "Instagram", note: "Needs a free Business or Creator account. We'll walk you through switching.", color: "#d62976" },
  { name: "Facebook Page", note: "Coming after launch.", color: "#1877f2", later: true },
  { name: "TikTok", note: "Coming after launch.", color: "#111111", later: true },
];

export default function Accounts() {
  return (
    <>
      <h1 className="mt-2 font-display text-2xl font-semibold">Accounts</h1>
      <p className="mt-1 text-sm text-muted">Connect the places you want to post. You can disconnect any time.</p>
      <ul className="mt-6 space-y-3">
        {accounts.map((a) => (
          <li key={a.name} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
            <span className="h-10 w-10 shrink-0 rounded-xl" style={{ background: a.color }} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{a.name}</p>
              <p className="text-sm text-muted">{a.note}</p>
            </div>
            <button disabled className="shrink-0 rounded-lg border border-line px-3 py-2 text-sm font-medium text-muted">
              {a.later ? "Later" : "Soon"}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-muted">Connecting is being set up now. Beta testers will be able to connect YouTube and Instagram first.</p>
    </>
  );
}
