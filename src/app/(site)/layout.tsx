import Link from "next/link";
import { Logo } from "@/components/Logo";
import { site } from "@/lib/site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-hairline bg-[rgba(23,23,23,.78)] backdrop-blur-[10px]">
        <nav className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-2 sm:px-8">
          <Link href="/" aria-label="Amar Helps home" className="text-primary">
            <Logo size={52} />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/#how" className="ah-eyebrow hidden !text-secondary hover:!text-primary sm:inline">How it works</Link>
            <Link href="/#pricing" className="ah-eyebrow hidden !text-secondary hover:!text-primary sm:inline">Pricing</Link>
            <Link href="/#waitlist" className="ah-btn ah-btn-sm">Join the waitlist</Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-hairline bg-sunken">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-4">
            <Logo variant="mark" size={28} className="text-primary" />
            <p className="ah-eyebrow">© 2026 {site.operator} · Built for people who sell in person</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {[
              ["/privacy", "Privacy"],
              ["/terms", "Terms"],
              ["/data-deletion", "Delete your data"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="ah-eyebrow !text-secondary hover:!text-accent">{label}</Link>
            ))}
            <a href={`mailto:${site.email}`} className="ah-eyebrow !text-secondary hover:!text-accent">{site.email}</a>
          </div>
        </div>
      </footer>
    </>
  );
}
