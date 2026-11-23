import { Logo } from "@/components/Logo";

// A flat mock of the composer: no gradients or photos, per the design system.
export function PhoneMock() {
  return (
    <div className="mx-auto w-64 sm:w-72" aria-hidden="true">
      <div className="ah-card-sticker rounded-[36px] bg-sunken p-3">
        <div className="relative flex aspect-[9/16] flex-col overflow-hidden rounded-[26px] border border-hairline bg-card p-4">
          <p className="ah-eyebrow">New post · 9:16</p>
          <div className="flex flex-1 items-center justify-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-ink-line">
              <Logo variant="mark" size={56} className="text-primary" />
            </div>
          </div>
          <p className="font-display text-xl font-semibold uppercase leading-tight">Market day</p>
          <p className="mb-4 text-sm text-secondary">Booth 14 · 8 am to 1 pm</p>
          <div className="space-y-2">
            {["YouTube Short", "Instagram Reel"].map((p) => (
              <div key={p} className="flex items-center justify-between rounded-[14px] border border-hairline px-3 py-2 text-xs">
                <span>{p}</span>
                <span className="ah-badge ah-badge-ok">Ready</span>
              </div>
            ))}
            <div className="ah-btn ah-btn-primary w-full">Post to both</div>
          </div>
        </div>
      </div>
    </div>
  );
}
