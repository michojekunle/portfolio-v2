import type { Metadata } from "next";
import { VideosClient } from "@/components/videos-client";
import { getIntroVideo, getFeaturedVideos, getHighlightVideos } from "@/lib/videos/queries";

export const metadata: Metadata = {
  title: "Videos",
  description:
    "Michael Ojekunle on YouTube, Instagram, TikTok, and X — build logs, demos, and behind-the-scenes from live projects.",
};

export default async function VideosPage(): Promise<React.ReactElement> {
  const [introVideo, featuredVideos, highlightVideos] = await Promise.all([
    getIntroVideo(),
    getFeaturedVideos(2),
    getHighlightVideos(),
  ]);

  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <VideosClient
        introVideo={introVideo}
        featuredVideos={featuredVideos}
        highlightVideos={highlightVideos}
      />
    </main>
  );
}
