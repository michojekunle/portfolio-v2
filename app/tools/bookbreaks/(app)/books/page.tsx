import { getBBBooks } from "@/lib/bookbreaks/queries";
import { BOOK_THEMES } from "@/lib/bookbreaks/constants";
import Link from "next/link";
import { BBAddBookButton } from "@/components/bookbreaks/AddBookButton";
import { BookOpen } from "lucide-react";

export default async function BooksPage(): Promise<React.ReactElement> {
  const books = await getBBBooks();

  return (
    <div className="p-[48px] max-[720px]:p-[24px] max-[1024px]:pt-[80px]">
      {/* Header */}
      <div className="flex items-end justify-between mb-[40px] max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-[20px]">
        <div>
          <div
            className="font-mono text-[10px] tracking-[0.16em] uppercase mb-[8px]"
            
          >
            Library
          </div>
          <h1
            className="font-display font-normal text-[36px] leading-[1.05] tracking-[-0.025em] fvs-text m-0"
            
          >
            My Books
          </h1>
          <p
            className="text-[14px] mt-[6px] m-0"
            
          >
            {books.length} book{books.length !== 1 ? "s" : ""} in your library
          </p>
        </div>
        <BBAddBookButton />
      </div>

      {/* Grid */}
      {books.length > 0 ? (
        <div className="grid grid-cols-3 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1 gap-[16px]">
          {books.map((book) => {
            const theme = BOOK_THEMES[book.theme] ?? BOOK_THEMES.custom;
            return (
              <div
                key={book.id}
                className="rounded-[12px] overflow-hidden group/book"
                
              >
                {/* Book spine */}
                <div
                  className="h-[100px] flex items-end p-[16px] relative"
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
                      className="font-mono text-[10px] mt-[2px] opacity-70"
                      style={{ color: theme.text }}
                    >
                      {book.author}
                    </div>
                  </div>
                  {book.rating && (
                    <div
                      className="absolute top-[12px] right-[12px] font-mono text-[9px] font-bold px-[6px] py-[3px] rounded-full"
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
                <div className="p-[16px]">
                  {/* Genres */}
                  {book.genres.length > 0 && (
                    <div className="flex flex-wrap gap-[6px] mb-[12px]">
                      {book.genres.slice(0, 3).map((g) => (
                        <span
                          key={g}
                          className="font-mono text-[9px] tracking-[0.1em] uppercase px-[8px] py-[3px] rounded-full bg-[color-mix(in_oklab,var(--v3-accent)_10%,transparent)] text-[var(--v3-accent)]"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Insights preview */}
                  {book.insights.length > 0 && (
                    <div
                      className="font-mono text-[11px] leading-[1.5] mb-[16px] line-clamp-2"
                      
                    >
                      {book.insights[0]}
                    </div>
                  )}

                  {/* Stats + CTA */}
                  <div className="flex items-center justify-between">
                    <div
                      className="font-mono text-[10px] tracking-[0.08em]"
                      
                    >
                      <span
                        className="font-semibold"
                        
                      >
                        {book.content_count}
                      </span>{" "}
                      piece{book.content_count !== 1 ? "s" : ""}
                    </div>
                    <Link
                      href={`/tools/bookbreaks/generate?book=${book.id}`}
                      className="font-mono text-[10px] uppercase tracking-[0.1em] font-semibold no-underline transition-colors"
                      style={{ color: "#2D5016" }}
                    >
                      Generate →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="rounded-[12px] p-[64px] text-center border-[1.5px] border-dashed border-[var(--rule)] bg-[var(--bg-2)]"
        >
          <div className="mb-[16px] text-[var(--v3-accent)]"><BookOpen size={48} className="mx-auto" /></div>
          <h2
            className="font-display text-[24px] fvs-text font-normal m-0 mb-[10px] text-[var(--ink)]"
          >
            Your library is empty.
          </h2>
          <p
            className="text-[14px] leading-[1.65] mb-[24px] max-w-[40ch] mx-auto m-0 text-[var(--ink-3)]"
          >
            Add the books you've read and generate multi-platform content from each one.
          </p>
          <BBAddBookButton />
        </div>
      )}
    </div>
  );
}
