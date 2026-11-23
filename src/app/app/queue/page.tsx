import type { Metadata } from "next";
import Link from "next/link";
import { appPath } from "@/lib/site";

export const metadata: Metadata = { title: "Queue" };

export default function Queue() {
  return (
    <>
      <h1 className="mt-2 font-display text-2xl font-semibold">Queue</h1>
      <div className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center">
        <p className="font-medium">Nothing scheduled yet</p>
        <p className="mt-1 text-sm text-muted">Posts you schedule, and the ones already live, will show up here with links.</p>
        <Link href={appPath("/")} className="mt-4 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-ink">Make a post</Link>
      </div>
    </>
  );
}
