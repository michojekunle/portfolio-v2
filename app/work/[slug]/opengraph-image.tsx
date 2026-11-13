import { getCaseStudy } from "@/lib/case-studies";
import { renderOgCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Case Study — Michael Ojekunle";
export const size = OG_SIZE;
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);

  const title = cs?.name ?? "Case Study";
  const eyebrow = cs ? `${cs.cat} · ${cs.year}` : "Case Study";
  const subtitle = cs?.tag || cs?.desc || "A deep dive into architecture, decisions, and outcomes.";

  return renderOgCard({
    eyebrow,
    title,
    subtitle,
    cta: "Read case study →",
    path: `/work/${slug}`,
  });
}
