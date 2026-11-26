import type { AestheticMood, AspectRatio, BackgroundStyle, LogoMark, Slide } from "./types";

export type TemplateTrack =
  | "all"
  | "simplistic"
  | "social-native"
  | "maximalist"
  | "terminal"
  | "executive";

export interface TrackMeta {
  id: TemplateTrack;
  label: string;
  description: string;
  badge: string;
}

export const TRACK_METAS: TrackMeta[] = [
  {
    id: "all",
    label: "All Tracks",
    description: "Browse all curated starter template decks across all creator styles.",
    badge: "Full Catalog",
  },
  {
    id: "simplistic",
    label: "Simplistic & Minimal",
    description: "Basic text & heading clarity, Swiss typography, stark white space, and zero unnecessary decoration.",
    badge: "Track 01",
  },
  {
    id: "social-native",
    label: "Social-Native (X / Threads)",
    description: "Tweet card frames, avatar handles, thread connectors, verified tags, and conversational quote bubbles.",
    badge: "Track 02",
  },
  {
    id: "maximalist",
    label: "Maximalist & Acid Pop",
    description: "High-voltage neon borders, electric lime, sticker punch callouts, high-contrast drop shadows.",
    badge: "Track 03",
  },
  {
    id: "terminal",
    label: "Terminal & Developer",
    description: "MacOS traffic lights, monospace CLI prompt, code diffs, architecture pipelines, and systems logs.",
    badge: "Track 04",
  },
  {
    id: "executive",
    label: "Executive & Newsprint",
    description: "Financial Times linen newsprint, Wall Street Journal serif, quarterly board memos, and capital theses.",
    badge: "Track 05",
  },
];

export interface StarterDeck {
  id: string;
  title: string;
  subtitle: string;
  track: Exclude<TemplateTrack, "all">;
  trackLabel: string;
  category: "Tech & Dev" | "Venture & Executive" | "Growth & Copy" | "Essays & Mindset" | "Design & Craft" | "Editorial";
  targetAudience: string;
  intention: string;
  aesthetic: AestheticMood;
  aspectRatio: AspectRatio;
  backgroundStyle: BackgroundStyle;
  topRightTag: string;
  creatorName: string;
  creatorHandle: string;
  logoText: string;
  logoMark: LogoMark;
  fontTitle?: string;
  fontBody?: string;
  slides: Slide[];
}

export const STARTER_DECKS: StarterDeck[] = [
  // ── TRACK 1: SIMPLISTIC & MINIMAL ──────────────────────────────────────────
  {
    id: "simple-clean",
    title: "Pure Minimal: Text & Heading",
    subtitle: "Stark Swiss typography, high-contrast white space & focused clarity",
    track: "simplistic",
    trackLabel: "Simplistic",
    category: "Design & Craft",
    targetAudience: "Minimalists & Clear Thinkers",
    intention: "Strip away all decorative noise so the core premise delivers maximum intellectual punch.",
    aesthetic: "Minimalist Clean",
    aspectRatio: "portrait",
    backgroundStyle: "solid",
    topRightTag: "Minimalist Note",
    creatorName: "Michael Ojekunle",
    creatorHandle: "michaelojekunle.dev",
    logoText: "MINIMAL",
    logoMark: "mo",
    slides: [
      {
        title: "The Simplicity Advantage",
        content: "If you cannot explain your product in a 10-word sentence, the problem is not your marketing. The problem is your product.",
        layout: "hook",
      },
      {
        title: "The Flaw of Feature Creep",
        content: "Adding more options creates decision friction. The highest-converting products ruthlessly eliminate 80% of edge-case settings.",
        layout: "default",
      },
      {
        title: "Clarity vs. Clutter",
        content: "Clutter feels productive during creation. Clarity feels effortless during consumption.",
        layout: "split",
      },
      {
        title: "The Core Rule",
        content: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.",
        layout: "quote",
      },
      {
        title: "Read More Notes",
        content: "Read weekly field notes on minimalism, product architecture, and clean design at michaelojekunle.dev.",
        layout: "cta",
      },
    ],
  },
  {
    id: "simple-manifesto",
    title: "Single-Point Micro Manifesto",
    subtitle: "Bold central thesis, stark monochrome emphasis & zero filler",
    track: "simplistic",
    trackLabel: "Simplistic",
    category: "Essays & Mindset",
    targetAudience: "Writers, Strategists & Solo Operators",
    intention: "Present a single foundational principle with uncompromising typography and discipline.",
    aesthetic: "Minimalist Clean",
    aspectRatio: "portrait",
    backgroundStyle: "solid",
    topRightTag: "Micro Manifesto",
    creatorName: "Michael Ojekunle",
    creatorHandle: "michaelojekunle.dev",
    logoText: "THESIS",
    logoMark: "mo",
    slides: [
      {
        title: "Do Fewer Things. Obsess Over Quality.",
        content: "Why the modern obsession with multi-tasking is destroying original thought and craft.",
        layout: "hook",
      },
      {
        title: "The Vanity of Velocity",
        content: "Running fast in five random directions produces zero net displacement. One focused hour beats eight fragmented hours.",
        layout: "default",
      },
      {
        title: "10x Depth Multiplier",
        content: "The market pays exponential rewards for the top 1% of depth, and near-zero for average breadth.",
        emoji: "10x",
        layout: "metrics",
      },
      {
        title: "The Operating Principle",
        content: "Ruthlessly decline good opportunities so you have the bandwidth to seize extraordinary ones.",
        layout: "quote",
      },
      {
        title: "Join the Quiet Craft",
        content: "A weekly letter on deliberate work and uncompromising creative stamina at michaelojekunle.dev.",
        layout: "cta",
      },
    ],
  },

  // ── TRACK 2: SOCIAL-NATIVE (X / TWITTER / THREADS) ─────────────────────────
  {
    id: "tweet-mockup",
    title: "Twitter / X Post Frame",
    subtitle: "Native tweet styling with avatar, @handle, verified tick & metrics",
    track: "social-native",
    trackLabel: "Social-Native",
    category: "Growth & Copy",
    targetAudience: "Creators & Twitter/X Operators",
    intention: "Leverage familiar social card cues (avatar, handle, stats) to maximize dwell time and engagement.",
    aesthetic: "Linear Swiss",
    aspectRatio: "portrait",
    backgroundStyle: "mesh",
    topRightTag: "Thread 1/5",
    creatorName: "Michael Ojekunle",
    creatorHandle: "@michaelojekunle",
    logoText: "POST",
    logoMark: "mo",
    slides: [
      {
        title: "The Best Advice I Received in 8 Years of Building",
        content: "Most advice on Twitter is optimized for likes, not execution. Here are 4 harsh realities about product retention 🧵👇",
        layout: "hook",
      },
      {
        title: "Lesson 1: Users Don't Read",
        content: "They scan, skim, and look for immediate visual confirmation. Design for scanning, not reading comprehension.",
        layout: "default",
      },
      {
        title: "Lesson 2: Retention > Acquisition",
        content: "A leaky funnel cannot be solved with top-of-funnel spend. Fix the leak before pouring more water into the bucket.",
        layout: "split",
      },
      {
        title: "84% Churn Reduction",
        content: "Shortening time-to-first-value from 12 minutes to 90 seconds cut early churn by 84% in 30 days.",
        emoji: "84%",
        layout: "metrics",
      },
      {
        title: "Enjoyed this thread?",
        content: "Follow @michaelojekunle for daily systems thinking, software craft, and product teardowns.",
        layout: "cta",
      },
    ],
  },
  {
    id: "growth-blueprint",
    title: "Viral Copy & Conversion Blueprint",
    subtitle: "Psychology-first landing page teardowns & high-converting copy shifts",
    track: "social-native",
    trackLabel: "Social-Native",
    category: "Growth & Copy",
    targetAudience: "Growth Marketers & Solopreneurs",
    intention: "Drive viral engagement, high dwell-time retention, and high conversion with bold, punchy social copy.",
    aesthetic: "Midnight Neon",
    aspectRatio: "portrait",
    backgroundStyle: "mesh",
    topRightTag: "Growth Playbook",
    creatorName: "Michael Ojekunle",
    creatorHandle: "michaelojekunle.dev",
    logoText: "GROWTH",
    logoMark: "mo",
    slides: [
      {
        title: "90% of Landing Pages Fail This 5-Second Test",
        content: "The exact 4-part copy framework that doubled conversion rates on our highest-traffic funnel without changing the product.",
        layout: "hook",
      },
      {
        title: "Fatal Mistake: Selling Features Over Relieved Pain",
        content: "Nobody buys software features. They buy immediate relief from a sharp, expensive headache that kept them awake at 2 AM.",
        layout: "default",
      },
      {
        title: "The Before vs. After Frame",
        content: "Stop writing: 'Automated invoice reconciliation.' Write: 'Get paid this Friday without chasing clients or opening spreadsheets.'",
        layout: "split",
      },
      {
        title: "The Golden Rule of Conversion",
        content: "If a 12-year-old cannot explain what you sell after 5 seconds, your page is leaking 60% of potential buyers.",
        layout: "quote",
      },
      {
        title: "2.4x Higher Conversion Rate",
        content: "Reframing the primary hero section to lead with the customer's relief metric doubled qualified demo bookings in 14 days.",
        emoji: "2.4x",
        layout: "metrics",
      },
      {
        title: "Grab the Free Copy Blueprint",
        content: "Save this carousel and visit michaelojekunle.dev to download our complete high-converting landing page swipe file.",
        layout: "cta",
      },
    ],
  },

  // ── TRACK 3: MAXIMALIST & ACID POP ─────────────────────────────────────────
  {
    id: "acid-neon",
    title: "High-Voltage Neon Pop",
    subtitle: "OLED black, electric lime highlighter, punchy sticker tags & bold borders",
    track: "maximalist",
    trackLabel: "Maximalist",
    category: "Growth & Copy",
    targetAudience: "Bold Creators, Disruptors & Gen-Z Marketers",
    intention: "Command instant scroll-stopping attention with unapologetic contrast and intense visual energy.",
    aesthetic: "Midnight Neon",
    aspectRatio: "portrait",
    backgroundStyle: "mesh",
    topRightTag: "HOT TAKE",
    creatorName: "Michael Ojekunle",
    creatorHandle: "michaelojekunle.dev",
    logoText: "ACID",
    logoMark: "mo",
    slides: [
      {
        title: "Boring Marketing is Financial Suicide",
        content: "If your brand sounds like everyone else in your category, you are paying a 100% invisible boredom tax on every impression.",
        layout: "hook",
      },
      {
        title: "The Sea of Corporate Beige",
        content: "Everyone uses the same pastel gradients, the same stock illustrations, and the same safe corporate buzzwords. Break the pattern.",
        layout: "default",
      },
      {
        title: "Polite Silence vs. Loud Retention",
        content: "Safe marketing gets zero complaints and zero sales. Polarizing clarity repels the wrong crowd and hypnotizes your true buyers.",
        layout: "split",
      },
      {
        title: "3.8x Higher Click-Through",
        content: "Switching from passive corporate copy to high-contrast irreverent messaging drove a 380% surge in qualified inbound leads.",
        emoji: "3.8x",
        layout: "metrics",
      },
      {
        title: "Stand Out or Disappear",
        content: "Follow for weekly high-voltage branding teardowns, contrarian growth levers, and design rebellion at michaelojekunle.dev.",
        layout: "cta",
      },
    ],
  },
  {
    id: "contrarian-punch",
    title: "Brutalist Punch: Hot Takes",
    subtitle: "Raw concrete gray, 4px heavy borders, typewriter font & hard drop shadow",
    track: "maximalist",
    trackLabel: "Maximalist",
    category: "Growth & Copy",
    targetAudience: "Opinion Leaders, Founders & Comment Drivers",
    intention: "Provoke fierce debate and massive comment velocity by attacking sacred industry conventions.",
    aesthetic: "Brutalist Punch",
    aspectRatio: "portrait",
    backgroundStyle: "solid",
    topRightTag: "Contrarian Take",
    creatorName: "Michael Ojekunle",
    creatorHandle: "michaelojekunle.dev",
    logoText: "BRUTAL",
    logoMark: "mo",
    slides: [
      {
        title: "Stop Doing Weekly 1-on-1s. They Are Ruining Your Team.",
        content: "Why calendar status meetings are an executive crutch, and the 3-bullet async protocol we used to replace them.",
        layout: "hook",
      },
      {
        title: "The Hidden Cost: 30 Hours of Context Switching",
        content: "Scattering 30-minute syncs throughout the week destroys flow state. Deep engineering work requires 4-hour uninterrupted blocks.",
        layout: "default",
      },
      {
        title: "The Hard Truth",
        content: "If you need a recurring weekly meeting to know what your team is building, your documentation and tracking are already broken.",
        layout: "quote",
      },
      {
        title: "Synchronous Trap vs. Async Memo",
        content: "Meetings reward the loudest person in the room. Asynchronous 3-bullet memos reward the clearest, most disciplined thinker.",
        layout: "split",
      },
      {
        title: "+20% Velocity Boost",
        content: "Canceling recurring status syncs gave our engineering organization back 180 collective focus hours every single sprint.",
        emoji: "+20%",
        layout: "metrics",
      },
      {
        title: "What is your take?",
        content: "Do you still run weekly status meetings? Drop your perspective in the comments below — let's debate.",
        layout: "cta",
      },
    ],
  },

  // ── TRACK 4: TERMINAL & DEVELOPER ──────────────────────────────────────────
  {
    id: "tech-architecture",
    title: "Tech Architecture Teardown",
    subtitle: "Scalability post-mortem, distributed bottlenecks & engineering rules",
    track: "terminal",
    trackLabel: "Terminal",
    category: "Tech & Dev",
    targetAudience: "Developers & Systems Architects",
    intention: "Deconstruct technical challenges, architecture migrations, and post-mortems with maximum developer credibility.",
    aesthetic: "Terminal Obsidian",
    aspectRatio: "portrait",
    backgroundStyle: "mesh",
    topRightTag: "Architecture Teardown",
    creatorName: "Michael Ojekunle",
    creatorHandle: "michaelojekunle.dev",
    logoText: "DEV",
    logoMark: "mo",
    slides: [
      {
        title: "How We Scaled to 10M Req/Sec (And the 1 Fatal Bottleneck)",
        content: "A post-mortem breakdown of our distributed cache failure under load, and the 3 architectural rules we enforced to prevent outages.",
        layout: "hook",
      },
      {
        title: "The Naive Architecture: Redis as Source-of-Truth",
        content: "Under 150k concurrency, connection pool exhaustion triggered cascaded timeouts across all 14 backend microservices in under 90 seconds.",
        layout: "default",
      },
      {
        title: "The Culprit: Unbounded N+1 Serialization",
        content: "Every single cache miss triggered 28 unindexed SQL queries. P99 latency spiked from 14ms to 4.2 seconds instantly.",
        layout: "split",
      },
      {
        title: "99.99% Uptime Restored",
        content: "Single-flight cache stampede suppression + write-through replicas collapsed P99 back down to 8ms at peak load.",
        emoji: "99.9%",
        layout: "metrics",
      },
      {
        title: "Architecture Rule #1",
        content: "Never allow a cache miss to hit your primary transactional database without circuit-breaking and deduplication.",
        layout: "quote",
      },
      {
        title: "Read the Full Post-Mortem",
        content: "Explore weekly distributed systems teardowns, low-latency protocols, and backend lessons at michaelojekunle.dev.",
        layout: "cta",
      },
    ],
  },
  {
    id: "linear-design",
    title: "Product Design & UI/UX Teardown",
    subtitle: "Micro-interactions, latency masking & modern software aesthetics",
    track: "terminal",
    trackLabel: "Terminal",
    category: "Design & Craft",
    targetAudience: "UI/UX Designers & Product Engineers",
    intention: "Deconstruct interface details, spatial layout tokens, and user experience psychology with Swiss precision.",
    aesthetic: "Linear Swiss",
    aspectRatio: "portrait",
    backgroundStyle: "mesh",
    topRightTag: "Design Systems",
    creatorName: "Michael Ojekunle",
    creatorHandle: "michaelojekunle.dev",
    logoText: "DESIGN",
    logoMark: "mo",
    slides: [
      {
        title: "Why Linear Feels 10x Faster Than Every Other Tool",
        content: "A deep dive into optimistic UI states, latency perception tricks, and the keyboard-first spatial design of modern software.",
        layout: "hook",
      },
      {
        title: "Optimistic UI: Never Wait for the Network",
        content: "UI state updates instantaneously on keystroke. The user perceives zero latency because changes precede backend confirmations.",
        layout: "default",
      },
      {
        title: "Hairline Contrast & Spatial Grid",
        content: "Replacing heavy drop shadows with 1px border tokens creates visual breathing room without cluttering cognitive focus.",
        layout: "split",
      },
      {
        title: "30ms Perception Threshold",
        content: "Any software interaction under 50ms feels instantaneous to human perception. Modern web apps achieve this with local-first caches.",
        emoji: "30ms",
        layout: "metrics",
      },
      {
        title: "The Design Craft Tenet",
        content: "Speed is not just an engineering metric. Speed is the primary emotional resonance of modern software craft.",
        layout: "quote",
      },
      {
        title: "Follow for UI/UX Craft",
        content: "Deconstructing the interface architecture of the world's most elegant software products every Tuesday.",
        layout: "cta",
      },
    ],
  },

  // ── TRACK 5: EXECUTIVE & NEWSPRINT ─────────────────────────────────────────
  {
    id: "executive-thesis",
    title: "Executive Market Thesis",
    subtitle: "Macro SaaS shifts, margin compression & emerging enterprise playbooks",
    track: "executive",
    trackLabel: "Executive",
    category: "Venture & Executive",
    targetAudience: "Founders, VCs & Enterprise Leaders",
    intention: "Publish high-status industry memos, capital allocation arguments, and board-level market perspectives.",
    aesthetic: "Venture Thesis",
    aspectRatio: "portrait",
    backgroundStyle: "mesh",
    topRightTag: "Executive Memo",
    creatorName: "Michael Ojekunle",
    creatorHandle: "michaelojekunle.dev",
    logoText: "VENTURE",
    logoMark: "mo",
    slides: [
      {
        title: "The $120B Silent Shift in Enterprise Software",
        content: "Why seat-based SaaS margins are compressing, and where the next decade of enterprise software value will accrue.",
        layout: "hook",
      },
      {
        title: "The Death of Per-Seat License Models",
        content: "Enterprises are shrinking headcount while demanding 5x output. When autonomous agents execute workflows, per-seat licensing collapses.",
        layout: "default",
      },
      {
        title: "Work Delivered vs. Software Licensed",
        content: "The dominant tech platforms of 2026-2030 monetize verified outcomes rather than user logins. Value shifts from workflow to verification.",
        layout: "split",
      },
      {
        title: "7.2x EV/NTM Multiple Expansion",
        content: "Companies pricing on outcome delivery are commanding premium valuations compared to legacy workflow vendors.",
        emoji: "7.2x",
        layout: "metrics",
      },
      {
        title: "The Operating Principle",
        content: "Software used to be a tool for humans to do work. Today software does the work, and humans verify the quality.",
        layout: "quote",
      },
      {
        title: "Subscribe to the Executive Memo",
        content: "Bi-weekly analyses on capital allocation, venture trends, and disruptive software business models.",
        layout: "cta",
      },
    ],
  },
  {
    id: "mindset-essay",
    title: "Timeless Mental Model",
    subtitle: "Reflections on deep work, compounding craft & intellectual stamina",
    track: "executive",
    trackLabel: "Executive",
    category: "Essays & Mindset",
    targetAudience: "Thinkers, Essayists & Authors",
    intention: "Craft contemplative, philosophical decks that distill timeless insights and encourage deep reflection.",
    aesthetic: "Warm Clay & Mindset",
    aspectRatio: "portrait",
    backgroundStyle: "mesh",
    topRightTag: "Mental Models",
    creatorName: "Michael Ojekunle",
    creatorHandle: "michaelojekunle.dev",
    logoText: "CRAFT",
    logoMark: "mo",
    slides: [
      {
        title: "The Iron Law of Compounding Craft",
        content: "Why the most enduring creators and thinkers ignore vanity metrics and optimize solely for obsessive intellectual depth.",
        layout: "hook",
      },
      {
        title: "The False Illusion of Speed",
        content: "Most people confuse frantic motion with meaningful progress. High velocity in the wrong direction is just accelerated failure.",
        layout: "default",
      },
      {
        title: "On Deliberate Solitude",
        content: "All of humanity's problems stem from man's inability to sit quietly in a room alone for one hour. — Blaise Pascal",
        layout: "quote",
      },
      {
        title: "Surface Noise vs. Deep Compounding",
        content: "Surface output burns you out with zero durability. Deep craft compounds silently and pays asymmetric dividends for decades.",
        layout: "split",
      },
      {
        title: "The Asymmetric Advantage",
        content: "In a world flooded with synthetic noise, deep human contemplation and original taste are the scarcest assets in existence.",
        layout: "default",
      },
      {
        title: "Explore More Essays",
        content: "Read weekly essays on creative stamina, the philosophy of craft, and independent thinking at michaelojekunle.dev.",
        layout: "cta",
      },
    ],
  },
  {
    id: "signature-editorial",
    title: "Signature Editorial Manifesto",
    subtitle: "Luxury thought leadership, human moats & independent media",
    track: "executive",
    trackLabel: "Executive",
    category: "Editorial",
    targetAudience: "Columnists & Thought Leaders",
    intention: "Publish timeless luxury commentary and executive essays with Michael Ojekunle's signature dark editorial aesthetic.",
    aesthetic: "Premium Editorial (Zamir)",
    aspectRatio: "portrait",
    backgroundStyle: "mesh",
    topRightTag: "Signature Essay",
    creatorName: "Michael Ojekunle",
    creatorHandle: "michaelojekunle.dev",
    logoText: "MICHAEL",
    logoMark: "mo",
    slides: [
      {
        title: "The Era of Commodity AI Content Is Dead",
        content: "Three foundational shifts every creator and executive must confront as synthetic noise drowns out generic publications.",
        layout: "hook",
      },
      {
        title: "The Zero-Marginal-Code Reality",
        content: "When generation becomes free, advantage shifts from implementation speed to taste, curated distribution, and lived perspective.",
        layout: "default",
      },
      {
        title: "Synthetic Volume vs. Human Moat",
        content: "Old moat: Publishing frequency and keyword volume. New moat: Uncompromising taste, real-world scars, and personal credibility.",
        layout: "split",
      },
      {
        title: "The Core Insight",
        content: "Technology changes faster than human psychology. Build your moat entirely around what will not change over the next 50 years.",
        layout: "quote",
      },
      {
        title: "Read the Complete Letter",
        content: "Published bi-weekly for senior leaders, founders, and operators at michaelojekunle.dev.",
        layout: "cta",
      },
    ],
  },
];
