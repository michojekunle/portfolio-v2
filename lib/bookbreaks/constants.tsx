import { FileText, MessageSquare, Images, Video, Hash } from "lucide-react";
import React from "react";
import type { BookThemeConfig } from "./types";

export const BOOK_THEMES: Record<string, BookThemeConfig> = {
  diary: {
    label: "The Diary of a CEO",
    bg: "#1F2937",
    accent: "#FF6B35",
    text: "#FFFFFF",
  },
  sideways: {
    label: "Thinking Sideways",
    bg: "#6366F1",
    accent: "#EC4899",
    text: "#FFFFFF",
  },
  sellcrazy: {
    label: "Sell Like Crazy",
    bg: "#DC2626",
    accent: "#FCD34D",
    text: "#FFFFFF",
  },
  sellsold: {
    label: "Sell or Be Sold",
    bg: "#1E40AF",
    accent: "#FBBF24",
    text: "#FFFFFF",
  },
  custom: {
    label: "Custom",
    bg: "#2D5016",
    accent: "#C85A2C",
    text: "#FFFFFF",
  },
};

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  article: "Blog Article",
  thread: "X Thread",
  carousel: "Instagram Carousel",
  tiktok: "TikTok Script",
  caption: "Caption",
};

export const CONTENT_TYPE_ICONS: Record<string, React.ReactElement> = {
  article: <FileText size={16} />,

  thread: <MessageSquare size={16} />,

  carousel: <Images size={16} />,

  tiktok: <Video size={16} />,

  caption: <Hash size={16} />,

};

export const TONE_OPTIONS = [
  { value: "educational", label: "Educational" },
  { value: "inspirational", label: "Inspirational" },
  { value: "conversational", label: "Conversational" },
  { value: "professional", label: "Professional" },
  { value: "storytelling", label: "Storytelling" },
];

export const BB_COLORS = {
  parchment: "#F5E6D3",
  parchmentDark: "#EDD9BA",
  forest: "#2D5016",
  terracotta: "#C85A2C",
  tan: "#8B6F47",
  charcoal: "#2C2C2C",
  offWhite: "#F9F7F4",
} as const;

export const DEFAULT_WEBSITE_URL = "www.michaelojekunle.dev";
export const DEFAULT_WORD_COUNT = 1500;
export const DEFAULT_TONE = "educational";
