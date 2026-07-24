import { getBBSettings } from "@/lib/bookbreaks/queries";
import { BBSettingsForm } from "@/components/bookbreaks/SettingsForm";

export default async function SettingsPage(): Promise<React.ReactElement> {
  const settings = await getBBSettings();

  return (
    <div className="px-12 py-12 max-[1024px]:pt-20 max-[720px]:px-6 max-[720px]:pb-6 max-[720px]:pt-20 max-w-160">
      {/* Page header */}
      <div className="mb-10">
        <div className="font-mono text-[10px] tracking-[0.16em] uppercase mb-2 text-muted-foreground">
          Settings
        </div>
        <h1 className="font-display font-normal text-[36px] leading-[1.05] tracking-tight fvs-text m-0 text-(--ink)">
          Preferences
        </h1>
        <p className="text-[14px] mt-1.5 m-0 text-muted-foreground leading-[1.6]">
          Configure how BookBreaks generates content. Changes apply immediately to all future generations.
        </p>
      </div>

      <BBSettingsForm initialSettings={settings} />

      {/* Theme hint */}
      <p className="mt-6 font-mono text-[10px] text-(--ink-4) text-center leading-[1.6]">
        Colour theme, font &amp; dark mode can be changed via the{" "}
        <span className="text-(--v3-accent)">palette icon</span> in the bottom-right corner.
      </p>
    </div>
  );
}
