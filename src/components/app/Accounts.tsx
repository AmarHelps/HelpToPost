"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Aperture, Flag, MonitorPlay, Music2 } from "lucide-react";
import { site } from "@/lib/site";
import { useSession } from "./Session";

type Conn = { platform: string; name: string | null; avatar: string | null };

const MESSAGES: Record<string, string> = {
  "connected:youtube": "YouTube is connected.",
  "connected:instagram": "Instagram is connected.",
  "error:denied": "Connecting was cancelled. Nothing was changed.",
  "error:expired": "That took too long. Try connecting again.",
  "error:google": "Google did not finish connecting. Try again.",
  "error:youtube-scope": "HelpToPost needs permission to upload videos. Connect again and leave that box ticked.",
  "error:youtube-channel": "That Google account has no YouTube channel yet. Create one at youtube.com, then connect again.",
  "error:instagram": "Instagram did not finish connecting. It needs a Business or Creator account in a Meta business portfolio. Try again.",
  "error:instagram-account": "No Instagram professional account was shared. Connect again and tick your Instagram account when asked.",
  "error:google-setup": "YouTube connecting is not switched on yet.",
  "error:instagram-setup": "Instagram connecting is not switched on yet.",
};

async function fetchConnections(): Promise<Conn[]> {
  const r = await fetch("/api/connections", { cache: "no-store" }).catch(() => null);
  return r?.ok ? (await r.json()).connections : [];
}

export function Accounts() {
  const { user, google, instagram, reload } = useSession();
  const params = useSearchParams();
  const router = useRouter();
  const [conns, setConns] = useState<Conn[] | null>(null);
  const [busy, setBusy] = useState("");
  const notice = ["connected", "error"].map((k) => MESSAGES[`${k}:${params.get(k)}`]).find(Boolean);
  const isError = !!params.get("error");

  const load = useCallback(() => fetchConnections().then(setConns), []);
  useEffect(() => {
    fetchConnections().then(setConns);
  }, []);

  async function disconnect(platform: string) {
    setBusy(platform);
    await fetch(`/api/connections?platform=${platform}`, { method: "DELETE" });
    await load();
    setBusy("");
  }

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.replace("?");
    await reload();
  }

  async function deleteAccount() {
    if (busy !== "confirm-delete") return setBusy("confirm-delete");
    setBusy("deleting");
    await fetch("/api/account", { method: "DELETE" });
    await reload();
  }

  const rows = [
    { id: "youtube", name: "YouTube", note: "Videos and Shorts on your channel.", Icon: MonitorPlay, ready: google },
    { id: "instagram", name: "Instagram", note: "Photos, carousels and Reels. Needs a free Business or Creator account.", Icon: Aperture, ready: instagram },
  ];

  return (
    <>
      <h1 className="mt-2 text-[30px] leading-[1.1]">Accounts</h1>
      <p className="mt-2 text-secondary">Connect the places you post. Disconnect any time.</p>

      {notice && (
        <p role="status" className={`mt-4 rounded-[14px] px-3 py-2.5 text-sm ${isError ? "bg-[var(--status-alert-soft)]" : "bg-[var(--status-ok-soft)]"}`}>{notice}</p>
      )}

      <ul className="mt-6 space-y-3">
        {rows.map(({ id, name, note, Icon, ready }) => {
          const c = conns?.find((x) => x.platform === id);
          return (
            <li key={id} className="ah-card !p-4">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-ink-line">
                  {c?.avatar
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={c.avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    : <Icon size={18} strokeWidth={1.75} aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[17px] leading-[1.25]">{name}</h2>
                  <p className="break-words text-sm text-secondary">{c ? `Connected as ${c.name ?? "your account"}` : note}</p>
                </div>
                {conns === null ? null : c ? (
                  <button onClick={() => disconnect(id)} disabled={busy === id} className="ah-btn ah-btn-ghost ah-btn-sm shrink-0">
                    {busy === id ? "…" : "Disconnect"}
                  </button>
                ) : ready ? (
                  <a href={`/api/${id === "youtube" ? "google" : "instagram"}/start?intent=${id}`} className="ah-btn ah-btn-primary ah-btn-sm shrink-0">Connect</a>
                ) : (
                  <span className="ah-badge shrink-0">Soon</span>
                )}
              </div>
            </li>
          );
        })}
        {[{ name: "Facebook Page", Icon: Flag }, { name: "TikTok", Icon: Music2 }].map(({ name, Icon }) => (
          <li key={name} className="ah-card flex items-center gap-4 !p-4 opacity-70">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink-line"><Icon size={18} strokeWidth={1.75} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1"><h2 className="text-[17px] leading-[1.25]">{name}</h2><p className="text-sm text-secondary">After launch.</p></div>
            <span className="ah-badge shrink-0">Later</span>
          </li>
        ))}
      </ul>

      <p className="ah-hint mt-4">
        Connecting YouTube means you agree to the <a href="https://www.youtube.com/t/terms" className="underline">YouTube Terms of Service</a>.
        See the <a href="https://policies.google.com/privacy" className="underline">Google Privacy Policy</a> and{" "}
        <a href={`${site.url}/privacy`} className="underline">{site.appName}&apos;s Privacy Policy</a>.
      </p>

      <section className="mt-10 space-y-3 border-t border-hairline pt-6">
        <p className="text-sm text-secondary">Signed in as {user?.email}</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={signOut} className="ah-btn ah-btn-sm">Sign out</button>
          <button onClick={deleteAccount} disabled={busy === "deleting"} className="ah-btn ah-btn-ghost ah-btn-sm">
            {busy === "confirm-delete" ? "Tap again to delete everything" : busy === "deleting" ? "Deleting…" : "Delete my account"}
          </button>
        </div>
        <p className="ah-hint">Deleting removes your account, connected accounts and any media waiting to post. Posts already on YouTube or Instagram stay there. <a href={`${site.url}/data-deletion`} className="underline">More about deleting data</a>.</p>
      </section>
    </>
  );
}
