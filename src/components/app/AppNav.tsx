"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appPath } from "@/lib/site";

const tabs = [
  { href: "/", label: "New post", icon: "M12 5v14M5 12h14" },
  { href: "/queue", label: "Queue", icon: "M4 6h16M4 12h16M4 18h10" },
  { href: "/accounts", label: "Accounts", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" },
];

export function AppNav() {
  const pathname = usePathname();
  const current = pathname.replace(/^\/app/, "") || "/";
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {tabs.map((t) => {
          const active = current === t.href;
          return (
            <li key={t.href} className="flex-1">
              <Link href={appPath(t.href)} aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-3 text-xs font-medium ${active ? "text-brand" : "text-muted"}`}>
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={t.icon} />
                </svg>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
