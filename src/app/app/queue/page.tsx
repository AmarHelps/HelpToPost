import type { Metadata } from "next";
import { Queue } from "@/components/app/Queue";

export const metadata: Metadata = { title: "Queue" };

export default function QueuePage() {
  return (
    <>
      <h1 className="mt-2 text-[30px] leading-[1.1]">Queue</h1>
      <Queue />
    </>
  );
}
