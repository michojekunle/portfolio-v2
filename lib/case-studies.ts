export interface CaseStudyOutcome {
  n: string;
  l: string;
  d: string;
}

export interface CaseStudyNowItem {
  h: string;
  m: string;
}

export interface GalleryItem {
  src: string;
  alt: string;
  kind: "desktop" | "phone";
  w: number;
  h: number;
}

export interface CaseStudy {
  slug: string;
  idx: string;
  name: string;
  tag: string;
  cat: string;
  year: string;
  desc: string;
  lede: string;
  stack: string[];
  role: string;
  duration: string;
  team: string;
  image?: string;
  gallery?: GalleryItem[];
  live?: string;
  problem: string;
  approach: string;
  process: string[];
  outcomes: CaseStudyOutcome[];
  learned: string;
  next?: string;
}

export interface FeaturedProject {
  slug: string;
  idx: string;
  name: string;
  tag: string;
  year: string;
  desc: string;
  stack: string[];
  role: string;
  duration: string;
  image?: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "zamir",
    idx: "01",
    name: "Zamir",
    tag: "Flagship",
    cat: "product",
    year: "2026",
    desc: "Turns Bible verses into worship songs, in seven styles and ten languages. Live since March 2026. Built with a team of four.",
    lede: "Scripture, on repeat.",
    stack: [
      "Next.js",
      "TypeScript",
      "Flutter",
      "Gemini",
      "Music-generation API",
    ],
    role: "CEO & CTO · Product and engineering",
    duration: "Live since March 2026",
    team: "4 people · 1 founding engineer",
    image: "/work/zamir/01-marketing-hero-desktop.webp",
    gallery: [
      { src: "/work/zamir/02-marketing-find-a-verse-desktop.webp", alt: "Zamir website: finding a verse by feeling", kind: "desktop", w: 1800, h: 1125 },
      { src: "/work/zamir/03-marketing-altar-desktop.webp", alt: "Zamir website: the Altar daily habit", kind: "desktop", w: 1800, h: 1125 },
      { src: "/work/zamir/04-marketing-languages-desktop.webp", alt: "Zamir website: songs in ten languages", kind: "desktop", w: 1800, h: 1125 },
      { src: "/work/zamir/09-app-home-ios.webp", alt: "Zamir iOS app: home", kind: "phone", w: 700, h: 1522 },
      { src: "/work/zamir/10-app-altar-ios.webp", alt: "Zamir iOS app: the Altar with a nine-day streak", kind: "phone", w: 700, h: 1522 },
      { src: "/work/zamir/13-app-create-song-ios.webp", alt: "Zamir iOS app: creating a song", kind: "phone", w: 700, h: 1522 },
      { src: "/work/zamir/11-app-library-ios.webp", alt: "Zamir iOS app: library", kind: "phone", w: 700, h: 1522 },
    ],
    live: "zamir.app",
    problem:
      "Scripture is easy to read and easy to forget. Songs stick. But writing, producing and translating a worship song for every verse, in the listener's own language and style, is not something one person can do on demand. For most people in my context there is also almost nothing in Yorùbá, Igbo, Hausa or Naijá.",
    approach:
      "Zamir lets you pick a feeling or paste a passage, choose a style and a language, and get a song back. Around that sits a daily habit: the Altar delivers a new verse and song every morning and asks you to recall three missing words to keep a streak. The product is built so that listening, memorising and sharing all feel like one loop rather than separate features.",
    process: [
      "Designed the product around the daily habit first. Soul Check (18 emotions mapped to verses), custom songs (7 styles, 10 languages, 14 translations), read-along and memorisation, and the Altar with its forgiving streak: one missed day per week is covered automatically.",
      "Built the web app in Next.js with API routes, and the mobile app in Flutter. Song generation runs through Gemini and a music-generation API behind those routes. The mobile apps are in beta with testers.",
      "Put a credits model in front of generation so the cost of every song is bounded: 4 credits at sign-up, 1 more every 3 days up to 10 a month, and extra songs for purchase. Listening to shared songs is free and needs no account.",
      "Worked with a small team. Our founding engineer proposed OPFS for offline listening on the web and added tooltips. I took the rest of the product from first commit to production, including the Altar, sharing, the morning email and the Journal.",
    ],
    outcomes: [
      {
        n: "69",
        l: "Believers",
        d: "People using Zamir, as of November 2026.",
      },
      {
        n: "105",
        l: "Community songs",
        d: "Songs in the shared community library.",
      },
      {
        n: "~420",
        l: "Songs produced",
        d: "Estimated. Older generations are counted at two songs each.",
      },
      {
        n: "233",
        l: "Hearts",
        d: "Hearts given to songs by listeners.",
      },
      {
        n: "4.7k",
        l: "Plays",
        d: "4,699 plays, with 1,914 repeats. People come back to the same songs.",
      },
      {
        n: "290+",
        l: "Hours listened",
        d: "Total listening time across all songs.",
      },
    ],
    learned:
      "Every generated song costs real money, so a consumer AI product has to be designed around unit cost from the first day. That is why credits exist, and why exact cost-per-song and failure tracking is the next thing I want to measure properly. It is also what pulled me toward infrastructure: the product questions I care about most are now reliability and cost questions.",
    next: "coinsafe",
  },
  {
    slug: "coinsafe",
    idx: "02",
    name: "CoinSafe",
    tag: "Web3",
    cat: "web3",
    year: "2024–2025",
    desc: "A goal-based, time-locked savings protocol on Lisk and Base. I owned the frontend and the wallet and contract integrations, including account-abstracted onboarding.",
    lede: "Making on-chain savings feel like a savings app, not a protocol dashboard.",
    stack: [
      "Next.js",
      "TypeScript",
      "thirdweb",
      "Lisk",
      "Base",
      "PWA",
    ],
    role: "Founding team · Frontend & blockchain integrations engineer",
    duration: "~18 months · 2024–2025",
    team: "4–6 people",
    image: "/work/coinsafe/dash.webp",
    gallery: [
      { src: "/work/coinsafe/vault.webp", alt: "CoinSafe vault with savings targets and locked balances", kind: "desktop", w: 1800, h: 1026 },
      { src: "/work/coinsafe/landing2.webp", alt: "CoinSafe landing page: save and earn", kind: "desktop", w: 1800, h: 1026 },
      { src: "/work/coinsafe/card1.webp", alt: "CoinSafe save flow: one-time save with target and duration", kind: "desktop", w: 1187, h: 1175 },
      { src: "/work/coinsafe/card2.webp", alt: "CoinSafe scheduled savings panel", kind: "desktop", w: 708, h: 951 },
    ],
    live: "coinsafe.network",
    problem:
      "DeFi savings feel like protocol dashboards. There are few goal-setting or discipline tools, and lock periods are rarely explained clearly. On top of that, the wallet itself is the first obstacle: asking someone who just wants to save to install an extension, store a seed phrase and buy gas is where most of them leave.",
    approach:
      "The protocol, designed and written by the contracts team, is vault-centric: each user gets an isolated vault, saving strategies are separate modules, and withdrawal time-locks are enforced in the contract rather than the interface. My side was the product on top of it: the app, the onboarding, and every connection between the interface, the backend and the chain.",
    process: [
      "Built the account abstraction layer on thirdweb: sign-in with Google, email or other social options, passkey-based onboarding, and gas sponsorship, so new users could start saving without knowing what a wallet was.",
      "Integrated the interface with the backend and the smart contracts across 50+ screens: target and emergency safes, one-time and automated saving, assets and rewards, and a progressive web app experience.",
      "Kept the interface honest about asynchronous reality. I listened to contract events and synced them into application state with optimistic updates, across more than ten transaction types, so a pending transaction never left the screen lying.",
      "Because I was the one integrating the contracts, I read them closely. I did informal contract reviews and reported bugs I found from the integration side. I did not write the contracts.",
    ],
    outcomes: [
      {
        n: "200+",
        l: "User wallets",
        d: "Registered through the account abstraction onboarding.",
      },
      {
        n: "10+",
        l: "Transaction types",
        d: "Synchronised between contract events and application state.",
      },
      {
        n: "18 months",
        l: "On the team",
        d: "From the founding team through launch and iteration.",
      },
    ],
    learned:
      "Integration work lives on the seam between three systems, the interface, the backend and the chain, and bugs live on that seam. Reading contracts closely enough to flag problems made me a better frontend engineer, and it made me want to understand what sits underneath the contracts: storage, consensus and the machinery that makes the guarantees real.",
    next: "zk-implementations",
  },
  {
    slug: "zk-implementations",
    idx: "03",
    name: "ZK Proof Systems in Rust",
    tag: "Research · Public repo",
    cat: "systems",
    year: "2026",
    desc: "Rust implementations of GKR, KZG polynomial commitments and the Sumcheck protocol, with tests and a Criterion benchmark harness. Work in progress, public on GitHub.",
    lede: "Turning the paper into code, one protocol at a time.",
    stack: ["Rust", "GKR", "KZG", "Sumcheck", "Fiat–Shamir", "Criterion"],
    role: "Author · Solo",
    duration: "Ongoing",
    team: "Just me",
    live: "github.com/michojekunle/zk",
    problem:
      "Interactive proof systems are easy to nod along to in a paper and hard to get right in code. Every sentence a paper skips, such as how variables are indexed, how layers connect and how challenges are derived, becomes a bug when you implement it. I wanted to understand these protocols well enough to build them, not just use them through someone else's library.",
    approach:
      "Start from the smallest piece and build up. Sumcheck is the core: it reduces a claim about a sum over a hypercube to a single evaluation. GKR layers those reductions across a circuit. KZG commits to polynomials so a verifier can check evaluations succinctly. Fiat–Shamir turns the interaction into a non-interactive proof by deriving the verifier's challenges from a transcript.",
    process: [
      "Implemented polynomial representations and arithmetic first, then the Sumcheck prover and verifier, then GKR on top, with a verifier that checks claimed sums and proofs layer by layer against evaluations, random challenges and input consistency.",
      "Fixed the GKR layer handling so the number of variables per layer is derived from the layer's length rather than assumed.",
      "Found and corrected a bit-indexing bug in the KZG trusted setup: it used least-significant-bit indexing where the protocol layout needs most-significant-bit. Tests pass after the change.",
      "Added a Criterion benchmark harness so performance work is measured, not guessed. Published numbers will follow once the methodology is documented.",
    ],
    outcomes: [
      {
        n: "3",
        l: "Protocols",
        d: "GKR, KZG commitments and Sumcheck, plus polynomial arithmetic and Fiat–Shamir.",
      },
      {
        n: "1",
        l: "Indexing bug fixed",
        d: "KZG setup now uses most-significant-bit indexing.",
      },
      {
        n: "Criterion",
        l: "Benchmarks added",
        d: "The harness is in the repo. Results will be published with the method.",
      },
    ],
    learned:
      "Implementation is the real test of understanding. The bugs were never in the maths I had memorised; they were in the details the paper leaves implicit. It is also an honest picture of where I am: this is a work in progress, not a production library, and I would rather show that than overstate it.",
    next: "rhng",
  },
  {
    slug: "rhng",
    idx: "04",
    name: "RHNG",
    tag: "Built solo",
    cat: "product",
    year: "Client work",
    desc: "The website for Roberts House Nigeria, a Lagos energy-engineering company. Taken from requirements to production in about three months, independently.",
    lede: "One engineer, requirements to production, with the results to show for it.",
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Sanity",
      "Supabase",
      "Resend",
      "Vercel",
    ],
    role: "Independent full-stack developer",
    duration: "~3 months · requirements to production",
    team: "Solo",
    live: "rh-ng.com",
    problem:
      "Roberts House Nigeria is an engineering partner for Nigeria's energy transition: cryogenic engineering, CNG, LNG and LPG supply, a training academy and energy consultancy. It needed a production website that explains four service lines to industrial buyers, takes enquiries, lets the team manage content themselves, and is found in search.",
    approach:
      "Own the whole lifecycle: requirements and planning, frontend, backend and API work, content management, email, deployment, SEO and performance. A headless CMS keeps content editable without a developer, and a Node API handles backend logic and email.",
    process: [
      "Turned the company's goals into requirements and a plan before writing code.",
      "Built the frontend in Next.js, React, TypeScript and Tailwind, with content modelled in Sanity so the team can edit it themselves.",
      "Wired the backend: a Node API, Supabase for stored data and Resend for email, deployed on Vercel.",
      "Treated search visibility and speed as features, and measured them with PageSpeed and Search Console rather than guessing.",
    ],
    outcomes: [
      {
        n: "100",
        l: "PageSpeed score",
        d: "Reported performance score at launch.",
      },
      {
        n: "2.5k",
        l: "Search impressions",
        d: "Reported from Search Console after launch.",
      },
      {
        n: "85+",
        l: "Search clicks",
        d: "Reported organic clicks.",
      },
    ],
    learned:
      "Owning a project end to end means every decision has a cost you personally pay later. It taught me to choose boring, maintainable tools and to treat the client's ability to run the site without me as part of the deliverable. The source is private client work, and the figures are the ones I reported at the time.",
    next: "edifition",
  },
  {
    slug: "edifition",
    idx: "05",
    name: "Edifition",
    tag: "Frontend team",
    cat: "product",
    year: "Client work",
    desc: "Frontend engineering on a three-developer team at Edifition, a product development studio for startups: 20+ pages, 30+ reusable components, Keycloak authentication and a measured performance gain.",
    lede: "A large frontend, kept fast and consistent by a small team.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Keycloak"],
    role: "Frontend developer",
    duration: "Team engagement",
    team: "3 developers",
    live: "edifition.com",
    problem:
      "A growing product needs a frontend that stays consistent as pages multiply, integrates with many backend services, and sits behind real authentication, without getting slow.",
    approach:
      "A shared component library so pages are assembled rather than rewritten, a clear frontend architecture the three of us could extend in parallel, and Keycloak for authentication. Performance was tracked as a number, not a feeling.",
    process: [
      "Built 20+ pages and 7+ features on a library of 30+ reusable components.",
      "Integrated roughly five to ten backend APIs and the Keycloak authentication flow.",
      "Profiled with Lighthouse and worked through the biggest costs first, raising the performance score from 67 to 90.",
      "Worked in a small team, so consistency came from shared components and conventions rather than review bottlenecks.",
    ],
    outcomes: [
      {
        n: "20+",
        l: "Pages",
        d: "Across 7+ features.",
      },
      {
        n: "30+",
        l: "Reusable components",
        d: "The shared library the three of us built on.",
      },
      {
        n: "+23",
        l: "Lighthouse points",
        d: "Performance score improved from 67 to 90.",
      },
    ],
    learned:
      "In a team of three, the component library is the architecture, and performance work pays off when you measure first and fix the biggest cost first. The source is private, and the figures are those I reported.",
    next: "createstacksapp",
  },
  {
    slug: "createstacksapp",
    idx: "06",
    name: "create-stacks-app",
    tag: "OSS",
    cat: "oss",
    year: "2026",
    desc: "An npm scaffolding CLI that sets up full-stack Stacks blockchain applications from a single command.",
    lede: "The missing starting point for Stacks developers.",
    stack: ["Node.js", "TypeScript", "Clarity", "Stacks.js", "npm"],
    role: "Author · maintainer",
    duration: "Jan–Mar 2026 · 40+ releases",
    team: "Solo",
    image: "/work/createstacksapp/landing.webp",
    gallery: [
      { src: "/work/createstacksapp/docs.webp", alt: "create-stacks-app documentation site", kind: "desktop", w: 1800, h: 1085 },
    ],
    live: "npmjs.com/package/@devvmichael/create-stacks-app",
    problem:
      "Starting a Stacks project meant assembling the pieces by hand: contract scaffolding, frontend, wallet integration and tooling. There was no standard starting point, so each new developer repeated the same setup work.",
    approach:
      "One command that scaffolds a full-stack Stacks application, published to npm so it is available wherever a developer already works.",
    process: [
      "Designed the prompt flow before writing code, because the experience of a CLI is its interface.",
      "Published and iterated in public: more than forty releases between January and March 2026.",
      "Kept the package small and dependable, since a scaffolder is only useful if it works the first time.",
    ],
    outcomes: [
      {
        n: "40+",
        l: "Releases",
        d: "From 0.1.0 in January 2026 to 0.2.43 in March 2026.",
      },
      {
        n: "1.4k+",
        l: "npm downloads",
        d: "Total downloads on the public registry.",
      },
      {
        n: "1",
        l: "Command",
        d: "To scaffold a full-stack Stacks app.",
      },
    ],
    learned:
      "Developer tools are products. The prompts, error messages and README matter as much as the code, and shipping many small releases taught me how fast feedback improves a tool when it is public.",
    next: "zamir",
  },
];

export const FEATURED_PROJECTS: FeaturedProject[] = CASE_STUDIES.slice(0, 3).map(
  ({ slug, idx, name, tag, year, desc, stack, role, duration, image }) => ({
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
  })
);

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((cs) => cs.slug === slug);
}
