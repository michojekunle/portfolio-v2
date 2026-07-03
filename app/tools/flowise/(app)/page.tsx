import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserAccounts, getTransactions, getUserCategories, getProfile } from "@/lib/flowise/queries";
import { computeMonthlyStats, computeNetWorth, getCurrentMonthKey, getLastMonthKey } from "@/lib/flowise/calculator";
import { FwDashboardClient } from "@/components/flowise/DashboardClient";

export const metadata: Metadata = { title: "Flowise — Dashboard" };

export default async function FlowiseDashboard(): Promise<React.ReactElement> {
  const profile = await getProfile();
  if (!profile || !profile.onboarded) {
    redirect("/tools/flowise/onboarding");
  }

  const [accounts, categories] = await Promise.all([
    getUserAccounts(),
    getUserCategories(),
  ]);

  const currentMonth = getCurrentMonthKey();
  const lastMonth = getLastMonthKey();

  const [thisMonthTxs, lastMonthTxs, recentTxs] = await Promise.all([
    getTransactions({ month: currentMonth }),
    getTransactions({ month: lastMonth }),
    getTransactions({ limit: 10 }),
  ]);

  const thisMonthStats = computeMonthlyStats(thisMonthTxs, categories);
  const lastMonthStats = computeMonthlyStats(lastMonthTxs, categories);
  const netWorth = computeNetWorth(accounts);

  return (
    <Suspense>
      <FwDashboardClient
        accounts={accounts}
        recentTransactions={recentTxs}
        categories={categories}
        thisMonth={thisMonthStats}
        lastMonth={lastMonthStats}
        netWorth={netWorth}
      />
    </Suspense>
  );
}
