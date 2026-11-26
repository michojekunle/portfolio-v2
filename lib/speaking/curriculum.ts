import type { AudienceTypeId, CurriculumDay, SpeakingFormatId } from "./types";
import { getDateForDayNumber } from "./dates";
import { getPhaseForDay, getWeekMetaForDay, MONTH_TITLES } from "./methodology";

interface RawDaySeed {
  dayNumber: number;
  topic: string;
  skill: string;
  description: string;
  whyItMatters: string;
  thinkingPrompts: string[];
  recommendedFormat: SpeakingFormatId;
  recommendedAudience: AudienceTypeId;
  publishingSuggestion: string;
  audienceAngles?: Partial<Record<AudienceTypeId, string>>;
}

const DEFAULT_RECORDING_CHECKLIST = [
  "I have prepared my thoughts.",
  "I have recorded my first take.",
  "I have reviewed my recording.",
  "I have completed my improved take.",
  "I have saved my reflection.",
  "I have published or explicitly marked the day as practice-only.",
];

const RAW_CURRICULUM_SEEDS: RawDaySeed[] = [
  // ── MONTH 1: EXPRESSION AND CLARITY ────────────────────────────────────────
  // Week 1: Introducing yourself and your worldview
  {
    dayNumber: 1,
    topic: "Who am I beyond what I do for a living?",
    skill: "Self-expression",
    description: "Explore your identity, interests, values, curiosity and ambitions beyond your professional title.",
    whyItMatters:
      "Communicators people remember aren't walking résumés. Before teaching systems or talking about products, you need a grounded way to articulate who you are as a whole person.",
    thinkingPrompts: [
      "What interests you beyond technology?",
      "What kinds of problems naturally attract your attention?",
      "What do you find yourself thinking about when nobody asks you to?",
      "What do you value?",
      "What are you trying to become?",
      "What would you want someone to understand about you after spending an hour in conversation with you?",
    ],
    recommendedFormat: "conversational_talk",
    recommendedAudience: "mixed",
    publishingSuggestion: "Instagram Reel / X thread introducing the 90-day ledger and your positioning: Engineer. Writer. Builder.",
    audienceAngles: {
      developers: "Show the human curiosity behind your technical work—chess, investing, language, and faith.",
      entrepreneurs: "Frame your identity around the kinds of problems you can't stop trying to build solutions for.",
      general: "Leave job titles out for the first 60 seconds and talk about what makes you genuinely curious.",
    },
  },
  {
    dayNumber: 2,
    topic: "Why I am interested in so many different things.",
    skill: "Personal storytelling",
    description: "Connect your varied curiosities—engineering, Rust, investing, chess, philosophy, music products, languages—into one coherent thread.",
    whyItMatters:
      "People with broad curiosity often sound scattered when explaining themselves. Showing the common principle behind your interests turns breadth into depth.",
    thinkingPrompts: [
      "What connects your interest in systems programming, value investing, chess, and human communication?",
      "When did someone make you feel like having wide interests was a flaw rather than an asset?",
      "Which seemingly unrelated interest unexpectedly made you a better builder?",
      "How do you decide what deserves deep study versus passing curiosity?",
    ],
    recommendedFormat: "personal_story",
    recommendedAudience: "students",
    publishingSuggestion: "Short X note or 3-minute YouTube/IG reflection on why breadth and depth reinforce each other.",
  },
  {
    dayNumber: 3,
    topic: "What makes someone an interesting person to talk to?",
    skill: "Observation",
    description: "Examine the habits of mind, listening skills, and curiosity that turn ordinary conversations into memorable exchanges.",
    whyItMatters:
      "Great speaking begins with noticing how great conversations work. Studying what draws you to other thinkers refines your own presence.",
    thinkingPrompts: [
      "Think of the last conversation that energized you—what did the other person do differently?",
      "What is the difference between someone trying to sound smart and someone genuinely curious?",
      "How do specific observations beat rehearsed talking points?",
      "What habit makes a conversation immediately dry or transactional?",
    ],
    recommendedFormat: "conversational_talk",
    recommendedAudience: "general",
    publishingSuggestion: "Distill 3 sharp observations into a crisp X post or short speaking clip.",
  },
  {
    dayNumber: 4,
    topic: "The difference between knowing something and understanding it.",
    skill: "Explanation",
    description: "Unpack why recognizing terminology is not the same as grasping how a mechanism actually behaves.",
    whyItMatters:
      "Your entire learning philosophy rests on deep understanding rather than trivia collection. Articulating this distinction sharpens how you teach.",
    thinkingPrompts: [
      "When have you realized you only knew the name of a concept without understanding how it worked?",
      "What test proves to you that you truly understand an engineering or economic idea?",
      "How does trying to explain an idea aloud immediately reveal gaps?",
      "What changes in your work once you understand first principles instead of copying patterns?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "developers",
    publishingSuggestion: "Turn the contrast into a 4-slide daily learning carousel + short video clip.",
    audienceAngles: {
      developers: "Contrast memorizing framework APIs with tracing memory ownership or distributed failure modes.",
      students: "Contrast passing an exam from memorized notes with solving an unfamiliar problem from scratch.",
      general: "Contrast reading a recipe with knowing how to rescue a meal when an ingredient runs out.",
    },
  },
  {
    dayNumber: 5,
    topic: "Why I decided to build things instead of just consume information.",
    skill: "Storytelling",
    description: "Tell the story of shifting from passive reading and tutorials into shipping real products like RHNG, CoinSafe, and Zamir.",
    whyItMatters:
      "Your positioning is Engineer. Writer. Builder. Explaining why building matters to you creates immediate resonance with ambitious peers.",
    thinkingPrompts: [
      "What was the moment passive learning stopped feeling satisfying?",
      "What happens mentally when you go from reading about products to putting something in real users' hands?",
      "What did shipping early projects teach you that books never could?",
      "Why do people stay trapped in endless preparation?",
    ],
    recommendedFormat: "personal_story",
    recommendedAudience: "entrepreneurs",
    publishingSuggestion: "5-part structure video for YouTube/Instagram using your Rust or early product shift as the concrete turning point.",
  },
  {
    dayNumber: 6,
    topic: "Three principles I try to live by.",
    skill: "Structured thinking",
    description: "Organize three personal convictions into a clear, memorable, jargon-free spoken structure.",
    whyItMatters:
      "Speaking in clear numbered pillars without sounding rigid or preachy is a core communication discipline.",
    thinkingPrompts: [
      "Which three principles actually govern how you spend your time and handle setbacks—not slogans you wish were true?",
      "What real moment tested one of these principles?",
      "How do you state a conviction plainly without sounding like a motivational poster?",
      "Which single principle would remain if you had to drop the other two?",
    ],
    recommendedFormat: "mini_keynote",
    recommendedAudience: "mixed",
    publishingSuggestion: "Website short journal entry or Instagram carousel summarizing the 3 principles.",
  },
  {
    dayNumber: 7,
    topic: "My story so far and the experiences that shaped me.",
    skill: "Narrative",
    description: "Synthesize the key chapters, pivots, and convictions that brought you to where you stand today.",
    whyItMatters:
      "Being able to tell your own story cleanly in under five minutes—without rambling or false modesty—is foundational for founders, engineers, and writers.",
    thinkingPrompts: [
      "Which three turning points genuinely altered your direction?",
      "What early constraints or responsibilities shaped how you view opportunity and work?",
      "How do your past projects connect to what you are building and studying now?",
      "What chapter are you in right now, and what is still unresolved?",
    ],
    recommendedFormat: "personal_story",
    recommendedAudience: "mixed",
    publishingSuggestion: "YouTube archive anchor video + link from your About or Speaking Journal page.",
  },

  // Week 2: Learning to tell stories
  {
    dayNumber: 8,
    topic: "A time I discovered I knew less than I thought.",
    skill: "Vulnerability",
    description: "Recount a moment of intellectual humility where reality corrected an assumption.",
    whyItMatters:
      "Audiences trust speakers who admit what they didn't know. Vulnerability grounded in reflection builds credibility without seeking sympathy.",
    thinkingPrompts: [
      "What problem, bug, or product decision exposed a blind spot you didn't know you had?",
      "How confident were you right before things broke?",
      "What did you feel in that moment—and what did you change afterwards?",
      "Why is overconfidence so quiet right before it fails?",
    ],
    recommendedFormat: "personal_story",
    recommendedAudience: "developers",
    publishingSuggestion: "Candid X post or short reel focusing on the turning point and lesson.",
  },
  {
    dayNumber: 9,
    topic: "A difficult problem that changed how I approach challenges.",
    skill: "Storytelling",
    description: "Walk through one genuinely hard technical or product problem and how solving it reshaped your method.",
    whyItMatters:
      "Technical stories become compelling when you focus on the human thinking process—dead ends, hypotheses, and breakthroughs—rather than listing tools.",
    thinkingPrompts: [
      "Which problem resisted your first three attempts to solve it?",
      "What changed in your approach when brute force stopped working?",
      "How did that problem alter how you tackle unfamiliar territory today?",
      "How can you explain the stakes of the problem so a non-engineer feels the tension?",
    ],
    recommendedFormat: "personal_story",
    recommendedAudience: "developers",
    publishingSuggestion: "YouTube dev story or carousel breaking down the before/after problem-solving mindset.",
  },
  {
    dayNumber: 10,
    topic: "What building a product taught me about people.",
    skill: "Practical explanation",
    description: "Share concrete observations about human behavior learned from watching real people use software you shipped.",
    whyItMatters:
      "Software is built for people, not compilers. Translating product insights into human terms makes engineering stories universally engaging.",
    thinkingPrompts: [
      "Think of CoinSafe's wallet onboarding or Zamir's user flows: what surprised you about how people behaved?",
      "What assumption did you hold as the builder that real users immediately broke?",
      "What do people actually care about when confronting unfamiliar technology?",
      "How has observing users changed what you prioritize when building?",
    ],
    recommendedFormat: "conversational_talk",
    recommendedAudience: "entrepreneurs",
    publishingSuggestion: "X thread or short video contrasting builder assumptions vs user reality.",
  },
  {
    dayNumber: 11,
    topic: "Why good intentions are not enough to build something useful.",
    skill: "Argument",
    description: "Make the case that caring about a problem must be paired with discipline, clarity, and execution.",
    whyItMatters:
      "Strong opinions require clear reasoning, not cynicism. Learning to challenge well-meaning mediocrity constructively makes you persuasive.",
    thinkingPrompts: [
      "Where do you see smart or well-meaning builders fail because they stopped at noble intentions?",
      "What separates a sincere wish from a product or system that actually works?",
      "What concrete failure mode shows up when rigor is missing?",
      "How do you state this bluntly without sounding dismissive?",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "entrepreneurs",
    publishingSuggestion: "Sharp opinion clip on Instagram/X paired with one concrete example.",
  },
  {
    dayNumber: 12,
    topic: "The story behind Zamir and what I wanted to create.",
    skill: "Product storytelling",
    description: "Tell the human story of Zamir—turning what people express or write into music in their own language.",
    whyItMatters:
      "Every builder needs to explain their flagship work with clarity and heart, without sounding like a pitch deck.",
    thinkingPrompts: [
      "What emotional or creative gap sparked the idea for Zamir?",
      "Why did helping people express feelings and ideas in their own language matter so much?",
      "What moment—seeing 4.7k plays or a 40.7% repeat-listening rate across 10 languages—proved people felt it too?",
      "What was the hardest product or UX tension in making creative expression effortless?",
    ],
    recommendedFormat: "personal_story",
    recommendedAudience: "mixed",
    publishingSuggestion: "Instagram Reel / YouTube story introducing Zamir's human purpose.",
  },
  {
    dayNumber: 13,
    topic: "A mistake that improved how I work.",
    skill: "Reflection",
    description: "Examine an operational, engineering, or communication mistake and the system you built because of it.",
    whyItMatters:
      "Reflection without a concrete change is just nostalgia. Showing how mistakes turn into better habits makes your stories useful.",
    thinkingPrompts: [
      "What mistake cost you time, clarity, or momentum in a project?",
      "Why did you make it at the time?",
      "What concrete rule, checklist, or habit exists in your workflow today because of it?",
      "What would you tell someone about to make the exact same error?",
    ],
    recommendedFormat: "conversational_talk",
    recommendedAudience: "developers",
    publishingSuggestion: "Short X post or daily journal reflection linked to your current build notes.",
  },
  {
    dayNumber: 14,
    topic: "What I have learned from working with other people.",
    skill: "Connection",
    description: "Reflect on collaboration across projects like Edifition, Zamir, and CoinSafe—communication, friction, and shared standards.",
    whyItMatters:
      "Solo skill hits a ceiling quickly. Showing awareness of team dynamics signals maturity to founders, leaders, and peers.",
    thinkingPrompts: [
      "What changed when you moved from building solo to collaborating with other engineers or designers?",
      "What causes avoidable friction in small product teams?",
      "What makes someone genuinely great to build alongside?",
      "What did another teammate teach you by how they worked?",
    ],
    recommendedFormat: "conversational_talk",
    recommendedAudience: "leaders",
    publishingSuggestion: "Reflective post on X or Weekly Review synthesis for Week 2.",
  },

  // Week 3: Explaining ideas simply
  {
    dayNumber: 15,
    topic: "Explain how the internet works to someone who has never used a computer.",
    skill: "Simplification",
    description: "Strip away TCP/IP, DNS, and HTTP jargon and explain packets, addresses, and servers using physical-world intuition.",
    whyItMatters:
      "If you can explain foundational infrastructure to a complete beginner without losing accuracy, you can explain anything.",
    thinkingPrompts: [
      "What everyday physical system (mail, libraries, couriers) best captures addresses, routes, and splitting messages?",
      "Which technical words must you ban completely for this explanation?",
      "How do you keep the explanation accurate without getting lost in protocols?",
      "What single image would you want the listener to hold in their head?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "general",
    publishingSuggestion: "5-slide educational carousel + 3-minute explainer clip.",
  },
  {
    dayNumber: 16,
    topic: "What artificial intelligence actually does.",
    skill: "Teaching",
    description: "Demystify AI beyond hype and sci-fi—pattern prediction, probability, context, retrieval, and tool execution.",
    whyItMatters:
      "Everyone talks about AI; few can explain what it actually is in plain English. Clear demystification builds instant authority.",
    thinkingPrompts: [
      "What is the biggest misconception non-technical people have about what an AI model is doing?",
      "How do you explain prediction, tokens, and context without math jargon?",
      "What is the difference between a model guessing from memory and a system grounded in real data (like RAG)?",
      "Where is AI genuinely useful today, and where does it still break?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "general",
    publishingSuggestion: "YouTube explainer + Carousel Lab deck breaking hype vs mechanism.",
    audienceAngles: {
      developers: "Focus on probability distributions, context windows, retrieval grounding, and agent loops.",
      business_owners: "Focus on where AI saves real operational hours versus where deterministic software is safer.",
      general: "Compare statistical next-word prediction to an extraordinarily well-read autocomplete that still needs verification.",
    },
  },
  {
    dayNumber: 17,
    topic: "Why some simple problems are surprisingly difficult to solve.",
    skill: "Analogy",
    description: "Use an everyday or engineering analogy to show why hidden complexity lives behind seemingly simple user experiences.",
    whyItMatters:
      "Your experience with CoinSafe (passkeys, gas sponsorship, account abstraction) is a masterclass in hiding complexity. Analogies make this visible.",
    thinkingPrompts: [
      "What feels effortless to a user on the surface while requiring serious engineering underneath?",
      "What non-tech analogy illustrates why 'making something simple' takes extra work?",
      "Why do beginners underestimate edge cases, trust, and recovery paths?",
      "How do you describe hidden complexity without complaining about how hard your job is?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "mixed",
    publishingSuggestion: "Short story-driven clip using CoinSafe onboarding or everyday design as the hook.",
  },
  {
    dayNumber: 18,
    topic: "What is money, and why do people value it?",
    skill: "Conceptual explanation",
    description: "Explain money from first principles—coordination, trust, scarcity, time, and exchange.",
    whyItMatters:
      "Connecting economics, cryptography, and human psychology lets you bridge technology and everyday life effortlessly.",
    thinkingPrompts: [
      "If paper notes and numbers on a screen have no utility on their own, why do people trade hours of their lives for them?",
      "What three problems does money solve that barter cannot?",
      "Why does trust sit underneath every currency—from cowries to central banks to blockchains?",
      "What happens when people lose trust in a unit of account?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "students",
    publishingSuggestion: "Clean first-principles carousel + short spoken breakdown.",
  },
  {
    dayNumber: 19,
    topic: "How does a business actually make money?",
    skill: "Business communication",
    description: "Demystify unit economics, margins, distribution, and sustainable value creation without MBA buzzwords.",
    whyItMatters:
      "Great engineers who understand how businesses actually generate and keep cash flow become irreplaceable builders and founders.",
    thinkingPrompts: [
      "Why do many products with users still fail to become real businesses?",
      "What is the difference between revenue, margin, and cash staying in the bank?",
      "Pick one business everyone knows and trace where the money enters and where it leaks.",
      "What should a builder ask before writing code for a 'business idea'?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "entrepreneurs",
    publishingSuggestion: "Educational thread/carousel pairing software craft with business reality.",
  },
  {
    dayNumber: 20,
    topic: "What makes people trust a product?",
    skill: "Persuasion",
    description: "Break down reliability, clarity, design honesty, predictability, and recovery when things go wrong.",
    whyItMatters:
      "Building fintech, AI, and web products taught you that trust isn't a logo—it's earned in micro-interactions and edge cases.",
    thinkingPrompts: [
      "What immediately makes you distrust a website, app, or service within ten seconds?",
      "How do small details—speed, clear errors, transparent pricing—build quiet confidence?",
      "What did building CoinSafe or RHNG teach you about user hesitation?",
      "Why is trust ten times slower to earn than to break?",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "business_owners",
    publishingSuggestion: "Short LinkedIn/X carousel or video aimed at founders and product builders.",
  },
  {
    dayNumber: 21,
    topic: "Explain something you recently learned in five minutes.",
    skill: "Clarity",
    description: "Take a concept from your current Rust, distributed systems, reading, or chess study and teach it cleanly.",
    whyItMatters:
      "Turning daily learning into clear spoken explanations is the core engine of The Speaking Ledger.",
    thinkingPrompts: [
      "What did you learn this week that made you pause and think 'that's actually clever'?",
      "What is the single central insight—if the listener only remembers one thing?",
      "What concrete example makes that insight click immediately?",
      "How can you explain it cleanly inside five minutes without rushing?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "developers",
    publishingSuggestion: "YouTube learning log + Carousel Lab slide deck summarizing today's concept.",
  },

  // Week 4: Opinions and personality
  {
    dayNumber: 22,
    topic: "Why curiosity is an underrated quality.",
    skill: "Opinion",
    description: "Make a thoughtful case for curiosity as a compounding advantage in engineering, business, and life.",
    whyItMatters:
      "Curiosity is central to your personal brand. Expressing why it matters—without sounding cliché—sets your intellectual tone.",
    thinkingPrompts: [
      "What separates genuine curiosity from scrolling or trivia-hoarding?",
      "How has following an unprompted question ever led you to an unexpected opportunity?",
      "Why do systems often reward credentials over curiosity—and why does curiosity win long term?",
      "What happens to someone who stops asking 'how does this actually work?'",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "mixed",
    publishingSuggestion: "X post + short spoken reflection.",
  },
  {
    dayNumber: 23,
    topic: "Why being busy doesn't mean you're making progress.",
    skill: "Argument",
    description: "Distinguish motion from direction, activity from output, and exhaustion from meaningful work.",
    whyItMatters:
      "Ambitious builders often confuse long hours with real leverage. Sharpening this distinction clarifies your own discipline.",
    thinkingPrompts: [
      "What does 'productive procrastination' look like in your own life or engineering work?",
      "Why is busyness socially rewarded even when nothing meaningful ships?",
      "How do you measure real progress at the end of a week?",
      "What hard task do people avoid by staying busy with easy ones?",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "students",
    publishingSuggestion: "Instagram Reel / X video with a punchy opening hook.",
  },
  {
    dayNumber: 24,
    topic: "The danger of comparing your journey with other people's.",
    skill: "Reflection",
    description: "Examine how invisible context makes external comparison both inaccurate and paralyzing.",
    whyItMatters:
      "In tech and entrepreneurship, public timelines distort reality. Speaking honestly about pace builds genuine connection.",
    thinkingPrompts: [
      "What do we never see when looking at someone else's public milestone?",
      "When has comparison quietly pushed you toward someone else's goals instead of your own?",
      "What is the healthier alternative to comparison—reference points vs rivalry?",
      "How do you stay ambitious while running your own race?",
    ],
    recommendedFormat: "conversational_talk",
    recommendedAudience: "students",
    publishingSuggestion: "Reflective spoken clip for Instagram or personal journal.",
  },
  {
    dayNumber: 25,
    topic: "Why intelligence and wisdom are different.",
    skill: "Conceptual thinking",
    description: "Contrast raw processing speed and cleverness with judgment, restraint, and long-term perspective.",
    whyItMatters:
      "In engineering and investing alike, smart people still walk into avoidable traps. Defining wisdom shows depth of thought.",
    thinkingPrompts: [
      "What can an intelligent person do brilliantly while still lacking wisdom?",
      "Think of a decision in investing, chess, or life where patience beat cleverness.",
      "How is wisdom earned differently from knowledge?",
      "What does wise judgment look like in someone young?",
    ],
    recommendedFormat: "mini_keynote",
    recommendedAudience: "mixed",
    publishingSuggestion: "Thoughtful X essay-post + short talk.",
  },
  {
    dayNumber: 26,
    topic: "Is formal education preparing people for the real world?",
    skill: "Debate",
    description: "Take a balanced, sharp position on what formal schooling still gets right and where it breaks down.",
    whyItMatters:
      "Education and opportunity are core themes for you. Nuanced debate beats lazy 'school is useless' slogans.",
    thinkingPrompts: [
      "What genuinely valuable habits or foundations did formal education give or fail to give you?",
      "Where does a classroom environment actively train people against real-world agency?",
      "What would you keep and what would you redesign if you ran a modern university curriculum?",
      "What can an ambitious student do right now regardless of their school's flaws?",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "students",
    publishingSuggestion: "Debate-style clip for X/YouTube sparking conversation with students and educators.",
  },
  {
    dayNumber: 27,
    topic: "Why everyone should learn to communicate effectively.",
    skill: "Persuasion",
    description: "Argue why clear speaking and writing act as force multipliers for technical skill, leadership, and opportunity.",
    whyItMatters:
      "Many engineers treat communication as 'soft skills'. Making the case for communication as leverage validates the entire 90-day effort.",
    thinkingPrompts: [
      "How often does a weaker idea win simply because it was communicated more clearly?",
      "What opportunities stay closed to capable engineers who cannot explain their work?",
      "Why is clear speaking really a symptom of clear thinking?",
      "What changes when someone learns to articulate ideas to non-specialists?",
    ],
    recommendedFormat: "mini_keynote",
    recommendedAudience: "developers",
    publishingSuggestion: "High-conviction video clip + carousel.",
  },
  {
    dayNumber: 28,
    topic: "Something I disagree with that many people believe.",
    skill: "Defending opinions",
    description: "Name a widely held assumption in tech, career advice, or culture and explain cleanly why you reject it.",
    whyItMatters:
      "Independent thinkers don't just echo consensus. Practising respectful dissent builds intellectual backbone.",
    thinkingPrompts: [
      "What common piece of advice do people repeat without questioning?",
      "Why does that belief sound appealing on the surface?",
      "Where does it fall apart when tested against real experience?",
      "What do you propose in its place?",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "mixed",
    publishingSuggestion: "X discussion post inviting thoughtful disagreement.",
  },
  {
    dayNumber: 29,
    topic: "An unpopular opinion I am willing to defend.",
    skill: "Confidence",
    description: "Push one step further than Day 28: hold a genuinely contrarian stance calmly under scrutiny.",
    whyItMatters:
      "Confidence isn't loudness—it's staying composed when others push back because you've thought your premise through.",
    thinkingPrompts: [
      "What position do you hold that makes most people in your circle pause or push back?",
      "What is the strongest argument someone could make against you?",
      "Why do you still hold your view even after considering that counter-argument?",
      "Where could you still be wrong—and how do you acknowledge that without collapsing your point?",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "entrepreneurs",
    publishingSuggestion: "Short direct-to-camera opinion video.",
  },
  {
    dayNumber: 30,
    topic: "What have I learned about communicating in 30 days?",
    skill: "Self-assessment",
    description: "Phase 1 milestone review: look back at Days 1–29, notice your patterns, and articulate how your voice is changing.",
    whyItMatters:
      "Closing Month 1 with honest self-assessment turns 30 daily reps into deliberate mastery before entering Phase 2.",
    thinkingPrompts: [
      "Watch your Day 1 recording before speaking: what feels different now?",
      "Which verbal habits, filler patterns, or mental blocks showed up repeatedly?",
      "Which format felt most natural—and which stretched you most?",
      "What single focus will carry you through Phase 2 (Depth)?",
    ],
    recommendedFormat: "conversational_talk",
    recommendedAudience: "mixed",
    publishingSuggestion: "Month 1 retrospective post on website + summary thread on X.",
  },

  // ── MONTH 2: INTELLECTUAL DEPTH AND PERSPECTIVE ────────────────────────────
  // Week 5: Engineering, technology and the future
  {
    dayNumber: 31,
    topic: "Why understanding fundamentals matters more than knowing tools.",
    skill: "Teaching",
    description: "Explain why frameworks rotate every few years while memory, networking, data structures, and systems thinking endure.",
    whyItMatters:
      "This is a cornerstone of your engineering philosophy. Teaching it well separates senior systems thinking from framework chasing.",
    thinkingPrompts: [
      "Which tool you used three years ago barely matters today—and which fundamental still shows up every single week?",
      "Why do tutorials push tools first while real engineering problems demand fundamentals?",
      "How does knowing fundamentals speed up learning a brand-new stack?",
      "When is knowing a tool well still genuinely valuable?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "developers",
    publishingSuggestion: "YouTube engineering talk + 6-slide carousel for developers.",
  },
  {
    dayNumber: 32,
    topic: "What happens when millions of people use the same application?",
    skill: "Technical explanation",
    description: "Explain concurrency, bottlenecks, caching, queues, and failure modes in clear, vivid language.",
    whyItMatters:
      "Explaining distributed systems without drowning listeners in buzzwords is a superpower for systems engineers.",
    thinkingPrompts: [
      "What breaks first when traffic jumps from 100 users to 1,000,000?",
      "What everyday physical analogy explains queues, caches, or database locks?",
      "Why can't you just 'buy a bigger computer' forever?",
      "What trade-off between speed, cost, and consistency surprises newcomers most?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "developers",
    publishingSuggestion: "Educational video + visual slide deck breaking down scale step by step.",
  },
  {
    dayNumber: 33,
    topic: "Why I decided to learn Rust.",
    skill: "Personal narrative",
    description: "Share what drew you from frontend and web3 products toward systems programming, Rust, memory safety, and infrastructure.",
    whyItMatters:
      "Your public Rust learning series is part of your identity. Telling the 'why' behind the transition inspires other builders.",
    thinkingPrompts: [
      "What limitation or curiosity pulled you toward systems programming after years in TypeScript/React?",
      "What felt intimidating or frustrating at the beginning of Rust?",
      "How did fighting the compiler change how you think about correctness even in TypeScript?",
      "What kind of engineer do you want Rust and systems work to make you?",
    ],
    recommendedFormat: "personal_story",
    recommendedAudience: "developers",
    publishingSuggestion: "YouTube narrative + X post linking to your systems/Rust notes.",
  },
  {
    dayNumber: 34,
    topic: "What makes an engineer genuinely valuable?",
    skill: "Argument",
    description: "Move beyond lines of code and syntax trivia: problem framing, ownership, reliability, product judgment, and clarity.",
    whyItMatters:
      "In an era of code generation, defining true engineering value helps both you and junior developers focus on what endures.",
    thinkingPrompts: [
      "Think of the best engineer you've worked with or studied—what made them indispensable?",
      "Why is writing more code often a sign of lower value, not higher?",
      "How do ownership and communication multiply technical skill?",
      "What separates an operator who follows tickets from an engineer who owns outcomes?",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "developers",
    publishingSuggestion: "X thread or short keynote clip.",
  },
  {
    dayNumber: 35,
    topic: "Will AI replace software engineers?",
    skill: "Debate",
    description: "Give a grounded, unsensational take on what AI automates, what becomes harder, and what engineering becomes.",
    whyItMatters:
      "This is one of the loudest debates in tech. A calm, technical, nuanced answer stands out immediately from clickbait.",
    thinkingPrompts: [
      "Which parts of writing code are genuinely becoming commoditized right now?",
      "Which parts of software engineering—requirements ambiguity, architecture, debugging novel failures, accountability—resist automation?",
      "How does cheaper code change the volume and complexity of systems we have to maintain?",
      "What should a software engineer start doing differently today?",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "mixed",
    publishingSuggestion: "YouTube/IG commentary clip + X discussion prompt.",
  },
  {
    dayNumber: 36,
    topic: "Why building reliable systems is difficult.",
    skill: "Simplification",
    description: "Explain why partial failures, edge cases, state synchronization, and human error make 99.9% reliability non-trivial.",
    whyItMatters:
      "Bridging the gap between 'it works on my laptop' and production reliability helps audiences respect systems craft.",
    thinkingPrompts: [
      "Why is 'happy path' software easy while failure handling is where 80% of the work lives?",
      "What real-world failure taught you about idempotency, retries, or state consistency?",
      "How would you explain distributed failure to a business owner whose payments froze?",
      "Why is simplicity a reliability feature?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "business_owners",
    publishingSuggestion: "Short educational breakdown with a concrete everyday analogy.",
  },
  {
    dayNumber: 37,
    topic: "What I think the next decade of technology will look like.",
    skill: "Vision",
    description: "Synthesize your perspective on AI infrastructure, verifiable computation/ZK, developer tooling, and emerging markets.",
    whyItMatters:
      "Articulating a grounded long-term thesis—without sci-fi hype—positions you as a builder looking ahead.",
    thinkingPrompts: [
      "Which infrastructure shifts feel quiet today but inevitable over ten years?",
      "How will AI agents, verification/cryptography, and local-first/mobile realities intersect?",
      "What hype cycle do you think will quietly fade?",
      "Where do you personally want to be positioned in that landscape?",
    ],
    recommendedFormat: "mini_keynote",
    recommendedAudience: "entrepreneurs",
    publishingSuggestion: "Week 5 short-form article on your blog + YouTube talk.",
  },

  // Week 6: Business, products and entrepreneurship
  {
    dayNumber: 38,
    topic: "The difference between having an idea and building a business.",
    skill: "Explanation",
    description: "Separate the excitement of concept generation from distribution, retention, pricing, and endurance.",
    whyItMatters:
      "Every builder hears 'I have an app idea'. Explaining the chasm clearly helps aspiring founders focus on execution.",
    thinkingPrompts: [
      "Why do ideas feel 90% done in our heads and turn out to be 1% of the journey?",
      "What unglamorous problems appear the day after you write the code?",
      "What makes someone pay repeatedly versus compliment an idea politely?",
      "How did shipping RHNG or Zamir prove this difference to you?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "entrepreneurs",
    publishingSuggestion: "Instagram Reel / X carousel for builders.",
  },
  {
    dayNumber: 39,
    topic: "Why great products sometimes fail.",
    skill: "Critical thinking",
    description: "Analyze distribution traps, wrong timing, confusing onboarding, weak economics, and solving problems users don't prioritize.",
    whyItMatters:
      "Engineers love the myth that 'best tech wins'. Examining why strong products still stall builds sharper product judgment.",
    thinkingPrompts: [
      "Recall a genuinely well-engineered product that struggled or disappeared—what actually killed it?",
      "How can superior technology lose to simpler distribution or lower friction?",
      "When does building 'better features' become a distraction from finding customers?",
      "What lesson does that carry for your own builds?",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "entrepreneurs",
    publishingSuggestion: "X thread or short video essay.",
  },
  {
    dayNumber: 40,
    topic: "What I learned about people from building Zamir.",
    skill: "Product storytelling",
    description: "Go deeper than Day 12: examine how users across 10 languages relate to music, self-expression, and creative tools.",
    whyItMatters:
      "Connecting concrete product observations (like why people come back and repeat-listen) to universal human behavior is unforgettable storytelling.",
    thinkingPrompts: [
      "What did watching people turn personal writing into music reveal about human emotion and language?",
      "Why does hearing something in your own language land differently from generic English templates?",
      "What surprised you about why listeners returned repeatedly?",
      "How did user feedback reshape your product instincts?",
    ],
    recommendedFormat: "personal_story",
    recommendedAudience: "mixed",
    publishingSuggestion: "Storytelling clip on Instagram/YouTube linking to Zamir.",
  },
  {
    dayNumber: 41,
    topic: "Why understanding customers is an engineering skill.",
    skill: "Persuasion",
    description: "Argue that customer empathy prevents over-engineering, clarifies constraints, and yields cleaner architectures.",
    whyItMatters:
      "Too many engineers see product discovery as 'someone else's job'. Bridging user pain and architecture makes you twice as effective.",
    thinkingPrompts: [
      "How does misunderstanding the user create bloated or fragile code?",
      "Give an example where talking to or observing users simplified a technical solution.",
      "What happened with CoinSafe when wallet onboarding met real non-crypto users?",
      "What habit helps engineers stay close to users without losing focus?",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "developers",
    publishingSuggestion: "X post + short spoken clip aimed at product engineers.",
  },
  {
    dayNumber: 42,
    topic: "What makes a business valuable beyond revenue?",
    skill: "Business reasoning",
    description: "Explore moats, retention, trust, unit economics, team resilience, and compounding brand reputation.",
    whyItMatters:
      "Connecting value investing (Benjamin Graham) with company building deepens your business commentary.",
    thinkingPrompts: [
      "Why can two businesses with identical revenue have wildly different real value?",
      "What makes customers stay when a cheaper competitor shows up?",
      "How do operational discipline and cash efficiency outlast hype?",
      "What intangible assets—trust, data, culture—show up slowly in financials?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "business_owners",
    publishingSuggestion: "Carousel + short explainer bridging product and value investing.",
  },
  {
    dayNumber: 43,
    topic: "If I had to build a business from zero, what would I do?",
    skill: "Structured presentation",
    description: "Lay out a step-by-step playbook from problem discovery to first paying customer with zero outside funding.",
    whyItMatters:
      "Structured hypotheticals test whether you can organize strategy clearly in real time under a 5-minute clock.",
    thinkingPrompts: [
      "How would you spend your first 48 hours—would you open an editor or talk to people?",
      "What criteria would a problem need before you committed six months to it?",
      "How would you prove willingness to pay before building heavy infrastructure?",
      "What mistake from past projects would you deliberately skip?",
    ],
    recommendedFormat: "mini_keynote",
    recommendedAudience: "entrepreneurs",
    publishingSuggestion: "5-step Carousel Lab deck + YouTube talk.",
  },
  {
    dayNumber: 44,
    topic: "Why execution is harder than inspiration.",
    skill: "Argument",
    description: "Address the quiet discipline required after the initial spark wears off—iteration, boredom, rejection, and consistency.",
    whyItMatters:
      "Around Day 44 (midway through the 90 days!), this topic directly mirrors the reality of sticking with any long commitment.",
    thinkingPrompts: [
      "Why does Day 1 excitement evaporate around Week 4 or 6?",
      "What actually happens during the 'unsexy middle' of shipping a product?",
      "How do systems and standards carry you when inspiration disappears?",
      "What recent small win came purely from refusing to quit on an ordinary day?",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "mixed",
    publishingSuggestion: "Honest mid-challenge video clip + Week 6 short-form article.",
  },

  // Week 7: Economics, investing and society
  {
    dayNumber: 45,
    topic: "What Benjamin Graham taught me about investing.",
    skill: "Teaching",
    description: "Distill Mr. Market, margin of safety, intrinsic value, and emotional discipline from The Intelligent Investor.",
    whyItMatters:
      "Sharing lessons from serious reading outside software shows intellectual breadth and attracts business-minded audiences.",
    thinkingPrompts: [
      "How do you explain 'Mr. Market' in 30 seconds to someone who has never bought a stock?",
      "What does 'margin of safety' mean in investing—and how does it apply to engineering or life?",
      "Why is temperament more decisive than IQ in Graham's framework?",
      "What misconception did reading Graham clear up for you?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "general",
    publishingSuggestion: "Book-linked carousel + YouTube explainer (link to your Reading Log!).",
  },
  {
    dayNumber: 46,
    topic: "The difference between making money and building wealth.",
    skill: "Explanation",
    description: "Contrast active income and short-term cash spikes with ownership, compounding, equity, and capital allocation.",
    whyItMatters:
      "Clear financial communication empowers young professionals and builders to think in decades rather than paychecks.",
    thinkingPrompts: [
      "Why do many high earners still end up financially fragile?",
      "What shifts when you think in assets, skills, and equity rather than just monthly income?",
      "How does lifestyle inflation silently erase income growth?",
      "What simple mental model separates income from wealth?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "students",
    publishingSuggestion: "Carousel + short clear spoken explanation on Instagram/X.",
  },
  {
    dayNumber: 47,
    topic: "Why speculation and investing are not the same.",
    skill: "Critical thinking",
    description: "Draw a clean boundary between analyzing underlying value and betting on short-term price movements.",
    whyItMatters:
      "Especially in crypto and tech circles, speculation often disguises itself as investing. Clarity here saves people real pain.",
    thinkingPrompts: [
      "Using Graham's definition, what makes an operation 'investment' versus 'speculation'?",
      "Why do bull markets make speculators look like geniuses temporarily?",
      "How have you seen this confusion play out in crypto or startup hype?",
      "Is there anything wrong with calculated speculation if you call it what it is?",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "business_owners",
    publishingSuggestion: "X thread + short analytical talk.",
  },
  {
    dayNumber: 48,
    topic: "Why financial literacy should be taught early.",
    skill: "Persuasion",
    description: "Make a compelling argument for teaching compounding, debt, budgeting, and risk to teenagers and university students.",
    whyItMatters:
      "Connecting education, personal responsibility, and economic mobility speaks directly to young people and parents.",
    thinkingPrompts: [
      "What financial mistake do smart young adults repeatedly make simply because nobody explained the mechanics early?",
      "Why does waiting until you have 'extra money' to learn finance backfire?",
      "What three concepts would you teach every 16-year-old?",
      "How does financial clarity expand someone's career freedom and risk tolerance?",
    ],
    recommendedFormat: "mini_keynote",
    recommendedAudience: "students",
    publishingSuggestion: "Persuasive short video on Instagram/YouTube.",
  },
  {
    dayNumber: 49,
    topic: "Why do some countries develop faster than others?",
    skill: "Systems thinking",
    description: "Analyze institutions, trust, infrastructure, energy, education, incentives, and capital formation as interconnected systems.",
    whyItMatters:
      "Applying systems thinking—familiar from software—to economics and national development produces unusually clear commentary.",
    thinkingPrompts: [
      "Why are natural resources alone never enough to guarantee development?",
      "How do trust, rule of law, and reliable infrastructure (power, logistics, internet) act like system primitives?",
      "What feedback loops accelerate or stall national compounding?",
      "How do you speak about development thoughtfully without partisan clichés?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "mixed",
    publishingSuggestion: "Thoughtful long-form X post + 4-minute systems breakdown.",
  },
  {
    dayNumber: 50,
    topic: "What would make Africa a stronger technological economy?",
    skill: "Big-picture thinking",
    description: "Explore infrastructure, local capital, engineering depth, cross-border commerce, and building real value beyond outsourcing.",
    whyItMatters:
      "As a builder in Lagos, your grounded perspective on African tech—free from empty hype—carries real weight.",
    thinkingPrompts: [
      "What is the difference between having lots of software talent and having a deep technology economy?",
      "Which real bottlenecks—payments, energy, trust, distribution, R&D—matter most?",
      "Why does building deep technical products for real local and global problems beat copying Silicon Valley pitches?",
      "What role can individual engineers and founders play right now?",
    ],
    recommendedFormat: "mini_keynote",
    recommendedAudience: "leaders",
    publishingSuggestion: "YouTube talk + Week 7 blog essay.",
  },
  {
    dayNumber: 51,
    topic: "What young Africans should understand about global opportunities.",
    skill: "Audience connection",
    description: "Speak directly to ambitious students and builders about internet leverage, global standards, patience, and agency.",
    whyItMatters:
      "This is a chance to connect deeply with peers—practical encouragement anchored in reality, not false promises.",
    thinkingPrompts: [
      "What has the internet genuinely leveled, and what gaps still require extra grit to cross?",
      "Why do global standards—reliability, clear writing, shipping—matter more than geography?",
      "What trap catches talented young people chasing quick remote paychecks without compounding mastery?",
      "If you were talking to a 19-year-old version of yourself in Lagos, what would you say?",
    ],
    recommendedFormat: "conversational_talk",
    recommendedAudience: "students",
    publishingSuggestion: "Direct-to-camera Instagram/YouTube message.",
  },

  // Week 8: Critical thinking and intellectual independence
  {
    dayNumber: 52,
    topic: "How do you know when you truly understand something?",
    skill: "Reflection",
    description: "Revisit Day 4 at a deeper level: explore edge cases, mental models, prediction, and the ability to improvise.",
    whyItMatters:
      "Phase 2 is about depth of thought. Testing your own standard of understanding keeps you intellectually honest.",
    thinkingPrompts: [
      "Can you derive the idea, spot where it breaks, and explain it three different ways?",
      "What does the Feynman test catch—and what does it sometimes miss?",
      "Recall a subject you studied deeply recently: at what exact point did it 'click'?",
      "How does superficial familiarity trick intelligent people?",
    ],
    recommendedFormat: "conversational_talk",
    recommendedAudience: "mixed",
    publishingSuggestion: "X post or short reflection linked to your current study topic.",
  },
  {
    dayNumber: 53,
    topic: "Why intelligent people make poor decisions.",
    skill: "Reasoning",
    description: "Examine ego, motivated reasoning, over-complexity, blind spots, and mistaking eloquence for truth.",
    whyItMatters:
      "High intelligence can actually make rationalizing bad choices easier. Unpacking this sharpens self-awareness.",
    thinkingPrompts: [
      "How does being clever make someone better at defending a bad decision?",
      "Where do ego, impatience, or social status override clear logic?",
      "Think of an example from chess, investing, or engineering where overthinking caused a blunder.",
      "What safeguards protect against your own blind spots?",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "leaders",
    publishingSuggestion: "Analytical X thread + short spoken piece.",
  },
  {
    dayNumber: 54,
    topic: "The danger of believing everything you read.",
    skill: "Critical thinking",
    description: "Discuss source incentives, survivorship bias, AI-generated noise, and verifying claims from primary sources.",
    whyItMatters:
      "In a noisy feed economy, intellectual independence requires reading skeptically without turning cynical.",
    thinkingPrompts: [
      "What incentives shape most articles, threads, and viral claims you see daily?",
      "When did checking a primary source or running an experiment contradict popular online consensus?",
      "How can someone stay open-minded while still filtering noise?",
      "What questions do you ask before adopting someone else's conclusion?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "students",
    publishingSuggestion: "Carousel + short video on reading critically.",
  },
  {
    dayNumber: 55,
    topic: "Is experience more valuable than knowledge?",
    skill: "Debate",
    description: "Weigh theoretical study against lived trial-and-error, showing where each wins and why neither alone suffices.",
    whyItMatters:
      "Practising balanced argument prepares you for Week 8's challenge: arguing both sides of the same issue.",
    thinkingPrompts: [
      "Where does book knowledge save you years of painful trial and error?",
      "Where does lived experience reveal things no textbook can ever transmit?",
      "Why is '10 years of experience' sometimes just 1 year repeated ten times?",
      "How do you combine deliberate study with real execution?",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "mixed",
    publishingSuggestion: "Debate clip inviting thoughtful replies on X.",
  },
  {
    dayNumber: 56,
    topic: "Why changing your mind can be a strength.",
    skill: "Intellectual humility",
    description: "Reframe updating your beliefs based on better evidence as intellectual courage rather than weakness.",
    whyItMatters:
      "Speakers who never admit error become brittle. Demonstrating intellectual honesty earns deep respect.",
    thinkingPrompts: [
      "Tell a quick story of an opinion you used to hold strongly that you've since revised.",
      "Why do public figures fight harder to protect old claims than to find what's true?",
      "What is the difference between shifting principles opportunistically and updating models from evidence?",
      "How do you publicly say 'I was wrong about X' with poise?",
    ],
    recommendedFormat: "conversational_talk",
    recommendedAudience: "mixed",
    publishingSuggestion: "Candid X post or short reel.",
  },
  {
    dayNumber: 57,
    topic: "Can ambition become a distraction?",
    skill: "Self-reflection",
    description: "Examine when chasing impressive goals, status, or too many simultaneous quests undermines depth and peace.",
    whyItMatters:
      "Ambitious people rarely ask whether their ambition is serving them or driving them blindly. Honest self-inquiry resonates.",
    thinkingPrompts: [
      "When does healthy drive cross into restlessness or status-chasing?",
      "Have you ever said yes to something impressive that pulled you away from what actually mattered?",
      "How do you distinguish true calling and craft from comparison-fueled urgency?",
      "What keeps ambition grounded in purpose and responsibility?",
    ],
    recommendedFormat: "conversational_talk",
    recommendedAudience: "entrepreneurs",
    publishingSuggestion: "Quiet reflective clip or speaking journal entry.",
  },
  {
    dayNumber: 58,
    topic: "Why simplicity is harder than complexity.",
    skill: "Explanation",
    description: "Explain why stripping away non-essentials in code, UI, writing, and speaking takes deeper understanding than adding layers.",
    whyItMatters:
      "Every discipline you care about—editorial design, Rust APIs, UX, and clear speech—converges on hard-won simplicity.",
    thinkingPrompts: [
      "Why is a 10-page document easier to write than a sharp 1-page memo?",
      "Where in software or product design does complexity hide unfinished thinking?",
      "How have you worked to simplify something complicated in Zamir, CoinSafe, or your writing?",
      "What is the difference between simple and simplistic?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "developers",
    publishingSuggestion: "Design/engineering carousel + 3-minute talk.",
  },
  {
    dayNumber: 59,
    topic: "Defend an opinion you previously disagreed with.",
    skill: "Adaptability",
    description: "Step inside an opposing viewpoint and articulate its strongest, most charitable case fairly.",
    whyItMatters:
      "If you can't state the opposing view well enough that its supporters nod, you don't fully understand the debate.",
    thinkingPrompts: [
      "Pick a genuine debate (remote vs office, monolith vs microservices, formal school vs self-taught, or an economic issue).",
      "What real problem or human priority motivates the side you usually push back on?",
      "Can you argue it without sarcasm or strawmen?",
      "What truth from that side do you now respect?",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "mixed",
    publishingSuggestion: "X thread steelmanning an opposing view.",
  },
  {
    dayNumber: 60,
    topic: "An idea that has fundamentally changed how I see the world.",
    skill: "Intellectual storytelling",
    description: "Phase 2 milestone: tell the story of one transformative concept—from economics, faith, CS, or philosophy—and how it rewired your lens.",
    whyItMatters:
      "Closes Month 2 by proving you can sustain a deep, structured intellectual narrative without reading a script.",
    thinkingPrompts: [
      "Which single idea shifted how you interpret people, work, risk, or purpose?",
      "How did you think before encountering this idea?",
      "What moment or book made it click?",
      "Where does that idea show up in your daily decisions now?",
    ],
    recommendedFormat: "mini_keynote",
    recommendedAudience: "mixed",
    publishingSuggestion: "YouTube anchor talk + Month 2 short-form essay on your blog.",
  },

  // ── MONTH 3: CONNECTION, LEADERSHIP AND INFLUENCE ──────────────────────────
  // Week 9: Personal philosophy and human experiences
  {
    dayNumber: 61,
    topic: "What does it mean to live a meaningful life?",
    skill: "Reflection",
    description: "Begin Phase 3 by articulating what gives life weight—craft, service, relationships, truth, and contribution.",
    whyItMatters:
      "Audience connection deepens when you step beyond tactics into questions every human being quietly carries.",
    thinkingPrompts: [
      "If success wasn't measured by applause or net worth, what would make a life unmistakably well-lived?",
      "Whose life do you quietly admire, and why?",
      "How do everyday integrity and small promises shape meaning more than grand moments?",
      "How does this connect to building useful things?",
    ],
    recommendedFormat: "mini_keynote",
    recommendedAudience: "general",
    publishingSuggestion: "Calm, unscripted reflection for YouTube/Instagram.",
  },
  {
    dayNumber: 62,
    topic: "Why discipline matters beyond motivation.",
    skill: "Persuasion",
    description: "Make a practical, unsentimental case for systems, environment, and daily habits over fleeting emotional highs.",
    whyItMatters:
      "You've now passed Day 60 of a 90-day commitment. You aren't theorizing about discipline—you are living proof of it.",
    thinkingPrompts: [
      "What happens on days when motivation is completely absent?",
      "What small structural habits keep you showing up without heroic willpower?",
      "Why does motivation lie at the start of hard projects?",
      "What advice feels actually usable for someone struggling with consistency?",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "students",
    publishingSuggestion: "Short grounded reel referencing Day 62 of your 90-day practice.",
  },
  {
    dayNumber: 63,
    topic: "The relationship between faith, ambition and responsibility.",
    skill: "Personal philosophy",
    description: "Speak thoughtfully about how faith anchors purpose, tempers ego, and calls for faithful stewardship of ability.",
    whyItMatters:
      "Faith and personal responsibility are real pillars of your worldview. Expressing them authentically sets you apart from shallow hustle culture.",
    thinkingPrompts: [
      "How does faith shape how you hold ambition—neither passive nor self-worshipping?",
      "What does stewardship mean when applied to engineering talent, time, and opportunity?",
      "How do you handle outcomes you cannot control while still working with full diligence?",
      "How do you speak about faith respectfully to listeners from different backgrounds?",
    ],
    recommendedFormat: "conversational_talk",
    recommendedAudience: "mixed",
    publishingSuggestion: "Long-form reflection on website or quiet Instagram/YouTube video.",
  },
  {
    dayNumber: 64,
    topic: "Why comparison distorts our understanding of progress.",
    skill: "Storytelling",
    description: "Revisit comparison through story—showing how real growth is often invisible, nonlinear, and quiet before it compounds.",
    whyItMatters:
      "In Phase 3, you turn recurring observations into compelling human stories rather than abstract advice.",
    thinkingPrompts: [
      "Tell a story about a season when it looked like nothing was happening, yet foundational growth was occurring.",
      "Why do social feeds highlight outcomes while hiding years of quiet preparation?",
      "What metaphor captures nonlinear compounding progress?",
      "How do you recognize genuine progress in yourself week to week?",
    ],
    recommendedFormat: "personal_story",
    recommendedAudience: "students",
    publishingSuggestion: "Storytelling reel + carousel.",
  },
  {
    dayNumber: 65,
    topic: "What does it mean to be a person of substance?",
    skill: "Thought leadership",
    description: "Define character, depth, reliability, and quiet competence in an era optimized for surface impressions.",
    whyItMatters:
      "Leadership communication rests on substance. Naming what separates depth from performance resonates with serious people.",
    thinkingPrompts: [
      "What traits immediately signal that someone has real substance rather than polish alone?",
      "Why does social media reward optics over character—and why does substance still win over time?",
      "What private habits build substance when nobody is watching?",
      "What kind of builder or leader do you respect most?",
    ],
    recommendedFormat: "mini_keynote",
    recommendedAudience: "leaders",
    publishingSuggestion: "X post + YouTube mini-talk.",
  },
  {
    dayNumber: 66,
    topic: "How reading has changed how I think.",
    skill: "Personal narrative",
    description: "Share specific books and habits from your Reading Log that permanently altered your mental toolkit.",
    whyItMatters:
      "Connecting your spoken ideas to your active Reading Log invites others into a richer intellectual conversation.",
    thinkingPrompts: [
      "Which two or three books noticeably upgraded how you reason, invest, or build?",
      "What changed when you started taking structured notes instead of passively finishing pages?",
      "How does reading older books protect you from today's short-term noise?",
      "What are you reading right now, and what question is it raising?",
    ],
    recommendedFormat: "personal_story",
    recommendedAudience: "mixed",
    publishingSuggestion: "Link directly to michaelojekunle.dev/reading + carousel of top reading lessons.",
  },
  {
    dayNumber: 67,
    topic: "What I wish more young people understood about adulthood.",
    skill: "Connection",
    description: "Speak warmly and honestly about agency, patience, responsibility, relationships, and building foundations early.",
    whyItMatters:
      "Speaking across life experience without sounding condescending is a key mark of relatable leadership.",
    thinkingPrompts: [
      "What illusion about adulthood disappears quickly once real responsibilities arrive?",
      "Why is nobody coming to hand out structured syllabi or guaranteed roadmaps?",
      "What quiet investments in health, character, friendships, and skill pay off massively by 30?",
      "What tone feels like an older brother talking rather than a lecturer?",
    ],
    recommendedFormat: "conversational_talk",
    recommendedAudience: "students",
    publishingSuggestion: "Instagram/YouTube video + Week 9 short-form article.",
  },

  // Week 10: Communication and human connection
  {
    dayNumber: 68,
    topic: "Why people struggle to express what they really think.",
    skill: "Observation",
    description: "Explore fear of judgment, muddled thinking, social scripts, and jargon as barriers to authentic speech.",
    whyItMatters:
      "Noticing why others hold back helps you create rooms—and talks—where honesty feels natural.",
    thinkingPrompts: [
      "When do you notice yourself watering down what you actually think?",
      "Is the problem usually vocabulary, fear of disapproval, or not having thought the idea through yet?",
      "How do borrowed buzzwords mask genuine thought?",
      "What helps someone speak plainly and truthfully?",
    ],
    recommendedFormat: "conversational_talk",
    recommendedAudience: "general",
    publishingSuggestion: "Short X observation + clip.",
  },
  {
    dayNumber: 69,
    topic: "The art of asking better questions.",
    skill: "Communication",
    description: "Show how one sharp question unlocks deeper insight than ten statements.",
    whyItMatters:
      "Great communicators lead conversations through curiosity and precision, not by dominating airtime.",
    thinkingPrompts: [
      "What makes a question genuinely open up a conversation versus shut it down?",
      "Think of a question someone asked you that stayed with you for weeks.",
      "How do good questions make engineering debugging, user interviews, and friendships dramatically better?",
      "What bad question habit do people fall into on podcasts or meetings?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "leaders",
    publishingSuggestion: "4-slide carousel with 3 practical question upgrades.",
  },
  {
    dayNumber: 70,
    topic: "Why listening is an underrated skill.",
    skill: "Connection",
    description: "Contrast waiting for your turn to speak with genuinely hearing someone's meaning, tone, and unspoken concern.",
    whyItMatters:
      "Listening is half of speaking. Speakers who listen well calibrate their message effortlessly to real humans.",
    thinkingPrompts: [
      "What does it feel like when someone is actually listening to you versus waiting to respond?",
      "Why does listening closely make you a sharper debater and better product builder?",
      "What distracts us most when another person is talking?",
      "How does silence for two seconds after someone finishes improve a conversation?",
    ],
    recommendedFormat: "conversational_talk",
    recommendedAudience: "general",
    publishingSuggestion: "Reflective clip preparing for Week 10's interview challenge.",
  },
  {
    dayNumber: 71,
    topic: "How to make a boring subject interesting.",
    skill: "Audience engagement",
    description: "Demonstrate framing, human stakes, curiosity hooks, and contrast using a seemingly dry technical or financial topic.",
    whyItMatters:
      "As an engineer and investor, much of what matters (allocators, accounting, protocols) looks dry on paper until you reveal why it matters.",
    thinkingPrompts: [
      "Pick a topic people call 'boring' (taxation, memory alignment, HTTP headers, balance sheets)—what real human drama depends on it?",
      "Why is 'boring' usually just a failure to show stakes or contrast?",
      "How do you open with tension or surprise instead of a dictionary definition?",
      "Prove it right now in your 3-minute talk!",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "mixed",
    publishingSuggestion: "Demonstrate this live in a 3-minute YouTube/IG video on a technical or finance topic.",
  },
  {
    dayNumber: 72,
    topic: "What makes a story memorable?",
    skill: "Storytelling",
    description: "Break down specificity, stakes, tension, turning points, and restraint in ending right after the point lands.",
    whyItMatters:
      "Turning raw events into crisp stories makes every future keynote, video, and article stickier.",
    thinkingPrompts: [
      "Why do vague summaries fade immediately while one sensory detail sticks for years?",
      "What is the role of conflict or obstacle—no tension, no story?",
      "Where do amateur storytellers ruin a good story (over-explaining the moral at the end)?",
      "Recall a short story you heard recently that stuck with you—why did it work?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "entrepreneurs",
    publishingSuggestion: "Carousel Lab breakdown of story structure.",
  },
  {
    dayNumber: 73,
    topic: "How to disagree without becoming enemies.",
    skill: "Diplomacy",
    description: "Explore separating ideas from identity, charitable interpretation, tone control, and knowing when to step back.",
    whyItMatters:
      "Online and in teams, disagreement often turns tribal. Modeling calm firmness makes you someone leaders trust in hard rooms.",
    thinkingPrompts: [
      "Why do technical or philosophical disagreements escalate into personal defensiveness?",
      "What phrase or posture keeps a sharp disagreement respectful?",
      "How do you hold your ground firmly without insulting the other person's intelligence?",
      "When is a disagreement worth having versus leaving alone?",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "leaders",
    publishingSuggestion: "X thread + short speaking clip.",
  },
  {
    dayNumber: 74,
    topic: "Why honesty makes communication more powerful.",
    skill: "Authenticity",
    description: "Explain why plain truth, admitting uncertainty, and dropping performative polish create instant trust.",
    whyItMatters:
      "Listeners have an extraordinary radar for performance. Dropping the mask is both simpler and stronger.",
    thinkingPrompts: [
      "When have you heard a speaker drop their polished script and say something completely honest—and felt the room shift?",
      "Why is 'I don't know yet, here is what I am testing' far stronger than fake certainty?",
      "Where do people accidentally fake authority when speaking publicly?",
      "How does honesty simplify preparation?",
    ],
    recommendedFormat: "conversational_talk",
    recommendedAudience: "mixed",
    publishingSuggestion: "Week 10 reflection article + short unscripted video.",
  },

  // Week 11: Leadership, building and vision
  {
    dayNumber: 75,
    topic: "What building Zamir is teaching me about leadership.",
    skill: "Leadership",
    description: "Reflect on setting standards, making product calls under ambiguity, and keeping momentum while building Zamir.",
    whyItMatters:
      "Leadership stories grounded in actual products you're responsible for carry real authority.",
    thinkingPrompts: [
      "What hard judgment call on Zamir couldn't be outsourced to a checklist?",
      "How do you communicate direction clearly when building with collaborators?",
      "What surprised you about leading a product from idea to thousands of real listens?",
      "What leadership habit are you actively trying to strengthen next?",
    ],
    recommendedFormat: "personal_story",
    recommendedAudience: "entrepreneurs",
    publishingSuggestion: "Founder-builder clip on X/Instagram linking to Zamir.",
  },
  {
    dayNumber: 76,
    topic: "What it means to take ownership of a problem.",
    skill: "Responsibility",
    description: "Contrast blaming circumstances, tools, or teammates with stepping forward to own the outcome.",
    whyItMatters:
      "Ownership is the defining trait of both top systems engineers and effective leaders.",
    thinkingPrompts: [
      "What is the difference between 'I did my part of the ticket' and 'I own whether this actually works for the user'?",
      "Tell a brief story where taking responsibility for something messy changed the outcome.",
      "Why do people confuse ownership with doing everything alone?",
      "What changes in a team when even one person models complete ownership?",
    ],
    recommendedFormat: "mini_keynote",
    recommendedAudience: "leaders",
    publishingSuggestion: "Short keynote clip on YouTube/X.",
  },
  {
    dayNumber: 77,
    topic: "Why execution matters more than having brilliant ideas.",
    skill: "Persuasion",
    description: "Build a persuasive argument with concrete proof from software, business, and personal development.",
    whyItMatters:
      "Persuading ambitious peers to ship, iterate, and finish beats inspiring them for five minutes.",
    thinkingPrompts: [
      "Why are 'brilliant ideas' cheap while sustained execution is scarce?",
      "What happens to an ordinary idea executed relentlessly versus a genius idea left in a Notion doc?",
      "How does execution generate new ideas you could never think up from an armchair?",
      "What concrete action can the listener take today?",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "entrepreneurs",
    publishingSuggestion: "Punchy Reel/X video.",
  },
  {
    dayNumber: 78,
    topic: "How I would approach building a technology company in Africa.",
    skill: "Vision",
    description: "Lay out a realistic, first-principles blueprint: real pain points, distribution, reliability, unit economics, and global quality.",
    whyItMatters:
      "Combines your engineering depth, business economics, and Lagos context into a coherent leadership vision.",
    thinkingPrompts: [
      "What kinds of problems in Africa actually justify software or deep tech—versus solutions looking for a problem?",
      "How would you design for intermittent networks, mobile-first users, and payment friction from day one?",
      "How do you build global-grade engineering standards while staying rooted in local reality?",
      "What would you refuse to compromise on in the first year?",
    ],
    recommendedFormat: "mini_keynote",
    recommendedAudience: "entrepreneurs",
    publishingSuggestion: "YouTube talk + structured carousel.",
  },
  {
    dayNumber: 79,
    topic: "Why ambitious students deserve more opportunities.",
    skill: "Advocacy",
    description: "Speak on talent distribution, access, mentorship, open infrastructure, and backing high-agency young builders.",
    whyItMatters:
      "Advocacy asks you to speak *for* someone else—expanding your range from self-expression to public voice.",
    thinkingPrompts: [
      "What talent goes wasted simply due to lack of exposure, hardware, mentorship, or early belief?",
      "What small opportunity early on changed your own trajectory disproportionately?",
      "How can engineers, companies, and universities create real on-ramps instead of performative events?",
      "What do you want decision-makers watching to actually do?",
    ],
    recommendedFormat: "mini_keynote",
    recommendedAudience: "leaders",
    publishingSuggestion: "Advocacy video clip on YouTube/Instagram/X.",
  },
  {
    dayNumber: 80,
    topic: "What kind of future should Africa be building?",
    skill: "Public speaking",
    description: "Deliver a forward-looking, grounded public talk on production over consumption, education, technology, and agency.",
    whyItMatters:
      "Practising genuine public-interest speaking prepares you for stages, panels, and larger conversations.",
    thinkingPrompts: [
      "Move past critiques: what positive future is worth spending twenty years helping build?",
      "What role should local builders, educators, and capital play?",
      "Why must Africa shift from importing tools to owning infrastructure and intellectual property?",
      "How do you close with hope rooted in responsibility rather than wishful thinking?",
    ],
    recommendedFormat: "mini_keynote",
    recommendedAudience: "mixed",
    publishingSuggestion: "Signature Phase 3 YouTube video + blog essay.",
  },
  {
    dayNumber: 81,
    topic: "One thing I would change about how young people approach careers.",
    skill: "Persuasion",
    description: "Give one sharp, actionable reframe—building proof of work, learning fundamentals, or playing long-term games.",
    whyItMatters:
      "Constraining yourself to *one* thing forces clarity and eliminates sprawling career advice.",
    thinkingPrompts: [
      "If you could fix just one career habit among ambitious twenty-somethings, which one has the highest leverage?",
      "Why do resumes and certificates lose to visible proof of work and clear communication?",
      "What does following this one shift look like over the next 90 days?",
      "Tell one brief example of how it paid off.",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "students",
    publishingSuggestion: "Short high-retention video + Week 11 article.",
  },

  // Week 12: Spontaneity and public presence
  {
    dayNumber: 82,
    topic: "Explain a difficult idea to a 12-year-old.",
    skill: "Simplification",
    description: "Pick zero-knowledge proofs, Rust ownership, inflation, or distributed consensus and make a 12-year-old light up with understanding.",
    whyItMatters:
      "Extreme simplification without dumbing down proves mastery of both the subject and your audience.",
    thinkingPrompts: [
      "Which difficult concept from your technical or financial world will you choose today?",
      "What game, classroom situation, or everyday analogy does a 12-year-old immediately grasp?",
      "Watch every single sentence for hidden jargon—replace it instantly.",
      "End by asking: 'Does that make sense?' in tone, keeping it playful and crisp.",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "general",
    publishingSuggestion: "Fun 2–3 minute video + Carousel Lab visual explainer.",
  },
  {
    dayNumber: 83,
    topic: "What an ordinary object can teach us about life.",
    skill: "Creativity",
    description: "Pick something on your desk—a mug, notebook, chess pawn, keyboard, or bridge—and draw an unexpected, grounded insight.",
    whyItMatters:
      "Trains creative observation and metaphor so you can generate compelling talks from everyday surroundings.",
    thinkingPrompts: [
      "Look around the room right now and pick one physical object.",
      "What is its design trade-off, flaw, or hidden purpose?",
      "What parallel does it spark about work, patience, resilience, or communication?",
      "Keep the insight grounded—avoid forced poetry.",
    ],
    recommendedFormat: "spontaneous_response",
    recommendedAudience: "general",
    publishingSuggestion: "Short creative Instagram Reel or X clip.",
  },
  {
    dayNumber: 84,
    topic: "Defend a controversial but reasonable position.",
    skill: "Debate",
    description: "Take a topic with real tension and defend a thoughtful, well-reasoned position with poise and nuance.",
    whyItMatters:
      "Real leadership requires articulating nuanced positions cleanly even when crowds prefer simple extremes.",
    thinkingPrompts: [
      "Choose a position that sparks instant pushback yet rests on solid reasoning.",
      "State the claim cleanly in your first 15 seconds.",
      "Acknowledge the valid concern on the other side before laying out your two core reasons.",
      "Stay calm, conversational, and unhurried.",
    ],
    recommendedFormat: "opinion_piece",
    recommendedAudience: "mixed",
    publishingSuggestion: "X video or thread inviting respectful debate.",
  },
  {
    dayNumber: 85,
    topic: "Tell a personal story you've never prepared before.",
    skill: "Improvisation",
    description: "Hit record with minimal notes and tell a genuine story from memory, trusting your narrative instincts.",
    whyItMatters:
      "After 84 days, you have internalized setup, tension, and takeaway. Today tests telling a story naturally on the spot.",
    thinkingPrompts: [
      "Pick a memory you haven't written down yet—funny, tense, or surprising.",
      "Drop straight into the moment: where were you and what happened?",
      "Trust pauses instead of rushing to fill air.",
      "Notice what surfaced when you didn't over-rehearse.",
    ],
    recommendedFormat: "spontaneous_response",
    recommendedAudience: "general",
    publishingSuggestion: "Practice-only or raw unedited Instagram Story/Reel.",
  },
  {
    dayNumber: 86,
    topic: "Teach something you recently learned without technical jargon.",
    skill: "Teaching",
    description: "Take something fresh from this week's engineering, Rust, AI, or reading notes and explain it in everyday language.",
    whyItMatters:
      "Demonstrates your daily learning loop in action—fresh curiosity translated immediately into accessible communication.",
    thinkingPrompts: [
      "What concept did you study in the last 48 hours?",
      "If someone outside tech asks 'what have you been learning lately?', how do you answer in three minutes?",
      "Which concrete example replaces the technical terminology?",
      "Why should an ordinary curious person find this fascinating?",
    ],
    recommendedFormat: "educational_video",
    recommendedAudience: "general",
    publishingSuggestion: "Daily learning carousel + short video clip.",
  },
  {
    dayNumber: 87,
    topic: "Speak passionately about an issue you care about.",
    skill: "Emotional connection",
    description: "Let genuine conviction come through your voice, pacing, and emphasis without slipping into theatrical shouting.",
    whyItMatters:
      "Clarity gets attention; authentic conviction moves people. Today connects head and heart.",
    thinkingPrompts: [
      "What issue—in education, technology, opportunity, or integrity—genuinely stirs you?",
      "Why does this matter personally to you, not just abstractly?",
      "Use pauses and vocal contrast rather than rushing.",
      "End with one clear, honest call to reflection or action.",
    ],
    recommendedFormat: "mini_keynote",
    recommendedAudience: "mixed",
    publishingSuggestion: "High-conviction Instagram/YouTube video.",
  },
  {
    dayNumber: 88,
    topic: "Give a talk on an unfamiliar subject using only two minutes of preparation.",
    skill: "Spontaneity",
    description: "Pick an unfamiliar topic from your Idea Bank or a random prompt, prep PREM for 120 seconds, and deliver cleanly.",
    whyItMatters:
      "Proves you can think on your feet anywhere—podcasts, Q&A, interviews, or impromptu rooms.",
    thinkingPrompts: [
      "Pick a topic you haven't studied deeply (or draw one from your Idea Bank).",
      "Spend strictly 2 minutes writing 4 words: Point, Reason, Example, Meaning.",
      "Be honest about what you know and what you're reasoning through from first principles.",
      "Deliver a calm 3-minute talk without restarting.",
    ],
    recommendedFormat: "spontaneous_response",
    recommendedAudience: "mixed",
    publishingSuggestion: "Practice-only or raw behind-the-scenes clip showing 2-minute prep.",
  },

  // FINAL DAYS: YOUR SIGNATURE TALKS
  {
    dayNumber: 89,
    topic: "The person I am becoming and the future I want to contribute to.",
    skill: "Vision",
    description: "Revisit Day 1 with 88 days of clarity: articulate who you are becoming as an engineer, writer, builder, and communicator.",
    whyItMatters:
      "Bridges the end of the 90 days into your ongoing life, work, and public voice.",
    thinkingPrompts: [
      "How has your self-understanding sharpened since Day 1?",
      "What kind of difficult engineering and product problems do you want to own over the next five years?",
      "What kind of communicator, teammate, and person of substance are you building yourself into?",
      "What future are you actively contributing to through your work and writing?",
    ],
    recommendedFormat: "mini_keynote",
    recommendedAudience: "mixed",
    publishingSuggestion: "YouTube/Website video essay setting up tomorrow's Day 90 signature talk.",
  },
  {
    dayNumber: 90,
    topic: "What I believe about building a meaningful life and creating value.",
    skill: "Signature talk",
    description: "Your 10-minute capstone presentation synthesizing engineering, curiosity, storytelling, value creation, faith, and human connection—plus full comparison with Day 1.",
    whyItMatters:
      "Day 90 is not the end—it is the graduation into a permanent speaking and writing practice, anchored by a signature 10-minute talk.",
    thinkingPrompts: [
      "What are the core convictions you now hold about building useful things, learning deeply, and creating real value?",
      "Which concrete stories from your projects, mistakes, and these 90 days belong in your signature talk?",
      "What surprised you most when re-watching your Day 1 recording alongside today?",
      "What ongoing rhythm of daily learning, carousels, weekly short-form articles, and talks comes next?",
    ],
    recommendedFormat: "mini_keynote",
    recommendedAudience: "mixed",
    publishingSuggestion: "Publish your 10-minute signature talk on YouTube, embed/link it on your Website, and share the 90-day reflection across X & Instagram.",
  },
];

export const CURRICULUM_DAYS: CurriculumDay[] = RAW_CURRICULUM_SEEDS.map((seed) => {
  const phase = getPhaseForDay(seed.dayNumber);
  const week = getWeekMetaForDay(seed.dayNumber);
  const monthNumber = week.monthNumber as 1 | 2 | 3;
  const isFinalDay = seed.dayNumber === 90;

  return {
    id: `day-${seed.dayNumber}`,
    dayNumber: seed.dayNumber,
    date: getDateForDayNumber(seed.dayNumber),
    phase: phase.number,
    monthNumber,
    monthTitle: MONTH_TITLES[monthNumber],
    weekNumber: week.weekNumber,
    weekTitle: week.weekTitle,
    topic: seed.topic,
    description: seed.description,
    whyItMatters: seed.whyItMatters,
    skill: seed.skill,
    duration: isFinalDay ? "10 minutes" : "3–5 minutes",
    thinkingPrompts: seed.thinkingPrompts,
    recommendedFormat: seed.recommendedFormat,
    recommendedAudience: seed.recommendedAudience,
    audienceAngles: seed.audienceAngles ?? {},
    exercise: isFinalDay
      ? "Deliver a composed 10-minute signature presentation without reading a script, then review Day 1 alongside Day 90."
      : "Speak for 3–5 minutes without reading a script. First take: uninterrupted. Second take: improve the weakest part of the first recording.",
    recordingChecklist: DEFAULT_RECORDING_CHECKLIST,
    publishingSuggestion: seed.publishingSuggestion,
    weeklyChallengeReference: week.challengeTitle,
    isFinalDay,
  };
});

export function getCurriculumDay(dayNumber: number): CurriculumDay | undefined {
  return CURRICULUM_DAYS.find((d) => d.dayNumber === dayNumber);
}

export function getWeekDays(weekNumber: number): CurriculumDay[] {
  return CURRICULUM_DAYS.filter((d) => d.weekNumber === weekNumber);
}
