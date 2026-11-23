"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Camera, Images, Play, RotateCcw, TriangleAlert } from "lucide-react";
import { appPath } from "@/lib/site";
import { PostRow, isDone, type PostView } from "./Queue";

type Media = { url: string; kind: "image" | "video"; file: File; type: string; duration?: number; w?: number; h?: number };
type Aspect = "9:16" | "1:1" | "4:5";
type Platform = "youtube" | "instagram";
type Privacy = "public" | "unlisted" | "private";
type Phase = { step: "idle" } | { step: "uploading"; pct: number } | { step: "posting" } | { step: "tracking"; batchId: string; posts: PostView[] };

const ASPECTS: { id: Aspect; label: string; css: string; ratio: number }[] = [
  { id: "9:16", label: "Short / Reel", css: "aspect-[9/16]", ratio: 9 / 16 },
  { id: "4:5", label: "Feed post", css: "aspect-[4/5]", ratio: 4 / 5 },
  { id: "1:1", label: "Square", css: "aspect-square", ratio: 1 },
];
// Instagram photos can be no taller than 4:5, so a 9:16 choice crops photos to 4:5.
const photoAspect = (a: Aspect) => (a === "9:16" ? "4:5" : a);
const NAMES: Record<Platform, string> = { youtube: "YouTube", instagram: "Instagram" };

/** Crops a photo to the chosen shape (centered) and converts it to JPEG, the only photo format Instagram takes. */
async function toJpeg(file: File, ratio: number): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  let sw = bmp.width, sh = bmp.height;
  if (sw / sh > ratio) sw = Math.round(sh * ratio);
  else sh = Math.round(sw / ratio);
  const outW = Math.min(sw, 1440), outH = Math.round(outW / ratio);
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  canvas.getContext("2d")!.drawImage(bmp, (bmp.width - sw) / 2, (bmp.height - sh) / 2, sw, sh, 0, 0, outW, outH);
  bmp.close();
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("crop"))), "image/jpeg", 0.9));
}

function put(url: string, body: Blob, type: string, onProgress: (loaded: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("PUT", url);
    x.setRequestHeader("Content-Type", type);
    x.upload.onprogress = (e) => onProgress(e.loaded);
    x.onload = () => (x.status < 300 ? resolve() : reject(new Error(x.status === 413 ? "too-big" : `upload ${x.status}`)));
    x.onerror = () => reject(new Error("network"));
    x.send(body);
  });
}

export function Composer() {
  const [media, setMedia] = useState<Media[]>([]);
  const [active, setActive] = useState(0);
  const [aspect, setAspect] = useState<Aspect>("9:16");
  const [platforms, setPlatforms] = useState<Set<Platform>>(new Set(["youtube", "instagram"]));
  const [caption, setCaption] = useState("");
  const [title, setTitle] = useState("");
  const [privacy, setPrivacy] = useState<Privacy>("public");
  const [forKids, setForKids] = useState(false);
  const [connected, setConnected] = useState<Set<string> | null>(null);
  const [phase, setPhase] = useState<Phase>({ step: "idle" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/connections", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { connections: [] }))
      .then((j: { connections: { platform: string }[] }) => setConnected(new Set(j.connections.map((c) => c.platform))))
      .catch(() => setConnected(new Set()));
  }, []);

  // Free preview URLs that are no longer shown, and all of them when the page unmounts.
  const shown = useRef<Set<string>>(new Set());
  useEffect(() => {
    const now = new Set(media.map((m) => m.url));
    shown.current.forEach((u) => { if (!now.has(u)) URL.revokeObjectURL(u); });
    shown.current = now;
  }, [media]);
  useEffect(() => () => shown.current.forEach((u) => URL.revokeObjectURL(u)), []);

  function onFiles(list: FileList | null) {
    if (!list?.length) return;
    const next = Array.from(list)
      .filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"))
      .slice(0, 10)
      .map<Media>((f) => ({ url: URL.createObjectURL(f), kind: f.type.startsWith("video/") ? "video" : "image", file: f, type: f.type }));
    setMedia(next);
    setActive(0);
    setError("");
  }

  function setVideoMeta(i: number, v: HTMLVideoElement) {
    setMedia((prev) => prev.map((m, j) => (j === i ? { ...m, duration: v.duration, w: v.videoWidth, h: v.videoHeight } : m)));
  }

  function toggle(p: Platform) {
    setPlatforms((prev) => {
      const s = new Set(prev);
      if (s.has(p)) s.delete(p);
      else s.add(p);
      return s;
    });
  }

  const videos = media.filter((m) => m.kind === "video");
  const images = media.filter((m) => m.kind === "image");
  const targets = [...platforms].filter((p) => connected?.has(p));
  const notConnected = [...platforms].filter((p) => connected && !connected.has(p));
  const toYouTube = targets.includes("youtube");

  const warnings = useMemo(() => {
    const w: string[] = [];
    if (platforms.has("youtube") && media.length && !videos.length) w.push("YouTube only takes video. Photos go to Instagram only.");
    if (platforms.has("youtube") && videos.length > 1) w.push("YouTube gets the first video only.");
    const v = videos[0];
    if (platforms.has("youtube") && v?.duration && v.duration > 180) w.push("Over 3 minutes: YouTube will post this as a regular video, not a Short.");
    else if (platforms.has("youtube") && v?.w && v.h && v.w > v.h) w.push("Landscape video: YouTube will post this as a regular video, not a Short.");
    if (videos.length) w.push("Videos post in their original shape. Film vertically for Shorts and Reels.");
    if (platforms.has("instagram") && images.length && aspect === "9:16") w.push("Instagram photos can be no taller than 4:5, so photos are cropped to 4:5.");
    if (platforms.has("instagram") && images.some((i) => !/jpe?g/.test(i.type))) w.push("Instagram only takes JPEG photos. These get converted when you post.");
    if (platforms.has("instagram") && media.length > 1) w.push("This will post to Instagram as a carousel.");
    if (caption.length > 2200) w.push("Instagram captions can be up to 2,200 characters. The rest is cut off there.");
    return w;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media, platforms, aspect, caption]);

  const poll = useCallback(async (batchId: string) => {
    const r = await fetch(`/api/posts?batch=${batchId}`, { cache: "no-store" }).catch(() => null);
    if (!r?.ok) return;
    const { posts } = (await r.json()) as { posts: PostView[] };
    setPhase((p) => (p.step === "tracking" && p.batchId === batchId ? { ...p, posts } : p));
  }, []);

  useEffect(() => {
    if (phase.step !== "tracking" || phase.posts.every((p) => isDone(p.status))) return;
    const t = setTimeout(() => poll(phase.batchId), 3000);
    return () => clearTimeout(t);
  }, [phase, poll]);

  async function postNow() {
    setError("");
    // Only what each platform will use gets uploaded: YouTube alone needs just the first video.
    const items = targets.includes("instagram") ? media : videos.slice(0, 1);
    try {
      setPhase({ step: "uploading", pct: 0 });
      const ratio = ASPECTS.find((a) => a.id === photoAspect(aspect))!.ratio;
      const blobs = await Promise.all(items.map(async (m) => (m.kind === "image" ? toJpeg(m.file, ratio) : m.file)));
      const types = items.map((m, i) => (m.kind === "image" ? "image/jpeg" : blobs[i].type || m.type || "video/mp4"));

      const r = await fetch("/api/uploads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: types.map((type) => ({ type })) }),
      });
      const up = await r.json();
      if (!r.ok) throw new Error(up.error ?? "upload");

      const total = blobs.reduce((n, b) => n + b.size, 0) || 1;
      const loaded = blobs.map(() => 0);
      await Promise.all(up.files.map((f: { uploadUrl: string }, i: number) =>
        put(f.uploadUrl, blobs[i], types[i], (n) => {
          loaded[i] = n;
          setPhase({ step: "uploading", pct: Math.round((loaded.reduce((a, b) => a + b, 0) / total) * 100) });
        })));

      setPhase({ step: "posting" });
      const p = await fetch("/api/posts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: up.batchId,
          media: up.files.map((f: { path: string; kind: string }) => ({ path: f.path, kind: f.kind })),
          platforms: targets, caption, title, privacy, madeForKids: forKids,
        }),
      });
      const res = await p.json();
      if (!p.ok) throw new Error(res.error ?? "post");
      setPhase({ step: "tracking", batchId: res.batchId, posts: res.posts });
    } catch (e) {
      const m = e instanceof Error ? e.message : "";
      setError(
        m === "too-big" ? "That file is too large to upload. Try a shorter video."
        : m === "network" ? "The upload stopped. Check your connection and try again."
        : m === "crop" || e instanceof DOMException ? "One of the photos could not be read. Try a different photo."
        : m && !/^(upload|post)/.test(m) ? m : "That did not go through. Try again.",
      );
      setPhase({ step: "idle" });
    }
  }

  function reset() {
    setMedia([]);
    setCaption("");
    setTitle("");
    setPhase({ step: "idle" });
  }

  if (phase.step === "tracking") {
    const done = phase.posts.every((p) => isDone(p.status));
    return (
      <div className="mt-4 space-y-4">
        <p className="text-secondary" aria-live="polite">
          {done ? "Finished." : "Posting now. You can leave this screen; progress also shows in Queue."}
        </p>
        <ul className="space-y-3">{phase.posts.map((p) => <PostRow key={p.id} p={p} />)}</ul>
        <div className="flex gap-2">
          <button onClick={reset} className="ah-btn ah-btn-primary flex-1">Make another post</button>
          <Link href={appPath("/queue")} className="ah-btn flex-1">Queue</Link>
        </div>
      </div>
    );
  }

  const current = media[active];
  const frameId = current?.kind === "image" ? photoAspect(aspect) : aspect;
  const frame = ASPECTS.find((a) => a.id === frameId)!;
  const busy = phase.step !== "idle";
  const canPost = !busy && media.length > 0 && targets.length > 0 && !(targets.length === 1 && toYouTube && !videos.length);

  return (
    <div className="mt-4 space-y-6">
      {!media.length ? (
        <div className="grid grid-cols-2 gap-3">
          <label className="ah-card ah-card-drawn flex cursor-pointer flex-col items-center justify-center gap-3 text-center transition-transform active:scale-[.97]">
            <Camera size={28} strokeWidth={1.75} aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-[0.14em]">Take photo or video</span>
            <input type="file" accept="image/*,video/*" capture="environment" className="sr-only" onChange={(e) => onFiles(e.target.files)} />
          </label>
          <label className="ah-card flex cursor-pointer flex-col items-center justify-center gap-3 text-center transition-transform active:scale-[.97]">
            <Images size={28} strokeWidth={1.75} aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-[0.14em]">Choose from library</span>
            <input type="file" accept="image/*,video/*" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} />
          </label>
        </div>
      ) : (
        <>
          <div className="mx-auto w-full max-w-[240px]">
            <div className={`relative ${frame.css} overflow-hidden rounded-[20px] border-2 border-ink-line bg-sunken`}>
              {current.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <video src={current.url} className="h-full w-full object-contain" controls playsInline muted
                  onLoadedMetadata={(e) => setVideoMeta(active, e.currentTarget)} />
              )}
              {caption && (
                <p className="pointer-events-none absolute inset-x-3 bottom-3 line-clamp-3 rounded-[14px] bg-sunken px-3 py-2 text-sm">{caption}</p>
              )}
            </div>
          </div>
          {media.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {media.map((m, i) => (
                <button key={m.url} onClick={() => setActive(i)} aria-label={`Show item ${i + 1}`}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-[10px] border-2 ${i === active ? "border-accent" : "border-hairline"}`}>
                  {m.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-card"><Play size={16} strokeWidth={1.75} aria-hidden="true" /></span>
                  )}
                </button>
              ))}
            </div>
          )}
          {images.length > 0 && (
            <div className="flex gap-2" role="radiogroup" aria-label="Shape">
              {ASPECTS.map((a) => (
                <button key={a.id} role="radio" aria-checked={aspect === a.id} onClick={() => setAspect(a.id)}
                  className="ah-tag flex-1 flex-col !gap-0 !rounded-[14px] !px-2 !py-2">
                  <span className="font-mono text-sm">{a.id}</span>
                  <span className="text-xs text-muted">{a.label}</span>
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setMedia([])} disabled={busy} className="ah-btn ah-btn-ghost ah-btn-sm"><RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" />Start over</button>
        </>
      )}

      <div>
        <label htmlFor="caption" className="ah-label">Caption</label>
        <textarea id="caption" rows={3} value={caption} onChange={(e) => setCaption(e.target.value)}
          placeholder="Fresh tomatoes today. Booth 14, 8 am to 1 pm"
          className="ah-input" />
      </div>

      <fieldset>
        <legend className="ah-label">Post to</legend>
        <div className="flex gap-2">
          {(["youtube", "instagram"] as Platform[]).map((p) => (
            <button key={p} type="button" aria-pressed={platforms.has(p)} onClick={() => toggle(p)}
              className="ah-tag flex-1 justify-center">
              {NAMES[p]}
            </button>
          ))}
        </div>
        {notConnected.length > 0 && (
          <p className="ah-hint mt-2">
            {notConnected.map((p) => NAMES[p]).join(" and ")} {notConnected.length > 1 ? "are" : "is"} not connected yet.{" "}
            <Link href={appPath("/accounts")} className="underline">Connect in Accounts</Link>
          </p>
        )}
      </fieldset>

      {toYouTube && videos.length > 0 && (
        <fieldset className="space-y-4">
          <legend className="ah-label">YouTube</legend>
          <div>
            <label htmlFor="title" className="ah-label">Title</label>
            <input id="title" value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)}
              placeholder={caption.split("\n")[0].slice(0, 100) || "Title for YouTube"} className="ah-input" />
            <p className="ah-hint mt-1.5">Left empty, the first line of the caption is used.</p>
          </div>
          <div className="flex gap-2" role="radiogroup" aria-label="Who can watch">
            {(["public", "unlisted", "private"] as Privacy[]).map((v) => (
              <button key={v} type="button" role="radio" aria-checked={privacy === v} onClick={() => setPrivacy(v)} className="ah-tag flex-1 justify-center capitalize">{v}</button>
            ))}
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={forKids} onChange={(e) => setForKids(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
            <span>This video is made for kids. <span className="text-secondary">YouTube requires you to say so. It turns off comments and some features.</span></span>
          </label>
        </fieldset>
      )}

      {warnings.length > 0 && (
        <ul className="space-y-2">
          {warnings.map((w) => (
            <li key={w} className="flex gap-3 rounded-[14px] bg-[var(--status-warn-soft)] px-3 py-2.5 text-sm">
              <TriangleAlert size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2">
        {error && <p className="ah-error text-center" role="alert">{error}</p>}
        <button disabled={!canPost} onClick={postNow} className="ah-btn ah-btn-primary w-full">
          {phase.step === "uploading" ? `Uploading ${phase.pct}%` : phase.step === "posting" ? "Sending…" : targets.length ? `Post to ${targets.map((p) => NAMES[p]).join(" and ")}` : "Post now"}
        </button>
        {connected && connected.size === 0 && (
          <p className="ah-hint text-center">Posting turns on once YouTube or Instagram is connected in <Link href={appPath("/accounts")} className="underline">Accounts</Link>.</p>
        )}
        {busy && <p className="ah-hint text-center">Keep this screen open until the upload finishes.</p>}
      </div>
    </div>
  );
}
