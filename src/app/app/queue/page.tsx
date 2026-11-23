import type { Metadata } from "next";
import Link from "next/link";
import { appPath } from "@/lib/site";

export const metadata: Metadata = { title: "Queue" };

export default function Queue() {
  return (
    <>
      <h1 className="mt-2 text-[30px] leading-[1.1]">Queue</h1>
      <div className="mt-6 rounded-[20px] border-2 border-dashed border-hairline p-8 text-center">
        <p className="ah-eyebrow">Nothing here</p>
        <p className="mt-3 text-secondary">Scheduled posts, and the ones already live, show up here with a link to each.</p>
        <Link href={appPath("/")} className="ah-btn mt-6">Make a post</Link>
      </div>
    </>
  );
}
