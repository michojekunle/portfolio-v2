import { Suspense } from "react";
import { getUserBooks, getUserBookCount } from "@/lib/chapterly/queries";
import { FREE_BOOK_LIMIT } from "@/lib/chapterly/types";
import { ChLibraryClient } from "@/components/chapterly/LibraryClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chapterly — Library",
};

export default async function LibraryPage(): Promise<React.ReactElement> {
  const [books, bookCount] = await Promise.all([getUserBooks(), getUserBookCount()]);
  const atFreeLimit = bookCount >= FREE_BOOK_LIMIT;

  return (
    <div className="px-[40px] pt-[48px] pb-[48px] max-[1024px]:pt-[80px] max-[720px]:px-[24px] max-[720px]:pb-[32px]">
      <Suspense>
        <ChLibraryClient books={books} atFreeLimit={atFreeLimit} freeLimit={FREE_BOOK_LIMIT} />
      </Suspense>
    </div>
  );
}
