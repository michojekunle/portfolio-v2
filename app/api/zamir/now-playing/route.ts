import { NextResponse } from "next/server";
import { getZamirNowPlaying } from "@/lib/zamir";

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle") || undefined;
  const data = await getZamirNowPlaying(handle);
  return NextResponse.json(data);
}
