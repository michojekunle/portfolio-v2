# Michael Ojekunle

Software engineer building products end-to-end across web, mobile, and blockchain, going deep on Rust systems and AI infrastructure.

[**Live Site**](https://michaelojekunle.dev) &nbsp;·&nbsp; [**GitHub**](https://github.com/michojekunle) &nbsp;·&nbsp; [**X / Twitter**](https://x.com/devvmichael) &nbsp;·&nbsp; [**LinkedIn**](https://linkedin.com/in/michojekunle)

---

## Overview

A personal digital garden, systems depth map, and production showcase designed with an editorial aesthetic (Fraunces serif, JetBrains Mono, high-contrast monochrome paper tones).

- **/work:** In-depth engineering case studies ([Zamir](https://michaelojekunle.dev/work/zamir), [CoinSafe](https://michaelojekunle.dev/work/coinsafe), [ZK Implementations](https://michaelojekunle.dev/work/zk-implementations), [RHNG](https://michaelojekunle.dev/work/rhng), [Triple Cure Assembly](https://michaelojekunle.dev/work/triple-cure), [Edifition](https://michaelojekunle.dev/work/edifition), and [create-stacks-app](https://michaelojekunle.dev/work/createstacksapp)).
- **/systems:** Public accountability depth map tracking progress from product interfaces down to memory allocators and operating systems in Rust.
- **/tools:** Creator Suite containing six standalone in-browser utilities (Flowise, Vela, Chapterly, BookBreaks, Carousel Lab, Thread Studio).
- **/blog & /reading:** Technical writing, field notes, and real-time reading progress synced via Supabase.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + OKLCH design tokens
- **Database & Auth:** Supabase (Postgres, RLS, `@supabase/ssr`)
- **Email & Notifications:** Resend
- **PWA:** Serwist service worker
- **Typography:** Fraunces, Space Grotesk, Inter, JetBrains Mono
- **Deployment:** Vercel

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/michojekunle/portfolio-v2.git
cd portfolio-v2

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env

# Run local development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

---

## Database Migrations

Database schemas and RLS policies are tracked version-by-version under `supabase/migrations/`.

```bash
# Apply migrations with Supabase CLI
supabase db push
```

---

## License

MIT
