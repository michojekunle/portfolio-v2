import { getBBBooks } from "@/lib/bookbreaks/queries";
import { BOOK_THEMES } from "@/lib/bookbreaks/constants";
import Link from "next/link";
import { BBAddBookButton } from "@/components/bookbreaks/AddBookButton";
import { BookOpen, ArrowRight } from "lucide-react";

export default async function BooksPage(): Promise<React.ReactElement> {
  const books = await getBBBooks();

  return (
    <div className="px-12 py-12 max-[1024px]:pt-20 max-[720px]:px-6 max-[720px]:pb-6 max-[720px]:pt-20">
      {/* Header */}
      <div className="flex items-end justify-between mb-10 max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-5">
        <div>
          <div
            className="font-mono text-[10px] tracking-[0.16em] uppercase mb-2 text-muted-foreground"
          >
            Library
          </div>
          <h1
            className="font-display font-normal text-[36px] max-[720px]:text-[28px] leading-[1.05] tracking-tight fvs-text m-0 text-(--ink)"
          >
            My Books
          </h1>
          <p
            className="text-[14px] mt-1.5 m-0 text-muted-foreground"
          >
            {books.length} book{books.length !== 1 ? "s" : ""} in your library
          </p>
        </div>
        <BBAddBookButton />
      </div>

      {/* Grid */}
      {books.length > 0 ? (
        <div className="grid grid-cols-3 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1 gap-4">
          {books.map((book) => {
            const theme = BOOK_THEMES[book.theme] ?? BOOK_THEMES.custom;
            return (
              <div
                key={book.id}
                className="rounded-xl overflow-hidden group/book"
                
              >
                {/* Book spine */}
                <div
                  className="h-[100px] flex items-end p-4 relative"
                  style={{ background: theme.bg }}
                >
                  <div>
                    <div
                      className="font-display text-[18px] fvs-text leading-[1.2] line-clamp-2"
                      style={{ color: theme.text }}
                    >
                      {book.title}
                    </div>
                    <div
                      className="font-mono text-[10px] mt-0.5 opacity-70"
                      style={{ color: theme.text }}
                    >
                      {book.author}
                    </div>
                  </div>
                  {book.rating && (
                    <div
                      className="absolute top-3 right-3 font-mono text-[9px] font-bold px-1.5 py-0.75 rounded-full"
                      style={{
                        background: theme.accent,
                        color: theme.bg,
                      }}
                    >
                      {book.rating}/5
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4">
                  {/* Genres */}
                  {book.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {book.genres.slice(0, 3).map((g) => (
                        <span
                          key={g}
                          className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.75 rounded-full bg-[color-mix(in_oklab,var(--v3-accent)_10%,transparent)] text-(--v3-accent)"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Insights preview */}
                  {book.insights.length > 0 && (
                    <div
                      className="font-mono text-[11px] leading-normal mb-4 line-clamp-2 text-muted-foreground"
                    >
                      {book.insights[0]}
                    </div>
                  )}

                  {/* Stats + CTA */}
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground">
                      <span className="font-semibold text-(--ink)">
                        {book.content_count}
                      </span>{" "}
                      piece{book.content_count !== 1 ? "s" : ""}
                    </div>
                    <Link
                      href={`/tools/bookbreaks/generate?book=${book.id}`}
                      className="font-mono text-[10px] uppercase tracking-widest font-semibold no-underline transition-colors text-(--v3-accent) hover:opacity-80"
                    >
                      Generate <ArrowRight className="w-3 h-3 ml-1 inline-block" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="rounded-xl p-16 text-center border-[1.5px] border-dashed border-(--rule) bg-(--bg-2)"
        >
          <div className="mb-4 text-(--v3-accent)"><BookOpen size={48} className="mx-auto" /></div>
          <h2
            className="font-display text-[24px] fvs-text font-normal m-0 mb-2.5 text-(--ink)"
          >
            Your library is empty.
          </h2>
          <p
            className="text-[14px] leading-[1.65] mb-6 max-w-[40ch] mx-auto m-0 text-muted-foreground"
          >
            Add the books you've read and generate multi-platform content from each one.
          </p>
          <BBAddBookButton />
        </div>
      )}
    </div>
  );
}
