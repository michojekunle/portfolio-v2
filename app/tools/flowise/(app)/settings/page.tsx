import type { Metadata } from "next";
import { SettingsClient } from "@/components/flowise/SettingsClient";
import { getUserAccounts, getUserCategories } from "@/lib/flowise/queries";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Flowise — Settings" };

export default async function SettingsPage(): Promise<React.ReactElement> {
  const [accounts, categories] = await Promise.all([getUserAccounts(), getUserCategories()]);
  return (
    <Suspense>
      <SettingsClient accounts={accounts} categories={categories} />
    </Suspense>
  );
}
