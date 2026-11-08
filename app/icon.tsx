import { ImageResponse } from "next/og";
import { MoMark } from "@/lib/brand-mark";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon(): ImageResponse {
  return new ImageResponse(<MoMark dim={32} />, { width: 32, height: 32 });
}
