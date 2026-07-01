import type { Metadata } from "next";

export const metadata: Metadata = { title: "Flowise — Settings" };

export default function SettingsPage(): React.ReactElement {
  return (
    <div className="px-[40px] pt-[48px] pb-[60px] max-[1024px]:pt-[80px] max-[720px]:px-[20px]">
      <h1 className="font-display font-normal text-[36px] leading-[1.05] tracking-[-0.03em] fvs-text m-0 mb-[32px] text-[var(--ink)]">
        Settings
      </h1>
      <div className="rounded-[12px] py-[60px] text-center" style={{ border: "1px dashed var(--rule)" }}>
        <div className="text-[40px] mb-[12px]">⚙️</div>
        <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--ink-3)]">Coming in Phase 5</div>
        <div className="text-[13px] text-[var(--ink-3)] mt-[8px]">Currency defaults, category management, data export.</div>
      </div>
    </div>
  );
}
