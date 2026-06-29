import { getBBContent, getBBBooks } from "@/lib/bookbreaks/queries";
import { CONTENT_TYPE_LABELS, CONTENT_TYPE_ICONS, BOOK_THEMES } from "@/lib/bookbreaks/constants";
import { BBContentActions } from "@/components/bookbreaks/ContentActions";

export default async function ContentHubPage(): Promise<React.ReactElement> {
  const [content, books] = await Promise.all([getBBContent(), getBBBooks()]);

  return (
    <div className="p-[48px] max-[720px]:p-[24px] max-[1024px]:pt-[80px]">
      <div className="flex items-end justify-between mb-[40px] max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-[16px]">
        <div>
          <div
            className="font-mono text-[10px] tracking-[0.16em] uppercase mb-[8px]"
            style={{ color: "#8B6F47" }}
          >
            Content Hub
          </div>
          <h1
            className="font-display font-normal text-[36px] leading-[1.05] tracking-[-0.025em] fvs-text m-0"
            style={{ color: "#2C2C2C" }}
          >
            All Content
          </h1>
          <p
            className="text-[14px] mt-[6px] m-0"
            style={{ color: "#8B6F47" }}
          >
            {content.length} piece{content.length !== 1 ? "s" : ""} generated
          </p>
        </div>
        <a
          href="/tools/bookbreaks/generate"
          className="inline-flex items-center gap-[8px] h-[44px] px-[20px] rounded-[8px] font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-white no-underline transition-all hover:opacity-90"
          style={{ background: "#C85A2C" }}
        >
          ✦ Generate More
        </a>
      </div>

      {content.length > 0 ? (
        <div className="space-y-[8px]">
          {content.map((c) => {
            const bookTheme =
              books.find((b) => b.id === c.book_id)?.theme ?? "custom";
            const theme = BOOK_THEMES[bookTheme] ?? BOOK_THEMES.custom;

            return (
              <div
                key={c.id}
                className="rounded-[10px] group/content"
                style={{ border: "1px solid #D4B896", background: "#FAF5EC" }}
              >
                {/* Collapsed summary */}
                <details>
                  <summary
                    className="flex items-center gap-[16px] p-[16px] cursor-pointer list-none"
                    style={{ userSelect: "none" }}
                  >
                    {/* Type icon */}
                    <div
                      className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center text-[16px] flex-shrink-0"
                      style={{
                        background: `${theme.bg}22`,
                        border: `1px solid ${theme.bg}44`,
                      }}
                      aria-hidden="true"
                    >
                      {CONTENT_TYPE_ICONS[c.content_type]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className="text-[14px] font-medium leading-[1.3] truncate"
                        style={{ color: "#2C2C2C", fontFamily: "inherit" }}
                      >
                        {c.title}
                      </div>
                      <div
                        className="font-mono text-[10px] mt-[2px] flex items-center gap-[8px] flex-wrap"
                        style={{ color: "#8B6F47" }}
                      >
                        <span
                          className="px-[6px] py-[2px] rounded-full text-[9px] uppercase tracking-[0.1em]"
                          style={{
                            background: `${theme.bg}1A`,
                            color: theme.bg,
                          }}
                        >
                          {CONTENT_TYPE_LABELS[c.content_type]}
                        </span>
                        <span className="truncate">{c.book_title}</span>
                        <span>{c.book_author}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-[12px] flex-shrink-0">
                      <span
                        className="font-mono text-[9px] uppercase tracking-[0.1em] px-[8px] py-[3px] rounded-full"
                        style={{
                          background:
                            c.status === "published"
                              ? "rgba(45,80,22,0.12)"
                              : "rgba(44,44,44,0.08)",
                          color:
                            c.status === "published" ? "#2D5016" : "#8B6F47",
                        }}
                      >
                        {c.status}
                      </span>
                      <span
                        className="font-mono text-[12px] transition-transform duration-200"
                        style={{ color: "#8B6F47" }}
                        aria-hidden="true"
                      >
                        ▾
                      </span>
                    </div>
                  </summary>

                  {/* Expanded content */}
                  <div
                    className="px-[16px] pb-[16px]"
                    style={{ borderTop: "1px solid #E8D9C4" }}
                  >
                    <pre
                      className="whitespace-pre-wrap text-[13px] leading-[1.7] font-[inherit] mt-[16px] mb-[16px] m-0 max-h-[400px] overflow-y-auto"
                      style={{ color: "#2C2C2C", fontFamily: "inherit" }}
                    >
                      {c.content}
                    </pre>
                    <BBContentActions contentId={c.id} content={c.content} status={c.status} />
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="rounded-[12px] p-[64px] text-center"
          style={{ border: "1.5px dashed #D4B896", background: "#FAF5EC" }}
        >
          <div className="text-[48px] mb-[16px]">◈</div>
          <h2
            className="font-display text-[24px] fvs-text font-normal m-0 mb-[10px]"
            style={{ color: "#2C2C2C" }}
          >
            No content yet.
          </h2>
          <p
            className="text-[14px] leading-[1.65] mb-[24px] max-w-[40ch] mx-auto"
            style={{ color: "#8B6F47", fontFamily: "inherit" }}
          >
            Generate your first piece of content and it'll appear here for easy access and management.
          </p>
          <a
            href="/tools/bookbreaks/generate"
            className="inline-flex items-center gap-[8px] font-mono text-[10px] uppercase tracking-[0.12em] font-semibold no-underline"
            style={{ color: "#C85A2C" }}
          >
            ✦ Generate content →
          </a>
        </div>
      )}
    </div>
  );
}
