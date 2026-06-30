import { getBBSettings } from "@/lib/bookbreaks/queries";
import { BBSettingsForm } from "@/components/bookbreaks/SettingsForm";

export default async function SettingsPage(): Promise<React.ReactElement> {
  const settings = await getBBSettings();

  return (
    <div className="px-[48px] py-[48px] max-[1024px]:pt-[80px] max-[720px]:px-[24px] max-[720px]:pb-[24px] max-[720px]:pt-[80px] max-w-[640px]">
      {/* Page header */}
      <div className="mb-[40px]">
        <div className="font-mono text-[10px] tracking-[0.16em] uppercase mb-[8px] text-[var(--ink-3)]">
          Settings
        </div>
        <h1 className="font-display font-normal text-[36px] leading-[1.05] tracking-[-0.025em] fvs-text m-0 text-[var(--ink)]">
          Preferences
        </h1>
        <p className="text-[14px] mt-[6px] m-0 text-[var(--ink-3)] leading-[1.6]">
          Configure how BookBreaks generates content. Changes apply immediately to all future generations.
        </p>
      </div>

      <BBSettingsForm initialSettings={settings} />

      {/* Theme hint */}
      <p className="mt-[24px] font-mono text-[10px] text-[var(--ink-4)] text-center leading-[1.6]">
        Colour theme, font &amp; dark mode can be changed via the{" "}
        <span className="text-[var(--v3-accent)]">palette icon</span> in the bottom-right corner.
      </p>
    </div>
  );
}
