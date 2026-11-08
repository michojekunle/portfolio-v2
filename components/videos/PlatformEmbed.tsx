import type { SiteVideo } from "@/lib/videos/types";
import { YoutubeEmbed } from "./YoutubeEmbed";
import { InstagramEmbed } from "./InstagramEmbed";
import { TiktokEmbed } from "./TiktokEmbed";

interface Props {
  video: SiteVideo;
  className?: string;
}

export function PlatformEmbed({ video, className }: Props): React.ReactElement {
  switch (video.platform) {
    case "youtube":
      return <YoutubeEmbed url={video.url} title={video.title} className={className} />;
    case "instagram":
      return <InstagramEmbed url={video.url} className={className} />;
    case "tiktok":
      return <TiktokEmbed url={video.url} className={className} />;
  }
}
