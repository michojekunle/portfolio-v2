"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  Flame,
  PenTool,
  BookOpen,
  Mic,
  Square,
  CheckCircle2,
  Bell,
  BellOff,
  Plus,
  Search,
  Trash2,
  BookMarked,
  ArrowRight,
  RotateCcw,
  Zap,
  Palette,
  Sparkles,
  X,
  Snowflake,
  Calendar as CalendarIcon,
  Check,
  Volume2,
  Copy,
  Lock,
  LogIn,
  LogOut,
  User as UserIcon,
  Clock,
  Languages,
  Globe,
  Video,
  Download,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Challenge {
  id: string;
  challenge_date: string;
  type: "speaking" | "writing" | "reading";
  prompt_text: string;
  example_text?: string;
  english_translation?: string;
}

interface Streak {
  current_streak: number;
  longest_streak: number;
  streak_freezes?: number;
  total_completions: number;
  last_completed_date: string | null;
}

interface VocabEntry {
  id: string;
  entry_type: "word" | "sentence";
  french_text: string;
  english_meaning: string;
  notes?: string;
  created_at: string;
}

type ThemeMode = "cowrywise" | "light" | "noir";

// ── Complete High-Contrast Theme System ───────────────────────────────────────
const THEMES: Record<
  ThemeMode,
  {
    name: string;
    bg: string;
    // Header
    headerText: string;
    headerSubtext: string;
    headerBtnBg: string;
    headerBtnBorder: string;
    headerBtnText: string;
    streakBtnBg: string;
    streakBtnText: string;
    // Nav Tabs
    navBg: string;
    navBorder: string;
    tabActiveBg: string;
    tabActiveText: string;
    tabInactiveText: string;
    // Cards
    cardBg: string;
    cardBorder: string;
    cardTitle: string;
    cardSubtext: string;
    subCardBg: string;
    subCardText: string;
    englishText: string;
    // Buttons
    primaryBtnBg: string;
    primaryBtnText: string;
    secondaryBtnBg: string;
    secondaryBtnBorder: string;
    secondaryBtnText: string;
    // Widgets & Badges
    badgeBg: string;
    badgeText: string;
    freezeBoxBg: string;
    freezeBoxBorder: string;
    freezeBoxTitle: string;
    freezeBoxSubtext: string;
    accentGlow: string;
    // Inputs & Controls
    inputBg: string;
    inputBorder: string;
    inputText: string;
    inputPlaceholder: string;
    iconColor: string;
  }
> = {
  cowrywise: {
    name: "Cowrywise Cobalt",
    bg: "#0066F5",
    // Header
    headerText: "#FFFFFF",
    headerSubtext: "rgba(255, 255, 255, 0.85)",
    headerBtnBg: "rgba(255, 255, 255, 0.18)",
    headerBtnBorder: "rgba(255, 255, 255, 0.35)",
    headerBtnText: "#FFFFFF",
    streakBtnBg: "#FFFFFF",
    streakBtnText: "#B45309",
    // Nav Tabs
    navBg: "rgba(255, 255, 255, 0.18)",
    navBorder: "rgba(255, 255, 255, 0.35)",
    tabActiveBg: "#FFFFFF",
    tabActiveText: "#0066F5",
    tabInactiveText: "rgba(255, 255, 255, 0.9)",
    // Cards
    cardBg: "#FFFFFF",
    cardBorder: "#E2E8F0",
    cardTitle: "#0F172A",
    cardSubtext: "#475569",
    subCardBg: "#F8FAFC",
    subCardText: "#0F172A",
    englishText: "#0066F5",
    // Buttons
    primaryBtnBg: "#0066F5",
    primaryBtnText: "#FFFFFF",
    secondaryBtnBg: "#F1F5F9",
    secondaryBtnBorder: "#CBD5E1",
    secondaryBtnText: "#0F172A",
    // Widgets & Badges
    badgeBg: "#EFF6FF",
    badgeText: "#0066F5",
    freezeBoxBg: "#F0F9FF",
    freezeBoxBorder: "#BAE6FD",
    freezeBoxTitle: "#0369A1",
    freezeBoxSubtext: "#0284C7",
    accentGlow: "rgba(0, 102, 245, 0.35)",
    // Inputs & Controls
    inputBg: "#F1F5F9",
    inputBorder: "#CBD5E1",
    inputText: "#0F172A",
    inputPlaceholder: "#64748B",
    iconColor: "#64748B",
  },
  light: {
    name: "Cowrywise Pure Light",
    bg: "#F8FAFC",
    // Header
    headerText: "#0F172A",
    headerSubtext: "#475569",
    headerBtnBg: "#FFFFFF",
    headerBtnBorder: "#E2E8F0",
    headerBtnText: "#0F172A",
    streakBtnBg: "#FEF3C7",
    streakBtnText: "#B45309",
    // Nav Tabs
    navBg: "#E2E8F0",
    navBorder: "#CBD5E1",
    tabActiveBg: "#0066F5",
    tabActiveText: "#FFFFFF",
    tabInactiveText: "#475569",
    // Cards
    cardBg: "#FFFFFF",
    cardBorder: "#E2E8F0",
    cardTitle: "#0F172A",
    cardSubtext: "#475569",
    subCardBg: "#F1F5F9",
    subCardText: "#0F172A",
    englishText: "#0066F5",
    // Buttons
    primaryBtnBg: "#0066F5",
    primaryBtnText: "#FFFFFF",
    secondaryBtnBg: "#F1F5F9",
    secondaryBtnBorder: "#CBD5E1",
    secondaryBtnText: "#0F172A",
    // Widgets & Badges
    badgeBg: "#EFF6FF",
    badgeText: "#0066F5",
    freezeBoxBg: "#F0F9FF",
    freezeBoxBorder: "#BAE6FD",
    freezeBoxTitle: "#0369A1",
    freezeBoxSubtext: "#0284C7",
    accentGlow: "rgba(0, 102, 245, 0.25)",
    // Inputs & Controls
    inputBg: "#F1F5F9",
    inputBorder: "#CBD5E1",
    inputText: "#0F172A",
    inputPlaceholder: "#64748B",
    iconColor: "#64748B",
  },
  noir: {
    name: "Portfolio Noir",
    bg: "#09090B",
    // Header
    headerText: "#FAFAFA",
    headerSubtext: "#A1A1AA",
    headerBtnBg: "#18181B",
    headerBtnBorder: "#27272A",
    headerBtnText: "#FAFAFA",
    streakBtnBg: "#27272A",
    streakBtnText: "#F59E0B",
    // Nav Tabs
    navBg: "#18181B",
    navBorder: "#27272A",
    tabActiveBg: "#FFFFFF",
    tabActiveText: "#000000",
    tabInactiveText: "#A1A1AA",
    // Cards
    cardBg: "#18181B",
    cardBorder: "#27272A",
    cardTitle: "#FAFAFA",
    cardSubtext: "#D4D4D8",
    subCardBg: "#27272A",
    subCardText: "#FAFAFA",
    englishText: "#60A5FA",
    // Buttons
    primaryBtnBg: "#FFFFFF",
    primaryBtnText: "#000000",
    secondaryBtnBg: "#27272A",
    secondaryBtnBorder: "#3F3F46",
    secondaryBtnText: "#FAFAFA",
    // Widgets & Badges
    badgeBg: "#27272A",
    badgeText: "#60A5FA",
    freezeBoxBg: "#0C4A6E",
    freezeBoxBorder: "#0369A1",
    freezeBoxTitle: "#E0F2FE",
    freezeBoxSubtext: "#7DD3FC",
    accentGlow: "rgba(255, 255, 255, 0.2)",
    // Inputs & Controls
    inputBg: "#27272A",
    inputBorder: "#3F3F46",
    inputText: "#FAFAFA",
    inputPlaceholder: "#9CA3AF",
    iconColor: "#A1A1AA",
  },
};

const TYPE_CONFIG = {
  speaking: {
    icon: Mic,
    label: "Speaking Practice",
    badge: "Oral Practice",
    hint: "Listen to native audio, speak clearly into the mic, then submit proof.",
  },
  writing: {
    icon: PenTool,
    label: "Writing Drill",
    badge: "Composition",
    hint: "Craft your French response below using accent shortcuts, then submit.",
  },
  reading: {
    icon: BookOpen,
    label: "Reading Aloud",
    badge: "Elocution",
    hint: "Read the passage aloud. Record voice to verify flow.",
  },
};

const FRENCH_ACCENTS = ["é", "è", "ê", "à", "â", "ç", "ù", "ô", "î", "ë"];

// ── Native Text-to-Speech Helper (fr-FR) ──────────────────────────────────────
function getFrenchVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  return (
    voices.find(
      (v) =>
        v.lang.startsWith("fr") &&
        (v.name.includes("Natural") ||
          v.name.includes("Enhanced") ||
          v.name.includes("Premium") ||
          v.name.includes("Online") ||
          v.name.includes("Google"))
    ) ||
    voices.find(
      (v) =>
        (v.lang === "fr-FR" || v.lang === "fr_FR" || v.lang.startsWith("fr")) &&
        (v.name.includes("Thomas") ||
          v.name.includes("Amélie") ||
          v.name.includes("Audrey") ||
          v.name.includes("Aurélie") ||
          v.name.includes("Hortense") ||
          v.name.includes("Nicolas"))
    ) ||
    voices.find((v) => v.lang.startsWith("fr")) ||
    null
  );
}

function speakFrench(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    toast.error("Text-to-speech is not supported in this browser.");
    return;
  }
  window.speechSynthesis.cancel();

  let frVoice = getFrenchVoice();
  if (!frVoice) {
    window.speechSynthesis.getVoices();
    frVoice = getFrenchVoice();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = 0.88;
  utterance.pitch = 1.0;

  if (frVoice) {
    utterance.voice = frVoice;
  }

  window.speechSynthesis.speak(utterance);
}

// ── Audio & Video MIME & Universal Converter Helpers ─────────────────────────────
function getSupportedAudioMimeType(): string {
  const types = [
    "audio/mp4",
    "audio/aac",
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg",
  ];
  for (const type of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
}

function getSupportedVideoMimeType(): string {
  const types = [
    'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
    "video/mp4;codecs=avc1",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  for (const type of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
}

function getMediaExtension(mimeType: string, mode: "audio" | "video"): string {
  if (mode === "video") {
    if (mimeType.includes("mp4")) return "mp4";
    return "webm";
  }
  if (mimeType.includes("mp4") || mimeType.includes("aac")) return "m4a";
  if (mimeType.includes("wav")) return "wav";
  return "wav";
}

// Convert any WebM / OGG / AAC audio blob into standard Universal PCM WAV (16-bit 44.1kHz)
async function convertAudioBlobToWavBlob(audioBlob: Blob): Promise<Blob> {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioContext = new AudioCtx();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels: Float32Array[] = [];
  const sampleRate = audioBuffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"

  // fmt sub-chunk
  setUint32(0x20746d66); // "fmt "
  setUint32(16); // SubChunk1Size (16 for PCM)
  setUint16(1); // AudioFormat (1 for PCM)
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // ByteRate
  setUint16(numOfChan * 2); // BlockAlign
  setUint16(16); // BitsPerSample

  // data sub-chunk
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  for (let i = 0; i < numOfChan; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  while (offset < audioBuffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  audioContext.close();
  return new Blob([buffer], { type: "audio/wav" });
}

// Universal Cross-Device Download Helper
async function downloadUniversalMedia(mediaUrl: string, isVideo: boolean, defaultFilename: string) {
  try {
    toast.loading("Preparing universal media download…");
    const res = await fetch(mediaUrl);
    const originalBlob = await res.blob();

    if (!isVideo) {
      // Audio: Convert to Universal WAV Audio Format if it's WebM/OGG
      try {
        const wavBlob = await convertAudioBlobToWavBlob(originalBlob);
        const wavUrl = URL.createObjectURL(wavBlob);
        const a = document.createElement("a");
        a.href = wavUrl;
        a.download = defaultFilename.replace(/\.(webm|ogg|mp3|m4a|wav|mp4)$/i, "") + ".wav";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(wavUrl);
        toast.dismiss();
        toast.success("Downloaded Universal WAV Audio! 🎧");
        return;
      } catch (convErr) {
        console.warn("WAV conversion fallback to original blob:", convErr);
      }
    }

    // Video or Audio Fallback
    const blobUrl = URL.createObjectURL(originalBlob);
    const a = document.createElement("a");
    a.href = blobUrl;
    const isMp4 = originalBlob.type.includes("mp4");
    const ext = isVideo ? (isMp4 ? "mp4" : "webm") : (isMp4 ? "m4a" : "wav");
    a.download = defaultFilename.replace(/\.[^.]+$/, "") + `.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
    toast.dismiss();
    toast.success(`Downloaded Universal ${ext.toUpperCase()} file! 📥`);
  } catch (err) {
    console.error("Download error:", err);
    toast.dismiss();
    window.open(mediaUrl, "_blank");
  }
}

// ── Confetti Burst ────────────────────────────────────────────────────────────
function Confetti({ active }: { active: boolean }) {
  const colors = ["#0066F5", "#60A5FA", "#F59E0B", "#38BDF8", "#10B981"];

  const pieces = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        x: (Math.random() - 0.5) * 260,
        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
        duration: 1.8 + Math.random() * 1.4,
        delay: Math.random() * 0.3,
        color: colors[i % colors.length],
        size: Math.random() * 6 + 4,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: "-12px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 10px ${p.color}`,
          }}
          animate={{
            y: ["0vh", "105vh"],
            x: [`${p.x}px`],
            rotate: [0, p.rotate],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// ── App Brand Logo Mark ───────────────────────────────────────────────────────
function AppLogo() {
  return (
    <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center relative shadow-md overflow-hidden shrink-0">
      <div className="absolute inset-0 flex">
        <div className="w-1/3 h-full bg-[#0055A5]" />
        <div className="w-1/3 h-full bg-white" />
        <div className="w-1/3 h-full bg-[#EF4135]" />
      </div>
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
      <span className="relative font-serif font-black text-white text-xs tracking-tighter drop-shadow">
        FR
      </span>
    </div>
  );
}

// ── Sleek Cowrywise Auth Modal ────────────────────────────────────────────────
function AuthModal({
  isOpen,
  onClose,
  theme,
}: {
  isOpen: boolean;
  onClose: () => void;
  theme: (typeof THEMES)["cowrywise"];
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isOpen) return null;

  const handleOAuth = async (provider: "google" | "github") => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/french`,
      },
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    const supabase = createClient();
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/french` },
        });
        if (error) throw error;
        toast.success("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in successfully! 🇫🇷");
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-sm rounded-3xl border p-6 shadow-2xl overflow-hidden relative"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.cardTitle }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full border transition-all cursor-pointer z-10"
            style={{ backgroundColor: theme.secondaryBtnBg, borderColor: theme.secondaryBtnBorder, color: theme.cardTitle }}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold font-serif" style={{ color: theme.cardTitle }}>Sign In Required</h3>
            <p className="text-xs mt-1.5 leading-relaxed font-medium" style={{ color: theme.cardSubtext }}>
              Anyone can view prompts and test flashcards, but signing in is required to log progress, generate on-demand challenges, and save vocabulary.
            </p>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              className="w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border bg-white text-slate-800 border-slate-200 shadow-sm hover:bg-slate-50 cursor-pointer"
            >
              Continue with Google
            </button>
          </div>

          <div className="relative flex py-2 items-center mb-3">
            <div className="flex-grow border-t" style={{ borderColor: theme.cardBorder }}></div>
            <span className="flex-shrink mx-3 text-[10px] font-mono uppercase font-bold" style={{ color: theme.cardSubtext }}>or email</span>
            <div className="flex-grow border-t" style={{ borderColor: theme.cardBorder }}></div>
          </div>

          <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="Email address"
              className="rounded-2xl px-4 py-3 text-xs border focus:outline-none font-medium"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              placeholder="Password"
              className="rounded-2xl px-4 py-3 text-xs border focus:outline-none font-medium"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="py-3 rounded-2xl font-bold text-xs shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: theme.primaryBtnBg, color: theme.primaryBtnText }}
            >
              {loading ? "Signing in…" : isSignUp ? "Create Account" : "Sign In"}
            </button>

            <button
              type="button"
              onClick={() => setIsSignUp((s) => !s)}
              className="text-[11px] font-semibold text-center hover:underline cursor-pointer pt-1"
              style={{ color: theme.cardSubtext }}
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── Custom Reminder Time Settings Selector ────────────────────────────────────
function ReminderTimeSettings({
  user,
  onRequireAuth,
  theme,
}: {
  user: User | null;
  onRequireAuth: () => void;
  theme: (typeof THEMES)["cowrywise"];
}) {
  const [reminderTime, setReminderTime] = useState("22:00");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/french/subscribe")
      .then((res) => res.json())
      .then((data) => {
        if (data.reminder_time) setReminderTime(data.reminder_time);
      })
      .catch(() => {});
  }, [user]);

  const handleTimeChange = async (newTime: string) => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setReminderTime(newTime);
    setUpdating(true);
    try {
      let reg = await navigator.serviceWorker.getRegistration("/french");
      const sub = await reg?.pushManager.getSubscription();

      const res = await fetch("/api/french/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub?.endpoint ?? "default_endpoint",
          reminder_time: newTime,
        }),
      });

      if (!res.ok) throw new Error("Failed to save reminder time");
      const timeLabels: Record<string, string> = {
        "08:00": "8:00 AM",
        "12:00": "12:00 PM",
        "18:00": "6:00 PM",
        "21:00": "9:00 PM",
        "22:00": "10:00 PM",
      };
      toast.success(`⏰ Daily reminder scheduled for ${timeLabels[newTime] || newTime}`);
    } catch {
      toast.error("Could not save custom reminder time.");
    } finally {
      setUpdating(false);
    }
  };

  const times = [
    { value: "08:00", label: "8 AM" },
    { value: "12:00", label: "12 PM" },
    { value: "18:00", label: "6 PM" },
    { value: "21:00", label: "9 PM" },
    { value: "22:00", label: "10 PM" },
  ];

  return (
    <div
      className="p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-semibold shadow-md"
      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.cardTitle }}
    >
      <div className="flex items-center gap-2.5">
        <Clock className="w-4 h-4 text-blue-600 shrink-0" />
        <div>
          <span className="font-bold block" style={{ color: theme.cardTitle }}>Daily Reminder Schedule</span>
          <span className="text-[11px] font-medium" style={{ color: theme.cardSubtext }}>
            Choose your preferred time to receive notification reminders
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
        {times.map((t) => {
          const isSelected = reminderTime === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => handleTimeChange(t.value)}
              disabled={updating}
              className="px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer shrink-0"
              style={{
                backgroundColor: isSelected ? theme.primaryBtnBg : theme.secondaryBtnBg,
                color: isSelected ? theme.primaryBtnText : theme.cardTitle,
                borderColor: isSelected ? theme.primaryBtnBg : theme.cardBorder,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Interactive Vocab Detail & Flashcard Modal ────────────────────────────────
function VocabDetailModal({
  entry,
  onClose,
  theme,
}: {
  entry: VocabEntry | null;
  onClose: () => void;
  theme: (typeof THEMES)["cowrywise"];
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!entry) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${entry.french_text} - ${entry.english_meaning}`);
    toast.success("Copied to clipboard!");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md rounded-3xl border p-6 shadow-2xl overflow-hidden relative"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.cardTitle }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full border transition-all cursor-pointer z-10"
            style={{ backgroundColor: theme.secondaryBtnBg, borderColor: theme.secondaryBtnBorder, color: theme.cardTitle }}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border"
              style={{ backgroundColor: theme.badgeBg, color: theme.badgeText, borderColor: theme.cardBorder }}
            >
              {entry.entry_type}
            </span>
            <span className="text-xs font-medium" style={{ color: theme.cardSubtext }}>
              Added {new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>

          <div
            onClick={() => setIsFlipped((f) => !f)}
            className="relative w-full min-h-[180px] p-6 rounded-3xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.01] shadow-inner select-none mb-6"
            style={{ backgroundColor: theme.subCardBg, borderColor: theme.cardBorder }}
          >
            <span className="text-[10px] font-mono uppercase tracking-widest block mb-3 font-semibold" style={{ color: theme.cardSubtext }}>
              {isFlipped ? "English Translation" : "French Practice (Tap to Flip)"}
            </span>

            {!isFlipped ? (
              <h3 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight leading-snug" style={{ color: theme.cardTitle }}>
                {entry.french_text}
              </h3>
            ) : (
              <p className="text-xl sm:text-2xl font-sans font-bold leading-snug" style={{ color: theme.englishText }}>
                {entry.english_meaning}
              </p>
            )}

            <div className="mt-4 flex items-center gap-2">
              <span className="text-[11px] font-mono font-medium" style={{ color: theme.cardSubtext }}>
                {isFlipped ? "Tap card to see French" : "Tap card to reveal meaning"}
              </span>
            </div>
          </div>

          {entry.notes && (
            <div className="p-3.5 rounded-2xl border mb-6 text-xs" style={{ backgroundColor: theme.subCardBg, borderColor: theme.cardBorder }}>
              <span className="font-mono text-[10px] uppercase font-bold block mb-1" style={{ color: theme.cardSubtext }}>Memory Hook / Context</span>
              <p className="italic font-medium" style={{ color: theme.cardTitle }}>{entry.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => speakFrench(entry.french_text)}
              className="py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer"
              style={{ backgroundColor: theme.secondaryBtnBg, borderColor: theme.secondaryBtnBorder, color: theme.secondaryBtnText }}
            >
              <Volume2 className="w-4 h-4 text-blue-600" /> Listen Audio
            </button>

            <button
              type="button"
              onClick={copyToClipboard}
              className="py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer"
              style={{ backgroundColor: theme.secondaryBtnBg, borderColor: theme.secondaryBtnBorder, color: theme.secondaryBtnText }}
            >
              <Copy className="w-4 h-4" /> Copy Text
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── Duolingo-style Streak Calendar Modal ──────────────────────────────────────
function StreakCalendarModal({
  isOpen,
  onClose,
  streak,
  theme,
}: {
  isOpen: boolean;
  onClose: () => void;
  streak: Streak | null;
  theme: (typeof THEMES)["cowrywise"];
}) {
  if (!isOpen) return null;

  const today = new Date();
  const currentMonthName = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const currentDayNum = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const currentStreak = streak?.current_streak ?? 0;
  const freezes = streak?.streak_freezes ?? 2;
  const lastCompleted = streak?.last_completed_date;
  const todayStr = today.toISOString().split("T")[0];
  const isCompletedToday = lastCompleted === todayStr;

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNumber = i + 1;
    const isToday = dayNumber === currentDayNum;
    const isPast = dayNumber < currentDayNum;
    const isCompleted = isToday
      ? isCompletedToday
      : isPast && dayNumber >= Math.max(1, currentDayNum - currentStreak);

    return { dayNumber, isToday, isPast, isCompleted };
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-sm rounded-3xl border p-6 shadow-2xl overflow-hidden relative"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.cardTitle }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full border transition-all cursor-pointer"
            style={{ backgroundColor: theme.secondaryBtnBg, borderColor: theme.secondaryBtnBorder, color: theme.cardTitle }}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-1">
            <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
            <h3 className="text-xl font-bold tracking-tight" style={{ color: theme.cardTitle }}>Streak & Activity</h3>
          </div>
          <p className="text-xs mb-6 font-medium" style={{ color: theme.cardSubtext }}>Duolingo-style habit protection</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-2xl border flex flex-col items-center text-center" style={{ backgroundColor: theme.subCardBg, borderColor: theme.cardBorder }}>
              <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                <Flame className="w-5 h-5 fill-amber-500" />
                <span className="text-2xl font-extrabold">{currentStreak}</span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold" style={{ color: theme.cardSubtext }}>Active Streak</span>
            </div>

            <div className="p-4 rounded-2xl border flex flex-col items-center text-center" style={{ backgroundColor: theme.freezeBoxBg, borderColor: theme.freezeBoxBorder }}>
              <div className="flex items-center gap-1.5 mb-1" style={{ color: theme.freezeBoxTitle }}>
                <Snowflake className="w-5 h-5" />
                <span className="text-2xl font-extrabold">{freezes}/2</span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold" style={{ color: theme.freezeBoxTitle }}>Streak Freezes</span>
            </div>
          </div>

          <div
            className="p-3.5 rounded-2xl border flex items-center gap-3 mb-6"
            style={{ backgroundColor: theme.freezeBoxBg, borderColor: theme.freezeBoxBorder, color: theme.freezeBoxTitle }}
          >
            <Snowflake className="w-5 h-5 shrink-0 animate-pulse" />
            <div className="text-xs">
              <span className="font-bold block">
                {freezes > 0 ? `${freezes} Streak Freeze${freezes > 1 ? "s" : ""} Protected` : "No Freezes Left"}
              </span>
              <span className="text-[11px] font-medium" style={{ color: theme.freezeBoxSubtext }}>
                {freezes > 0
                  ? "If you miss a daily drill, a freeze automatically saves your streak."
                  : "Practice today to keep your streak intact!"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold mb-3 px-1">
            <span className="flex items-center gap-1.5" style={{ color: theme.cardTitle }}>
              <CalendarIcon className="w-3.5 h-3.5 opacity-70" /> {currentMonthName}
            </span>
            <span className="text-[10px] font-mono font-medium" style={{ color: theme.cardSubtext }}>Today: Day {currentDayNum}</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
              <span key={idx} className="text-[10px] font-mono font-bold py-1" style={{ color: theme.cardSubtext }}>
                {d}
              </span>
            ))}

            {calendarDays.map((d) => (
              <div
                key={d.dayNumber}
                className="aspect-square rounded-xl flex items-center justify-center text-xs font-bold relative transition-all"
                style={{
                  backgroundColor: d.isCompleted
                    ? theme.primaryBtnBg
                    : d.isToday
                    ? theme.secondaryBtnBg
                    : theme.subCardBg,
                  color: d.isCompleted ? theme.primaryBtnText : theme.cardTitle,
                  border: `1px solid ${d.isToday ? theme.primaryBtnBg : theme.cardBorder}`,
                }}
              >
                {d.isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <span>{d.dayNumber}</span>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-6 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-lg"
            style={{ backgroundColor: theme.primaryBtnBg, color: theme.primaryBtnText }}
          >
            Close Calendar
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── French Interactive Dictionary & Grammar Inspector Engine ─────────────────────
const COMMON_FRENCH_DICT: Record<string, { en: string; note: string; partOfSpeech: string }> = {
  bonjour: { en: "hello / good morning", note: "Standard polite greeting throughout the day", partOfSpeech: "interjection" },
  salut: { en: "hi / bye (informal)", note: "Used among friends and family", partOfSpeech: "interjection" },
  merci: { en: "thank you", note: "Expresses gratitude; 'merci beaucoup' = thanks a lot", partOfSpeech: "interjection" },
  oui: { en: "yes", note: "Use 'si' when contradicting a negative question", partOfSpeech: "adverb" },
  non: { en: "no", note: "Negation particle", partOfSpeech: "adverb" },
  "s'il": { en: "if it...", note: "Part of 's'il vous plaît' (please)", partOfSpeech: "phrase" },
  plaît: { en: "pleases", note: "From verb plaire; 's'il vous plaît' = please", partOfSpeech: "verb" },
  avais: { en: "had", note: "Imperfect tense of avoir (I/you had)", partOfSpeech: "verb" },
  chance: { en: "luck / opportunity / chance", note: "Feminine noun (une chance)", partOfSpeech: "noun" },
  incroyable: { en: "incredible / amazing", note: "Adjective describing something extraordinary", partOfSpeech: "adjective" },
  choisirais: { en: "would choose", note: "Conditional mood of choisir", partOfSpeech: "verb" },
  hésitation: { en: "hesitation", note: "Feminine noun (sans hésitation = without hesitation)", partOfSpeech: "noun" },
  ville: { en: "city / town", note: "Feminine noun (la ville)", partOfSpeech: "noun" },
  bilingue: { en: "bilingual", note: "Describes a person or place using two languages", partOfSpeech: "adjective" },
  français: { en: "French (language / nationality)", note: "Capitalized for people (le Français), lowercase for language (le français)", partOfSpeech: "noun / adj" },
  présent: { en: "present / widespread", note: "Masculine adjective (présente in feminine)", partOfSpeech: "adjective" },
  environnement: { en: "environment", note: "Masculine noun (un environnement)", partOfSpeech: "noun" },
  immersion: { en: "immersion", note: "Feminine noun (une immersion)", partOfSpeech: "noun" },
  parfait: { en: "perfect", note: "Masculine adjective (parfaite in feminine)", partOfSpeech: "adjective" },
  sécurité: { en: "security / safety", note: "Feminine noun (la sécurité)", partOfSpeech: "noun" },
  anglophone: { en: "English-speaking", note: "Refers to English speakers or regions", partOfSpeech: "adjective" },
  mélange: { en: "mixture / blend", note: "Masculine noun (un mélange)", partOfSpeech: "noun" },
  culturel: { en: "cultural", note: "Masculine adjective (culturelle in feminine)", partOfSpeech: "adjective" },
  dynamisme: { en: "dynamism / vitality", note: "Masculine noun (le dynamisme)", partOfSpeech: "noun" },
  artistique: { en: "artistic", note: "Describes creative or art-related things", partOfSpeech: "adjective" },
  réputation: { en: "reputation", note: "Feminine noun (une réputation)", partOfSpeech: "noun" },
  étudiante: { en: "student (feminine)", note: "Refers to a female student or student-focused city", partOfSpeech: "noun / adj" },
  défis: { en: "challenges", note: "Plural noun (un défi = a challenge)", partOfSpeech: "noun" },
  adaptation: { en: "adaptation / adjustment", note: "Feminine noun (l'adaptation)", partOfSpeech: "noun" },
  climat: { en: "climate / weather", note: "Masculine noun (le climat)", partOfSpeech: "noun" },
  hivernal: { en: "wintry / winter", note: "Adjective (du climat hivernal)", partOfSpeech: "adjective" },
  rigoureux: { en: "harsh / rigorous", note: "Masculine adjective describing severe weather or standards", partOfSpeech: "adjective" },
  découverte: { en: "discovery", note: "Feminine noun (la découverte)", partOfSpeech: "noun" },
  subtilités: { en: "subtleties / nuances", note: "Plural feminine noun (une subtilité)", partOfSpeech: "noun" },
  accent: { en: "accent / pronunciation", note: "Masculine noun (l'accent)", partOfSpeech: "noun" },
  québécois: { en: "Quebec / French-Canadian", note: "Describes regional accent or culture of Quebec", partOfSpeech: "adjective" },
  fascinant: { en: "fascinating", note: "Masculine adjective (fascinante in feminine)", partOfSpeech: "adjective" },
  opportunités: { en: "opportunities", note: "Plural feminine noun (une opportunité)", partOfSpeech: "noun" },
  linguistique: { en: "linguistic / language", note: "Relating to language learning", partOfSpeech: "adjective" },
  profonde: { en: "deep / profound", note: "Feminine adjective (profond in masculine)", partOfSpeech: "adjective" },
  améliorer: { en: "to improve / enhance", note: "Infinitive verb (améliorer son français)", partOfSpeech: "verb" },
  manière: { en: "way / manner", note: "Feminine noun (de manière exponentielle = exponentially)", partOfSpeech: "noun" },
  exponentielle: { en: "exponential", note: "Feminine adjective", partOfSpeech: "adjective" },
  découvrir: { en: "to discover", note: "Infinitive verb", partOfSpeech: "verb" },
  nouvelle: { en: "new (feminine)", note: "Feminine singular form of nouveau", partOfSpeech: "adjective" },
  "nord-américaine": { en: "North American (feminine)", note: "Compound adjective", partOfSpeech: "adjective" },
  racines: { en: "roots", note: "Plural feminine noun (les racines)", partOfSpeech: "noun" },
  élargir: { en: "to broaden / expand", note: "Infinitive verb (élargir son réseau)", partOfSpeech: "verb" },
  réseau: { en: "network", note: "Masculine noun (le réseau professionnel)", partOfSpeech: "noun" },
  professionnel: { en: "professional", note: "Masculine adjective", partOfSpeech: "adjective" },
  quotidien: { en: "daily life / everyday", note: "Masculine noun (au quotidien = in daily life)", partOfSpeech: "noun / adj" },
  envisagerais: { en: "would consider / envisage", note: "Conditional tense of envisager", partOfSpeech: "verb" },
  partout: { en: "everywhere", note: "Adverb of place (absolument partout = absolutely everywhere)", partOfSpeech: "adverb" },
  travail: { en: "work / job", note: "Masculine noun (au travail)", partOfSpeech: "noun" },
  majoritairement: { en: "mostly / predominantly", note: "Adverb derived from majorité", partOfSpeech: "adverb" },
  francophone: { en: "French-speaking", note: "Describes French speakers or environments", partOfSpeech: "adjective" },
  idéal: { en: "ideal", note: "Masculine noun / adjective", partOfSpeech: "noun / adj" },
  chercherais: { en: "would seek / look for", note: "Conditional tense of chercher", partOfSpeech: "verb" },
  activement: { en: "actively", note: "Adverb", partOfSpeech: "adverb" },
  rencontres: { en: "encounters / meetings / networking", note: "Plural feminine noun (faire des rencontres)", partOfSpeech: "noun" },
  locales: { en: "local (feminine plural)", note: "Plural feminine adjective", partOfSpeech: "adjective" },
  rejoignant: { en: "joining", note: "Present participle of rejoindre", partOfSpeech: "verb" },
  clubs: { en: "clubs / groups", note: "Masculine plural noun", partOfSpeech: "noun" },
  sport: { en: "sports / fitness", note: "Masculine noun", partOfSpeech: "noun" },
  associations: { en: "organizations / associations", note: "Feminine plural noun", partOfSpeech: "noun" },
  bénévolat: { en: "volunteering / charity work", note: "Masculine noun (du bénévolat)", partOfSpeech: "noun" },
  marché: { en: "market", note: "Masculine noun (aller au marché)", partOfSpeech: "noun" },
  commander: { en: "to order (food/drinks)", note: "Infinitive verb used in restaurants/cafés", partOfSpeech: "verb" },
  restaurant: { en: "restaurant", note: "Masculine noun", partOfSpeech: "noun" },
  courses: { en: "errands / grocery shopping", note: "Plural feminine noun (faire mes courses)", partOfSpeech: "noun" },
  occasion: { en: "opportunity / chance", note: "Feminine noun (une occasion de pratiquer)", partOfSpeech: "noun" },
  pratiquer: { en: "to practice", note: "Infinitive verb", partOfSpeech: "verb" },
  films: { en: "movies / films", note: "Masculine plural noun", partOfSpeech: "noun" },
  musique: { en: "music", note: "Feminine noun (la musique)", partOfSpeech: "noun" },
  journaux: { en: "newspapers / journals", note: "Plural of journal", partOfSpeech: "noun" },
  locaux: { en: "local (masculine plural)", note: "Plural masculine adjective", partOfSpeech: "adjective" },
  objectif: { en: "goal / objective", note: "Masculine noun (l'objectif)", partOfSpeech: "noun" },
  penser: { en: "to think", note: "Infinitive verb (penser en français)", partOfSpeech: "verb" },
  rêver: { en: "to dream", note: "Infinitive verb (rêver en français)", partOfSpeech: "verb" },
  vivre: { en: "to live", note: "Infinitive verb (vivre le français)", partOfSpeech: "verb" },
  convaincu: { en: "convinced / certain", note: "Past participle / adjective of convaincre", partOfSpeech: "adjective" },
  expérience: { en: "experience", note: "Feminine noun (une expérience)", partOfSpeech: "noun" },
  transformatrice: { en: "life-changing / transformative", note: "Feminine adjective (transformateur in masculine)", partOfSpeech: "adjective" },
};

function getWordDetails(rawWord: string): { en: string; note: string; partOfSpeech: string } {
  const clean = rawWord.toLowerCase().replace(/[^a-zA-ZàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ'-]/g, "").trim();
  if (COMMON_FRENCH_DICT[clean]) {
    return COMMON_FRENCH_DICT[clean];
  }
  const stripped = clean.replace(/^(j'|c'|l'|d'|m'|t'|s'|n'|qu')/i, "");
  if (COMMON_FRENCH_DICT[stripped]) {
    return COMMON_FRENCH_DICT[stripped];
  }
  return {
    en: `Meaning of "${clean || rawWord}"`,
    note: "Tap 'Save to Vault' to bookmark this word for flashcards & spaced-repetition practice!",
    partOfSpeech: "vocabulary term",
  };
}

// ── Interactive Target Passage with Clickable Word Inspector & Translation ─────
function InteractiveTargetPassage({
  text,
  englishTranslation,
  theme,
}: {
  text: string;
  englishTranslation?: string;
  theme: (typeof THEMES)["cowrywise"];
}) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // Split text by lines and space tokens
  const paragraphs = text.split("\n").filter(Boolean);

  const handleWordClick = (rawWord: string) => {
    const cleanWord = rawWord.replace(/[^a-zA-ZàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ'-]/g, "").trim();
    if (!cleanWord) return;
    setSelectedWord(cleanWord);
    speakFrench(cleanWord);
  };

  return (
    <div
      className="mt-4 p-4 sm:p-5 rounded-2xl border transition-all"
      style={{ backgroundColor: theme.subCardBg, borderColor: theme.cardBorder }}
    >
      <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b" style={{ borderColor: theme.cardBorder }}>
        <span className="text-[10px] font-mono uppercase tracking-wider block font-bold" style={{ color: theme.cardSubtext }}>
          Target Passage • Tap any word to listen & inspect
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => speakFrench(text)}
            className="flex items-center gap-1 text-[11px] font-extrabold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            title="Listen to entire native French passage"
          >
            <Volume2 className="w-3.5 h-3.5" /> Full Audio
          </button>
          <button
            type="button"
            onClick={() => setShowTranslation((s) => !s)}
            className="flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border transition-all cursor-pointer shadow-xs"
            style={{
              backgroundColor: showTranslation ? theme.primaryBtnBg : theme.cardBg,
              color: showTranslation ? theme.primaryBtnText : theme.cardTitle,
              borderColor: theme.cardBorder,
            }}
          >
            <Languages className="w-3.5 h-3.5" /> {showTranslation ? "Hide English" : "Show English"}
          </button>
        </div>
      </div>

      {/* Interactive Word Tokens */}
      <div className="space-y-3 text-sm sm:text-base font-serif leading-relaxed sm:leading-loose font-medium" style={{ color: theme.cardTitle }}>
        {paragraphs.map((para, pIdx) => (
          <p key={pIdx} className="leading-relaxed sm:leading-loose whitespace-pre-wrap">
            {para.split(/(\s+)/).map((token, wIdx) => {
              if (/^\s+$/.test(token)) {
                return <span key={wIdx}>{token}</span>;
              }
              const clean = token.replace(/[^a-zA-ZàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ'-]/g, "").trim();
              return clean ? (
                <button
                  key={wIdx}
                  type="button"
                  onClick={() => handleWordClick(token)}
                  className="inline rounded px-0.5 transition-colors hover:bg-blue-500/20 hover:text-blue-600 cursor-pointer active:scale-95"
                  title={`Click to listen to "${clean}"`}
                >
                  {token}
                </button>
              ) : (
                <span key={wIdx}>{token}</span>
              );
            })}
          </p>
        ))}
      </div>

      {/* Word Inspector Modal Popover */}
      <AnimatePresence>
        {selectedWord && (() => {
          const details = getWordDetails(selectedWord);
          const clean = selectedWord.replace(/[^a-zA-ZàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ'-]/g, "").trim();
          return (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="mt-4 p-3.5 sm:p-4 rounded-2xl border flex flex-col gap-3 shadow-lg relative overflow-hidden"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.primaryBtnBg }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: theme.cardBorder }}>
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-extrabold font-serif" style={{ color: theme.cardTitle }}>
                        &ldquo;{clean}&rdquo;
                      </span>
                      <span className="text-[9px] font-mono uppercase font-extrabold px-2 py-0.5 rounded-full border bg-blue-500/10 border-blue-500/30 text-blue-600">
                        {details.partOfSpeech}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 block mt-1">
                      Meaning: {details.en}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0" style={{ borderColor: theme.cardBorder }}>
                  <button
                    type="button"
                    onClick={() => speakFrench(clean)}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 border cursor-pointer shadow-sm active:scale-95"
                    style={{ backgroundColor: theme.primaryBtnBg, color: theme.primaryBtnText, borderColor: theme.cardBorder }}
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Listen
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/french/vocab", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            entry_type: "word",
                            french_text: clean,
                            english_meaning: details.en,
                            notes: details.note,
                          }),
                        });
                        if (res.ok) {
                          toast.success(`Saved "${clean}" to Vocab Vault! 🇫🇷`);
                        } else {
                          toast.info(`Please sign in to save "${clean}" to your Vocab Vault.`);
                        }
                      } catch {
                        toast.error("Could not save to Vocab Vault.");
                      }
                    }}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 border cursor-pointer shadow-sm hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: theme.secondaryBtnBg, borderColor: theme.secondaryBtnBorder, color: theme.secondaryBtnText }}
                    title="Bookmark to your private Vocab Vault"
                  >
                    <BookMarked className="w-3.5 h-3.5 text-amber-400" /> Save to Vault
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedWord(null)}
                    className="p-1.5 rounded-xl text-xs font-bold hover:opacity-70 cursor-pointer"
                    style={{ color: theme.cardSubtext }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="text-xs font-medium italic flex items-start gap-1.5" style={{ color: theme.cardSubtext }}>
                <span className="text-blue-500 font-bold shrink-0">💡 Note:</span>
                <span className="leading-relaxed">{details.note}</span>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* English Translation Collapsible Drawer */}
      <AnimatePresence>
        {showTranslation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-3 border-t overflow-hidden"
            style={{ borderColor: theme.cardBorder }}
          >
            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-blue-600">
              <Globe className="w-4 h-4" /> English Meaning & Translation
            </div>

            {englishTranslation ? (
              <div className="space-y-2 text-xs sm:text-sm font-serif leading-relaxed italic p-3.5 rounded-2xl border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.cardTitle }}>
                {englishTranslation.split("\n").filter(Boolean).map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl border text-xs font-medium leading-relaxed italic" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.cardSubtext }}>
                English Translation Note: Compare the target French passage above with your natural understanding. Tap any individual word to hear native speech!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Media Recorder (Audio & Video Camera Proof Capture) ───────────────────────
function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function MediaRecorderModule({
  onRecorded,
  targetText,
  theme,
}: {
  onRecorded: (blob: Blob, ext: string) => void;
  targetText?: string;
  theme: (typeof THEMES)["cowrywise"];
}) {
  const [mode, setMode] = useState<"audio" | "video">("audio");
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mimeTypeLabel, setMimeTypeLabel] = useState("webm");

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (mode === "video" && recording && videoPreviewRef.current && streamRef.current) {
      videoPreviewRef.current.srcObject = streamRef.current;
      videoPreviewRef.current.play().catch(() => {});
    }
  }, [mode, recording]);

  const start = useCallback(async () => {
    try {
      let stream: MediaStream;
      if (mode === "video") {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: { facingMode: "user" },
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        }
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = mode === "video" ? getSupportedVideoMimeType() : getSupportedAudioMimeType();
      const options = mimeType ? { mimeType } : {};
      let mr: MediaRecorder;
      try {
        mr = new MediaRecorder(stream, options);
      } catch {
        mr = new MediaRecorder(stream);
      }
      const actualType = mr.mimeType || (mode === "video" ? "video/webm" : "audio/webm");
      setMimeTypeLabel(actualType.split(";")[0]);

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: actualType });
        const url = URL.createObjectURL(blob);
        setMediaUrl(url);
        setRecorded(true);
        const ext = getMediaExtension(actualType, mode);
        onRecorded(blob, ext);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };

      mr.start(250);
      mediaRef.current = mr;
      setRecording(true);
      setSeconds(0);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err) {
      console.error("[french/recorder] Error starting recording:", err);
      toast.error(`${mode === "video" ? "Camera and Microphone" : "Microphone"} permission required.`);
    }
  }, [mode, onRecorded]);

  const stop = useCallback(() => {
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
    }
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const reset = useCallback(() => {
    setRecorded(false);
    setMediaUrl(null);
    setSeconds(0);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [mediaUrl]);

  return (
    <div
      className="flex flex-col items-center gap-4 p-5 rounded-3xl border transition-colors shadow-sm"
      style={{ backgroundColor: theme.subCardBg, borderColor: theme.cardBorder }}
    >
      {/* Mode Selector */}
      {!recording && !recorded && (
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <button
            type="button"
            onClick={() => setMode("audio")}
            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            style={{
              backgroundColor: mode === "audio" ? theme.primaryBtnBg : "transparent",
              color: mode === "audio" ? theme.primaryBtnText : theme.cardSubtext,
            }}
          >
            <Mic className="w-3.5 h-3.5" /> Audio Mic
          </button>
          <button
            type="button"
            onClick={() => setMode("video")}
            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            style={{
              backgroundColor: mode === "video" ? theme.primaryBtnBg : "transparent",
              color: mode === "video" ? theme.primaryBtnText : theme.cardSubtext,
            }}
          >
            <Video className="w-3.5 h-3.5" /> Video Camera
          </button>
        </div>
      )}

      {/* Live Teleprompter Studio View while Recording */}
      {recording && targetText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full p-4 sm:p-5 rounded-2xl border bg-black/90 text-white shadow-2xl flex flex-col gap-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-white/20 pb-2.5">
            <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Live Teleprompter • Read out loud into mic/camera
            </span>
            <span className="text-xs font-mono font-bold text-red-400 animate-pulse flex items-center gap-1.5 bg-red-950/80 px-2.5 py-1 rounded-full border border-red-500/40">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> REC {formatSeconds(seconds)}
            </span>
          </div>

          <div className="text-base sm:text-lg font-serif leading-relaxed sm:leading-loose text-white/95 max-h-56 overflow-y-auto pr-2 font-medium">
            {targetText}
          </div>
        </motion.div>
      )}

      {/* Live Video Preview element if in video mode */}
      {mode === "video" && recording && (
        <div className="w-full max-w-sm aspect-video rounded-2xl overflow-hidden bg-black relative border shadow-inner">
          <video ref={videoPreviewRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-mono font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> REC
          </div>
        </div>
      )}

      {!recorded ? (
        <div className="flex flex-col items-center gap-3">
          <button
            id="french-record-btn"
            type="button"
            onClick={recording ? stop : start}
            className="group relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 shadow-xl cursor-pointer"
            style={{
              background: recording ? "#EF4444" : "#0066F5",
              border: `2px solid ${recording ? "#EF4444" : "#0066F5"}`,
              boxShadow: recording ? "0 0 30px rgba(239,68,68,0.4)" : `0 0 20px ${theme.accentGlow}`,
            }}
          >
            {recording && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: "2px solid #EF4444" }}
                animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
              />
            )}
            {recording ? (
              <Square className="w-7 h-7 text-white fill-current" />
            ) : mode === "video" ? (
              <Video className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
            ) : (
              <Mic className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
            )}
          </button>

          {recording ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-xs font-mono font-bold text-red-500 tabular-nums">
                {String(Math.floor(seconds / 60)).padStart(2, "0")}:
                {String(seconds % 60).padStart(2, "0")} • Recording {mode.toUpperCase()}
              </p>
            </div>
          ) : (
            <p className="text-xs font-medium" style={{ color: theme.cardSubtext }}>
              Tap button to record {mode} proof • Auto-saves submission
            </p>
          )}
        </div>
      ) : (
        <div className="w-full flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {mode.toUpperCase()} Proof Captured
            </span>
            <span className="text-[10px] font-mono opacity-70 uppercase" style={{ color: theme.cardSubtext }}>{mimeTypeLabel}</span>
          </div>

          {mode === "video" ? (
            <video controls src={mediaUrl || undefined} className="w-full rounded-2xl aspect-video bg-black" />
          ) : (
            <audio controls src={mediaUrl || undefined} className="w-full rounded-xl" />
          )}

          <div className="flex items-center justify-between pt-1 gap-2">
            <button
              type="button"
              onClick={() => {
                if (mediaUrl) {
                  downloadUniversalMedia(mediaUrl, mode === "video", `french_proof_${Date.now()}`);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm active:scale-95"
              style={{ backgroundColor: theme.primaryBtnBg, color: theme.primaryBtnText, borderColor: theme.cardBorder }}
              title="Download recorded proof to your local device"
            >
              <Download className="w-3.5 h-3.5" /> Download {mode.toUpperCase()}
            </button>

            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer opacity-80 hover:opacity-100"
              style={{ color: theme.cardSubtext }}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Re-record {mode}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Proof History Log Component ───────────────────────────────────────────────
interface LogEntry {
  id: string;
  type: "speaking" | "writing" | "reading";
  proof_text?: string;
  proof_url?: string;
  created_at: string;
  french_challenges?: {
    type: "speaking" | "writing" | "reading";
    prompt_text: string;
    example_text?: string;
    challenge_date: string;
  };
}

function HistoryTab({
  theme,
  user,
  onRequireAuth,
}: {
  theme: (typeof THEMES)["cowrywise"];
  user: User | null;
  onRequireAuth: () => void;
}) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetch("/api/french/history")
      .then((res) => res.json())
      .then((data) => setLogs(data.logs ?? []))
      .catch(() => toast.error("Could not load past practice logs."))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 px-6 text-center rounded-3xl border shadow-xl"
        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
      >
        <Lock className="w-10 h-10 mb-3 text-blue-600" />
        <h3 className="text-lg font-serif font-bold" style={{ color: theme.cardTitle }}>Sign In to View Proof History</h3>
        <p className="text-xs max-w-xs mt-2 leading-relaxed font-medium mb-6" style={{ color: theme.cardSubtext }}>
          All your logged audio recordings, video proof, and written essays are safely saved to your account.
        </p>

        <button
          type="button"
          onClick={onRequireAuth}
          className="py-3.5 px-6 rounded-2xl font-bold text-xs flex items-center gap-2 border shadow-xl cursor-pointer"
          style={{ backgroundColor: theme.primaryBtnBg, color: theme.primaryBtnText, borderColor: theme.cardBorder }}
        >
          <LogIn className="w-4 h-4" /> Sign In Now
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold" style={{ color: theme.cardSubtext }}>Loading your proof history…</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 px-6 text-center rounded-3xl border shadow-xl"
        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
      >
        <BookMarked className="w-10 h-10 mb-3 text-amber-500" />
        <h3 className="text-lg font-serif font-bold" style={{ color: theme.cardTitle }}>No Logged Proofs Yet</h3>
        <p className="text-xs max-w-xs mt-2 leading-relaxed font-medium" style={{ color: theme.cardSubtext }}>
          Complete today&apos;s 5-minute drill and log your audio, video, or written proof to build your history!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-bold flex items-center gap-2" style={{ color: theme.cardTitle }}>
          <BookMarked className="w-5 h-5 text-blue-600" /> Your Logged Practice Proofs ({logs.length})
        </h2>
      </div>

      <div className="space-y-4">
        {logs.map((log) => {
          const ch = log.french_challenges;
          const type = log.type || ch?.type || "speaking";
          const config = TYPE_CONFIG[type];
          const IconComponent = config?.icon || Sparkles;
          const isVideo = log.proof_url?.includes(".webm") || log.proof_url?.includes(".mp4");

          return (
            <div
              key={log.id}
              className="p-5 rounded-3xl border shadow-md flex flex-col gap-3 transition-all"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs"
                    style={{ backgroundColor: theme.badgeBg, borderColor: theme.cardBorder, color: theme.badgeText }}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block" style={{ color: theme.cardTitle }}>
                      {config?.label || "Practice Drill"}
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: theme.cardSubtext }}>
                      {new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                <span
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                  style={{ backgroundColor: theme.badgeBg, color: theme.badgeText, borderColor: theme.cardBorder }}
                >
                  {config?.badge || "Logged"}
                </span>
              </div>

              {ch?.prompt_text && (
                <p className="text-xs font-semibold" style={{ color: theme.cardTitle }}>
                  &ldquo;{ch.prompt_text}&rdquo;
                </p>
              )}

              {/* Logged Proof Content (Text or Audio/Video Player) */}
              {log.proof_text && (
                <div
                  className="p-3 rounded-2xl border text-xs font-serif leading-relaxed"
                  style={{ backgroundColor: theme.subCardBg, borderColor: theme.cardBorder, color: theme.cardTitle }}
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider block font-bold mb-1" style={{ color: theme.cardSubtext }}>
                    Your Written Proof:
                  </span>
                  {log.proof_text}
                </div>
              )}

              {log.proof_url && (
                <div
                  className="p-3 rounded-2xl border flex flex-col gap-2.5"
                  style={{ backgroundColor: theme.subCardBg, borderColor: theme.cardBorder }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Recorded Media Proof
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (log.proof_url) {
                          downloadUniversalMedia(log.proof_url, Boolean(isVideo), `french_proof_${log.id.slice(0, 8)}`);
                        }
                      }}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer shadow-xs active:scale-95"
                      style={{ backgroundColor: theme.primaryBtnBg, color: theme.primaryBtnText, borderColor: theme.cardBorder }}
                      title="Download recorded proof to your local device"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>

                  {isVideo ? (
                    <video controls src={log.proof_url} className="w-full rounded-xl aspect-video bg-black" />
                  ) : (
                    <audio controls src={log.proof_url} className="w-full rounded-xl" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Challenge Tab Component ───────────────────────────────────────────────────
function ChallengeTab({
  challenge,
  streak,
  isCompleted,
  onComplete,
  onGenerate,
  generating,
  generationCount,
  maxAllowed,
  user,
  onRequireAuth,
  theme,
}: {
  challenge: Challenge | null;
  streak: Streak | null;
  isCompleted: boolean;
  onComplete: (newStreak: Streak) => void;
  onGenerate: () => void;
  generating: boolean;
  generationCount: number;
  maxAllowed: number;
  user: User | null;
  onRequireAuth: () => void;
  theme: (typeof THEMES)["cowrywise"];
}) {
  const [audioBlob, setAudioBlob] = useState<{ blob: Blob; ext: string } | null>(null);
  const [writingText, setWritingText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const config = challenge ? TYPE_CONFIG[challenge.type] : null;
  const IconComponent = config?.icon || Sparkles;

  const handleRecorded = useCallback((blob: Blob, ext: string) => {
    setAudioBlob({ blob, ext });
  }, []);

  const insertAccent = (char: string) => {
    setWritingText((prev) => prev + char);
  };

  const handleSubmit = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    if (!challenge) return;
    setSubmitting(true);

    try {
      let proofUrl: string | undefined;
      let proofText: string | undefined;

      if (audioBlob && (challenge.type === "speaking" || challenge.type === "reading")) {
        const fd = new FormData();
        fd.append("audio", audioBlob.blob, `recording.${audioBlob.ext}`);
        const uploadRes = await fetch("/api/french/upload", { method: "POST", body: fd });
        if (!uploadRes.ok) throw new Error("Audio upload failed");
        const uploadData = (await uploadRes.json()) as { url?: string };
        if (!uploadData.url) throw new Error("No upload URL returned");
        proofUrl = uploadData.url;
      }

      if (challenge.type === "writing") {
        if (!writingText.trim()) {
          toast.error("Please write a response before submitting.");
          setSubmitting(false);
          return;
        }
        proofText = writingText.trim();
      }

      const res = await fetch("/api/french/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge_id: challenge.id,
          type: challenge.type,
          proof_text: proofText,
          proof_url: proofUrl,
        }),
      });

      if (!res.ok) throw new Error("Submission failed");
      const data = (await res.json()) as { ok: boolean; usedFreeze?: boolean; streak: Streak };
      if (data.usedFreeze) {
        toast.info("❄️ A Streak Freeze protected your streak!");
      }
      onComplete(data.streak);
    } catch (err) {
      console.error(err);
      toast.error("Could not save proof. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center py-12 px-6 rounded-3xl border shadow-xl"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
        }}
      >
        <div
          className="w-16 h-16 rounded-full border flex items-center justify-center mb-4 shadow-lg bg-emerald-50 border-emerald-200"
        >
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>

        <h3 className="text-xl font-serif font-bold tracking-tight" style={{ color: theme.cardTitle }}>Challenge Completed!</h3>
        <p className="text-xs max-w-xs mt-2 leading-relaxed font-medium" style={{ color: theme.cardSubtext }}>
          Great job! You can practice another prompt or come back tomorrow at 10 PM.
        </p>

        {streak && (
          <div
            className="grid grid-cols-3 gap-3 w-full max-w-xs mt-8 p-4 rounded-2xl border"
            style={{ backgroundColor: theme.subCardBg, borderColor: theme.cardBorder }}
          >
            <div className="flex flex-col items-center">
              <span className="text-xl font-extrabold text-amber-500">{streak.current_streak}</span>
              <span className="text-[10px] font-mono uppercase font-bold mt-0.5" style={{ color: theme.cardSubtext }}>Streak</span>
            </div>
            <div className="flex flex-col items-center border-x px-2" style={{ borderColor: theme.cardBorder }}>
              <span className="text-xl font-extrabold" style={{ color: theme.cardTitle }}>{streak.total_completions}</span>
              <span className="text-[10px] font-mono uppercase font-bold mt-0.5" style={{ color: theme.cardSubtext }}>Done</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-extrabold text-sky-600">{streak.streak_freezes ?? 2}/2</span>
              <span className="text-[10px] font-mono uppercase font-bold mt-0.5" style={{ color: theme.cardSubtext }}>Freezes</span>
            </div>
          </div>
        )}

        {generationCount < maxAllowed && (
          <button
            type="button"
            onClick={user ? onGenerate : onRequireAuth}
            disabled={generating}
            className="mt-6 py-3 px-6 rounded-2xl font-bold text-xs flex items-center gap-2 border shadow-md cursor-pointer transition-all active:scale-95"
            style={{ backgroundColor: theme.primaryBtnBg, color: theme.primaryBtnText, borderColor: theme.cardBorder }}
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> Generate Another Challenge ({generationCount}/{maxAllowed})
          </button>
        )}
      </motion.div>
    );
  }

  if (!challenge) {
    return (
      <div
        className="flex flex-col items-center justify-center py-8 sm:py-10 px-5 text-center rounded-3xl border shadow-xl"
        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
      >
        <Sparkles className="w-10 h-10 animate-pulse mb-3 text-amber-500" />
        <h3 className="text-lg font-serif font-bold" style={{ color: theme.cardTitle }}>No Prompt Loaded Yet</h3>
        <p className="text-xs max-w-xs mt-2 leading-relaxed font-medium mb-6" style={{ color: theme.cardSubtext }}>
          Anyone can view & test prompts, but tap below to generate a fresh 5-minute French challenge!
        </p>

        <button
          type="button"
          onClick={user ? onGenerate : onRequireAuth}
          disabled={generating || generationCount >= maxAllowed}
          className="py-3.5 px-6 rounded-2xl font-bold text-xs flex items-center gap-2 border shadow-xl cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          style={{ backgroundColor: theme.primaryBtnBg, color: theme.primaryBtnText, borderColor: theme.cardBorder }}
        >
          {generating ? (
            <>
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Generating Prompt…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" /> Generate Today&apos;s First Challenge (0/{maxAllowed})
            </>
          )}
        </button>
      </div>
    );
  }

  const isAudioChallenge = challenge.type === "speaking" || challenge.type === "reading";
  const canSubmit = !submitting && (challenge.type === "writing" ? writingText.trim().length > 0 : !!audioBlob);

  return (
    <div className="flex flex-col gap-5">
      {/* 3-Step Guided Studio Stepper Bar */}
      <div className="p-2 sm:p-2.5 rounded-2xl border shadow-md flex items-center justify-between gap-1 overflow-x-auto no-scrollbar" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-xl flex items-center justify-center bg-blue-600 text-white font-mono font-bold text-[10px] sm:text-xs shadow-xs">1</span>
          <span className="text-[11px] sm:text-xs font-bold" style={{ color: theme.cardTitle }}>1. Understand</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0 opacity-70" />
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-xl flex items-center justify-center font-mono font-bold text-[10px] sm:text-xs transition-colors shadow-xs ${canSubmit ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"}`}>2</span>
          <span className="text-[11px] sm:text-xs font-bold" style={{ color: theme.cardTitle }}>{isAudioChallenge ? "2. Record Teleprompter" : "2. Write Proof"}</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0 opacity-70" />
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-xl flex items-center justify-center font-mono font-bold text-[10px] sm:text-xs transition-colors shadow-xs ${canSubmit ? "bg-blue-600 text-white animate-pulse" : "bg-gray-400 text-white"}`}>3</span>
          <span className="text-[11px] sm:text-xs font-bold" style={{ color: canSubmit ? theme.cardTitle : theme.cardSubtext }}>3. Submit</span>
        </div>
      </div>

      {/* Main Challenge Card */}
      <div
        className="rounded-3xl p-5 sm:p-7 border shadow-xl transition-all relative overflow-hidden"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm"
              style={{ backgroundColor: theme.badgeBg, borderColor: theme.cardBorder, color: theme.badgeText }}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest block" style={{ color: theme.badgeText }}>
                {config?.badge}
              </span>
              <h2 className="text-base sm:text-lg font-bold" style={{ color: theme.cardTitle }}>{config?.label}</h2>
            </div>
          </div>

          <span
            className="text-[10px] font-mono font-bold px-3 py-1 rounded-full border"
            style={{ backgroundColor: theme.badgeBg, color: theme.badgeText, borderColor: theme.cardBorder }}
          >
            5 min drill
          </span>
        </div>

        {/* Prompt Header */}
        <p className="text-base sm:text-lg font-bold leading-relaxed tracking-tight" style={{ color: theme.cardTitle }}>
          {challenge.prompt_text}
        </p>

        {/* Interactive Target Passage with Word Inspector & Translation */}
        {challenge.example_text && (
          <InteractiveTargetPassage
            text={challenge.example_text}
            englishTranslation={challenge.english_translation}
            theme={theme}
          />
        )}

        <p className="mt-4 text-xs font-semibold" style={{ color: theme.cardSubtext }}>{config?.hint}</p>
      </div>

      {/* Input Module with Teleprompter Mode */}
      {isAudioChallenge && (
        <MediaRecorderModule
          onRecorded={handleRecorded}
          targetText={challenge.example_text}
          theme={theme}
        />
      )}


      {challenge.type === "writing" && (
        <div className="flex flex-col gap-2">
          {/* French Accents Keyboard Toolbar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1">
            <span className="text-[10px] font-mono uppercase tracking-wider shrink-0 mr-1 font-bold" style={{ color: theme.headerSubtext }}>
              Accents:
            </span>
            {FRENCH_ACCENTS.map((char) => (
              <button
                key={char}
                type="button"
                onClick={() => insertAccent(char)}
                className="w-8 h-8 rounded-xl border font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.cardTitle }}
              >
                {char}
              </button>
            ))}
          </div>

          <div className="relative">
            <textarea
              id="french-writing-input"
              className="w-full rounded-3xl p-5 text-sm min-h-[140px] border focus:outline-none transition-all resize-none shadow-inner font-medium"
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.inputText,
              }}
              placeholder="Écrivez votre réponse en français ici…"
              value={writingText}
              onChange={(e) => setWritingText(e.target.value)}
            />
            <div className="absolute bottom-4 right-4 text-[10px] font-mono font-bold" style={{ color: theme.cardSubtext }}>
              {writingText.trim().length} chars
            </div>
          </div>
        </div>
      )}

      {/* Submit Action */}
      <button
        id="french-submit-btn"
        type="button"
        onClick={user ? handleSubmit : onRequireAuth}
        disabled={!canSubmit && !!user}
        className="w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          backgroundColor: canSubmit ? theme.primaryBtnBg : theme.secondaryBtnBg,
          color: canSubmit ? theme.primaryBtnText : theme.secondaryBtnText,
          borderColor: theme.secondaryBtnBorder,
          boxShadow: canSubmit ? `0 8px 24px ${theme.accentGlow}` : "none",
        }}
      >
        {submitting ? (
          "Saving your proof…"
        ) : !user ? (
          <>
            <Lock className="w-4 h-4" /> Sign In to Log Proof & Update Streak
          </>
        ) : !canSubmit ? (
          isAudioChallenge ? (
            <>
              <Mic className="w-4 h-4 text-amber-400" /> Record Audio or Video Proof Above to Complete
            </>
          ) : (
            <>
              <PenTool className="w-4 h-4 text-amber-400" /> Write your French response above to complete
            </>
          )
        ) : (
          <>
            Complete Challenge & Log Proof <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}

// ── Vocab Vault Tab Component ─────────────────────────────────────────────────
function VocabTab({
  theme,
  user,
  onRequireAuth,
  onSelectEntry,
}: {
  theme: (typeof THEMES)["cowrywise"];
  user: User | null;
  onRequireAuth: () => void;
  onSelectEntry: (entry: VocabEntry) => void;
}) {
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "word" | "sentence">("all");
  const [entryType, setEntryType] = useState<"word" | "sentence">("word");
  const [frenchText, setFrenchText] = useState("");
  const [englishMeaning, setEnglishMeaning] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/french/vocab");
      const data = (await res.json()) as { entries: VocabEntry[] };
      setEntries(data.entries ?? []);
    } catch {
      toast.error("Failed to load vocabulary list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const insertFormAccent = (char: string) => {
    setFrenchText((prev) => prev + char);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }
    if (!frenchText.trim() || !englishMeaning.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/french/vocab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_type: entryType,
          french_text: frenchText,
          english_meaning: englishMeaning,
          notes,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = (await res.json()) as { entry: VocabEntry };
      setEntries((prev) => [data.entry, ...prev]);
      setFrenchText("");
      setEnglishMeaning("");
      setNotes("");
      setShowForm(false);
      toast.success("Saved to Vocab Vault! 🇫🇷");
    } catch {
      toast.error("Failed to save entry. Try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onRequireAuth();
      return;
    }
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    try {
      const res = await fetch("/api/french/vocab", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        await fetchEntries();
        toast.error("Deletion failed.");
      }
    } catch {
      await fetchEntries();
      toast.error("Deletion failed.");
    }
  };

  const filtered = entries.filter((e) => {
    const matchesSearch =
      e.french_text.toLowerCase().includes(search.toLowerCase()) ||
      e.english_meaning.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === "all" || e.entry_type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.iconColor }} />
            <input
              id="french-vocab-search"
              className="w-full rounded-2xl pl-10 pr-4 py-2.5 text-xs border focus:outline-none transition-all font-semibold shadow-sm"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
                color: theme.cardTitle,
              }}
              placeholder="Search vocabulary & meanings…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            id="french-vocab-add-btn"
            type="button"
            onClick={() => {
              if (!user) {
                onRequireAuth();
                return;
              }
              setShowForm((s) => !s);
            }}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer shrink-0 shadow-sm"
            style={{
              backgroundColor: showForm ? theme.secondaryBtnBg : theme.primaryBtnBg,
              color: showForm ? theme.cardTitle : theme.primaryBtnText,
              borderColor: theme.cardBorder,
            }}
          >
            {showForm ? "Cancel" : <><Plus className="w-3.5 h-3.5" /> Add Entry</>}
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-1.5 p-1 rounded-xl border" style={{ backgroundColor: theme.navBg, borderColor: theme.navBorder }}>
            {(["all", "word", "sentence"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className="px-3 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer"
                style={{
                  backgroundColor: filterType === t ? theme.tabActiveBg : "transparent",
                  color: filterType === t ? theme.tabActiveText : theme.tabInactiveText,
                }}
              >
                {t === "all" ? "All" : t === "word" ? "Words" : "Sentences"}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono font-bold" style={{ color: theme.headerSubtext }}>{filtered.length} saved</span>
        </div>
      </div>

      {/* Add Form Drawer */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            onSubmit={handleAdd}
            className="rounded-3xl p-5 flex flex-col gap-3 border shadow-xl"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: theme.badgeText }}>New Entry</span>
              <div className="flex gap-1.5">
                {(["word", "sentence"] as const).map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setEntryType(t)}
                    className="px-3 py-1 rounded-lg text-[10px] font-mono uppercase font-bold transition-all cursor-pointer"
                    style={{
                      backgroundColor: entryType === t ? theme.primaryBtnBg : theme.secondaryBtnBg,
                      color: entryType === t ? theme.primaryBtnText : theme.cardTitle,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent helper toolbar */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {FRENCH_ACCENTS.map((char) => (
                <button
                  key={char}
                  type="button"
                  onClick={() => insertFormAccent(char)}
                  className="w-7 h-7 rounded-lg border text-xs font-bold shrink-0 cursor-pointer"
                  style={{ backgroundColor: theme.secondaryBtnBg, borderColor: theme.cardBorder, color: theme.cardTitle }}
                >
                  {char}
                </button>
              ))}
            </div>

            <input
              id="french-vocab-french-input"
              required
              className="rounded-2xl px-4 py-3 text-xs border focus:outline-none transition-all font-medium"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }}
              placeholder={entryType === "word" ? "French word (e.g. 'incontournable')" : "French phrase / sentence"}
              value={frenchText}
              onChange={(e) => setFrenchText(e.target.value)}
            />

            <input
              id="french-vocab-english-input"
              required
              className="rounded-2xl px-4 py-3 text-xs border focus:outline-none transition-all font-medium"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }}
              placeholder="English translation"
              value={englishMeaning}
              onChange={(e) => setEnglishMeaning(e.target.value)}
            />

            <input
              id="french-vocab-notes-input"
              className="rounded-2xl px-4 py-3 text-xs border focus:outline-none transition-all font-medium"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }}
              placeholder="Notes or memory hook (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <button
              type="submit"
              disabled={adding || !frenchText.trim() || !englishMeaning.trim()}
              className="py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg"
              style={{ backgroundColor: theme.primaryBtnBg, color: theme.primaryBtnText }}
            >
              {adding ? "Saving…" : "Save Entry"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Vault List — High-Contrast Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/10 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-3xl border shadow-lg" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <BookMarked className="w-8 h-8 mb-2 opacity-60" style={{ color: theme.iconColor }} />
          <p className="text-xs font-semibold" style={{ color: theme.cardSubtext }}>
            {search ? "No vocabulary matches your search." : "Your vault is empty. Log new words or phrases above!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onSelectEntry(entry)}
              className="rounded-2xl p-4 border flex items-start justify-between gap-3 group transition-all hover:scale-[1.02] cursor-pointer shadow-md"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block border"
                    style={{ backgroundColor: theme.badgeBg, color: theme.badgeText, borderColor: theme.cardBorder }}
                  >
                    {entry.entry_type}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakFrench(entry.french_text);
                    }}
                    className="p-1 transition-colors cursor-pointer"
                    style={{ color: theme.iconColor }}
                    title="Pronounce French word"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="text-sm font-bold tracking-tight" style={{ color: theme.cardTitle }}>{entry.french_text}</h4>
                <p className="text-xs font-bold mt-0.5 truncate" style={{ color: theme.englishText }}>{entry.english_meaning}</p>
                {entry.notes && (
                  <p className="text-[11px] italic mt-1.5 border-l-2 pl-2 truncate" style={{ borderColor: theme.cardBorder, color: theme.cardSubtext }}>
                    {entry.notes}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => handleDelete(entry.id, e)}
                className="p-1 transition-all rounded-lg cursor-pointer hover:text-red-500"
                style={{ color: theme.iconColor }}
                aria-label={`Delete ${entry.french_text}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── VAPID Base64 Converter ──────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

// ── Notification Button Component (Bulletproof Push Subscription) ────────────
function NotificationButton({
  onSubscribed,
  user,
  onRequireAuth,
  theme,
}: {
  onSubscribed: () => void;
  user: User | null;
  onRequireAuth: () => void;
  theme: (typeof THEMES)["cowrywise"];
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "granted" | "denied">("idle");

  const enable = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      toast.error("VAPID Key not found in environment settings. Please configure NEXT_PUBLIC_VAPID_PUBLIC_KEY.");
      return;
    }

    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Push notifications are not supported in this browser environment.");
      return;
    }

    setStatus("loading");

    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus("denied");
        toast.error("Notification permission blocked. Please enable notifications in your browser settings.");
        return;
      }

      let reg = await navigator.serviceWorker.getRegistration("/french");
      if (!reg) {
        reg = await navigator.serviceWorker.register("/sw.js", { scope: "/french" });
      }

      const subscribePromise = reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Push registration timed out. Please retry.")), 6000)
      );

      const sub = await Promise.race([subscribePromise, timeoutPromise]);

      const res = await fetch("/api/french/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      if (!res.ok) throw new Error("Failed to save push subscription to database.");

      setStatus("granted");
      onSubscribed();
      toast.success("Daily Web Push active! Reminders sent at your scheduled time 🔔");
    } catch (err: unknown) {
      console.error("[french/webpush]", err);
      setStatus("idle");
      const message = err instanceof Error ? err.message : "Failed to enable notifications.";
      toast.error(message);
    }
  };

  if (status === "granted") return null;

  return (
    <button
      id="french-enable-notifications-btn"
      type="button"
      onClick={enable}
      disabled={status === "loading" || status === "denied"}
      className="w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] border shadow-md disabled:opacity-50 cursor-pointer"
      style={{
        backgroundColor: theme.cardBg,
        borderColor: theme.cardBorder,
        color: theme.cardTitle,
      }}
    >
      {status === "loading" ? (
        <>
          <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
          Enabling Push Reminders…
        </>
      ) : status === "denied" ? (
        <>
          <BellOff className="w-4 h-4 text-red-500" /> Notifications blocked in browser settings
        </>
      ) : (
        <>
          <Bell className="w-4 h-4 shrink-0 text-blue-600" /> Activate Daily Web Push Notifications
        </>
      )}
    </button>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function FrenchPage() {
  const [activeTab, setActiveTab] = useState<"challenge" | "vocab" | "history">("challenge");
  const [themeMode, setThemeMode] = useState<ThemeMode>("cowrywise");

  // User Auth State
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // On-demand challenge state
  const [todayChallenges, setTodayChallenges] = useState<Challenge[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [generationCount, setGenerationCount] = useState(0);
  const [maxAllowed, setMaxAllowed] = useState(5);
  const [generating, setGenerating] = useState(false);

  const [streak, setStreak] = useState<Streak | null>(null);
  const [completedToday, setCompletedToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showScheduleDrawer, setShowScheduleDrawer] = useState(false);
  const [selectedVocabEntry, setSelectedVocabEntry] = useState<VocabEntry | null>(null);

  const [notifSupported, setNotifSupported] = useState(false);
  const [notifSubscribed, setNotifSubscribed] = useState(false);

  const theme = THEMES[themeMode];

  // Pre-warm SpeechSynthesis Voices
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }, []);

  // Auth session listener
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const initPush = async () => {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        return;
      }
      setNotifSupported(true);
      try {
        const reg = await navigator.serviceWorker.getRegistration("/french");
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          setNotifSubscribed(!!sub);
        }
      } catch {
        // Non-fatal
      }
    };
    initPush();
  }, []);

  const fetchTodayData = useCallback(async () => {
    try {
      const res = await fetch("/api/french/today");
      if (!res.ok) throw new Error("Failed to fetch today's challenge");
      const data = (await res.json()) as {
        challenges: Challenge[];
        activeChallenge: Challenge | null;
        completedIds: string[];
        generationCount: number;
        maxAllowed: number;
        streak: Streak | null;
        completedToday: boolean;
      };

      setTodayChallenges(data.challenges ?? []);
      setActiveChallenge(data.activeChallenge);
      setCompletedIds(data.completedIds ?? []);
      setGenerationCount(data.generationCount ?? 0);
      setMaxAllowed(data.maxAllowed ?? 5);
      setStreak(data.streak);
      setCompletedToday(data.completedToday);
    } catch {
      toast.error("Could not load today's challenge.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayData();
  }, [fetchTodayData]);

  // On-Demand Generation Handler
  const handleGeneratePrompt = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (generationCount >= maxAllowed) {
      toast.info(`Daily limit reached (${generationCount}/${maxAllowed}). You can practice any of today's prompts below!`);
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/french/generate", { method: "POST" });
      const data = (await res.json()) as {
        ok: boolean;
        challenge?: Challenge;
        count: number;
        maxAllowed: number;
        challenges: Challenge[];
        error?: string;
      };

      if (data.ok && data.challenge) {
        setTodayChallenges(data.challenges);
        setActiveChallenge(data.challenge);
        setGenerationCount(data.count);
        toast.success(`✨ Fresh Prompt #${data.count} Generated!`);
      } else if (data.error) {
        toast.info(data.error);
      }
    } catch {
      toast.error("Could not generate prompt.");
    } finally {
      setGenerating(false);
    }
  };

  const handleComplete = (newStreak: Streak) => {
    setStreak(newStreak);
    if (activeChallenge) {
      setCompletedIds((prev) => [...prev, activeChallenge.id]);
    }
    setCompletedToday(true);
    setShowConfetti(true);
    toast.success(`🔥 ${newStreak.current_streak} Day Streak Unlocked!`);
    setTimeout(() => setShowConfetti(false), 3500);
  };

  const handleSelectDrill = (ch: Challenge) => {
    setActiveChallenge(ch);
    if (typeof window !== "undefined") {
      const studioEl = document.getElementById("french-studio-container");
      if (studioEl) {
        studioEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    toast.info("Signed out");
  };

  const todayDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="min-h-screen flex flex-col antialiased transition-colors duration-300"
      style={{
        backgroundColor: theme.bg,
        color: theme.headerText,
      }}
    >
      <Confetti active={showConfetti} />

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        theme={theme}
      />

      <StreakCalendarModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        streak={streak}
        theme={theme}
      />

      <VocabDetailModal
        entry={selectedVocabEntry}
        onClose={() => setSelectedVocabEntry(null)}
        theme={theme}
      />

      {/* Header — Mobile Safe Area Top Insets & Sticky Blur Navigation Bar */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-300 px-4 sm:px-8 py-3 w-full"
        style={{
          backgroundColor: `${theme.bg}F2`,
          borderColor: "rgba(255,255,255,0.15)",
          paddingTop: "max(0.75rem, env(safe-area-inset-top))",
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Left */}
          <div className="flex items-center gap-3 min-w-0">
            <AppLogo />
            <div className="min-w-0">
              <h1
                className="text-lg sm:text-2xl font-serif font-bold tracking-tight leading-none truncate"
                style={{ color: theme.headerText }}
              >
                French Daily
              </h1>
              <p className="text-xs mt-1 truncate font-medium flex items-center gap-1 opacity-90" style={{ color: theme.headerSubtext }}>
                <span>{todayDateStr}</span>
                <span className="hidden sm:inline">• On-Demand Practice</span>
              </p>
            </div>
          </div>

          {/* Controls Right */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Streak Pill */}
            <button
              type="button"
              onClick={() => setShowStreakModal(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl border transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md font-bold text-xs"
              style={{
                backgroundColor: theme.streakBtnBg,
                borderColor: theme.headerBtnBorder,
                color: theme.streakBtnText,
              }}
              title="View Duolingo-style Streak Calendar & Freezes"
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
              <span>{streak?.current_streak ?? 0}</span>
            </button>

            {/* Daily Schedule Toggle Button */}
            <button
              type="button"
              onClick={() => setShowScheduleDrawer((s) => !s)}
              className="p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm relative"
              style={{
                backgroundColor: showScheduleDrawer ? theme.primaryBtnBg : theme.headerBtnBg,
                borderColor: theme.headerBtnBorder,
                color: showScheduleDrawer ? theme.primaryBtnText : theme.headerBtnText,
              }}
              title="Notification & Reminder Schedule Settings"
            >
              <Clock className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => {
                const modes: ThemeMode[] = ["cowrywise", "light", "noir"];
                const nextIndex = (modes.indexOf(themeMode) + 1) % modes.length;
                setThemeMode(modes[nextIndex]);
                toast.info(`Theme: ${THEMES[modes[nextIndex]].name}`);
              }}
              className="p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
              style={{
                backgroundColor: theme.headerBtnBg,
                borderColor: theme.headerBtnBorder,
                color: theme.headerBtnText,
              }}
              title="Switch Theme (Cowrywise Cobalt / Pure Light / Noir)"
            >
              <Palette className="w-4 h-4" />
            </button>

            {/* User Auth Button */}
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-2xl border transition-all cursor-pointer text-xs font-bold hover:scale-105 active:scale-95 shadow-sm"
                style={{
                  backgroundColor: theme.headerBtnBg,
                  borderColor: theme.headerBtnBorder,
                  color: theme.headerBtnText,
                }}
                title={`Signed in as ${user.email} (Tap to Sign Out)`}
              >
                <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline max-w-[100px] truncate">{user.email?.split("@")[0]}</span>
                <LogOut className="w-3.5 h-3.5 opacity-70" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-2xl border transition-all cursor-pointer text-xs font-bold hover:scale-105 active:scale-95 shadow-md"
                style={{
                  backgroundColor: theme.primaryBtnBg,
                  color: theme.primaryBtnText,
                  borderColor: theme.cardBorder,
                }}
                title="Sign in to save vocabulary and track streaks"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Reminder Schedule & Push Notification Settings Drawer */}
        <AnimatePresence>
          {showScheduleDrawer && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden max-w-7xl mx-auto"
            >
              <div className="pt-3 flex flex-col gap-2">
                <ReminderTimeSettings
                  user={user}
                  onRequireAuth={() => setShowAuthModal(true)}
                  theme={theme}
                />

                {notifSupported && !notifSubscribed && (
                  <NotificationButton
                    onSubscribed={() => setNotifSubscribed(true)}
                    user={user}
                    onRequireAuth={() => setShowAuthModal(true)}
                    theme={theme}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Segmented Tab Navigation Pill */}
      <div
        className="px-4 sm:px-8 pt-4 pb-2 max-w-7xl mx-auto w-full"
        style={{
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
        }}
      >
        <div
          className="relative flex max-w-md rounded-2xl p-1 border shadow-sm"
          style={{ backgroundColor: theme.navBg, borderColor: theme.navBorder }}
        >
          {(["challenge", "vocab", "history"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                id={`french-tab-${tab}`}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="relative flex-1 py-2 text-xs font-bold transition-colors duration-200 z-10 flex items-center justify-center gap-1.5 cursor-pointer"
                style={{ color: isActive ? theme.tabActiveText : theme.tabInactiveText }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 rounded-xl shadow-md -z-10"
                    style={{ backgroundColor: theme.tabActiveBg }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {tab === "challenge" ? (
                  <>
                    <Zap className="w-3.5 h-3.5" /> Challenge
                  </>
                ) : tab === "vocab" ? (
                  <>
                    <BookMarked className="w-3.5 h-3.5" /> Vocab Vault
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3.5 h-3.5" /> Proof History
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <main
        id="main-content"
        className="flex-1 px-4 sm:px-8 pt-2 max-w-7xl mx-auto w-full"
        style={{
          paddingBottom: "max(3.5rem, env(safe-area-inset-bottom))",
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "challenge" ? (
              loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 h-80 rounded-3xl bg-white/10 animate-pulse" />
                  <div className="lg:col-span-4 h-80 rounded-3xl bg-white/10 animate-pulse" />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Mobile & Tablet Today's Prompt Bar */}
                  <div className="lg:hidden flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border bg-white/10 backdrop-blur-md" style={{ borderColor: theme.navBorder }}>
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider shrink-0 mr-1" style={{ color: theme.headerSubtext }}>
                        Today&apos;s Prompts ({todayChallenges.length}):
                      </span>
                      {todayChallenges.map((ch, idx) => {
                        const isActive = activeChallenge?.id === ch.id;
                        const isDone = completedIds.includes(ch.id);
                        const typeEmoji = ch.type === "speaking" ? "🗣️" : ch.type === "writing" ? "✍️" : "📖";
                        return (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => handleSelectDrill(ch)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 border"
                            style={{
                              backgroundColor: isActive ? theme.primaryBtnBg : theme.secondaryBtnBg,
                              color: isActive ? theme.primaryBtnText : theme.cardTitle,
                              borderColor: isActive ? theme.primaryBtnBg : theme.cardBorder,
                            }}
                          >
                            <span>{typeEmoji} #{idx + 1}</span>
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />}
                          </button>
                        );
                      })}
                    </div>

                    {generationCount < maxAllowed && (
                      <button
                        type="button"
                        onClick={handleGeneratePrompt}
                        disabled={generating}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border cursor-pointer shrink-0 shadow-sm"
                        style={{
                          backgroundColor: theme.primaryBtnBg,
                          color: theme.primaryBtnText,
                          borderColor: theme.cardBorder,
                        }}
                      >
                        {generating ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Generating…
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Generate Prompt ({generationCount}/{maxAllowed})
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* 12-Column Desktop Grid Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Main Challenge Studio (Left 7-8 Columns) */}
                    <div id="french-studio-container" className="lg:col-span-7 xl:col-span-8 scroll-mt-24">
                      <ChallengeTab
                        challenge={activeChallenge}
                        streak={streak}
                        isCompleted={activeChallenge ? completedIds.includes(activeChallenge.id) : false}
                        onComplete={handleComplete}
                        onGenerate={handleGeneratePrompt}
                        generating={generating}
                        generationCount={generationCount}
                        maxAllowed={maxAllowed}
                        user={user}
                        onRequireAuth={() => setShowAuthModal(true)}
                        theme={theme}
                      />
                    </div>

                    {/* Desktop Command Center Sidebar (Right 4-5 Columns — Sticky) */}
                    <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col gap-5 sticky top-24">
                      {/* Today's Practice Prompts Navigator Card */}
                      <div
                        className="p-5 sm:p-6 rounded-3xl border shadow-xl flex flex-col gap-4 transition-all"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
                      >
                        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: theme.cardBorder }}>
                          <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: theme.badgeText }}>
                            <Zap className="w-4 h-4 text-amber-500" /> Today&apos;s Practice Drills ({todayChallenges.length}/5)
                          </span>
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border" style={{ backgroundColor: theme.badgeBg, color: theme.badgeText, borderColor: theme.cardBorder }}>
                            {completedIds.length}/{todayChallenges.length} Done
                          </span>
                        </div>

                        <div className="flex flex-col gap-2">
                          {todayChallenges.map((ch, idx) => {
                            const isActive = activeChallenge?.id === ch.id;
                            const isDone = completedIds.includes(ch.id);
                            const typeEmoji = ch.type === "speaking" ? "🗣️" : ch.type === "writing" ? "✍️" : "📖";
                            const typeLabel = ch.type === "speaking" ? "Oral Practice" : ch.type === "writing" ? "Composition" : "Elocution";
                            return (
                              <button
                                key={ch.id}
                                type="button"
                                onClick={() => handleSelectDrill(ch)}
                                className="p-3 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                                style={{
                                  backgroundColor: isActive ? theme.primaryBtnBg : theme.subCardBg,
                                  color: isActive ? theme.primaryBtnText : theme.cardTitle,
                                  borderColor: isActive ? theme.primaryBtnBg : theme.cardBorder,
                                }}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="text-base shrink-0">{typeEmoji}</span>
                                  <div className="min-w-0">
                                    <span className="text-xs font-bold block truncate">
                                      Drill #{idx + 1} • {typeLabel}
                                    </span>
                                    <span className="text-[10px] font-medium opacity-80 block truncate">
                                      {ch.prompt_text}
                                    </span>
                                  </div>
                                </div>

                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                                ) : (
                                  <ArrowRight className="w-4 h-4 opacity-50 shrink-0 ml-2" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {generationCount < maxAllowed && (
                          <button
                            type="button"
                            onClick={handleGeneratePrompt}
                            disabled={generating}
                            className="w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all border cursor-pointer shadow-md active:scale-95"
                            style={{
                              backgroundColor: theme.primaryBtnBg,
                              color: theme.primaryBtnText,
                              borderColor: theme.cardBorder,
                            }}
                          >
                            {generating ? (
                              <>
                                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Generating Drill…
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 text-amber-300" /> Generate Fresh Drill ({generationCount}/{maxAllowed})
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Streak Protection Widget */}
                      <div
                        className="p-5 rounded-3xl border shadow-xl flex flex-col gap-3 transition-all"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: theme.badgeText }}>
                            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" /> Streak Protection
                          </span>
                          <span className="text-xs font-extrabold font-mono text-amber-500">
                            {streak?.current_streak ?? 0} Days
                          </span>
                        </div>

                        <div
                          className="flex items-center gap-3 p-3.5 rounded-2xl border"
                          style={{ backgroundColor: theme.freezeBoxBg, borderColor: theme.freezeBoxBorder }}
                        >
                          <Snowflake className="w-5 h-5 shrink-0" style={{ color: theme.freezeBoxTitle }} />
                          <div className="text-xs">
                            <span className="font-bold block" style={{ color: theme.freezeBoxTitle }}>{streak?.streak_freezes ?? 2}/2 Streak Freezes</span>
                            <span className="text-[11px] font-medium opacity-90" style={{ color: theme.freezeBoxSubtext }}>Automatic miss protection active</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowStreakModal(true)}
                          className="w-full py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm hover:opacity-90"
                          style={{
                            backgroundColor: theme.secondaryBtnBg,
                            borderColor: theme.secondaryBtnBorder,
                            color: theme.secondaryBtnText,
                          }}
                        >
                          Open Full Duolingo Calendar
                        </button>
                      </div>

                      {/* French Ear Training Widget */}
                      <div
                        className="p-5 rounded-3xl border shadow-xl flex flex-col gap-3 transition-all"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
                      >
                        <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: theme.badgeText }}>
                          <Volume2 className="w-4 h-4 text-blue-600" /> French Ear Training
                        </span>
                        <p className="text-xs font-medium leading-relaxed" style={{ color: theme.cardSubtext }}>
                          Practice hearing native French rhythm. Tap below to listen to key idiomatic expressions:
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {["C'est la vie", "Savoir-faire", "Au fur et à mesure", "Chaque jour compte"].map((phrase) => (
                            <button
                              key={phrase}
                              type="button"
                              onClick={() => speakFrench(phrase)}
                              className="p-2.5 rounded-xl border text-xs font-serif font-bold flex items-center justify-between text-left transition-all cursor-pointer shadow-sm hover:border-blue-500"
                              style={{
                                backgroundColor: theme.subCardBg,
                                borderColor: theme.cardBorder,
                                color: theme.cardTitle,
                              }}
                            >
                              <span>&ldquo;{phrase}&rdquo;</span>
                              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : activeTab === "vocab" ? (
              <VocabTab
                theme={theme}
                user={user}
                onRequireAuth={() => setShowAuthModal(true)}
                onSelectEntry={(entry) => setSelectedVocabEntry(entry)}
              />
            ) : (
              <HistoryTab
                theme={theme}
                user={user}
                onRequireAuth={() => setShowAuthModal(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
