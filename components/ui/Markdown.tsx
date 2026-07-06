/**
 * Lightweight, dependency-free markdown renderer for AI-generated content.
 * Handles the subset AI models actually emit: headings, bold/italic, inline
 * code, code fences, bullet & numbered lists, blockquotes, paragraphs.
 * Colors inherit from the parent (currentColor) so it works inside chat
 * bubbles, cards, and themed readers alike.
 */

// ── Inline: **bold**, *italic*, `code` ───────────────────────────────────────

export function MarkdownInline({ text }: { text: string }): React.ReactElement {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code
              key={i}
              className="font-mono text-[0.85em] px-[4px] py-[1px] rounded-[4px]"
              style={{ background: "color-mix(in srgb, currentColor 10%, transparent)" }}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      })}
    </>
  );
}

/** Strips markdown syntax for plain-text previews and truncated snippets. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,4}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .trim();
}

// ── Block-level renderer ─────────────────────────────────────────────────────

interface MarkdownProps {
  text: string;
  /** Accent for headings; defaults to inheriting the surrounding text color */
  accent?: string;
}

export function Markdown({ text, accent }: MarkdownProps): React.ReactElement {
  const lines = text.split("\n");
  const blocks: React.ReactElement[] = [];
  let key = 0;
  let i = 0;

  const headingColor = accent ?? "currentColor";

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (!line.trim()) { i++; continue; }

    // Code fence
    if (line.trimStart().startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] ?? "").trimStart().startsWith("```")) {
        codeLines.push(lines[i] ?? "");
        i++;
      }
      i++; // closing fence
      blocks.push(
        <pre
          key={key++}
          className="font-mono text-[0.85em] leading-[1.6] p-[12px] rounded-[8px] overflow-x-auto my-[8px]"
          style={{ background: "color-mix(in srgb, currentColor 8%, transparent)" }}
        >
          {codeLines.join("\n")}
        </pre>
      );
      continue;
    }

    // Headings (# through ####)
    const heading = line.match(/^(#{1,4})\s+(.+)/);
    if (heading) {
      const level = heading[1].length;
      blocks.push(
        <div
          key={key++}
          className={
            level <= 2
              ? "font-semibold text-[1.05em] mt-[14px] mb-[6px] leading-[1.35]"
              : "font-semibold text-[0.95em] mt-[12px] mb-[4px] leading-[1.35]"
          }
          style={{ color: headingColor }}
        >
          <MarkdownInline text={heading[2]} />
        </div>
      );
      i++;
      continue;
    }

    // Blockquote (consecutive > lines)
    if (line.trimStart().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i] ?? "").trimStart().startsWith(">")) {
        quoteLines.push((lines[i] ?? "").replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote
          key={key++}
          className="italic my-[8px] pl-[12px] opacity-80 m-0"
          style={{ borderLeft: "1px solid color-mix(in srgb, currentColor 35%, transparent)" }}
        >
          <MarkdownInline text={quoteLines.join(" ")} />
        </blockquote>
      );
      continue;
    }

    // Bullet list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-[6px] pl-[18px] space-y-[4px] list-disc">
          {items.map((item, j) => (
            <li key={j}><MarkdownInline text={item} /></li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\s*\d+[.)]\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="my-[6px] pl-[18px] space-y-[4px] list-decimal">
          {items.map((item, j) => (
            <li key={j}><MarkdownInline text={item} /></li>
          ))}
        </ol>
      );
      continue;
    }

    // Horizontal rule
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push(
        <div
          key={key++}
          className="h-[1px] my-[12px]"
          style={{ background: "color-mix(in srgb, currentColor 20%, transparent)" }}
        />
      );
      i++;
      continue;
    }

    // Paragraph: consume consecutive plain lines
    const paraLines: string[] = [line];
    i++;
    while (i < lines.length) {
      const next = lines[i] ?? "";
      if (
        !next.trim() ||
        /^#{1,4}\s+/.test(next) ||
        next.trimStart().startsWith(">") ||
        next.trimStart().startsWith("```") ||
        /^\s*[-*]\s+/.test(next) ||
        /^\s*\d+[.)]\s+/.test(next)
      ) break;
      paraLines.push(next);
      i++;
    }
    blocks.push(
      <p key={key++} className="my-[6px] m-0 first:mt-0">
        <MarkdownInline text={paraLines.join(" ")} />
      </p>
    );
  }

  return <div className="space-y-[6px]">{blocks}</div>;
}
