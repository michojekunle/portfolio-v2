"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Target, BookOpen, Sunrise } from "lucide-react";
import { VELA_ACCENT, VELA_ACCENT_SOFT, ENERGY_LABELS } from "@/lib/journal/types";
import type { JoEntry } from "@/lib/journal/types";

interface Props {
  date: string;
  todayEntry: JoEntry | null;
  tomorrow?: string;
  tomorrowEntry?: JoEntry | null;
}

type SlideId = "priorities" | "log" | "tomorrow";

const AUTO_ADVANCE_MS = 6000;

export function DailyCTAs({ date, todayEntry, tomorrow, tomorrowEntry }: Props): React.ReactElement {
  const [order, setOrder] = useState<SlideId[]>(["priorities", "log", "tomorrow"]);
  const [active, setActive] = useState(0);

  const prioritiesCount = todayEntry?.top_priorities.length ?? 0;
  const prioritiesSet = prioritiesCount > 0;

  const accomplishedCount = todayEntry?.accomplished.length ?? 0;
  const energyLevel = todayEntry?.energy_level ?? null;
  const dayLogged = accomplishedCount > 0 || energyLevel !== null;

  const tomorrowPrioritiesCount = tomorrowEntry?.top_priorities.length ?? 0;
  const tomorrowPrioritiesSet = tomorrowPrioritiesCount > 0;

  useEffect(() => {
    const isEvening = new Date().getHours() >= 17;
    if (tomorrow) {
      if (isEvening || (prioritiesSet && dayLogged)) {
        setOrder(["tomorrow", "log", "priorities"]);
      } else {
        setOrder(["priorities", "log", "tomorrow"]);
      }
    } else {
      setOrder(isEvening ? ["log", "priorities"] : ["priorities", "log"]);
    }
  }, [tomorrow, prioritiesSet, dayLogged]);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % order.length), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [order.length]);

  const currentSlide = order[active] ?? "priorities";

  return (
    <div className="mb-10">
      <AnimatePresence mode="wait">
        {currentSlide === "priorities" ? (
          <motion.div
            key="priorities"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            <Link
              href={`/tools/journal/log/${date}?focus=priorities#priorities`}
              className="block rounded-[14px] p-5.5 no-underline transition-all hover:shadow-[0_6px_28px_rgba(0,0,0,0.1)] hover:-translate-y-0.25"
              style={
                prioritiesSet
                  ? { background: VELA_ACCENT_SOFT, border: "1.5px solid rgba(124,58,237,0.22)" }
                  : {
                      background: `linear-gradient(135deg, ${VELA_ACCENT} 0%, #6d28d9 100%)`,
                      boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
                    }
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="flex items-center gap-1.75 font-mono text-[10px] tracking-[0.14em] uppercase mb-2"
                    style={{ color: prioritiesSet ? VELA_ACCENT : "rgba(255,255,255,0.7)" }}
                  >
                    <Target size={11} />
                    {prioritiesSet ? "Today's Priorities" : "Start Today's Log"}
                  </div>
                  {prioritiesSet ? (
                    <div className="text-[15px] font-semibold" style={{ color: VELA_ACCENT }}>
                      {prioritiesCount} {prioritiesCount === 1 ? "priority" : "priorities"} set
                    </div>
                  ) : (
                    <div>
                      <div className="text-[16px] font-semibold text-white">
                        Set your priorities for today
                      </div>
                      <div className="font-mono text-[11px] mt-0.75" style={{ color: "rgba(255,255,255,0.55)" }}>
                        Priorities · Accomplishments · Reflection · Energy
                      </div>
                    </div>
                  )}
                </div>
                <ArrowRight
                  size={20}
                  style={{ color: prioritiesSet ? VELA_ACCENT : "white", flexShrink: 0, opacity: 0.7 }}
                />
              </div>
            </Link>
          </motion.div>
        ) : currentSlide === "log" ? (
          <motion.div
            key="log"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            <Link
              href={`/tools/journal/log/${date}?focus=log#log-today`}
              className="block rounded-[14px] p-5.5 no-underline transition-all hover:shadow-[0_6px_28px_rgba(0,0,0,0.1)] hover:-translate-y-0.25"
              style={
                dayLogged
                  ? { background: "rgba(22,163,74,0.08)", border: "1.5px solid rgba(22,163,74,0.22)" }
                  : {
                      background: "linear-gradient(135deg, #16A34A 0%, #15803d 100%)",
                      boxShadow: "0 4px 20px rgba(22,163,74,0.3)",
                    }
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="flex items-center gap-1.75 font-mono text-[10px] tracking-[0.14em] uppercase mb-2"
                    style={{ color: dayLogged ? "#16A34A" : "rgba(255,255,255,0.7)" }}
                  >
                    <BookOpen size={11} />
                    {dayLogged ? "Today's Entry" : "Log The Day"}
                  </div>
                  {dayLogged ? (
                    <div>
                      <div className="text-[15px] font-semibold" style={{ color: "#16A34A" }}>
                        {accomplishedCount} accomplished
                      </div>
                      {energyLevel && (
                        <div className="font-mono text-[11px] mt-0.75" style={{ color: "rgba(22,163,74,0.6)" }}>
                          {"⚡".repeat(energyLevel)} {ENERGY_LABELS[energyLevel]}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="text-[16px] font-semibold text-white">How did today go?</div>
                      <div className="font-mono text-[11px] mt-0.75" style={{ color: "rgba(255,255,255,0.55)" }}>
                        Accomplishments · Reflection · Energy
                      </div>
                    </div>
                  )}
                </div>
                <ArrowRight
                  size={20}
                  style={{ color: dayLogged ? "#16A34A" : "white", flexShrink: 0, opacity: 0.7 }}
                />
              </div>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="tomorrow"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            <Link
              href={`/tools/journal/log/${tomorrow ?? date}?focus=priorities#priorities`}
              className="block rounded-[14px] p-5.5 no-underline transition-all hover:shadow-[0_6px_28px_rgba(0,0,0,0.1)] hover:-translate-y-0.25"
              style={
                tomorrowPrioritiesSet
                  ? { background: "rgba(217,119,6,0.08)", border: "1.5px solid rgba(217,119,6,0.25)" }
                  : {
                      background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                      boxShadow: "0 4px 20px rgba(217,119,6,0.3)",
                    }
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="flex items-center gap-1.75 font-mono text-[10px] tracking-[0.14em] uppercase mb-2"
                    style={{ color: tomorrowPrioritiesSet ? "#D97706" : "rgba(255,255,255,0.7)" }}
                  >
                    <Sunrise size={12} />
                    {tomorrowPrioritiesSet ? "Tomorrow's Priorities" : "Plan Tomorrow"}
                  </div>
                  {tomorrowPrioritiesSet ? (
                    <div>
                      <div className="text-[15px] font-semibold" style={{ color: "#D97706" }}>
                        {tomorrowPrioritiesCount} {tomorrowPrioritiesCount === 1 ? "priority" : "priorities"} set for tomorrow
                      </div>
                      <div className="font-mono text-[11px] mt-0.75" style={{ color: "rgba(217,119,6,0.7)" }}>
                        Click to view or update
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[16px] font-semibold text-white">Set priorities for tomorrow</div>
                      <div className="font-mono text-[11px] mt-0.75" style={{ color: "rgba(255,255,255,0.55)" }}>
                        Get ahead of your next day &amp; start clear
                      </div>
                    </div>
                  )}
                </div>
                <ArrowRight
                  size={20}
                  style={{ color: tomorrowPrioritiesSet ? "#D97706" : "white", flexShrink: 0, opacity: 0.7 }}
                />
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide indicator — also click-to-jump */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {order.map((id, i) => (
          <button
            key={id}
            onClick={() => setActive(i)}
            aria-label={`Show ${
              id === "priorities"
                ? "set priorities"
                : id === "log"
                ? "log the day"
                : "plan tomorrow"
            } card`}
            className="h-1.5 rounded-full border-none cursor-pointer p-0 transition-all duration-300"
            style={{
              width: i === active ? "18px" : "6px",
              background:
                i === active
                  ? id === "tomorrow"
                    ? "#D97706"
                    : id === "log"
                    ? "#16A34A"
                    : VELA_ACCENT
                  : "var(--rule)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
