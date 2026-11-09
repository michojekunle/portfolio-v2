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
  logo?: string;
  logoBg?: string;
  gallery?: GalleryItem[];
  imagePosition?: string;
  liveLabel?: string;
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
  logo?: string;
  logoBg?: string;
  imagePosition?: string;
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
    role: "CEO & CTO · Product & Engineering",
    duration: "Ongoing",
    team: "4 people · 1 founding engineer",
    image: "/work/zamir/01-marketing-hero-desktop.webp",
    logo: "/work/zamir/logo.svg",
    logoBg: "#052e16",
    imagePosition: "20% 50%",
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
    liveLabel: "Live App",
    problem:
      "Scripture is easy to read and easy to forget. Songs stick. But writing, producing, and translating a worship song for every verse, in the listener's own language and style, is not something one person can do on demand. For most people in my context, there was also virtually nothing available in Yorùbá, Igbo, Hausa, or Naijá.",
    approach:
      "Zamir lets you pick a feeling or paste a passage, choose a style and a language, and get a song back. Around that sits a daily habit: the Altar delivers a new verse and song every morning and asks you to recall three missing words to keep a streak. The product is built so that listening, memorising, and sharing all feel like one loop rather than separate features.",
    process: [
      "Designed the product around the daily habit loop first: Soul Check (18 emotional states mapped to verses), generative worship songs (7 styles, 10 languages, 14 translations), read-along memorisation, and the Altar with automated streak forgiveness (one missed day per week covered automatically).",
      "Built the web application in Next.js with TypeScript and the mobile clients in Flutter. Song generation runs through Gemini and specialized audio synthesis models behind backend API routes.",
      "Designed a bounded user credits model to strictly protect unit economics: 4 free credits at sign-up, 1 more every 3 days up to 10 a month, with extra songs for purchase. Public community listening is completely free and requires no account.",
      "Built the product from first commit to production—including the Altar, sharing flows, daily morning emails, and the Journal—collaborating with a small founding team on offline OPFS storage and tooltips.",
    ],
    outcomes: [
      {
        n: "40.7%",
        l: "Repeat rate",
        d: "1,914 of 4,699 plays are repeats — listeners build real daily scripture habits.",
      },
      {
        n: "4.7k",
        l: "Plays",
        d: "4,699 plays across 10 languages and 7 musical styles.",
      },
      {
        n: "69",
        l: "Active listeners",
        d: "People using Zamir organically as of November 2026.",
      },
      {
        n: "105",
        l: "Community songs",
        d: "Songs published to the shared public library.",
      },
      {
        n: "~420",
        l: "Songs produced",
        d: "Estimated total catalog generated since public beta.",
      },
      {
        n: "290+",
        l: "Hours listened",
        d: "Total listening time logged across organic sessions.",
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
    role: "Frontend & Web3 Engineer · Founding Team",
    duration: "~18 months",
    team: "4–6 people",
    image: "/work/coinsafe/landing2.webp",
    logo: "/work/coinsafe/logo.svg",
    logoBg: "#451a03",
    gallery: [
      { src: "/work/coinsafe/vault.webp", alt: "CoinSafe vault with savings targets and locked balances", kind: "desktop", w: 1800, h: 1026 },
      { src: "/work/coinsafe/landing2.webp", alt: "CoinSafe landing page: save and earn", kind: "desktop", w: 1800, h: 1026 },
      { src: "/work/coinsafe/card1.webp", alt: "CoinSafe save flow: one-time save with target and duration", kind: "desktop", w: 1187, h: 1175 },
      { src: "/work/coinsafe/card2.webp", alt: "CoinSafe scheduled savings panel", kind: "desktop", w: 708, h: 951 },
    ],
    live: "coinsafe.network",
    liveLabel: "Live App",
    problem:
      "DeFi savings platforms usually look and feel like confusing protocol dashboards. There are few goal-setting or discipline mechanisms, and withdrawal lock rules are buried in docs. On top of that, crypto wallet onboarding is the biggest drop-off point: asking someone who just wants to save money to install a browser extension, write down 12 seed words, and buy gas tokens loses them immediately.",
    approach:
      "The smart contracts team designed an isolated, vault-centric protocol where time-locks and savings strategies are strictly enforced on-chain. My job was owning the entire product layer on top: the responsive web app, the onboarding flow, and every bridge connecting user interfaces to backend APIs and the blockchain.",
    process: [
      "Implemented an account abstraction pipeline with thirdweb: enabled Google, email, and biometric passkey onboarding with sponsored gas, allowing non-crypto users to start saving without knowing what a seed phrase is.",
      "Engineered the frontend and contract interactions across 50+ screens: target safes, emergency lockboxes, automated recurring deposits, and reward claims in a progressive web app (PWA).",
      "Built a reactive event-listening pipeline to keep UI state synchronized with blockchain confirmations. Mapped over ten smart contract transaction types using optimistic updates so the UI never stalled during block latency.",
      "Conducted close contract reviews from the integration boundary, catching and reporting protocol edge-cases and transaction reversion risks before deployment.",
    ],
    outcomes: [
      {
        n: "200+",
        l: "Non-crypto wallets",
        d: "Registered seamlessly through sponsored account abstraction onboarding.",
      },
      {
        n: "10+",
        l: "Transaction types",
        d: "Synchronised between on-chain events and optimistic UI state.",
      },
      {
        n: "50+",
        l: "App screens",
        d: "Shipped across target safes, lockboxes, and portfolio management.",
      },
      {
        n: "18 mos",
        l: "On the team",
        d: "From founding team architecture through mainnet launch and iteration.",
      },
    ],
    learned:
      "Integration work lives on the seam between three systems: the interface, the backend, and the chain—and bugs live on that seam. Reading contracts closely enough to flag problems made me a better frontend engineer, and it made me want to understand what sits underneath the contracts: storage, consensus, and the machinery that makes the guarantees real.",
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
    role: "Author & Systems Researcher · Solo",
    duration: "Ongoing research",
    team: "Solo",
    image: "/work/zk/circuit.svg",
    logo: "/work/zk/logo.svg",
    logoBg: "#042f2e",
    gallery: [
      {
        src: "/work/zk/circuit.svg",
        alt: "ZK Proof System pipeline: GKR layered circuit reduction, Sumcheck protocol, and KZG polynomial commitment verification",
        kind: "desktop",
        w: 1600,
        h: 1000,
      },
    ],
    live: "github.com/michojekunle/zk",
    liveLabel: "GitHub Source",
    problem:
      "Interactive proof systems are easy to nod along to in a paper and hard to get right in code. Every sentence a paper skips, such as how variables are indexed, how layers connect and how challenges are derived, becomes a bug when you implement it. I wanted to understand these protocols well enough to build them, not just use them through someone else's library.",
    approach:
      "Start from the smallest piece and build up. Sumcheck is the core: it reduces a claim about a sum over a hypercube to a single evaluation. GKR layers those reductions across a circuit. KZG commits to polynomials so a verifier can check evaluations succinctly. Fiat–Shamir turns the interaction into a non-interactive proof by deriving the verifier's challenges from a transcript.",
    process: [
      "Implemented polynomial representations and evaluation arithmetic in Rust from first principles.",
      "Engineered the Sumcheck prover and verifier, then layered GKR on top with verification routines checking circuit layer outputs against evaluations and random challenges.",
      "Found and corrected a critical bit-indexing bug in the KZG trusted setup: it used least-significant-bit indexing where the protocol layout needs most-significant-bit format. Tests pass after the change.",
      "Added a Criterion benchmark harness so performance work is measured, not guessed. Published numbers will follow once the methodology is documented.",
    ],
    outcomes: [
      {
        n: "3",
        l: "Core protocols",
        d: "GKR circuit reduction, KZG commitments and Sumcheck, plus polynomial arithmetic and Fiat–Shamir.",
      },
      {
        n: "1",
        l: "Indexing bug fixed",
        d: "KZG setup now uses most-significant-bit indexing format.",
      },
      {
        n: "Criterion",
        l: "Micro-benchmarks",
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
    year: "2024",
    desc: "The digital platform for Roberts House Nigeria, an industrial energy engineering firm in Lagos helping factories transition from diesel generators to natural gas. Built solo from requirements to production in three months.",
    lede: "One engineer, requirements to production, with real numbers to back it up.",
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
    role: "Independent Full-Stack Developer · Solo",
    duration: "~3 months",
    team: "Solo",
    image: "/work/rhng/landing-on-laptop.png",
    logo: "/work/rhng/logo.webp",
    logoBg: "#0f172a",
    gallery: [
      { src: "/work/rhng/landing-on-laptop.png", alt: "RHNG homepage on laptop mockup", kind: "desktop", w: 1600, h: 1000 },
      { src: "/work/rhng/landing.png", alt: "RHNG landing page: Leading the Energy Revolution", kind: "desktop", w: 1600, h: 1000 },
      { src: "/work/rhng/engineering_page.png", alt: "RHNG Cryogenic Engineering and Pressure Systems", kind: "desktop", w: 1600, h: 1000 },
      { src: "/work/rhng/cng_page.png", alt: "RHNG CNG / LNG / LPG virtual pipeline supply", kind: "desktop", w: 1600, h: 1000 },
      { src: "/work/rhng/logisitics_page.png", alt: "RHNG Logistics and training academy", kind: "desktop", w: 1600, h: 1000 },
    ],
    live: "rh-ng.com",
    liveLabel: "Live Site",
    problem:
      "In Nigeria, industrial power is brutal—running heavy diesel generators can eat up to 70% of a plant's operating costs. Natural gas is dramatically cheaper and cleaner, but switching takes serious engineering: cryogenic tanks, pressure skids, and virtual pipelines (CNG/LNG trucking). RHNG needed a web presence that explained these four complex divisions to industrial plant managers, captured quote requests, and ranked on Google without needing an agency on retainer.",
    approach:
      "I took the project from zero to production solo. I structured the frontend in Next.js, TypeScript, and Tailwind, and modeled their four divisions in Sanity CMS so their commercial team could update specs themselves. I wired quote requests to Supabase and Resend, configured Microsoft Clarity to monitor drop-offs, and treated performance and SEO as core engineering requirements.",
    process: [
      "Mapped out the user flow for factory owners and plant engineers looking for industrial gas conversions.",
      "Built the frontend across RHNG's four core divisions: Cryogenic Engineering, Virtual Pipeline Supply (CNG/LNG/LPG), Training Academy, and Energy Consultancy.",
      "Modeled structured content schemas in Sanity CMS so the team could edit service capabilities and case studies without touching Git.",
      "Built endpoints with Supabase for quote storage, Resend for instant email notifications, and Microsoft Clarity for telemetry.",
      "Tuned Core Web Vitals to hit a 100/100 PageSpeed score, helping the site earn 2.5k+ search impressions right after launch.",
    ],
    outcomes: [
      {
        n: "100",
        l: "PageSpeed score",
        d: "Perfect mobile and desktop performance score at launch.",
      },
      {
        n: "2.5k+",
        l: "Search impressions",
        d: "Organic visibility reported from Search Console.",
      },
      {
        n: "85+",
        l: "Search clicks",
        d: "Direct organic clicks from prospective industrial clients.",
      },
      {
        n: "4",
        l: "Divisions",
        d: "Engineering, Virtual Pipelines, Training Academy, and Advisory.",
      },
    ],
    learned:
      "When you build a client platform solo, there is no one else to blame for a sloppy decision. It reinforced my preference for simple, rock-solid tools—Next.js, typed schemas in Sanity, and managed backends. If a client can operate their own platform without needing me to touch the codebase, I did my job.",
    next: "triple-cure",
  },
  {
    slug: "triple-cure",
    idx: "05",
    name: "Triple Cure Assembly",
    tag: "Built solo",
    cat: "product",
    year: "2024",
    desc: "The digital home and community portal for Triple Cure Assembly, a foundation supporting students and youth across Ondo State with scholarships and ICT centers. Built solo in roughly eight weeks.",
    lede: "From empty repo to live foundation portal in 60 days.",
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
    role: "Independent Full-Stack Developer · Solo",
    duration: "~2 months",
    team: "Solo",
    image: "/work/triple-cure/tca-landing-on-laptop.png",
    gallery: [
      { src: "/work/triple-cure/tca-landing-on-laptop.png", alt: "Triple Cure Assembly on laptop mockup showing initiatives and ICT literacy programs", kind: "desktop", w: 1600, h: 1000 },
      { src: "/work/triple-cure/tca_landing_page.png", alt: "Triple Cure Assembly homepage: Where Potential Meets Purpose", kind: "desktop", w: 1600, h: 1000 },
      { src: "/work/triple-cure/tca_about_page.png", alt: "Triple Cure Assembly about page: A Vision Born From Service honoring Barrister Clement Oyedele Akintola Arikawe", kind: "desktop", w: 1600, h: 1000 },
      { src: "/work/triple-cure/tca_scholarships_page.png", alt: "Triple Cure Assembly scholarship portal and Annual Igbotako Scholarship program", kind: "desktop", w: 1600, h: 1000 },
    ],
    live: "triplecure.com",
    liveLabel: "Live Foundation",
    problem:
      "Triple Cure Assembly is an education and community foundation in Ondo State that funds youth scholarships and digital training hubs. They had zero web presence and needed a fast, clean home to announce their programs—including the Annual Igbotako Scholarship and the Okitipupa ICT Hub—and publish ceremony updates. Most importantly, the board needed to manage everything themselves without having to call a developer every time they had an announcement.",
    approach:
      "I built and shipped the entire platform solo in about two months, from an empty repo to production on Vercel. I set up Next.js with TypeScript and Tailwind, and structured Sanity CMS so non-technical staff can post updates, photos, and announcements directly. Form submissions are wired to Supabase and Resend. Note: the live scholarship intake form is currently turned off on the client's end, but the foundation portal, program criteria, ICT center partnership, and CMS publishing pipeline are fully operational in their hands.",
    process: [
      "Sat down with the foundation team to understand what they needed: a clean, reliable site they could update without breaking things.",
      "Built the frontend with Next.js, React, TypeScript, and Tailwind, keeping page weights tiny and layouts crisp on mobile (crucial for users in Ondo State with variable network connections).",
      "Structured the content schema in Sanity CMS for news, scholarship guidelines, and ICT hub programs so the board could publish recaps—like the 2026 award ceremony where 20 students received scholarships.",
      "Hooked up Supabase and Resend for backend inquiries, added proper NGO structured data (JSON-LD) for search, and deployed to Vercel.",
    ],
    outcomes: [
      {
        n: "~8 wks",
        l: "Concept to live",
        d: "Built independently on an accelerated turnaround from zero to production.",
      },
      {
        n: "100%",
        l: "Self-administered",
        d: "The board publishes stories and ceremony recaps without asking for engineering help.",
      },
      {
        n: "20",
        l: "Scholars supported",
        d: "Students awarded merit scholarships at the 2026 ceremony alongside local community empowerment.",
      },
    ],
    learned:
      "Building for non-technical teams always reinforces the same lesson: if the CMS is too complicated or fragile, people stop updating the site the week after launch. Designing the editing experience in Sanity was just as important as writing the frontend. Giving them a system that runs without me was the real goal.",
    next: "edifition",
  },
  {
    slug: "edifition",
    idx: "06",
    name: "Edifition",
    tag: "Frontend team",
    cat: "product",
    year: "2023–2024",
    desc: "Frontend engineering at Edifition, a product development studio building client startup applications: 20+ pages, 30+ reusable components, Keycloak authentication, and a measured performance gain.",
    lede: "A large frontend, kept fast and consistent by a small team.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Keycloak"],
    role: "Frontend Engineer · Software Studio",
    duration: "9 months",
    team: "3 developers",
    image: "/work/peacefulnes.png",
    gallery: [
      { src: "/work/peacefulnes.png", alt: "Peacefulness platform built at Edifition: multilingual resources, internationalization, and partner portals", kind: "desktop", w: 1600, h: 1000 }
    ],
    live: "edifition.com",
    liveLabel: "Studio",
    problem:
      "Edifition is a software development studio where I worked alongside two other developers building production web apps for client startups (including platforms like the Peacefulness Institute). The challenge on client studio work is discipline: client startups bring different backend microservices, authentication requirements (like Keycloak), and tight deadlines. Without a strict component architecture, every new client app descends into copy-pasted UI, broken styles, and tanking Lighthouse scores.",
    approach:
      "Instead of rebuilding client interfaces from scratch, we designed a shared system of 30+ reusable UI components. I built the frontend architecture so the three of us could ship pages in parallel without stepping on each other's code, integrated client microservices and Keycloak authentication, and treated web performance as an engineering deliverable rather than a last-minute cleanup.",
    process: [
      "Built 20+ production pages and 7+ core features across client applications using a shared library of 30+ modular React components.",
      "Engineered client platforms like Peacefulness Institute, handling internationalization (i18n), multi-locale media delivery (video, audio, PDF) across 10+ languages, and protected partner portals.",
      "Wired client frontends to five to ten backend APIs and configured Keycloak enterprise authentication with role-based access control (RBAC).",
      "Profiled frontend bottlenecks with Chrome DevTools and Lighthouse, eliminating layout thrashing and bundle bloat to lift the performance score from 67 to 90 (+23 points).",
    ],
    outcomes: [
      {
        n: "20+",
        l: "Production pages",
        d: "Shipped across 7+ core client features and platforms.",
      },
      {
        n: "30+",
        l: "Reusable components",
        d: "The shared modular UI library our 3-developer team built on.",
      },
      {
        n: "+23",
        l: "Lighthouse points",
        d: "Performance score improved from 67 to 90 on client web apps.",
      },
    ],
    learned:
      "On a small studio team, your component library is your sanity. It cut our feature delivery turnaround by over a third and prevented design drift across client apps. More importantly, it proved that performance isn't something you sprinkle on at the end—you have to benchmark it on real mobile devices and eliminate the heaviest render costs first.",
    next: "createstacksapp",
  },
  {
    slug: "createstacksapp",
    idx: "07",
    name: "create-stacks-app",
    tag: "OSS",
    cat: "oss",
    year: "2026",
    desc: "An npm scaffolding CLI that sets up full-stack Stacks blockchain applications from a single command.",
    lede: "The missing starting point for Stacks developers.",
    stack: ["Node.js", "TypeScript", "Clarity", "Stacks.js", "npm"],
    role: "Author & Maintainer · Open Source",
    duration: "~3 months (40+ releases)",
    team: "Solo",
    image: "/work/createstacksapp/landing.webp",
    logo: "/work/createstacksapp/logo.svg",
    logoBg: "#1e1b4b",
    gallery: [
      { src: "/work/createstacksapp/docs.webp", alt: "create-stacks-app documentation site", kind: "desktop", w: 1800, h: 1085 },
    ],
    live: "npmjs.com/package/@devvmichael/create-stacks-app",
    liveLabel: "npm Package",
    problem:
      "Starting a Stacks blockchain project meant assembling the entire tooling stack by hand: contract scaffolding, frontend, wallet authentication, and build scripts. There was no standard starting point, so every developer wasted hours re-solving the same initial setup before writing any product code.",
    approach:
      "A single command-line tool that scaffolds an opinionated, production-ready Stacks full-stack application. Published directly to npm so developers can run it instantly with `npx @devvmichael/create-stacks-app` without manual installation.",
    process: [
      "Designed the interactive CLI prompts first with intuitive terminal choices, because developer experience begins before a single dependency installs.",
      "Packaged modern templates linking Clarity smart contracts, Hiro / Stacks.js wallet authentication, and a clean Next.js frontend.",
      "Iterated rapidly in public across 40+ releases, fixing edge cases reported by developers and keeping boilerplate lean and reliable.",
    ],
    outcomes: [
      {
        n: "40+",
        l: "Public releases",
        d: "From 0.1.0 in January 2026 to 0.2.43 in March 2026.",
      },
      {
        n: "1.4k+",
        l: "npm downloads",
        d: "Total downloads logged on the public npm registry.",
      },
      {
        n: "1",
        l: "Terminal command",
        d: "To scaffold a complete, type-safe full-stack Stacks app.",
      },
    ],
    learned:
      "Developer tools are products with terminal user interfaces. The CLI prompts, clear error messages, and a no-fuss README matter just as much as the underlying scripts. Shipping in public taught me how fast community feedback sharpens a developer tool.",
    next: "zamir",
  },
];

export const FEATURED_PROJECTS: FeaturedProject[] = [
  CASE_STUDIES.find((cs) => cs.slug === "zamir")!,
  CASE_STUDIES.find((cs) => cs.slug === "coinsafe")!,
  CASE_STUDIES.find((cs) => cs.slug === "triple-cure")!,
  CASE_STUDIES.find((cs) => cs.slug === "zk-implementations")!,
].map(
  ({ slug, idx, name, tag, year, desc, stack, role, duration, image, logo, logoBg, imagePosition }) => ({
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
    logo,
    logoBg,
    imagePosition,
  })
);

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((cs) => cs.slug === slug);
}
