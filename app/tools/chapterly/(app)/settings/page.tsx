import { getOrCreateGoal } from "@/lib/chapterly/queries";
import { ChSettingsClient } from "@/components/chapterly/SettingsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Chapterly — Settings" };

export default async function SettingsPage(): Promise<React.ReactElement> {
  const goal = await getOrCreateGoal();

  return (
    <div className="px-[40px] pt-[48px] pb-[48px] max-[1024px]:pt-[80px] max-[720px]:px-[24px] max-[720px]:pb-[32px] max-w-[640px]">
      <div className="mb-[40px]">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] mb-[6px]">
          Preferences
        </div>
        <h1 className="font-display text-[32px] font-normal tracking-[-0.02em] fvs-text text-[var(--ink)] m-0 leading-[1.1]">
          Settings
        </h1>
      </div>
      <ChSettingsClient goal={goal} />
    </div>
  );
}
