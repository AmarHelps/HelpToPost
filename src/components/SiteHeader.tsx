"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

const COMPANY = [
  ["/#apps", "Apps"],
  ["/#services", "Services"],
];
const HELPTOPOST = [
  ["/helptopost#how", "How it works"],
  ["/helptopost#pricing", "Pricing"],
];

export function SiteHeader() {
  const inApp = (usePathname() ?? "/").startsWith("/helptopost");
  const links = inApp ? HELPTOPOST : COMPANY;
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-[rgba(23,23,23,.78)] backdrop-blur-[10px]">
      <nav className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-2 sm:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="Amar Helps home" className="text-primary">
            <Logo size={52} />
          </Link>
          {inApp && (
            <Link href="/helptopost" className="ah-eyebrow hidden border-l border-hairline pl-4 !text-primary sm:inline">HelpToPost</Link>
          )}
        </div>
        <div className="flex items-center gap-6">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="ah-eyebrow hidden !text-secondary hover:!text-primary sm:inline">{label}</Link>
          ))}
          {inApp ? (
            <Link href="/helptopost#waitlist" className="ah-btn ah-btn-sm">Join the waitlist</Link>
          ) : (
            <Link href="/#contact" className="ah-btn ah-btn-sm">Contact</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
