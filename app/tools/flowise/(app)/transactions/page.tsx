import type { Metadata } from "next";
import { getUserAccounts, getTransactions, getUserCategories } from "@/lib/flowise/queries";
import { getCurrentMonthKey } from "@/lib/flowise/calculator";
import { TransactionsClient } from "@/components/flowise/TransactionsClient";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Flowise — Transactions" };

export default async function TransactionsPage(): Promise<React.ReactElement> {
  const [accounts, categories, transactions] = await Promise.all([
    getUserAccounts(),
    getUserCategories(),
    getTransactions({ month: getCurrentMonthKey(), limit: 100 }),
  ]);

  return (
    <Suspense>
      <TransactionsClient
        accounts={accounts}
        categories={categories}
        initialTransactions={transactions}
        initialMonth={getCurrentMonthKey()}
      />
    </Suspense>
  );
}
