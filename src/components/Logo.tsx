export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="var(--brand)" />
      <path d="M18 44 L32 18 L46 44" fill="none" stroke="var(--brand-ink)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="37" r="4.5" fill="var(--accent)" />
    </svg>
  );
}
