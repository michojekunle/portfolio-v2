import { CURATED_BOOKS } from "@/lib/chapterly/curated";
import { getUserBooks } from "@/lib/chapterly/queries";
import { DiscoverClient } from "@/components/chapterly/DiscoverClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Chapterly — Discover" };

export default async function DiscoverPage(): Promise<React.ReactElement> {
  const categories = Array.from(new Set(CURATED_BOOKS.map((b) => b.category))).sort();
  const userBooks = await getUserBooks();

  return (
    <div className="px-10 pt-12 pb-12 max-[1024px]:pt-20 max-[720px]:px-6 max-[720px]:pb-8 max-w-[1200px]">
      <div className="mb-10">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-2">
          10 curated summaries · Headway-style
        </div>
        <h1 className="font-display text-[32px] max-[720px]:text-[24px] font-normal tracking-[-0.02em] fvs-text text-(--ink) m-0 leading-[1.1]">
          Discover Books
        </h1>
      </div>
      <DiscoverClient
        books={CURATED_BOOKS}
        categories={categories}
        userBookTitles={userBooks.map((b) => b.title)}
      />
    </div>
  );
}
