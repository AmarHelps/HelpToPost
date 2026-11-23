"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
    if (platforms.has("youtube") && media.length && !videos.length) w.push("YouTube only takes videos. Photos will go to Instagram only.");
    if (platforms.has("youtube") && videos.some((v) => (v.duration ?? 0) > 180) && aspect !== "1:1" && aspect !== "4:5")
      w.push("Over 3 minutes: YouTube will post this as a regular video, not a Short.");
    if (platforms.has("instagram") && images.some((i) => !/jpe?g/.test(i.type)))
      w.push("Instagram needs JPEG photos. We'll convert them for you.");
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
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl bg-brand p-6 text-center font-semibold text-brand-ink">
            <span className="text-3xl" aria-hidden="true">📷</span>
            Take photo or video
            <input type="file" accept="image/*,video/*" capture="environment" className="sr-only" onChange={(e) => onFiles(e.target.files)} />
          </label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-surface p-6 text-center font-semibold">
            <span className="text-3xl" aria-hidden="true">🖼️</span>
            Choose from library
            <input type="file" accept="image/*,video/*" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} />
          </label>
        </div>
      ) : (
        <>
          <div className="mx-auto w-full max-w-xs">
            <div className={`relative ${frame.css} overflow-hidden rounded-2xl bg-black`}>
              {current.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <video src={current.url} className="h-full w-full object-cover" controls playsInline muted
                  onLoadedMetadata={(e) => setDuration(active, e.currentTarget.duration)} />
              )}
              {caption && (
                <p className="pointer-events-none absolute inset-x-0 bottom-0 line-clamp-3 bg-gradient-to-t from-black/70 p-3 text-sm text-white">{caption}</p>
              )}
            </div>
          </div>
          {media.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {media.map((m, i) => (
                <button key={m.url} onClick={() => setActive(i)} aria-label={`Show item ${i + 1}`}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${i === active ? "border-brand" : "border-transparent"}`}>
                  {m.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-ink text-xs text-bg">▶</span>
                  )}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2" role="radiogroup" aria-label="Shape">
            {ASPECTS.map((a) => (
              <button key={a.id} role="radio" aria-checked={aspect === a.id} onClick={() => setAspect(a.id)}
                className={`flex-1 rounded-xl border px-2 py-2 text-sm ${aspect === a.id ? "border-brand bg-soft font-semibold text-brand" : "border-line"}`}>
                {a.id}
                <span className="block text-xs font-normal text-muted">{a.label}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setMedia([])} className="text-sm text-muted underline">Start over</button>
        </>
      )}

      <div>
        <label htmlFor="caption" className="mb-1 block text-sm font-medium">Caption</label>
        <textarea id="caption" rows={3} value={caption} onChange={(e) => setCaption(e.target.value)}
          placeholder="Fresh tomatoes today! Booth 14, 8am to 1pm"
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-base outline-none focus:border-brand" />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Post to</legend>
        <div className="flex gap-2">
          {(["youtube", "instagram"] as Platform[]).map((p) => (
            <button key={p} type="button" aria-pressed={platforms.has(p)} onClick={() => toggle(p)}
              className={`flex-1 rounded-xl border px-3 py-3 text-sm font-medium ${platforms.has(p) ? "border-brand bg-soft text-brand" : "border-line text-muted"}`}>
              {p === "youtube" ? "YouTube" : "Instagram"}
            </button>
          ))}
        </div>
      </fieldset>

      {warnings.length > 0 && (
        <ul className="space-y-2">
          {warnings.map((w) => (
            <li key={w} className="rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-3 py-2 text-sm">{w}</li>
          ))}
        </ul>
      )}

      <div className="space-y-2">
        <button disabled className="w-full rounded-xl bg-brand py-3.5 font-semibold text-brand-ink opacity-50">Post now</button>
        <p className="text-center text-xs text-muted">Posting turns on once you connect YouTube or Instagram in Accounts.</p>
      </div>
    </div>
  );
}
