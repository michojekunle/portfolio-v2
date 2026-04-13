import sanitizeHtml from "sanitize-html";

interface MarkdownRendererProps {
  content: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

export function MarkdownRenderer({
  content,
}: MarkdownRendererProps): React.ReactElement {
  // Parse markdown securely to raw HTML
  const rawHtml = content || " ";
  
  // Inject IDs into headings for TOC linking
  const htmlWithIds = rawHtml.replace(
    /<h([2-4])(.*?)>(.*?)<\/h\1>/gi,
    (match, level, attrs, text) => {
      // Avoid overwriting existing IDs if any
      if (attrs.includes("id=")) return match;
      const id = slugify(text.replace(/<[^>]+>/g, ""));
      return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
    }
  );

  const cleanHtml = sanitizeHtml(htmlWithIds, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "h1", "h2", "h3", "h4", "img", "table", "thead", "tbody", "tr", "th", "td", "input"
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class", "id"],
      "img": ["src", "alt", "width", "height"],
      "input": ["type", "checked", "disabled"]
    },
    allowedClasses: {
      "*": ["*"] // Allow all classes for syntax highlighting and typography
    }
  });

  return (
    <div className="relative">
      <div
        className="public-article prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:tracking-tight"
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
      <style>{`
        .public-article h1 { font-size: 2.5rem !important; font-weight: 800 !important; margin-top: 2rem !important; margin-bottom: 1rem !important; line-height: 1.1 !important; color: hsl(var(--foreground)) !important; }
        .public-article h2 { font-size: 2rem !important; font-weight: 700 !important; margin-top: 2rem !important; margin-bottom: 1rem !important; line-height: 1.2 !important; color: hsl(var(--foreground)) !important; border-bottom: 1px solid hsl(var(--border)) !important; padding-bottom: 0.5rem !important; }
        .public-article h3 { font-size: 1.5rem !important; font-weight: 600 !important; margin-top: 1.5rem !important; margin-bottom: 0.75rem !important; line-height: 1.3 !important; color: hsl(var(--foreground)) !important; }
        .public-article p { margin: 1rem 0 !important; font-size: 1.1rem !important; line-height: 1.7 !important; }
        .public-article ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin: 1rem 0 !important; }
        .public-article ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin: 1rem 0 !important; }
        .public-article li { margin-bottom: 0.5rem !important; display: list-item !important; }
        .public-article blockquote { border-left: 4px solid hsl(var(--primary)) !important; padding: 0.75rem 1.5rem !important; font-style: italic !important; color: hsl(var(--muted-foreground)) !important; background: hsl(var(--muted)/0.3) !important; border-radius: 0 0.5rem 0.5rem 0 !important; margin: 2rem 0 !important; }
        .public-article img { max-width: 100% !important; border-radius: 1rem !important; margin: 2.5rem auto !important; border: 1px solid hsl(var(--border)) !important; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important; }
        .public-article a { color: hsl(var(--primary)) !important; text-decoration: underline !important; text-underline-offset: 4px !important; font-weight: 500 !important; }
        .public-article hr { border: 0 !important; border-top: 2px solid hsl(var(--border)) !important; margin: 3rem 0 !important; }
        
        /* Tables */
        .public-article table { border-collapse: collapse !important; table-layout: fixed !important; width: 100% !important; margin: 2rem 0 !important; overflow: hidden !important; border-radius: 0.5rem !important; border: 1px solid hsl(var(--border)) !important; }
        .public-article table td, .public-article table th { border: 1px solid hsl(var(--border)) !important; box-sizing: border-box !important; min-width: 1em !important; padding: 0.75rem 1rem !important; position: relative !important; vertical-align: top !important; }
        .public-article table th { background-color: hsl(var(--muted)/0.5) !important; font-weight: bold !important; text-align: left !important; }
        
        /* Task Lists */
        .public-article ul[data-type="taskList"] { list-style: none !important; padding: 0 !important; }
        .public-article ul[data-type="taskList"] li { display: flex !important; align-items: flex-start !important; gap: 0.75rem !important; margin-bottom: 0.5rem !important; }
        .public-article ul[data-type="taskList"] input[type="checkbox"] { width: 1.2rem !important; height: 1.2rem !important; margin-top: 0.25rem !important; cursor: pointer !important; accent-color: hsl(var(--primary)) !important; }
        
        /* Code Blocks */
        .public-article pre { background: #0d1117 !important; color: #c9d1d9 !important; border-radius: 0.75rem !important; padding: 1.5rem !important; font-family: 'JetBrains Mono', monospace !important; font-size: 0.95rem !important; margin: 2rem 0 !important; overflow-x: auto !important; border: 1px solid rgba(255,255,255,0.1) !important; }
        .public-article pre code { background: none !important; color: inherit !important; padding: 0 !important; }
        .hljs-comment, .hljs-quote { color: #8b949e !important; font-style: italic !important; }
        .hljs-keyword, .hljs-selector-tag { color: #ff7b72 !important; }
        .hljs-string, .hljs-doctag, .hljs-regexp, .hljs-attr, .hljs-template-punctuation, .hljs-template-variable { color: #a5d6ff !important; }
        .hljs-title, .hljs-section, .hljs-type, .hljs-name { color: #ffa657 !important; }
        .hljs-variable, .hljs-template-variable { color: #ffa657 !important; }
      `}</style>
    </div>
  );
}
