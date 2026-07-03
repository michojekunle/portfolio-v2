"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";
import { PERSONA_QUIZ } from "@/lib/flowise/persona";
import { SYSTEM_CATEGORIES, CURRENCY_SYMBOLS, PERSONA_CONFIG } from "@/lib/flowise/types";
import type { Currency, FinancialPersona, SuggestedBudget, SuggestedGoal } from "@/lib/flowise/types";

const ACCENT = "#16A34A";

const INCOME_TYPE_OPTIONS = [
  { id: "salary", label: "Salaried employee", icon: "💼" },
  { id: "freelance", label: "Freelancer / contractor", icon: "🧑‍💻" },
  { id: "business", label: "Business owner", icon: "🏪" },
  { id: "student", label: "Student / allowance", icon: "🎓" },
  { id: "mixed", label: "A mix of the above", icon: "🔀" },
];

const INCOME_RANGE_OPTIONS = [
  { id: "under_100k", label: "Under ₦100,000/month" },
  { id: "100k_300k", label: "₦100,000 - ₦300,000/month" },
  { id: "300k_700k", label: "₦300,000 - ₦700,000/month" },
  { id: "700k_1_5m", label: "₦700,000 - ₦1,500,000/month" },
  { id: "over_1_5m", label: "Over ₦1,500,000/month" },
];

const GOAL_OPTIONS = [
  { id: "save", label: "Save more money", icon: "🐷" },
  { id: "debt", label: "Pay off debt", icon: "💳" },
  { id: "track", label: "Understand where my money goes", icon: "🔍" },
  { id: "wealth", label: "Build long-term wealth", icon: "📈" },
];

const CURRENCY = "NGN" as Currency;

// Step layout: 0 income_type, 1 income_range, 2 primary_goal, 3..3+N-1 quiz questions, N+3 results
const INPUT_STEP_COUNT = 3 + PERSONA_QUIZ.length;

type SelectableCardsProps = {
  options: { id: string; label: string; icon?: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
};

function SelectableCards({ options, selected, onSelect }: SelectableCardsProps): React.ReactElement {
  return (
    <div className="space-y-[10px] pt-[8px]">
      {options.map((opt) => {
        const isSelected = selected === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className="w-full h-[54px] rounded-[12px] border px-[16px] flex items-center gap-[12px] cursor-pointer transition-all text-left bg-[var(--bg)] hover:border-[var(--ink-3)]"
            style={
              isSelected
                ? { borderColor: ACCENT, background: ACCENT + "15", color: ACCENT }
                : { borderColor: "var(--rule)" }
            }
          >
            {opt.icon && <span className="text-[18px]">{opt.icon}</span>}
            <span className="text-[13px] font-semibold">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function FlowiseOnboardingPage(): React.ReactElement {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [incomeType, setIncomeType] = useState<string | null>(null);
  const [incomeRange, setIncomeRange] = useState<string | null>(null);
  const [primaryGoal, setPrimaryGoal] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [results, setResults] = useState<{
    persona: FinancialPersona;
    welcome_message: string;
    budgets: SuggestedBudget[];
    goals: SuggestedGoal[];
  } | null>(null);
  const [selectedBudgets, setSelectedBudgets] = useState<Set<number>>(new Set());
  const [selectedGoals, setSelectedGoals] = useState<Set<number>>(new Set());

  const currentQuizQuestion = step >= 3 && step < INPUT_STEP_COUNT ? PERSONA_QUIZ[step - 3] : null;

  const canAdvance = (): boolean => {
    if (step === 0) return incomeType !== null;
    if (step === 1) return incomeRange !== null;
    if (step === 2) return primaryGoal !== null;
    if (currentQuizQuestion) return !!quizAnswers[currentQuizQuestion.id];
    return true;
  };

  const handleNext = (): void => {
    if (step < INPUT_STEP_COUNT - 1) {
      setStep(step + 1);
    } else {
      void handleGenerate();
    }
  };

  const handleBack = (): void => {
    if (step > 0) setStep(step - 1);
  };

  const handleGenerate = async (): Promise<void> => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/flowise/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          income_type: incomeType,
          monthly_income_range: incomeRange,
          primary_goal: primaryGoal,
          currency: CURRENCY,
          quiz_answers: quizAnswers,
        }),
      });

      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        throw new Error(d.error || "Failed to generate your plan");
      }

      const data = await res.json() as {
        persona: FinancialPersona;
        welcome_message: string;
        budgets: SuggestedBudget[];
        goals: SuggestedGoal[];
      };

      setResults(data);
      setSelectedBudgets(new Set(data.budgets.map((_, i) => i)));
      setSelectedGoals(new Set(data.goals.map((_, i) => i)));
      setStep(INPUT_STEP_COUNT);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBudget = (idx: number): void => {
    setSelectedBudgets((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const toggleGoal = (idx: number): void => {
    setSelectedGoals((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const handleFinish = async (): Promise<void> => {
    if (!results) return;
    setFinishing(true);
    setError(null);
    try {
      const month = new Date().toISOString().slice(0, 7);

      await Promise.all([
        ...Array.from(selectedBudgets).map((idx) => {
          const b = results.budgets[idx];
          return fetch("/api/flowise/budgets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category_id: b.category_id, month, amount: b.amount }),
          });
        }),
        ...Array.from(selectedGoals).map((idx) => {
          const g = results.goals[idx];
          return fetch("/api/flowise/goals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: g.name, target_amount: g.target_amount, deadline: g.deadline }),
          });
        }),
      ]);

      router.push("/tools/flowise");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to finish setup");
      setFinishing(false);
    }
  };

  const progress = ((Math.min(step, INPUT_STEP_COUNT) + 1) / (INPUT_STEP_COUNT + 1)) * 100;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col items-center justify-center p-[24px]">
      <div className="w-full max-w-[580px] bg-[var(--bg-2)] border border-[var(--rule)] rounded-[24px] p-[40px] max-[480px]:p-[24px] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-[var(--rule)]">
          <motion.div
            className="h-full"
            style={{ backgroundColor: ACCENT }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="flex items-center gap-[8px] mb-[32px] opacity-60">
          <Wallet size={18} style={{ color: ACCENT }} />
          <span className="font-mono text-[9px] tracking-[0.16em] uppercase">
            Flowise Setup
          </span>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }} className="space-y-[24px]">
              <div>
                <h1 className="text-[28px] max-[480px]:text-[22px] font-normal tracking-[-0.02em] leading-[1.2] m-0">
                  Where does your money come from?
                </h1>
                <p className="text-[14px] text-[var(--ink-3)] mt-[8px]">
                  This helps us tailor budgets to how your income actually works.
                </p>
              </div>
              <SelectableCards options={INCOME_TYPE_OPTIONS} selected={incomeType} onSelect={setIncomeType} />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }} className="space-y-[24px]">
              <div>
                <h1 className="text-[28px] max-[480px]:text-[22px] font-normal tracking-[-0.02em] leading-[1.2] m-0">
                  Roughly what do you bring in monthly?
                </h1>
                <p className="text-[14px] text-[var(--ink-3)] mt-[8px]">
                  Just a range — this only sizes your starter budget, you can edit everything after.
                </p>
              </div>
              <SelectableCards options={INCOME_RANGE_OPTIONS} selected={incomeRange} onSelect={setIncomeRange} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }} className="space-y-[24px]">
              <div>
                <h1 className="text-[28px] max-[480px]:text-[22px] font-normal tracking-[-0.02em] leading-[1.2] m-0">
                  What's your main money goal right now?
                </h1>
                <p className="text-[14px] text-[var(--ink-3)] mt-[8px]">
                  We'll weight your starter plan toward this.
                </p>
              </div>
              <SelectableCards options={GOAL_OPTIONS} selected={primaryGoal} onSelect={setPrimaryGoal} />
            </motion.div>
          )}

          {currentQuizQuestion && (
            <motion.div key={`quiz-${currentQuizQuestion.id}`} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }} className="space-y-[24px]">
              <div>
                <h1 className="text-[28px] max-[480px]:text-[22px] font-normal tracking-[-0.02em] leading-[1.2] m-0">
                  {currentQuizQuestion.question}
                </h1>
                <p className="text-[14px] text-[var(--ink-3)] mt-[8px]">
                  Quick gut-check question {step - 2} of {PERSONA_QUIZ.length} — there's no wrong answer.
                </p>
              </div>
              <SelectableCards
                options={currentQuizQuestion.options}
                selected={quizAnswers[currentQuizQuestion.id] ?? null}
                onSelect={(id) => setQuizAnswers((prev) => ({ ...prev, [currentQuizQuestion.id]: id }))}
              />
            </motion.div>
          )}

          {step === INPUT_STEP_COUNT && results && (
            <motion.div key="results" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }} className="space-y-[20px]">
              <div>
                <div className="flex items-center gap-[8px] mb-[8px]">
                  <span className="text-[22px]">{PERSONA_CONFIG[results.persona].icon}</span>
                  <h1 className="text-[24px] max-[480px]:text-[20px] font-normal tracking-[-0.02em] leading-[1.2] m-0">
                    You're {PERSONA_CONFIG[results.persona].label}
                  </h1>
                </div>
                <p className="text-[13px] text-[var(--ink-3)]">{results.welcome_message}</p>
              </div>

              <div>
                <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--ink-3)] mb-[10px]">
                  Starter budgets — pick what to keep
                </div>
                <div className="space-y-[8px]">
                  {results.budgets.map((b, idx) => {
                    const cat = SYSTEM_CATEGORIES.find((c) => c.id === b.category_id);
                    const isSelected = selectedBudgets.has(idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleBudget(idx)}
                        className="w-full h-[48px] rounded-[10px] border px-[14px] flex items-center justify-between cursor-pointer transition-all bg-[var(--bg)] hover:border-[var(--ink-3)]"
                        style={isSelected ? { borderColor: ACCENT, background: ACCENT + "10" } : { borderColor: "var(--rule)" }}
                      >
                        <span className="flex items-center gap-[8px] text-[13px] font-medium">
                          <span>{cat?.icon}</span> {cat?.name ?? b.category_id}
                        </span>
                        <span className="flex items-center gap-[8px]">
                          <span className="font-mono text-[11px] text-[var(--ink-3)]">
                            {CURRENCY_SYMBOLS[CURRENCY]}{b.amount.toLocaleString()}
                          </span>
                          <span
                            className="w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center"
                            style={isSelected ? { borderColor: ACCENT, background: ACCENT } : { borderColor: "var(--rule)" }}
                          >
                            {isSelected && <Check size={11} color="#fff" />}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {results.goals.length > 0 && (
                <div>
                  <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--ink-3)] mb-[10px]">
                    Starter goals — pick what to keep
                  </div>
                  <div className="space-y-[8px]">
                    {results.goals.map((g, idx) => {
                      const isSelected = selectedGoals.has(idx);
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleGoal(idx)}
                          className="w-full h-[48px] rounded-[10px] border px-[14px] flex items-center justify-between cursor-pointer transition-all bg-[var(--bg)] hover:border-[var(--ink-3)]"
                          style={isSelected ? { borderColor: ACCENT, background: ACCENT + "10" } : { borderColor: "var(--rule)" }}
                        >
                          <span className="text-[13px] font-medium">{g.name}</span>
                          <span className="flex items-center gap-[8px]">
                            <span className="font-mono text-[11px] text-[var(--ink-3)]">
                              {CURRENCY_SYMBOLS[CURRENCY]}{g.target_amount.toLocaleString()}
                            </span>
                            <span
                              className="w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center"
                              style={isSelected ? { borderColor: ACCENT, background: ACCENT } : { borderColor: "var(--rule)" }}
                            >
                              {isSelected && <Check size={11} color="#fff" />}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mt-[20px] p-[12px] rounded-[8px] text-[12px] bg-red-500/10 border border-red-500/20 text-red-500">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-[40px] pt-[20px] border-t border-[var(--rule)]">
          <button
            onClick={handleBack}
            disabled={step === 0 || submitting || finishing}
            className="flex items-center gap-[6px] font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer disabled:opacity-30 transition-all"
          >
            <ArrowLeft size={14} /> Back
          </button>

          {step < INPUT_STEP_COUNT ? (
            <button
              onClick={handleNext}
              disabled={!canAdvance() || submitting}
              className="h-[40px] px-[20px] rounded-[10px] font-mono text-[9px] tracking-[0.12em] uppercase font-semibold text-white cursor-pointer border-none flex items-center gap-[6px] transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: ACCENT }}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Building your plan…
                </>
              ) : step === INPUT_STEP_COUNT - 1 ? (
                <>
                  Generate My Plan <Sparkles size={14} />
                </>
              ) : (
                <>
                  Next Step <ArrowRight size={14} />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => void handleFinish()}
              disabled={finishing}
              className="h-[40px] px-[20px] rounded-[10px] font-mono text-[9px] tracking-[0.12em] uppercase font-semibold text-white cursor-pointer border-none flex items-center gap-[6px] transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: ACCENT }}
            >
              {finishing ? <Loader2 size={14} className="animate-spin" /> : <>Finish Setup <Check size={14} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
