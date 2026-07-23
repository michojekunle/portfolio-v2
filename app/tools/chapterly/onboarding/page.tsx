"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Target,
  Clock,
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";

const ACCENT = "var(--ch-accent)";

const INTEREST_OPTIONS = [
  { id: "productivity", label: "Productivity & Habits", icon: "⚡" },
  { id: "wealth", label: "Wealth & Finance", icon: "💰" },
  { id: "psychology", label: "Psychology & Success", icon: "🧠" },
  { id: "leadership", label: "Leadership & Careers", icon: "👔" },
];

const GOAL_OPTIONS = [
  { id: "habit", label: "Build a solid reading habit", icon: "📚" },
  { id: "career", label: "Accelerate my career/business", icon: "🚀" },
  { id: "mind", label: "Broaden my perspective & mind", icon: "✨" },
  { id: "skills", label: "Learn concrete practical skills", icon: "🛠️" },
];

const LEVEL_OPTIONS = [
  { id: "beginner", label: "Beginner", desc: "Rarely read books", speed: "150 wpm" },
  { id: "intermediate", label: "Intermediate", desc: "Read about once a month", speed: "250 wpm" },
  { id: "advanced", label: "Advanced", desc: "Read weekly or daily", speed: "400 wpm" },
];

const TIME_OPTIONS = [5, 10, 15, 20, 30, 45, 60];
const ANNUAL_OPTIONS = [6, 12, 24, 36, 52];

export default function OnboardingQuizPage(): React.ReactElement {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [readingLevel, setReadingLevel] = useState("intermediate");
  const [dailyMinutes, setDailyMinutes] = useState(15);
  const [annualBooks, setAnnualBooks] = useState(12);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (id: string): void => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleGoal = (id: string): void => {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleNext = (): void => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      void handleSubmit();
    }
  };

  const handleBack = (): void => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async (): Promise<void> => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/chapterly/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          daily_minutes: dailyMinutes,
          annual_books: annualBooks,
          interests,
          goals,
          reading_level: readingLevel,
        }),
      });

      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        throw new Error(d.error || "Failed to submit onboarding quiz");
      }

      router.push("/tools/chapterly");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
      setSubmitting(false);
    }
  };

  const progress = ((step + 1) / 5) * 100;

  return (
    <div className="chapterly-root min-h-screen bg-(--bg) text-(--ink) flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-145 bg-(--bg-2) border border-(--rule) rounded-3xl p-10 max-[480px]:p-6 shadow-xl relative overflow-hidden">
        {/* Progress indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-(--rule)">
          <motion.div
            className="h-full"
            style={{ backgroundColor: ACCENT }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Top brand header */}
        <div className="flex items-center gap-2 mb-8 opacity-60">
          <Compass size={18} style={{ color: ACCENT }} />
          <span className="font-mono text-[9px] tracking-[0.16em] uppercase">
            Chapterly Mentor Onboarding
          </span>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-[28px] max-[480px]:text-[22px] font-normal tracking-[-0.02em] leading-[1.2] m-0">
                  What areas of self-growth do you want to explore?
                </h1>
                <p className="text-[14px] text-muted-foreground mt-2">
                  Select all that interest you to customize your learning recommendations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {INTEREST_OPTIONS.map((opt) => {
                  const selected = interests.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleInterest(opt.id)}
                      className="h-[100px] rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center p-3 bg-(--bg) hover:border-muted-foreground"
                      style={
                        selected
                          ? { borderColor: ACCENT, background: "color-mix(in srgb, var(--ch-accent) 8%, transparent)", color: ACCENT }
                          : { borderColor: "var(--rule)" }
                      }
                    >
                      <span className="text-[24px]">{opt.icon}</span>
                      <span className="font-mono text-[10px] tracking-wider uppercase font-semibold">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-[28px] max-[480px]:text-[22px] font-normal tracking-[-0.02em] leading-[1.2] m-0">
                  What is your primary reading goal?
                </h1>
                <p className="text-[14px] text-muted-foreground mt-2">
                  This helps us target the type of books and lessons we prepare.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {GOAL_OPTIONS.map((opt) => {
                  const selected = goals.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleGoal(opt.id)}
                      className="w-full h-[54px] rounded-xl border px-4 flex items-center gap-3 cursor-pointer transition-all text-left bg-(--bg) hover:border-muted-foreground"
                      style={
                        selected
                          ? { borderColor: ACCENT, background: "color-mix(in srgb, var(--ch-accent) 8%, transparent)", color: ACCENT }
                          : { borderColor: "var(--rule)" }
                      }
                    >
                      <span className="text-[18px]">{opt.icon}</span>
                      <span className="text-[13px] font-semibold">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-[28px] max-[480px]:text-[22px] font-normal tracking-[-0.02em] leading-[1.2] m-0">
                  How would you describe your reading frequency?
                </h1>
                <p className="text-[14px] text-muted-foreground mt-2">
                  This helps us calculate estimates for summaries and book sessions.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {LEVEL_OPTIONS.map((opt) => {
                  const selected = readingLevel === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setReadingLevel(opt.id)}
                      className="w-full rounded-[14px] border p-4 flex items-start gap-3 cursor-pointer transition-all text-left bg-(--bg) hover:border-muted-foreground"
                      style={
                        selected
                          ? { borderColor: ACCENT, background: "color-mix(in srgb, var(--ch-accent) 8%, transparent)" }
                          : { borderColor: "var(--rule)" }
                      }
                    >
                      <div className="flex-1">
                        <span className="text-[13px] font-semibold block" style={{ color: selected ? ACCENT : "var(--ink)" }}>
                          {opt.label}
                        </span>
                        <span className="text-[12px] text-muted-foreground mt-0.5 block">
                          {opt.desc}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground border px-2 py-0.75 rounded-md">
                        {opt.speed}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-[28px] max-[480px]:text-[22px] font-normal tracking-[-0.02em] leading-[1.2] m-0">
                  How many minutes will you commit to each day?
                </h1>
                <p className="text-[14px] text-muted-foreground mt-2">
                  Consistently reading just a few minutes daily produces massive long-term results.
                </p>
              </div>

              <div className="space-y-5 pt-2">
                <div className="flex gap-2 flex-wrap justify-center">
                  {TIME_OPTIONS.map((m) => {
                    const selected = dailyMinutes === m;
                    return (
                      <button
                        key={m}
                        onClick={() => setDailyMinutes(m)}
                        className="font-mono text-[11px] tracking-widest uppercase px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all font-semibold"
                        style={
                          selected
                            ? { background: ACCENT, color: "#fff" }
                            : { background: "var(--bg)", color: "var(--ink-3)", outline: "1px solid var(--rule)" }
                        }
                      >
                        {m}m
                      </button>
                    );
                  })}
                </div>
                <div className="text-center font-mono text-[11px] text-muted-foreground">
                  💡 A {dailyMinutes}-minute daily reading habit accumulates to about {Math.round((dailyMinutes * 365) / 60)} hours of learning in a year!
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-[28px] max-[480px]:text-[22px] font-normal tracking-[-0.02em] leading-[1.2] m-0">
                  Choose your annual reading goal
                </h1>
                <p className="text-[14px] text-muted-foreground mt-2">
                  Setting a concrete books-finished target keeps you accountable.
                </p>
              </div>

              <div className="space-y-5 pt-2">
                <div className="flex gap-2 flex-wrap justify-center">
                  {ANNUAL_OPTIONS.map((b) => {
                    const selected = annualBooks === b;
                    return (
                      <button
                        key={b}
                        onClick={() => setAnnualBooks(b)}
                        className="font-mono text-[11px] tracking-widest uppercase px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all font-semibold"
                        style={
                          selected
                            ? { background: ACCENT, color: "#fff" }
                            : { background: "var(--bg)", color: "var(--ink-3)", outline: "1px solid var(--rule)" }
                        }
                      >
                        {b} books
                      </button>
                    );
                  })}
                </div>
                <div className="text-center font-mono text-[11px] text-muted-foreground">
                  📚 This is roughly {Math.round((annualBooks / 12) * 10) / 10} book summaries per month.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mt-5 p-3 rounded-lg text-[12px] bg-red-500/10 border border-red-500/20 text-red-500">
            {error}
          </div>
        )}

        {/* Footer controls */}
        <div className="flex items-center justify-between mt-10 pt-5 border-t border-(--rule)">
          <button
            onClick={handleBack}
            disabled={step === 0 || submitting}
            className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest uppercase text-muted-foreground hover:text-(--ink) bg-transparent border-none cursor-pointer disabled:opacity-30 transition-all"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <button
            onClick={handleNext}
            disabled={submitting}
            className="h-10 px-5 rounded-[10px] font-mono text-[9px] tracking-[0.12em] uppercase font-semibold text-(--bg) cursor-pointer border-none flex items-center gap-1.5 transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: ACCENT }}
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : step === 4 ? (
              <>
                Finish Onboarding <Check size={14} />
              </>
            ) : (
              <>
                Next Step <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
