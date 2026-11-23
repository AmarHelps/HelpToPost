"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Images, Play, RotateCcw, TriangleAlert } from "lucide-react";

type Media = { url: string; kind: "image" | "video"; name: string; type: string; duration?: number };
type Aspect = "9:16" | "1:1" | "4:5";
type Platform = "youtube" | "instagram";

const ASPECTS: { id: Aspect; label: string; css: string }[] = [
  { id: "9:16", label: "Short / Reel", css: "aspect-[9/16]" },
  { id: "4:5", label: "Feed post", css: "aspect-[4/5]" },
  { id: "1:1", label: "Square", css: "aspect-square" },
];

export function Composer() {
  const [media, setMedia] = useState<Media[]>([]);
  const [active, setActive] = useState(0);
  const [aspect, setAspect] = useState<Aspect>("9:16");
  const [platforms, setPlatforms] = useState<Set<Platform>>(new Set(["youtube", "instagram"]));
  const [caption, setCaption] = useState("");

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
      .map<Media>((f) => ({ url: URL.createObjectURL(f), kind: f.type.startsWith("video/") ? "video" : "image", name: f.name, type: f.type }));
    setMedia(next);
    setActive(0);
  }

  function setDuration(i: number, d: number) {
    setMedia((prev) => prev.map((m, j) => (j === i ? { ...m, duration: d } : m)));
  }

  function toggle(p: Platform) {
    setPlatforms((prev) => {
      const s = new Set(prev);
      if (s.has(p)) s.delete(p);
      else s.add(p);
      return s;
    });
  }

  const warnings = useMemo(() => {
    const w: string[] = [];
    const videos = media.filter((m) => m.kind === "video");
    const images = media.filter((m) => m.kind === "image");
    if (platforms.has("youtube") && media.length && !videos.length) w.push("YouTube only takes video. Photos go to Instagram only.");
    if (platforms.has("youtube") && videos.some((v) => (v.duration ?? 0) > 180) && aspect !== "1:1" && aspect !== "4:5")
      w.push("Over 3 minutes: YouTube will post this as a regular video, not a Short.");
    if (platforms.has("instagram") && images.some((i) => !/jpe?g/.test(i.type)))
      w.push("Instagram only takes JPEG photos. These get converted when you post.");
    if (platforms.has("instagram") && videos.length > 0 && images.length > 0 && media.length > 1)
      w.push("This will post to Instagram as a carousel of photos and videos.");
    if (caption.length > 2200) w.push("Instagram captions can be up to 2,200 characters.");
    return w;
  }, [media, platforms, aspect, caption]);

  const current = media[active];
  const frame = ASPECTS.find((a) => a.id === aspect)!;

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
                <video src={current.url} className="h-full w-full object-cover" controls playsInline muted
                  onLoadedMetadata={(e) => setDuration(active, e.currentTarget.duration)} />
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
          <div className="flex gap-2" role="radiogroup" aria-label="Shape">
            {ASPECTS.map((a) => (
              <button key={a.id} role="radio" aria-checked={aspect === a.id} onClick={() => setAspect(a.id)}
                className="ah-tag flex-1 flex-col !gap-0 !rounded-[14px] !px-2 !py-2">
                <span className="font-mono text-sm">{a.id}</span>
                <span className="text-xs text-muted">{a.label}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setMedia([])} className="ah-btn ah-btn-ghost ah-btn-sm"><RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" />Start over</button>
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
              {p === "youtube" ? "YouTube" : "Instagram"}
            </button>
          ))}
        </div>
      </fieldset>

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
        <button disabled className="ah-btn ah-btn-primary w-full">Post now</button>
        <p className="ah-hint text-center">Posting turns on once YouTube or Instagram is connected in Accounts.</p>
      </div>
    </div>
  );
}
