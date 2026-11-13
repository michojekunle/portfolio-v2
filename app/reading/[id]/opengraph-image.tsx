import { getPublicBookById } from "@/lib/supabase/reading";
import { renderOgCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Reading Notes — Michael Ojekunle";
export const size = OG_SIZE;
export const contentType = "image/png";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Image({ params }: Props) {
  const { id } = await params;
  const book = await getPublicBookById(id);

  const title = book?.title ?? "Reading Notes";
  const eyebrow = book?.author ? `Reading Notes · ${book.author}` : "Reading Notes";
  const subtitle = book?.title
    ? `Key insights, notes, and highlights from ${book.title}.`
    : "Notes and takeaways from books on engineering, craft, and thinking.";

  return renderOgCard({
    eyebrow,
    title,
    subtitle,
    cta: "Read notes →",
    path: `/reading/${id}`,
  });
}
