import type { Metadata } from "next";
import { AppNav } from "@/components/app/AppNav";
import { Logo } from "@/components/Logo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: site.appName, template: `%s · ${site.appName}` },
  manifest: "/manifest.webmanifest",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Amar Helps", statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <header className="flex items-center gap-3 px-4 pb-3 pt-[max(env(safe-area-inset-top),16px)]">
        <Logo variant="mark" size={28} className="text-primary" />
        <span className="ah-eyebrow">Help to post</span>
        <span className="ah-badge ml-auto">Beta</span>
      </header>
      <main className="flex-1 px-4 pb-32">{children}</main>
      <AppNav />
    </div>
  );
}
