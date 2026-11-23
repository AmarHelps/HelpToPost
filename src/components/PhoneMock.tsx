export function PhoneMock() {
  return (
    <div className="mx-auto w-64 sm:w-72" aria-hidden="true">
      <div className="rounded-[2.5rem] border-[10px] border-ink bg-surface p-3 shadow-2xl">
        <div className="relative aspect-[9/16] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#f4c26b] via-[#e2583e] to-[#1f6b4a]">
          <div className="absolute inset-x-0 top-6 text-center font-display text-xl font-semibold text-white drop-shadow">Market day!</div>
          <div className="absolute inset-x-0 top-14 text-center text-sm text-white/90">Booth 14 · 8am to 1pm</div>
          <div className="absolute inset-x-4 bottom-4 space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-white/90 px-3 py-2 text-xs font-medium text-[#1f2a24]">
              <span>YouTube Short</span><span className="text-[#1f6b4a]">✓ Ready</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/90 px-3 py-2 text-xs font-medium text-[#1f2a24]">
              <span>Instagram Reel</span><span className="text-[#1f6b4a]">✓ Ready</span>
            </div>
            <div className="rounded-xl bg-[#1f2a24] py-2.5 text-center text-sm font-semibold text-white">Post to both</div>
          </div>
        </div>
      </div>
    </div>
  );
}
