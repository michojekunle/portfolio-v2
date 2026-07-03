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

const ACCENT = "#4F6D7A";

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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col items-center justify-center p-[24px]">
      <div className="w-full max-w-[580px] bg-[var(--bg-2)] border border-[var(--rule)] rounded-[24px] p-[40px] max-[480px]:p-[24px] shadow-xl relative overflow-hidden">
        {/* Progress indicator */}
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-[var(--rule)]">
          <motion.div
            className="h-full"
            style={{ backgroundColor: ACCENT }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Top brand header */}
        <div className="flex items-center gap-[8px] mb-[32px] opacity-60">
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
              className="space-y-[24px]"
            >
              <div>
                <h1 className="text-[28px] max-[480px]:text-[22px] font-normal tracking-[-0.02em] leading-[1.2] m-0">
                  What areas of self-growth do you want to explore?
                </h1>
                <p className="text-[14px] text-[var(--ink-3)] mt-[8px]">
                  Select all that interest you to customize your learning recommendations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-[12px] pt-[8px]">
                {INTEREST_OPTIONS.map((opt) => {
                  const selected = interests.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleInterest(opt.id)}
                      className="h-[100px] rounded-[16px] border flex flex-col items-center justify-center gap-[8px] cursor-pointer transition-all text-center p-[12px] bg-[var(--bg)] hover:border-[var(--ink-3)]"
                      style={
                        selected
                          ? { borderColor: ACCENT, background: ACCENT + "15", color: ACCENT }
                          : { borderColor: "var(--rule)" }
                      }
                    >
                      <span className="text-[24px]">{opt.icon}</span>
                      <span className="font-mono text-[10px] tracking-[0.05em] uppercase font-semibold">
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
              className="space-y-[24px]"
            >
              <div>
                <h1 className="text-[28px] max-[480px]:text-[22px] font-normal tracking-[-0.02em] leading-[1.2] m-0">
                  What is your primary reading goal?
                </h1>
                <p className="text-[14px] text-[var(--ink-3)] mt-[8px]">
                  This helps us target the type of books and lessons we prepare.
                </p>
              </div>

              <div className="space-y-[10px] pt-[8px]">
                {GOAL_OPTIONS.map((opt) => {
                  const selected = goals.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleGoal(opt.id)}
                      className="w-full h-[54px] rounded-[12px] border px-[16px] flex items-center gap-[12px] cursor-pointer transition-all text-left bg-[var(--bg)] hover:border-[var(--ink-3)]"
                      style={
                        selected
                          ? { borderColor: ACCENT, background: ACCENT + "15", color: ACCENT }
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
              className="space-y-[24px]"
            >
              <div>
                <h1 className="text-[28px] max-[480px]:text-[22px] font-normal tracking-[-0.02em] leading-[1.2] m-0">
                  How would you describe your reading frequency?
                </h1>
                <p className="text-[14px] text-[var(--ink-3)] mt-[8px]">
                  This helps us calculate estimates for summaries and book sessions.
                </p>
              </div>

              <div className="space-y-[10px] pt-[8px]">
                {LEVEL_OPTIONS.map((opt) => {
                  const selected = readingLevel === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setReadingLevel(opt.id)}
                      className="w-full rounded-[14px] border p-[16px] flex items-start gap-[12px] cursor-pointer transition-all text-left bg-[var(--bg)] hover:border-[var(--ink-3)]"
                      style={
                        selected
                          ? { borderColor: ACCENT, background: ACCENT + "15" }
                          : { borderColor: "var(--rule)" }
                      }
                    >
                      <div className="flex-1">
                        <span className="text-[13px] font-semibold block" style={{ color: selected ? ACCENT : "var(--ink)" }}>
                          {opt.label}
                        </span>
                        <span className="text-[12px] text-[var(--ink-3)] mt-[2px] block">
                          {opt.desc}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)] border px-[8px] py-[3px] rounded-[6px]">
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
              className="space-y-[24px]"
            >
              <div>
                <h1 className="text-[28px] max-[480px]:text-[22px] font-normal tracking-[-0.02em] leading-[1.2] m-0">
                  How many minutes will you commit to each day?
                </h1>
                <p className="text-[14px] text-[var(--ink-3)] mt-[8px]">
                  Consistently reading just a few minutes daily produces massive long-term results.
                </p>
              </div>

              <div className="space-y-[20px] pt-[8px]">
                <div className="flex gap-[8px] flex-wrap justify-center">
                  {TIME_OPTIONS.map((m) => {
                    const selected = dailyMinutes === m;
                    return (
                      <button
                        key={m}
                        onClick={() => setDailyMinutes(m)}
                        className="font-mono text-[11px] tracking-[0.1em] uppercase px-[16px] py-[10px] rounded-[8px] border-none cursor-pointer transition-all font-semibold"
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
                <div className="text-center font-mono text-[11px] text-[var(--ink-3)]">
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
              className="space-y-[24px]"
            >
              <div>
                <h1 className="text-[28px] max-[480px]:text-[22px] font-normal tracking-[-0.02em] leading-[1.2] m-0">
                  Choose your annual reading goal
                </h1>
                <p className="text-[14px] text-[var(--ink-3)] mt-[8px]">
                  Setting a concrete books-finished target keeps you accountable.
                </p>
              </div>

              <div className="space-y-[20px] pt-[8px]">
                <div className="flex gap-[8px] flex-wrap justify-center">
                  {ANNUAL_OPTIONS.map((b) => {
                    const selected = annualBooks === b;
                    return (
                      <button
                        key={b}
                        onClick={() => setAnnualBooks(b)}
                        className="font-mono text-[11px] tracking-[0.1em] uppercase px-[16px] py-[10px] rounded-[8px] border-none cursor-pointer transition-all font-semibold"
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
                <div className="text-center font-mono text-[11px] text-[var(--ink-3)]">
                  📚 This is roughly {Math.round((annualBooks / 12) * 10) / 10} book summaries per month.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mt-[20px] p-[12px] rounded-[8px] text-[12px] bg-red-500/10 border border-red-500/20 text-red-500">
            {error}
          </div>
        )}

        {/* Footer controls */}
        <div className="flex items-center justify-between mt-[40px] pt-[20px] border-t border-[var(--rule)]">
          <button
            onClick={handleBack}
            disabled={step === 0 || submitting}
            className="flex items-center gap-[6px] font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer disabled:opacity-30 transition-all"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <button
            onClick={handleNext}
            disabled={submitting}
            className="h-[40px] px-[20px] rounded-[10px] font-mono text-[9px] tracking-[0.12em] uppercase font-semibold text-(--bg) cursor-pointer border-none flex items-center gap-[6px] transition-all hover:opacity-90 disabled:opacity-50"
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
