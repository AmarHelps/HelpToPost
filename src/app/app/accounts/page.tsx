import type { Metadata } from "next";
import { Accounts } from "@/components/app/Accounts";

export const metadata: Metadata = { title: "Accounts" };

export default function AccountsPage() {
  return <Accounts />;
}
