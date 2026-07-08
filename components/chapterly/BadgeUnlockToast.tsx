"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { ChAchievement } from "@/lib/chapterly/types";
import { BADGE_DEFS } from "@/lib/chapterly/achievements";
import { Award } from "lucide-react";

const SEEN_KEY = "chapterly_seen_badges";

function getSeenBadges(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function markBadgesSeen(ids: string[]): void {
  try {
    const seen = getSeenBadges();
    ids.forEach((id) => seen.add(id));
    localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(seen)));
  } catch {
    // localStorage unavailable — silently skip
  }
}

// CSS confetti particle (pure CSS, no canvas)
function Confetti(): React.ReactElement {
  const COLORS = ["#F59E0B", "#22C55E", "#3B82F6", "#EC4899", "#A78BFA", "#F97316"];
  const particles = Array.from({ length: 24 }, (_, i) => {
    const color = COLORS[i % COLORS.length];
    const left = `${Math.random() * 100}%`;
    const delay = `${Math.random() * 0.6}s`;
    const size = `${6 + Math.random() * 6}px`;
    const rotation = `${Math.random() * 360}deg`;
    return { color, left, delay, size, rotation, id: i };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: "2px",
            transform: `rotate(${p.rotation})`,
            animation: `confetti-fall 1.2s cubic-bezier(0.25,0.46,0.45,0.94) ${p.delay} forwards`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(200px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export function BadgeUnlockToast(): React.ReactElement {
  const [queue, setQueue] = useState<ChAchievement[]>([]);
  const [current, setCurrent] = useState<ChAchievement | null>(null);
  const [visible, setVisible] = useState(false);

  // Swipe-to-dismiss: the toast follows the finger horizontally and flies
  // off once dragged past the threshold.
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartXRef = useRef(0);

  // Check for unseen badges on mount
  useEffect(() => {
    const run = async (): Promise<void> => {
      try {
        const res = await fetch("/api/chapterly/achievements/list");
        if (!res.ok) return;
        const { achievements } = (await res.json()) as { achievements: ChAchievement[] };
        const seen = getSeenBadges();
        const newBadges = achievements.filter((a) => !seen.has(a.badge_id));
        if (newBadges.length > 0) {
          setQueue(newBadges);
        }
      } catch {
        // Silently ignore network errors
      }
    };
    void run();
  }, []);

  const dismiss = useCallback((): void => {
    setVisible(false);
    setTimeout(() => {
      setCurrent(null);
      setQueue((prev) => prev.slice(1));
    }, 400);
  }, []);

  // Show next in queue when current is null
  useEffect(() => {
    if (queue.length > 0 && !current) {
      const next = queue[0];
      markBadgesSeen([next.badge_id]);
      setCurrent(next);
      setTimeout(() => setVisible(true), 50);
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => dismiss(), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [queue, current, dismiss]);

  if (!current) return <></>;

  const def = BADGE_DEFS[current.badge_id as keyof typeof BADGE_DEFS];
  const ACCENT = "var(--ch-accent)";

  const handleTouchStart = (e: React.TouchEvent): void => {
    dragStartXRef.current = e.touches[0]?.clientX ?? 0;
    setDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent): void => {
    if (!dragging) return;
    setDragX((e.touches[0]?.clientX ?? 0) - dragStartXRef.current);
  };

  const handleTouchEnd = (): void => {
    setDragging(false);
    if (Math.abs(dragX) > 90) {
      // Fly off in the drag direction, then advance the queue
      setDragX(dragX > 0 ? 480 : -480);
      setVisible(false);
      setTimeout(() => {
        setDragX(0);
        setCurrent(null);
        setQueue((prev) => prev.slice(1));
      }, 300);
    } else {
      setDragX(0); // spring back
    }
  };

  return (
    <div
      className="fixed bottom-[24px] right-[24px] z-[100] max-[480px]:left-[24px] max-[480px]:right-[24px]"
      style={{
        transform: visible
          ? `translateX(${dragX}px) translateY(0) scale(1)`
          : `translateX(${dragX}px) translateY(${dragX === 0 ? 24 : 0}px) scale(0.95)`,
        opacity: visible ? Math.max(0, 1 - Math.abs(dragX) / 260) : 0,
        transition: dragging ? "none" : "transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease",
        touchAction: "pan-y",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="relative w-[320px] max-[480px]:w-full rounded-[16px] border border-[var(--rule)] shadow-2xl overflow-hidden"
        style={{ background: "var(--bg)" }}
      >
        <Confetti />

        {/* Top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, ${ACCENT}, color-mix(in srgb, var(--ch-accent) 40%, white))` }}
        />

        <div className="p-[20px] pt-[22px]">
          {/* Label */}
          <div className="font-mono text-[9px] tracking-[0.14em] uppercase mb-[12px]" style={{ color: ACCENT }}>
            Achievement Unlocked
          </div>

          <div className="flex items-start gap-[14px]">
            {/* Badge icon */}
            <div
              className="w-[48px] h-[48px] rounded-[12px] flex items-center justify-center shrink-0"
              style={{ background: `color-mix(in srgb, var(--ch-accent) 8%, transparent)` }}
            >
              <Award size={24} style={{ color: ACCENT }} />
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[15px] text-[var(--ink)] leading-[1.2] mb-[4px]">
                {def?.label ?? current.badge_id}
              </div>
              <div className="text-[12px] leading-[1.5] text-[var(--ink-3)]">
                {def?.description ?? "You earned a new badge!"}
              </div>
            </div>

            {/* Close */}
            <button
              onClick={dismiss}
              className="shrink-0 w-[24px] h-[24px] flex items-center justify-center rounded-[6px] border-none bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors text-[16px] leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>

          {/* Progress bar (auto-dismiss countdown) */}
          <div className="mt-[14px] h-[2px] rounded-full bg-[var(--rule)] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                background: ACCENT,
                animation: "badge-countdown 5s linear forwards",
              }}
            />
          </div>
        </div>

        <style>{`
          @keyframes badge-countdown {
            from { width: 100%; }
            to   { width: 0%; }
          }
        `}</style>
      </div>
    </div>
  );
}
