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
  const eyebrow = cs ? `${cs.cat.toUpperCase()} · ${cs.year}` : "CASE STUDY";
  
  // Use rich description, falling back to lede
  const subtitle = cs?.desc ?? cs?.lede ?? "A deep dive into architecture, decisions, and engineering outcomes.";
  
  // Pick primary outcome metric if available
  const primaryOutcome = cs?.outcomes?.[0]
    ? { value: cs.outcomes[0].n, label: cs.outcomes[0].l }
    : undefined;

  return renderOgCard({
    eyebrow,
    title,
    subtitle,
    cta: "Read case study →",
    path: `/work/${slug}`,
    tags: cs?.stack,
    stat: primaryOutcome,
  });
}
