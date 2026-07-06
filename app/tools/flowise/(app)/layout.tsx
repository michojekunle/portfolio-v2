import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FwSidebarNav } from "@/components/flowise/SidebarNav";
import { getUserAccounts } from "@/lib/flowise/queries";
import { computeNetWorth } from "@/lib/flowise/calculator";
import { AssistantWidget } from "@/components/flowise/AssistantWidget";
import { PwaRegistrar } from "@/components/PwaRegistrar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flowise — Your money, mapped",
  description:
    "A personal finance OS. Log transactions, set budgets and savings goals, and get plain-language AI insights into where your money goes.",
  manifest: "/manifests/flowise.json",
  appleWebApp: {
    capable: true,
    title: "Flowise",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default async function FlowiseLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): Promise<React.ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/tools/flowise/login");
  }

  const accounts = await getUserAccounts();
  const netWorth = computeNetWorth(accounts);

  return (
    <div className="min-h-screen flex bg-[var(--bg)] text-[var(--ink)]">
      <FwSidebarNav
        userEmail={user.email ?? ""}
        netWorth={netWorth}
        currency="NGN"
      />
      <div className="flex-1 min-w-0 max-[1024px]:ml-0 ml-[260px] flex flex-col relative">
        <main className="flex-1 min-h-screen">{children}</main>
      </div>
      <AssistantWidget />
      <PwaRegistrar toolId="flowise" />
    </div>
  );
}
