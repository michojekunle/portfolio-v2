import { Suspense } from "react";
import { getUserBooks } from "@/lib/chapterly/queries";
import { ChLibraryClient } from "@/components/chapterly/LibraryClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chapterly — Library",
};

export default async function LibraryPage(): Promise<React.ReactElement> {
  const books = await getUserBooks();

  return (
    <div className="px-10 pt-12 pb-12 max-[1024px]:pt-20 max-[720px]:px-6 max-[720px]:pb-8">
      <Suspense>
        <ChLibraryClient books={books} />
      </Suspense>
    </div>
  );
}
