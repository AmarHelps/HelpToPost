import type { Metadata, Viewport } from "next";
import { DM_Sans, Fredoka, JetBrains_Mono } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const fredoka = Fredoka({ variable: "--font-fredoka-src", subsets: ["latin"], weight: ["500", "600", "700"] });
const dmSans = DM_Sans({ variable: "--font-dmsans-src", subsets: ["latin"], weight: ["400", "500", "700"] });
const jbMono = JetBrains_Mono({ variable: "--font-jbmono-src", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.appName}: shoot it, fix it, post it everywhere`, template: `%s · ${site.name}` },
  description:
    "Phone-first posting for market vendors, musicians and one-person businesses. Shoot a photo or video, fix it and post it to YouTube and Instagram in under a minute.",
  openGraph: { siteName: site.name, type: "website" },
};

export const viewport: Viewport = { themeColor: "#171717", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${dmSans.variable} ${jbMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
