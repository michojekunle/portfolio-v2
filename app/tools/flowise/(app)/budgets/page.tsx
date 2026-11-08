import type { Metadata } from "next";
import { Suspense } from "react";
import { getBudgets, getUserCategories } from "@/lib/flowise/queries";
import { getCurrentMonthKey } from "@/lib/flowise/calculator";
import { BudgetsClient } from "@/components/flowise/BudgetsClient";

export const metadata: Metadata = { title: "Flowise — Budgets" };

export default async function BudgetsPage(): Promise<React.ReactElement> {
  const month = getCurrentMonthKey();
  const [budgets, categories] = await Promise.all([
    getBudgets(month),
    getUserCategories(),
  ]);

  return (
    <Suspense>
      <BudgetsClient
        initialBudgets={budgets}
        categories={categories}
        initialMonth={month}
      />
    </Suspense>
  );
}
