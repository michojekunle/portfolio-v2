import { ImageResponse } from "next/og";
import { MoMark } from "@/lib/brand-mark";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon(): ImageResponse {
  return new ImageResponse(<MoMark dim={180} />, { width: 180, height: 180 });
}
