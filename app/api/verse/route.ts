import { NextResponse } from "next/server";

interface BibleApiResponse {
  reference: string;
  verses: Array<{
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
  }>;
  text: string;
  translation_id: string;
}

interface VerseResponse {
  text: string;
  reference: string;
}

const FALLBACK_VERSE: VerseResponse = {
  text: "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.",
  reference: "Ephesians 2:10",
};

const VERSES = [
  "john+3:16",
  "psalms+23:1",
  "proverbs+3:5-6",
  "philippians+4:13",
  "romans+8:28",
  "isaiah+40:31",
  "jeremiah+29:11",
  "matthew+5:16",
  "colossians+3:23",
  "ephesians+2:10",
  "joshua+1:9",
  "2+timothy+1:7",
  "hebrews+11:1",
  "romans+12:2",
  "psalm+46:1",
  "genesis+1:1",
  "john+14:6",
  "philippians+4:6-7",
  "matthew+6:33",
  "proverbs+16:3",
] as const;

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export async function GET(): Promise<Response> {
  const reference = VERSES[getDayOfYear() % VERSES.length];
  const url = `https://bible-api.com/${reference}?translation=kjv`;

  try {
    const apiResponse = await fetch(url, {
      next: { revalidate: 86400 },
    });

    if (!apiResponse.ok) {
      throw new Error(`Bible API responded with ${apiResponse.status}`);
    }

    const data = (await apiResponse.json()) as BibleApiResponse;

    const verse: VerseResponse = {
      text: data.text.trim(),
      reference: data.reference,
    };

    return NextResponse.json(verse, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error: unknown) {
    console.error("[verse] Failed to fetch verse:", error);
    return NextResponse.json(FALLBACK_VERSE);
  }
}
