import type {
  AudienceOption,
  AudienceTypeId,
  IdeaCategory,
  PhaseInfo,
  PlatformId,
  ProgrammeInfo,
  ScorecardDimension,
  SpeakingFormatGuide,
  SpeakingFormatId,
  WeeklyChallengeMeta,
} from "./types";
import { PROGRAMME_END_DATE, PROGRAMME_START_DATE, PROGRAMME_TIMEZONE, PROGRAMME_TOTAL_DAYS } from "./dates";

export const PROGRAMME_INFO: ProgrammeInfo = {
  id: "90-days-of-speaking",
  name: "The Speaking Ledger",
  programmeTitle: "90 Days of Speaking",
  tagline: "90 topics. 90 conversations. A better way to communicate.",
  description: "90 days of ideas, conversations and becoming a better communicator.",
  startDate: PROGRAMME_START_DATE,
  endDate: PROGRAMME_END_DATE,
  timezone: PROGRAMME_TIMEZONE,
  totalDays: PROGRAMME_TOTAL_DAYS,
  status: "active",
};

export const SPEAKING_PHASES: PhaseInfo[] = [
  {
    number: 1,
    name: "Phase 1: Foundation — Find Your Voice",
    title: "Foundation — Find Your Voice",
    dayRange: [1, 30],
    objective:
      "Become comfortable expressing ideas, organising thoughts, speaking naturally, explaining concepts and telling stories.",
    endOutcome:
      "By the end of this phase, speak for three minutes on a subject with a clear beginning, middle and ending.",
  },
  {
    number: 2,
    name: "Phase 2: Depth — Develop Your Thinking",
    title: "Depth — Develop Your Thinking",
    dayRange: [31, 60],
    objective:
      "Develop arguments, explain complex subjects, share opinions, use analogies, defend positions and speak without depending on written scripts.",
    endOutcome:
      "By the end of this phase, communicate a complex idea, develop an argument and respond to disagreement.",
  },
  {
    number: 3,
    name: "Phase 3: Influence — Connect and Communicate",
    title: "Influence — Connect and Communicate",
    dayRange: [61, 90],
    objective:
      "Develop storytelling, persuasion, leadership communication, audience awareness, spontaneity and presentation skills.",
    endOutcome:
      "By the end of this phase, deliver a compelling 10-minute talk, even though daily assignments remain 3–5 minutes.",
  },
];

export const MONTH_TITLES: Record<1 | 2 | 3, string> = {
  1: "Month 1: Expression and Clarity",
  2: "Month 2: Intellectual Depth and Perspective",
  3: "Month 3: Connection, Leadership and Influence",
};

export const WEEKLY_CHALLENGES: WeeklyChallengeMeta[] = [
  {
    weekNumber: 1,
    monthNumber: 1,
    weekTitle: "Introducing yourself and your worldview",
    dayRange: [1, 7],
    challengeTitle: "Introduce yourself to someone new and have a meaningful conversation.",
    challengeDescription:
      "Move past small talk. Share what you are curious about, ask genuine questions, and listen carefully.",
  },
  {
    weekNumber: 2,
    monthNumber: 1,
    weekTitle: "Learning to tell stories",
    dayRange: [8, 14],
    challengeTitle: "Tell one personal story without rehearsing.",
    challengeDescription:
      "Pick a real moment from your work or life and tell it cleanly with a setup, tension, and turning point.",
  },
  {
    weekNumber: 3,
    monthNumber: 1,
    weekTitle: "Explaining ideas simply",
    dayRange: [15, 21],
    challengeTitle: "Explain a technical concept to someone outside technology.",
    challengeDescription:
      "No jargon. Anchor the explanation in an everyday analogy until the listener can explain it back.",
  },
  {
    weekNumber: 4,
    monthNumber: 1,
    weekTitle: "Opinions and personality",
    dayRange: [22, 30],
    challengeTitle: "Defend an opinion in a respectful disagreement.",
    challengeDescription:
      "State your premise clearly, acknowledge the strongest counter-argument, and stay calm and curious.",
  },
  {
    weekNumber: 5,
    monthNumber: 2,
    weekTitle: "Engineering, technology and the future",
    dayRange: [31, 37],
    challengeTitle: "Give a five-minute explanation of something difficult.",
    challengeDescription:
      "Take a non-trivial engineering or systems topic and walk through why it works and why it breaks.",
  },
  {
    weekNumber: 6,
    monthNumber: 2,
    weekTitle: "Business, products and entrepreneurship",
    dayRange: [38, 44],
    challengeTitle: "Record a mock podcast episode.",
    challengeDescription:
      "Speak in a conversational, long-form rhythm for 8–12 minutes about a product or business lesson.",
  },
  {
    weekNumber: 7,
    monthNumber: 2,
    weekTitle: "Economics, investing and society",
    dayRange: [45, 51],
    challengeTitle: "Explain one business idea from first principles.",
    challengeDescription:
      "Break down who has the problem, why existing options fail, and how value is created and captured.",
  },
  {
    weekNumber: 8,
    monthNumber: 2,
    weekTitle: "Critical thinking and intellectual independence",
    dayRange: [52, 60],
    challengeTitle: "Argue both sides of the same issue.",
    challengeDescription:
      "Steelman the position you hold and the position you oppose with equal clarity and fairness.",
  },
  {
    weekNumber: 9,
    monthNumber: 3,
    weekTitle: "Personal philosophy and human experiences",
    dayRange: [61, 67],
    challengeTitle: "Deliver a short talk standing up without notes.",
    challengeDescription:
      "Use posture, eye contact, and natural pauses rather than looking down at a screen or outline.",
  },
  {
    weekNumber: 10,
    monthNumber: 3,
    weekTitle: "Communication and human connection",
    dayRange: [68, 74],
    challengeTitle: "Interview someone and ask thoughtful follow-up questions.",
    challengeDescription:
      "Listen to their actual answer rather than waiting for your next prepared question.",
  },
  {
    weekNumber: 11,
    monthNumber: 3,
    weekTitle: "Leadership, building and vision",
    dayRange: [75, 81],
    challengeTitle: "Give a presentation about something I am building.",
    challengeDescription:
      "Frame the problem, the user reality, what you built, what surprised you, and where it goes next.",
  },
  {
    weekNumber: 12,
    monthNumber: 3,
    weekTitle: "Spontaneity and public presence",
    dayRange: [82, 88],
    challengeTitle: "Deliver a talk with an audience in mind, not just a camera.",
    challengeDescription:
      "Speak directly to a real person or group, calibrating tone, pacing, and examples to their context.",
  },
  {
    weekNumber: 13,
    monthNumber: 3,
    weekTitle: "Final Days: Your Signature Talks",
    dayRange: [89, 90],
    challengeTitle: "Complete the final presentation and review development.",
    challengeDescription:
      "Deliver your 10-minute signature talk, review Day 1 alongside Day 90, and generate your permanent 90-day report.",
  },
];

export const SPEAKING_FORMATS: SpeakingFormatGuide[] = [
  {
    id: "conversational_talk",
    label: "Conversational talk",
    shortDesc: "Speak as though thinking aloud with an intelligent friend across the table.",
    howToExecute:
      "Drop presenter cadence. Start with an honest observation, follow the thread of your reasoning, allow natural pauses, and end with what remains on your mind.",
    exampleAngle: "“I was debugging something this week and noticed a pattern I can't unsee…”",
  },
  {
    id: "mini_keynote",
    label: "Mini keynote",
    shortDesc: "A structured 3–5 minute talk with a clear arc, strong opening, and memorable close.",
    howToExecute:
      "Follow the 5-part structure: Hook → Context → Main Idea → Concrete Story/Evidence → Takeaway. Stand up if possible and own the pacing.",
    exampleAngle: "Open with a crisp contrast, build one core thesis, close with a sentence worth remembering.",
  },
  {
    id: "educational_video",
    label: "Educational video",
    shortDesc: "Teach one concept clearly so a viewer walks away understanding how it works.",
    howToExecute:
      "State the question you are answering in the first 10 seconds, remove unnecessary jargon, use one concrete mental model or analogy, and summarize the mechanism.",
    exampleAngle: "“Most people hear X and assume it's magic. Here is what is actually happening underneath.”",
  },
  {
    id: "opinion_piece",
    label: "Opinion piece",
    shortDesc: "State a clear thesis, support it with reasoning, and engage the strongest counter-view.",
    howToExecute:
      "State your claim early without hedging. Give two solid reasons, one grounded example, acknowledge where a reasonable person disagrees, and hold your line.",
    exampleAngle: "“Everyone optimizes for speed of tools, when understanding fundamentals compounds faster.”",
  },
  {
    id: "personal_story",
    label: "Personal story",
    shortDesc: "Anchor an idea inside a lived moment with tension, a turn, and a lesson.",
    howToExecute:
      "Put the listener inside the scene quickly (where, what was at stake), describe what broke or surprised you, and extract the human or technical insight.",
    exampleAngle: "Start in the middle of the mistake or realization rather than giving ten minutes of backstory.",
  },
  {
    id: "spontaneous_response",
    label: "Spontaneous response",
    shortDesc: "Minimal prep (1–2 minutes) using PREM as an anchor for on-the-spot clarity.",
    howToExecute:
      "Jot four short phrases (Point, Reason, Example, Meaning) and hit record immediately. Resist restarting when you stumble; recover cleanly in real time.",
    exampleAngle: "“Here's my honest first-principles take on that question in three minutes.”",
  },
];

export const AUDIENCE_OPTIONS: AudienceOption[] = [
  {
    id: "developers",
    label: "Developers",
    defaultFocus: "Frame around system design, trade-offs, mental models, Rust/TypeScript, and craft.",
  },
  {
    id: "entrepreneurs",
    label: "Entrepreneurs",
    defaultFocus: "Frame around user reality, distribution, product-market fit, and execution.",
  },
  {
    id: "students",
    label: "Students",
    defaultFocus: "Frame around learning how to learn, curiosity, agency, and bridging theory to practice.",
  },
  {
    id: "business_owners",
    label: "Business owners",
    defaultFocus: "Frame around economics, customer trust, reliability, and compounding value.",
  },
  {
    id: "general",
    label: "General audience",
    defaultFocus: "Use zero jargon, everyday analogies, human stakes, and relatable observations.",
  },
  {
    id: "leaders",
    label: "Leaders",
    defaultFocus: "Frame around ownership, judgment, clarity of communication, and long-term outcomes.",
  },
  {
    id: "mixed",
    label: "Mixed audience",
    defaultFocus: "Lead with a universal human tension, then layer one concrete specific without losing accessibility.",
  },
];

export const SCORECARD_DIMENSIONS: ScorecardDimension[] = [
  {
    key: "clarity",
    label: "Clarity",
    question: "Could someone understand my point?",
  },
  {
    key: "structure",
    label: "Structure",
    question: "Did my ideas flow logically?",
  },
  {
    key: "confidence",
    label: "Confidence",
    question: "Did I sound comfortable and assured?",
  },
  {
    key: "voice",
    label: "Voice",
    question: "Were my pace, articulation and emphasis effective?",
  },
  {
    key: "storytelling",
    label: "Storytelling",
    question: "Did I make the idea interesting?",
  },
  {
    key: "connection",
    label: "Connection",
    question: "Did I speak to people rather than at them?",
  },
  {
    key: "originality",
    label: "Originality",
    question: "Did I offer my own thinking?",
  },
];

export const PUBLISHING_PLATFORMS: Array<{
  id: PlatformId;
  label: string;
  purpose: string;
  placeholder: string;
}> = [
  {
    id: "instagram",
    label: "Instagram",
    purpose: "Personality, video, storytelling and reach.",
    placeholder: "https://www.instagram.com/reel/...",
  },
  {
    id: "tiktok",
    label: "TikTok",
    purpose: "Fast-cut clarity, spoken hooks and everyday lessons.",
    placeholder: "https://www.tiktok.com/@devvvmichaell/video/...",
  },
  {
    id: "x",
    label: "X",
    purpose: "Ideas, opinions, discussions and intellectual conversations.",
    placeholder: "https://x.com/devvmichael/status/...",
  },
  {
    id: "youtube",
    label: "YouTube",
    purpose: "A searchable archive of your speaking videos.",
    placeholder: "https://youtube.com/watch?v=... or /shorts/...",
  },
  {
    id: "website",
    label: "Website",
    purpose: "A permanent, organised journal of your thinking and development.",
    placeholder: "https://michaelojekunle.dev/blog/...",
  },
];

export const IDEA_CATEGORIES: Array<{ id: IdeaCategory; label: string; prompt: string }> = [
  { id: "observation", label: "Observation", prompt: "Something subtle you noticed today." },
  { id: "question", label: "Question", prompt: "An open question worth wrestling with out loud." },
  { id: "reading", label: "Reading", prompt: "A passage or concept from a book or essay." },
  { id: "disagreement", label: "Disagreement", prompt: "A common belief you question or push back on." },
  { id: "technical_concept", label: "Technical concept", prompt: "A systems, Rust, AI, or crypto idea to simplify." },
  { id: "business_idea", label: "Business idea", prompt: "An economic, product, or customer insight." },
  { id: "personal_experience", label: "Personal experience", prompt: "A real moment or mistake worth telling as a story." },
  { id: "conversation", label: "Conversation", prompt: "A dialogue with someone that sparked a clearer thought." },
];

export const PREM_GUIDE = [
  {
    letter: "P",
    name: "Point",
    question: "What exactly am I trying to say?",
    guidance: "One clear claim or thesis in one or two plain sentences. If you have three points, pick the sharpest one.",
    example: "Building real software teaches you far faster than watching tutorials because it forces you to make decisions under ambiguity.",
  },
  {
    letter: "R",
    name: "Reason",
    question: "Why do I believe this? What are my strongest supporting ideas?",
    guidance: "Explain the underlying mechanism — why your point holds true beyond mere preference.",
    example: "Passive consumption creates the illusion of fluency; only execution exposes what you actually don't understand.",
  },
  {
    letter: "E",
    name: "Example",
    question: "What personal experience, observation, analogy or evidence supports my point?",
    guidance: "Ground the abstract claim in something concrete: a bug, a product lesson from Zamir or CoinSafe, a book, or an everyday scene.",
    example: "Reading about Rust's borrow checker felt clear on paper, until my first real program failed to compile and forced me to trace ownership line by line.",
  },
  {
    letter: "M",
    name: "Meaning",
    question: "Why should someone listening care?",
    guidance: "Connect the idea back to the listener's own work, curiosity, or choices.",
    example: "If you feel stuck learning something difficult, stop collecting explanations and ship one small thing that breaks.",
  },
];

export const FIVE_PART_STRUCTURE = {
  title: "The Five-Part Speaking Structure",
  parts: [
    {
      step: 1,
      name: "Hook",
      description: "Start with something that makes people want to listen.",
    },
    {
      step: 2,
      name: "Context",
      description: "Explain why the subject matters.",
    },
    {
      step: 3,
      name: "Main idea",
      description: "Communicate the central argument.",
    },
    {
      step: 4,
      name: "Evidence or story",
      description: "Give an example, experience, analogy or supporting argument.",
    },
    {
      step: 5,
      name: "Takeaway",
      description: "Leave the audience with something to consider or apply.",
    },
  ],
  workedExample: {
    topic: "Why building something teaches you more than consuming information.",
    hook: "There's something interesting about learning to code. You can spend three weeks watching tutorials, feel like you're making incredible progress, and then open a blank editor and realise you have no idea what to do.",
    context: "Explain the difference between recognising information and applying it.",
    mainIdea: "Building forces you to make decisions and solve problems.",
    example: "Use your experience learning Rust and encountering compiler errors while implementing actual programs.",
    takeaway: "Knowledge becomes much more useful when you have to make decisions with it.",
  },
};

export const SPEAKING_PRINCIPLES: string[] = [
  "Prepare ideas, not paragraphs.",
  "Do not read a script.",
  "Avoid unnecessary jargon.",
  "Make one central point.",
  "Use concrete examples.",
  "Do not force humour.",
  "Do not imitate motivational speakers.",
  "Allow natural pauses.",
  "Avoid overexplaining.",
  "Be willing to say when you do not know something.",
  "Do not confuse confidence with certainty.",
  "Speak to the audience, not at the audience.",
  "Speak about things you are still trying to understand, not just things you have mastered.",
];

export const DAY90_QUESTIONS: Array<{ key: keyof import("./types").Day90ReportRecord; label: string }> = [
  { key: "q1OrganiseThoughts", label: "1. How has my ability to organise thoughts changed?" },
  { key: "q2WithoutScript", label: "2. Am I more comfortable speaking without a script?" },
  { key: "q3ExplainComplicated", label: "3. Can I explain complicated ideas more clearly?" },
  { key: "q4BetterStoryteller", label: "4. Have I become a better storyteller?" },
  { key: "q5HabitsOvercome", label: "5. What speaking habits have I overcome?" },
  { key: "q6StillNeedsImprovement", label: "6. What still needs improvement?" },
  { key: "q7ConversationsOpportunities", label: "7. What conversations and opportunities came from the challenge?" },
  { key: "q8ContinueDoing", label: "8. What do I want to continue doing?" },
];

export const WEEKLY_REVIEW_QUESTIONS = [
  { key: "strongestRecording", label: "1. What was my strongest recording this week?" },
  { key: "weakestRecording", label: "2. What was my weakest recording?" },
  { key: "speakingHabit", label: "3. What speaking habit did I notice?" },
  { key: "whatImproved", label: "4. What improved?" },
  { key: "stillStruggling", label: "5. Where am I still struggling?" },
  { key: "mostInterestingIdea", label: "6. What idea generated the most interesting conversations?" },
  { key: "connectedWithSomeone", label: "7. Did I connect with anyone new?" },
  { key: "nextWeekFocus", label: "8. What do I want to improve next week?" },
] as const;

export function getPhaseForDay(dayNumber: number): PhaseInfo {
  if (dayNumber <= 30) return SPEAKING_PHASES[0];
  if (dayNumber <= 60) return SPEAKING_PHASES[1];
  return SPEAKING_PHASES[2];
}

export function getWeekMetaForDay(dayNumber: number): WeeklyChallengeMeta {
  const found = WEEKLY_CHALLENGES.find(
    (w) => dayNumber >= w.dayRange[0] && dayNumber <= w.dayRange[1]
  );
  return found ?? WEEKLY_CHALLENGES[WEEKLY_CHALLENGES.length - 1];
}

export function getFormatGuide(id: SpeakingFormatId): SpeakingFormatGuide {
  return SPEAKING_FORMATS.find((f) => f.id === id) ?? SPEAKING_FORMATS[0];
}

export function getAudienceOption(id: AudienceTypeId): AudienceOption {
  return AUDIENCE_OPTIONS.find((a) => a.id === id) ?? AUDIENCE_OPTIONS[0];
}
