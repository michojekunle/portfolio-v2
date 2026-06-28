import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
      <div className="v3-serif text-[clamp(120px,25vw,240px)] font-normal leading-[0.9] tracking-[-0.04em] text-[var(--rule)] select-none mb-8">
        404
      </div>

      <h1 className="font-display fvs-text text-[clamp(28px,4vw,48px)] font-normal tracking-[-0.02em] text-[var(--ink)] m-0 mb-4">
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
        <ArrowLeft className="inline w-4 h-4 mr-2" /> Return to Basecamp
      </Link>
    </main>
  );
}
