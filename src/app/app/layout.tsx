import type { Metadata } from "next";
import { AppNav } from "@/components/app/AppNav";
import { LogoMark } from "@/components/Logo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: site.appName, template: `%s · ${site.appName}` },
  manifest: "/manifest.webmanifest",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Amar Helps", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <header className="flex items-center gap-2 px-4 pb-2 pt-[max(env(safe-area-inset-top),1rem)]">
        <LogoMark className="h-7 w-7" />
        <span className="font-display text-lg font-semibold">Amar Helps</span>
        <span className="ml-auto rounded-full bg-soft px-2.5 py-0.5 text-xs font-medium text-brand">Beta</span>
      </header>
      <main className="flex-1 px-4 pb-28">{children}</main>
      <AppNav />
    </div>
  );
}
