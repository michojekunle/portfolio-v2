import type { Metadata } from "next";
import { VideosClient } from "@/components/videos-client";
import {
  getIntroVideo,
  getFeaturedVideos,
  getHighlightVideosPage,
  getHighlightVideoCategories,
} from "@/lib/videos/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Videos",
  description:
    "Michael Ojekunle on YouTube, Instagram, TikTok, and X — build logs, demos, and behind-the-scenes from live projects.",
};

const HIGHLIGHTS_PAGE_SIZE = 6;

export default async function VideosPage(): Promise<React.ReactElement> {
  const [introVideo, featuredVideos, highlightsPage, categories] =
    await Promise.all([
      getIntroVideo(),
      getFeaturedVideos(2),
      getHighlightVideosPage({ offset: 0, limit: HIGHLIGHTS_PAGE_SIZE }),
      getHighlightVideoCategories(),
    ]);

  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <VideosClient
        introVideo={introVideo}
        featuredVideos={featuredVideos}
        highlightVideos={highlightsPage.videos}
        totalHighlights={highlightsPage.total}
        initialHasMore={highlightsPage.hasMore}
        categories={categories}
        pageSize={HIGHLIGHTS_PAGE_SIZE}
      />
    </main>
  );
}
