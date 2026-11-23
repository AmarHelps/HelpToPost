"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUser, ListOrdered, Plus } from "lucide-react";
import { appPath } from "@/lib/site";

const tabs = [
  { href: "/", label: "New post", Icon: Plus },
  { href: "/queue", label: "Queue", Icon: ListOrdered },
  { href: "/accounts", label: "Accounts", Icon: CircleUser },
];

export function AppNav() {
  const pathname = usePathname();
  const current = pathname.replace(/^\/app/, "") || "/";
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-hairline bg-sunken pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-md">
        {tabs.map(({ href, label, Icon }) => {
          const active = current === href;
          return (
            <li key={href} className="flex-1">
              <Link href={appPath(href)} aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1.5 py-3 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors active:scale-[.97] ${active ? "text-accent" : "text-muted hover:text-primary"}`}>
                <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
