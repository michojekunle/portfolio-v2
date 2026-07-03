import { CURATED_BOOKS } from "@/lib/chapterly/curated";
import { DiscoverClient } from "@/components/chapterly/DiscoverClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Chapterly — Discover" };

export default function DiscoverPage(): React.ReactElement {
  const categories = Array.from(new Set(CURATED_BOOKS.map((b) => b.category))).sort();

  return (
    <div className="px-[40px] pt-[48px] pb-[48px] max-[1024px]:pt-[80px] max-[720px]:px-[24px] max-[720px]:pb-[32px] max-w-[1200px]">
      <div className="mb-[40px]">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] mb-[8px]">
          10 curated summaries · Headway-style
        </div>
        <h1 className="font-display text-[32px] max-[720px]:text-[24px] font-normal tracking-[-0.02em] fvs-text text-[var(--ink)] m-0 leading-[1.1]">
          Discover Books
        </h1>
      </div>
      <DiscoverClient books={CURATED_BOOKS} categories={categories} />
    </div>
  );
}
