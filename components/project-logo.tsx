import Image from "next/image";

interface ProjectLogoProps {
  name: string;
  logo?: string;
  logoBg?: string;
  /** Tile height in px. Wide wordmarks keep their aspect ratio inside the tile. */
  size?: number;
  className?: string;
}

function initials(name: string): string {
  const words = name
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(" ")
    .filter(Boolean);
  const letters =
    words.length > 1 ? words.slice(0, 2).map((w) => w[0]) : [name[0] ?? "?"];
  return letters.join("").toUpperCase();
}

export function ProjectLogo({
  name,
  logo,
  logoBg = "var(--bg-2)",
  size = 44,
  className = "",
}: ProjectLogoProps): React.ReactElement {
  const wordmark = logo?.includes("coinsafe") || logo?.includes("rhng");
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 overflow-hidden rounded-xl border border-(--rule) ${className}`}
      style={{ height: size, width: wordmark ? size * 2.2 : size }}
      aria-hidden="true"
    >
      {logo ? (
        <Image
          src={logo}
          alt=""
          width={Math.round(size * (wordmark ? 2.2 : 1))}
          height={size}
          className="h-full w-full object-contain"
          style={{ padding: size * (wordmark ? 0.2 : 0.18) }}
          unoptimized={logo.endsWith(".svg")}
        />
      ) : (
        <span
          className="font-display text-(--ink)"
          style={{ fontSize: size * 0.4 }}
        >
          {initials(name)}
        </span>
      )}
    </span>
  );
}
