import type { Metadata } from "next";

export const metadata: Metadata = { title: "Flowise — Goals" };

export default function GoalsPage(): React.ReactElement {
  return (
    <div className="px-[40px] pt-[48px] pb-[60px] max-[1024px]:pt-[80px] max-[720px]:px-[20px]">
      <div className="mb-[40px]">
        <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--ink-4)] mb-[6px]">Coming next</div>
        <h1 className="font-display font-normal text-[40px] leading-[1.05] tracking-[-0.03em] fvs-text m-0 text-[var(--ink)]">
          Savings Goals
        </h1>
        <p className="text-[15px] leading-[1.65] text-[var(--ink-3)] mt-[12px] max-w-[44ch]">
          Create goals — Emergency Fund, Laptop, Trip — and see exactly how much to save each month to hit your deadline.
        </p>
      </div>
      <div className="rounded-[12px] py-[60px] text-center" style={{ border: "1px dashed var(--rule)" }}>
        <div className="text-[40px] mb-[12px]">🎯</div>
        <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--ink-3)]">Phase 2 — Coming soon</div>
      </div>
    </div>
  );
}
