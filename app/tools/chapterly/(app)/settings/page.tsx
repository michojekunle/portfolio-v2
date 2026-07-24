import { getOrCreateGoal } from "@/lib/chapterly/queries";
import { ChSettingsClient } from "@/components/chapterly/SettingsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Chapterly — Settings" };

export default async function SettingsPage(): Promise<React.ReactElement> {
  const goal = await getOrCreateGoal();

  return (
    <div className="px-10 pt-12 pb-12 max-[1024px]:pt-20 max-[720px]:px-6 max-[720px]:pb-8 max-w-160">
      <div className="mb-10">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
          Preferences
        </div>
        <h1 className="font-display text-[32px] font-normal tracking-[-0.02em] fvs-text text-(--ink) m-0 leading-[1.1]">
          Settings
        </h1>
      </div>
      <ChSettingsClient goal={goal} />
    </div>
  );
}
