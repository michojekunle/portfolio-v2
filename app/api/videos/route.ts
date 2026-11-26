import { NextRequest, NextResponse } from "next/server";
import { getHighlightVideosPage } from "@/lib/videos/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "all";
  const offsetRaw = Number(searchParams.get("offset") ?? "0");
  const limitRaw = Number(searchParams.get("limit") ?? "6");

  const offset = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? Math.floor(offsetRaw) : 0;
  const limit =
    Number.isFinite(limitRaw) && limitRaw >= 1 ? Math.min(24, Math.floor(limitRaw)) : 6;

  const page = await getHighlightVideosPage({ category, offset, limit });
  return NextResponse.json(page);
}
