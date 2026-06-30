import { getBBSettings } from "@/lib/bookbreaks/queries";
import { BBSettingsForm } from "@/components/bookbreaks/SettingsForm";

export default async function SettingsPage(): Promise<React.ReactElement> {
  const settings = await getBBSettings();

  return (
    <div className="p-[48px] max-[720px]:p-[24px] max-[1024px]:pt-[80px] max-w-[600px]">
      <div className="mb-[40px]">
        <div
          className="font-mono text-[10px] tracking-[0.16em] uppercase mb-[8px]"
          
        >
          Settings
        </div>
        <h1
          className="font-display font-normal text-[36px] leading-[1.05] tracking-[-0.025em] fvs-text m-0"
          
        >
          Preferences
        </h1>
        <p
          className="text-[14px] mt-[6px] m-0"
          
        >
          Configure how BookBreaks generates content for you.
        </p>
      </div>

      <BBSettingsForm initialSettings={settings} />
    </div>
  );
}
