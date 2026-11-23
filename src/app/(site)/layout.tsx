import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/site";

const FOOTER_LINKS = [
  ["/helptopost", site.appName],
  ["/privacy", "Privacy"],
  ["/terms", "Terms"],
  ["/data-deletion", "Delete your data"],
];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-hairline bg-sunken">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-4">
            <Logo variant="mark" size={28} className="text-primary" />
            <p className="ah-eyebrow">© 2026 {site.operator} · Texas</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {FOOTER_LINKS.map(([href, label]) => (
              <Link key={href} href={href} className="ah-eyebrow !text-secondary hover:!text-accent">{label}</Link>
            ))}
            <a href={`mailto:${site.email}`} className="ah-eyebrow !text-secondary hover:!text-accent">{site.email}</a>
          </div>
        </div>
      </footer>
    </>
  );
}
