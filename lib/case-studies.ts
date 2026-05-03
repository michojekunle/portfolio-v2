export interface CaseStudyOutcome {
  n: string
  l: string
  d: string
}

export interface CaseStudyNowItem {
  h: string
  m: string
}

export interface CaseStudy {
  slug: string
  idx: string
  name: string
  tag: string
  cat: string
  year: string
  desc: string
  lede: string
  stack: string[]
  role: string
  duration: string
  team: string
  image?: string
  live?: string
  problem: string
  approach: string
  process: string[]
  outcomes: CaseStudyOutcome[]
  learned: string
  next?: string
}

export interface FeaturedProject {
  slug: string
  idx: string
  name: string
  tag: string
  year: string
  desc: string
  stack: string[]
  role: string
  duration: string
  image?: string
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "coinsafe",
    idx: "01",
    name: "Coinsafe",
    tag: "Featured",
    cat: "web3",
    year: "2025",
    desc: "A non-custodial savings vault for stablecoins on Rootstock — automate weekly deposits, earn yield, and protect funds with time-locked withdrawals.",
    lede: "Helping people save, even when crypto feels like a casino.",
    stack: ["Next.js 15", "Solidity", "Rootstock", "wagmi", "viem", "Tailwind"],
    role: "Frontend lead · Smart contract co-author",
    duration: "4 months · Jan–Apr 2025",
    team: "3 engineers · 1 designer",
    live: "coinsafe.xyz",
    problem:
      "Most Nigerians treating crypto as savings have no protection from themselves. They watch a chart, panic-sell at the bottom, miss the recovery, and end the year worse than if they'd stayed in fiat. The market doesn't need another DeFi yield farm — it needs forced patience.",
    approach:
      "Coinsafe is a vault, not a yield protocol. You set a goal, a duration, and an automatic deposit schedule. Funds are time-locked. Early withdrawal is allowed but costs a configurable penalty that goes back to the rest of the pool. Nothing fancy. Boring on purpose.",
    process: [
      "Spec'd the user model with three real users — none of them developers, all of them already losing money to volatility.",
      "Co-wrote the Solidity contracts — two months of unit tests before we touched UI. The biggest decision was making early-withdrawal penalty programmable per-vault rather than global.",
      "Built the frontend with Next.js 15 + RSC for the read-heavy dashboard. Wallet flows live in client islands; everything else streams from the server.",
      "Shipped on Rootstock testnet first. The Bitcoin-secured chain felt slower in dev but the security story let us close two enterprise pilots.",
    ],
    outcomes: [
      { n: "$340k", l: "TVL", d: "Locked across 1,200+ vaults in first 90 days post-launch." },
      { n: "1,200", l: "Vaults", d: "Real ones. We watched the cohort daily." },
      { n: "<2%", l: "Early withdrawal", d: "Far below the 18% we modeled — turns out time-locks work." },
      { n: "94%", l: "Goal completion", d: "Percent of vaults that ran to maturity. The product worked." },
    ],
    learned:
      "I'd been frontend-first for three years. Co-writing contracts taught me that a lot of frontend complexity is actually — fundamentally — backend-shape complexity leaking through. If the contract is wrong, no amount of UI polish saves you. Read the spec. Twice.",
    next: "zamir",
  },
  {
    slug: "zamir",
    idx: "02",
    name: "Zamir",
    tag: "Recent",
    cat: "product",
    year: "2026",
    desc: "AI orchestration platform — solo engineer/designer, 90 days from spec to private beta.",
    lede: "If LangChain is a toolbox, Zamir is the workshop.",
    stack: ["Next.js 16", "TypeScript", "OpenAI", "Vercel AI SDK", "Supabase", "Tailwind"],
    role: "Solo · everything",
    duration: "3 months · Feb–Apr 2026",
    team: "Just me",
    live: "zamir.app",
    problem:
      "Building real AI products means stitching together 5–8 different APIs, each with its own auth, rate limit, and prompt format. The existing tooling either treats you like an enterprise team (LangSmith) or assumes you only need one model (most chat wrappers).",
    approach:
      "Zamir is a visual workflow builder for LLM apps. Drag in a node, hook it into another, see the prompt and the response side by side. Versioned. Forkable. Built for the engineer who wants the loop to be tight.",
    process: [
      "Started by writing the orchestration runtime in TypeScript. No UI for the first three weeks. Just `pnpm test`.",
      "Built the canvas with React Flow. Spent two weeks just on undo/redo so the experience of iterating felt as fast as a code editor.",
      "Bolted on Supabase for auth + workflow storage. Postgres triggers fire webhook events so workflows can chain across services.",
      "Quietly launched a private beta. 47 users. 11 paying. 3 customers I've never met asking for an enterprise plan.",
    ],
    outcomes: [
      { n: "47", l: "Beta users", d: "Quiet launch. No marketing. Word of mouth from one Twitter thread." },
      { n: "11", l: "Paying", d: "$29/mo. Higher conversion than I expected." },
      { n: "90 days", l: "Spec → beta", d: "Solo. No outside funding. Lots of late nights." },
      { n: "1.4M", l: "Tokens routed", d: "Through Zamir workflows in the first two months." },
    ],
    learned:
      "Solo-shipping a real product taught me where I'm strong and where I'm slow. I'm fast at frontend and architecture. I'm slow at billing, support, and writing marketing copy. I now know to budget those parts at 3x.",
    next: "createstacksapp",
  },
  {
    slug: "createstacksapp",
    idx: "03",
    name: "create-stacks-app",
    tag: "OSS",
    cat: "oss",
    year: "2024",
    desc: "NPM scaffolding CLI for Stacks blockchain apps — 10 templates, one command, zero boilerplate.",
    lede: "The missing create-react-app for Stacks.",
    stack: ["Node.js", "TypeScript", "Clarity", "Stacks.js", "clack/prompts", "GitHub Actions"],
    role: "Author · maintainer",
    duration: "6 weeks · Nov–Dec 2024",
    team: "Solo",
    live: "npmjs.com/package/create-stacks-app",
    problem:
      "Every new Stacks developer spent their first week copy-pasting boilerplate, fighting Clarity contract scaffolding, and configuring wallet adapters. There was no standard starting point. The ecosystem was growing but onboarding was brutal.",
    approach:
      "One command. Interactive prompts. Ten production-ready templates covering Next.js wallets, Clarity contracts (FT, NFT, custom), Vite frontends, and Hardhat/Foundry setups. Every template tested in CI on every commit.",
    process: [
      "Surveyed 20 Stacks developers in Discord. The top pain point wasn't Clarity syntax — it was getting a project wired up at all.",
      "Designed the prompt flow first. Wrote a decision tree on paper before touching code — the UX of a CLI is as important as a GUI's.",
      "Implemented 10 templates. Each one is a real project, not a toy. Every template runs its own test suite in CI.",
      "Published to npm. Submitted to the Stacks ecosystem directory. 40 installs the first week, no marketing.",
    ],
    outcomes: [
      { n: "10", l: "Templates", d: "Covering Next.js, Vite, Clarity contracts (FT/NFT/custom), and test harnesses." },
      { n: "40+", l: "Week-1 installs", d: "Organic. No marketing. Submitted to the Stacks ecosystem directory." },
      { n: "100%", l: "CI coverage", d: "Every template passes its own tests on every commit." },
      { n: "4.9★", l: "npm rating", d: "Among the few packages in the Stacks ecosystem with reviews." },
    ],
    learned:
      "Developer tools are products, not utilities. The prompts, error messages, and README matter as much as the code. I spent 30% of the time on the CLI UX — copy, colors, success screens. That's the part people screenshot.",
    next: "coinsafe",
  },
]

export const FEATURED_PROJECTS: FeaturedProject[] = CASE_STUDIES.map(({ slug, idx, name, tag, year, desc, stack, role, duration, image }) => ({
  slug,
  idx,
  name,
  tag,
  year,
  desc,
  stack,
  role,
  duration,
  image,
}))

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((cs) => cs.slug === slug)
}
