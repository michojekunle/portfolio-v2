import { getBBBooks } from "@/lib/bookbreaks/queries";
import { BOOK_THEMES } from "@/lib/bookbreaks/constants";
import Link from "next/link";
import { BBAddBookButton } from "@/components/bookbreaks/AddBookButton";

export default async function BooksPage(): Promise<React.ReactElement> {
  const books = await getBBBooks();

  return (
    <div className="p-[48px] max-[720px]:p-[24px] max-[1024px]:pt-[80px]">
      {/* Header */}
      <div className="flex items-end justify-between mb-[40px] max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-[20px]">
        <div>
          <div
            className="font-mono text-[10px] tracking-[0.16em] uppercase mb-[8px]"
            style={{ color: "#8B6F47" }}
          >
            Library
          </div>
          <h1
            className="font-display font-normal text-[36px] leading-[1.05] tracking-[-0.025em] fvs-text m-0"
            style={{ color: "#2C2C2C" }}
          >
            My Books
          </h1>
          <p
            className="text-[14px] mt-[6px] m-0"
            style={{ color: "#8B6F47" }}
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
                style={{ border: "1px solid #D4B896", background: "#FAF5EC" }}
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
                          className="font-mono text-[9px] tracking-[0.1em] uppercase px-[8px] py-[3px] rounded-full"
                          style={{
                            background: "rgba(200,90,44,0.1)",
                            color: "#C85A2C",
                          }}
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
                      style={{ color: "#8B6F47" }}
                    >
                      {book.insights[0]}
                    </div>
                  )}

                  {/* Stats + CTA */}
                  <div className="flex items-center justify-between">
                    <div
                      className="font-mono text-[10px] tracking-[0.08em]"
                      style={{ color: "#8B6F47" }}
                    >
                      <span
                        className="font-semibold"
                        style={{ color: "#C85A2C" }}
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
          className="rounded-[12px] p-[64px] text-center"
          style={{ border: "1.5px dashed #D4B896", background: "#FAF5EC" }}
        >
          <div className="text-[48px] mb-[16px]">📚</div>
          <h2
            className="font-display text-[24px] fvs-text font-normal m-0 mb-[10px]"
            style={{ color: "#2C2C2C" }}
          >
            Your library is empty.
          </h2>
          <p
            className="text-[14px] leading-[1.65] mb-[24px] max-w-[40ch] mx-auto m-0"
            style={{ color: "#8B6F47" }}
          >
            Add the books you've read and generate multi-platform content from each one.
          </p>
          <BBAddBookButton />
        </div>
      )}
    </div>
  );
}
