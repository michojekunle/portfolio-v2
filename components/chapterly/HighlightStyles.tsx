// Styles for the CSS Custom Highlight API (::highlight()) used to paint
// saved highlights onto text-format book content in ReaderClient.
//
// This can't live in globals.css: Turbopack's CSS parser (Lightning CSS)
// doesn't recognize the ::highlight() pseudo-element yet and fails the
// entire stylesheet build on it. Injecting a plain <style> tag at runtime
// sidesteps the build-time CSS parser — the browser understands it fine.
export function HighlightStyles(): React.ReactElement {
  return (
    <style>{`
      ::highlight(ch-yellow) { background-color: rgba(254, 240, 138, 0.55); }
      ::highlight(ch-green)  { background-color: rgba(187, 247, 208, 0.55); }
      ::highlight(ch-blue)   { background-color: rgba(191, 219, 254, 0.55); }
      ::highlight(ch-pink)   { background-color: rgba(251, 207, 232, 0.55); }
    `}</style>
  );
}
