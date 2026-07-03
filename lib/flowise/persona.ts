import type { FinancialPersona } from "./types";

export interface QuizOption {
  id: string;
  label: string;
  weights: Partial<Record<FinancialPersona, number>>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export const PERSONA_QUIZ: QuizQuestion[] = [
  {
    id: "windfall",
    question: "When you get unexpected money, you...",
    options: [
      { id: "save", label: "Save or move it somewhere I won't touch it", weights: { saver: 2 } },
      { id: "spend", label: "Spend it on something I've wanted", weights: { spender: 2 } },
      { id: "invest", label: "Put it to work — invest it or reinvest in a hustle", weights: { hustler: 2 } },
      { id: "forget", label: "Honestly, I don't think much about it", weights: { avoider: 2 } },
    ],
  },
  {
    id: "tracking",
    question: "How do you currently track your spending?",
    options: [
      { id: "spreadsheet", label: "Detailed budget or spreadsheet", weights: { planner: 2 } },
      { id: "mental", label: "Rough mental estimate", weights: { spender: 1, saver: 1 } },
      { id: "none", label: "I don't really track it", weights: { avoider: 2 } },
      { id: "varies", label: "It varies — my income comes from a few places", weights: { hustler: 2 } },
    ],
  },
  {
    id: "income_shape",
    question: "Your income each month is...",
    options: [
      { id: "steady", label: "Steady and predictable", weights: { planner: 1, saver: 1 } },
      { id: "irregular", label: "Irregular, or from multiple sources", weights: { hustler: 2 } },
      { id: "unsure", label: "Enough, but I don't always know where it goes", weights: { spender: 1, avoider: 1 } },
    ],
  },
  {
    id: "feeling",
    question: "Thinking about your finances makes you feel...",
    options: [
      { id: "control", label: "In control", weights: { planner: 2 } },
      { id: "anxious", label: "Anxious — I'd rather not look", weights: { avoider: 2 } },
      { id: "motivated", label: "Motivated to earn more", weights: { hustler: 1 } },
      { id: "excited", label: "Excited to save more", weights: { saver: 1 } },
    ],
  },
];

const PERSONA_PRIORITY: FinancialPersona[] = ["planner", "saver", "hustler", "avoider", "spender"];

/** answers: map of question id -> selected option id */
export function classifyPersona(answers: Record<string, string>): FinancialPersona {
  const scores: Record<FinancialPersona, number> = {
    saver: 0, spender: 0, planner: 0, avoider: 0, hustler: 0,
  };

  for (const q of PERSONA_QUIZ) {
    const selectedId = answers[q.id];
    const option = q.options.find((o) => o.id === selectedId);
    if (!option) continue;
    for (const [persona, weight] of Object.entries(option.weights)) {
      scores[persona as FinancialPersona] += weight ?? 0;
    }
  }

  let best: FinancialPersona = "planner";
  let bestScore = -1;
  for (const persona of PERSONA_PRIORITY) {
    if (scores[persona] > bestScore) {
      bestScore = scores[persona];
      best = persona;
    }
  }
  return best;
}
