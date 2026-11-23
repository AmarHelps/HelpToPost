import type { Metadata } from "next";
import { Aperture, Flag, MonitorPlay, Music2 } from "lucide-react";

export const metadata: Metadata = { title: "Accounts" };

const accounts = [
  { name: "YouTube", note: "Videos and Shorts on your channel.", Icon: MonitorPlay, status: "Soon" },
  { name: "Instagram", note: "Needs a free Business or Creator account. The app walks you through switching.", Icon: Aperture, status: "Soon" },
  { name: "Facebook Page", note: "After launch.", Icon: Flag, status: "Later" },
  { name: "TikTok", note: "After launch.", Icon: Music2, status: "Later" },
];

export default function Accounts() {
  return (
    <>
      <h1 className="mt-2 text-[30px] leading-[1.1]">Accounts</h1>
      <p className="mt-2 text-secondary">Connect the places you post. Disconnect any time.</p>
      <ul className="mt-6 space-y-3">
        {accounts.map(({ name, note, Icon, status }) => (
          <li key={name} className="ah-card flex items-center gap-4 !p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink-line">
              <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[17px] leading-[1.25]">{name}</h2>
              <p className="text-sm text-secondary">{note}</p>
            </div>
            <span className="ah-badge shrink-0">{status}</span>
          </li>
        ))}
      </ul>
      <p className="ah-hint mt-6">Connecting is being built now. Beta testers get YouTube and Instagram first.</p>
    </>
  );
}
