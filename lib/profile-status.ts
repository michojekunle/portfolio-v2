import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export interface ProfileStatusData {
  status: string;
  focus1_name: string;
  focus1_pct: number;
  focus2_name: string;
  focus2_pct: number;
  /** Where I'm heading next — shown as the "horizon" line under Active Focuses. */
  next_focus: string;
  spotify_override_title: string;
  spotify_override_artist: string;
  spotify_override_playlist: string;
  spotify_override_active: boolean;
  currently_reading: string;
}

const DEFAULT_STATUS: ProfileStatusData = {
  status: "Available",
  focus1_name: "Flutter (mobile)",
  focus1_pct: 35,
  focus2_name: "Rust systems",
  focus2_pct: 55,
  next_focus: "zkML",
  spotify_override_title: "Metanoia (feat. Lofi Chill)",
  spotify_override_artist: "Michael's Focus Mix",
  spotify_override_playlist: "Spotify Track",
  spotify_override_active: true,
  currently_reading: "Zero to One by Peter Thiel",
};

export async function getProfileStatus(): Promise<ProfileStatusData> {
  let currentlyReading = DEFAULT_STATUS.currently_reading;
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: book } = await supabase
      .from("books")
      .select("title, author")
      .eq("status", "reading")
      .order("sort_order")
      .limit(1)
      .maybeSingle();
    if (book) {
      currentlyReading = `${book.title} by ${book.author}`;
    }
  } catch (e) {
    console.error("[getProfileStatus] failed to fetch currently reading book:", e);
  }

  if (!redis) {
    return { ...DEFAULT_STATUS, currently_reading: currentlyReading };
  }
  try {
    const data = await redis.get<Partial<ProfileStatusData>>("profile_status_data");
    return { ...DEFAULT_STATUS, ...data, currently_reading: currentlyReading };
  } catch (e) {
    console.error("[redis] getProfileStatus error:", e);
    return { ...DEFAULT_STATUS, currently_reading: currentlyReading };
  }
}

export async function setProfileStatus(data: Partial<ProfileStatusData>): Promise<void> {
  if (!redis) return;
  try {
    const current = await getProfileStatus();
    await redis.set("profile_status_data", JSON.stringify({ ...current, ...data }));
  } catch (e) {
    console.error("[redis] setProfileStatus error:", e);
  }
}

export { getSpotifyLiveTrack } from "@/lib/spotify";
