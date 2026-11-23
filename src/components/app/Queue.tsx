"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { appPath } from "@/lib/site";

export type PostView = {
  id: string; batchId: string; platform: "youtube" | "instagram"; status: string; caption: string; title: string | null;
  url: string | null; error: string | null; kinds: string[]; createdAt: string;
};

export const STATUS: Record<string, { label: string; badge: string }> = {
  queued: { label: "Waiting", badge: "" },
  uploading: { label: "Uploading", badge: "ah-badge-accent" },
  processing: { label: "Processing", badge: "ah-badge-accent" },
  publishing: { label: "Publishing", badge: "ah-badge-accent" },
  published: { label: "Live", badge: "ah-badge-ok" },
  failed: { label: "Failed", badge: "ah-badge-warn" },
};
export const PLATFORM = { youtube: "YouTube", instagram: "Instagram" } as const;
export const isDone = (s: string) => s === "published" || s === "failed";

export function PostRow({ p }: { p: PostView }) {
  const s = STATUS[p.status] ?? STATUS.queued;
  return (
    <li className="ah-card !p-4">
      <div className="flex items-center gap-3">
        <span className="text-[17px] leading-[1.25]">{PLATFORM[p.platform]}</span>
        <span className={`ah-badge ${s.badge}`}>{s.label}</span>
        {p.url && (
          <a href={p.url} target="_blank" rel="noopener noreferrer" className="ah-btn ah-btn-ghost ah-btn-sm ml-auto">
            Open<ExternalLink size={14} strokeWidth={1.75} aria-hidden="true" />
          </a>
        )}
      </div>
      {(p.title || p.caption) && <p className="mt-2 line-clamp-2 text-sm text-secondary">{p.title || p.caption}</p>}
      {p.error && <p className="mt-2 text-sm">{p.error}</p>}
      <p className="ah-hint mt-2">{new Date(p.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</p>
    </li>
  );
}

async function fetchPosts(): Promise<PostView[]> {
  const r = await fetch("/api/posts", { cache: "no-store" }).catch(() => null);
  return r?.ok ? (await r.json()).posts : [];
}

export function Queue() {
  const [posts, setPosts] = useState<PostView[] | null>(null);
  useEffect(() => {
    fetchPosts().then(setPosts);
  }, []);
  useEffect(() => {
    if (!posts?.some((p) => !isDone(p.status))) return;
    const t = setTimeout(() => fetchPosts().then(setPosts), 5000);
    return () => clearTimeout(t);
  }, [posts]);

  if (posts === null) return <p className="mt-6 text-muted">Loading…</p>;
  if (!posts.length)
    return (
      <div className="mt-6 rounded-[20px] border-2 border-dashed border-hairline p-8 text-center">
        <p className="ah-eyebrow">Nothing here</p>
        <p className="mt-3 text-secondary">Your posts show up here, with a link to each one once it is live.</p>
        <Link href={appPath("/")} className="ah-btn mt-6">Make a post</Link>
      </div>
    );
  return <ul className="mt-6 space-y-3">{posts.map((p) => <PostRow key={p.id} p={p} />)}</ul>;
}
