import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { site } from "@/lib/site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line/70 bg-bg/85 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
            <LogoMark className="h-8 w-8" />
            {site.name}
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/#how" className="hidden text-muted hover:text-ink sm:inline">How it works</Link>
            <Link href="/#pricing" className="hidden text-muted hover:text-ink sm:inline">Pricing</Link>
            <Link href="/#waitlist" className="rounded-full bg-brand px-4 py-2 font-medium text-brand-ink">Join the waitlist</Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {site.operator}. Made for small businesses.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-ink">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-ink">Terms of Service</Link>
            <Link href="/data-deletion" className="hover:text-ink">Delete your data</Link>
            <a href={`mailto:${site.email}`} className="hover:text-ink">{site.email}</a>
          </div>
        </div>
      </footer>
    </>
  );
}
