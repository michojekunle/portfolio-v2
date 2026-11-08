import type { Metadata } from "next";
import { Suspense } from "react";
import { getUserAccounts, getUserCategories } from "@/lib/flowise/queries";
import { AccountsClient } from "@/components/flowise/AccountsClient";

export const metadata: Metadata = { title: "Flowise — Accounts" };

export default async function AccountsPage(): Promise<React.ReactElement> {
  const [accounts, categories] = await Promise.all([
    getUserAccounts(),
    getUserCategories(),
  ]);

  return (
    <Suspense>
      <AccountsClient accounts={accounts} categories={categories} />
    </Suspense>
  );
}
