import Link from "next/link";

export default function NotFound(): React.ReactElement {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="outline-none"
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "80px var(--gutter)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--display-font)",
          fontVariationSettings: '"opsz" 144',
          fontSize: "clamp(120px, 25vw, 240px)",
          fontWeight: 400,
          lineHeight: 0.9,
          letterSpacing: "-0.04em",
          color: "var(--rule)",
          userSelect: "none",
          marginBottom: 32,
        }}
      >
        404
      </div>

      <h1
        style={{
          fontFamily: "var(--display-font)",
          fontVariationSettings: '"opsz" 96',
          fontSize: "clamp(28px, 4vw, 48px)",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          color: "var(--ink)",
          margin: "0 0 16px",
        }}
      >
        Off the grid.
      </h1>

      <p
        style={{
          fontSize: 17,
          color: "var(--ink-2)",
          maxWidth: "42ch",
          lineHeight: 1.6,
          margin: "0 0 48px",
        }}
      >
        The page you&apos;re looking for has been disconnected or never existed.
        You&apos;ve wandered from first principles into an undocumented sector.
      </p>

      <Link href="/" className="v3-btn v3-btn-primary">
        ← Return to Basecamp
      </Link>
    </main>
  );
}
