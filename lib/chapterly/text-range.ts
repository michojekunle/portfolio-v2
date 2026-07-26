// Finds the first occurrence of `snippet` across the container's text nodes
// and returns a Range spanning it (which may cross node boundaries).
// Whitespace runs are normalized on both sides so snippets saved from a
// selection still match after markdown/text-layer re-rendering collapses whitespace.
export function findTextRange(container: HTMLElement, snippet: string): Range | null {
  const needle = snippet.replace(/\s+/g, " ").trim();
  if (!needle) return null;

  // Also visit element nodes so we can detect <br> line breaks (used by
  // pdf.js's text layer between lines) — otherwise two lines' text nodes get
  // concatenated with no separator, while `sel.toString()` (used to capture
  // the original snippet) inserts a line break there, and the two can never match.
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT
  );
  const nodes: Text[] = [];
  let fullText = "";
  const nodeStarts: number[] = [];
  let pendingBreak = false;
  while (walker.nextNode()) {
    const current = walker.currentNode;
    if (current.nodeType === Node.ELEMENT_NODE) {
      if ((current as Element).tagName === "BR") pendingBreak = true;
      continue;
    }
    const node = current as Text;
    if (pendingBreak) {
      fullText += " ";
      pendingBreak = false;
    }
    nodeStarts.push(fullText.length);
    nodes.push(node);
    fullText += node.data;
  }

  // Build a normalized copy plus an index map back to raw offsets
  const rawToNorm: number[] = [];
  let norm = "";
  let lastWasSpace = true;
  for (let i = 0; i < fullText.length; i++) {
    const ch = fullText[i];
    if (/\s/.test(ch)) {
      if (!lastWasSpace) {
        rawToNorm.push(i);
        norm += " ";
        lastWasSpace = true;
      }
    } else {
      rawToNorm.push(i);
      norm += ch;
      lastWasSpace = false;
    }
  }

  const idx = norm.indexOf(needle);
  if (idx === -1) return null;
  const rawStart = rawToNorm[idx];
  const rawEnd = rawToNorm[idx + needle.length - 1] + 1;
  if (rawStart === undefined || rawEnd === undefined || isNaN(rawEnd)) return null;

  const locate = (rawOffset: number, isEnd: boolean): { node: Text; offset: number } | null => {
    for (let n = nodes.length - 1; n >= 0; n--) {
      const start = nodeStarts[n];
      const len = nodes[n].data.length;
      if (rawOffset >= start && rawOffset <= start + len) {
        // For the end boundary prefer staying inside this node
        if (!isEnd && rawOffset === start + len && n + 1 < nodes.length) {
          return { node: nodes[n + 1], offset: 0 };
        }
        return { node: nodes[n], offset: rawOffset - start };
      }
    }
    return null;
  };

  const startPos = locate(rawStart, false);
  const endPos = locate(rawEnd, true);
  if (!startPos || !endPos) return null;

  const range = document.createRange();
  try {
    range.setStart(startPos.node, startPos.offset);
    range.setEnd(endPos.node, endPos.offset);
  } catch {
    return null;
  }
  return range;
}

// Like findTextRange, but returns the <span>/<br> elements the snippet
// overlaps instead of a Range. pdf.js's text layer gives every text item its
// own <span> with a `transform` scaling it to match its glyph run, and
// Range.getClientRects() does not reliably account for that — it can return
// boxes wildly offset from, or bounding far more than, the actual text. Each
// span's own getBoundingClientRect() is a much more reliable primitive for
// transformed elements, at the cost of granularity: a whole span (usually a
// full text run, not a single word) is the smallest highlightable unit.
export function findMatchingSpans(container: HTMLElement, snippet: string): HTMLElement[] | null {
  const needle = snippet.replace(/\s+/g, " ").trim();
  if (!needle) return null;

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) =>
      (node as Element).tagName === "SPAN" || (node as Element).tagName === "BR"
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP,
  });

  const spans: HTMLElement[] = [];
  const spanStarts: number[] = [];
  let fullText = "";
  let pendingBreak = false;
  while (walker.nextNode()) {
    const el = walker.currentNode as HTMLElement;
    if (el.tagName === "BR") {
      pendingBreak = true;
      continue;
    }
    if (pendingBreak) {
      fullText += " ";
      pendingBreak = false;
    }
    spanStarts.push(fullText.length);
    spans.push(el);
    fullText += el.textContent ?? "";
  }

  const rawToNorm: number[] = [];
  let norm = "";
  let lastWasSpace = true;
  for (let i = 0; i < fullText.length; i++) {
    const ch = fullText[i];
    if (/\s/.test(ch)) {
      if (!lastWasSpace) {
        rawToNorm.push(i);
        norm += " ";
        lastWasSpace = true;
      }
    } else {
      rawToNorm.push(i);
      norm += ch;
      lastWasSpace = false;
    }
  }

  const idx = norm.indexOf(needle);
  if (idx === -1) return null;
  const rawStart = rawToNorm[idx];
  const rawEnd = rawToNorm[idx + needle.length - 1] + 1;
  if (rawStart === undefined || rawEnd === undefined || isNaN(rawEnd)) return null;

  const matched: HTMLElement[] = [];
  for (let n = 0; n < spans.length; n++) {
    const start = spanStarts[n];
    const end = start + (spans[n].textContent?.length ?? 0);
    if (start < rawEnd && end > rawStart) matched.push(spans[n]);
  }
  return matched.length > 0 ? matched : null;
}
