<p align="center">
  <img src="./public/logo.svg" alt="Michael Ojekunle" width="280" />
</p>

<p align="center">
  Personal portfolio and blog — built with Next.js 16, Supabase, and a custom CMS admin UI.
</p>

<p align="center">
  <a href="https://michaelojekunle.dev">michaelojekunle.dev</a> &nbsp;·&nbsp;
  <a href="https://github.com/michojekunle">GitHub</a> &nbsp;·&nbsp;
  <a href="https://x.com/devvmichael">Twitter / X</a>
</p>

---

## What this is

A production-grade portfolio site with a fully custom CMS — no third-party headless CMS. Content (blog posts, projects, books, learning progress, active builds) lives in Supabase and is editable through a protected admin UI at `/admin`. Everything on the public site is server-rendered and ISR-cached directly from the database.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript — strict mode |
| Styling | Tailwind CSS v3 + CSS custom properties |
| Database + Auth | Supabase (Postgres + RLS + email/password auth) |
| Auth session | `@supabase/ssr` — cookie-based, middleware-protected |
| Markdown | `react-markdown` + `remark-gfm` + `rehype-highlight` |
| Email | SendGrid via `@sendgrid/mail` |
| OG images | `next/og` ImageResponse (edge runtime) |
| Fonts | Space Grotesk (Google Fonts via `next/font`) |
| Deployment | Vercel |

## Features

**Public site**
- Hero, About, Projects, Blog preview, Now, Contact sections
- `/blog` — listing of all published posts
- `/blog/[slug]` — individual post with markdown rendering and syntax highlighting
- Per-post dynamic OG image (title, excerpt, category)
- Daily Bible verse via curated list + `bible-api.com`
- JSON-LD structured data (Person + WebSite schema)
- Full security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy)
- ISR — pages revalidate every 60 seconds

**Admin UI (`/admin`)**
- Protected by Supabase session middleware — `/admin/login` gate
- `/admin/blog` — create, edit, publish/unpublish, delete posts
- `/admin/projects` — manage projects, sync pinned repos from GitHub GraphQL API
- `/admin/now` — update books (progress + notes), learning items, active builds with markdown notes

## Project structure

```
app/
├── admin/                   # CMS admin UI (protected)
│   ├── blog/                # Blog CRUD + markdown editor
│   ├── now/                 # Books / learning / building managers
│   └── projects/            # Project list + GitHub sync
├── api/
│   ├── admin/sync-github/   # POST — upsert pinned repos into DB
│   ├── contact/             # Contact form → SendGrid
│   ├── github/              # GET — GitHub GraphQL pinned repos (cached 1h)
│   └── verse/               # GET — daily Bible verse (cached 24h)
├── blog/
│   ├── page.tsx             # Published post listing
│   └── [slug]/              # Post page + dynamic OG image
├── icon.tsx                 # Favicon (auto-detected by Next.js)
├── apple-icon.tsx           # Apple touch icon
└── opengraph-image.tsx      # Root OG image

components/
├── blog-section.tsx         # Server component — fetches latest 4 posts
├── projects-section.tsx     # Server component — fetches from projects table
├── now-section.tsx          # Server component — fetches books/learning/building
├── projects-tabs.tsx        # Client tabs component
├── now-tabs.tsx             # Client tabs + markdown notes
└── newsletter-form.tsx      # Client subscribe form

lib/
├── supabase/server.ts       # Cookie-based Supabase client (Server Components)
└── supabase/client.ts       # Browser Supabase client (admin UI mutations)

middleware.ts                # Session refresh + /admin route protection
```

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/michojekunle/portfolio-v2
cd portfolio-v2
pnpm install
```

### 2. Set up Supabase

Create a project at [supabase.com](https://supabase.com), then run the schema in **SQL Editor**:

```sql
-- Blog posts
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  category text,
  published boolean default false,
  published_at timestamptz,
  read_time text,
  source text default 'custom',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Projects (GitHub + manual)
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  tags text[],
  github_url text,
  demo_url text,
  category text,
  github_repo text,
  stars int default 0,
  language text,
  is_hidden boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Books
create table books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  progress int default 0,
  status text default 'reading',
  cover_url text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Book notes (notes, quotes, takeaways — multiple per book)
create table book_notes (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  type text not null check (type in ('note', 'quote', 'takeaway')),
  content text not null,
  page_ref text,
  created_at timestamptz default now()
);

-- Learning items
create table learning_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  progress int default 0,
  description text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Building / active projects
create table building_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text default 'In Progress',
  notes text,
  github_url text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contact form messages (visible in admin, private)
create table messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Newsletter send history
create table newsletter_sends (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  type text not null check (type in ('blog_post', 'digest', 'custom')),
  recipient_count int not null default 0,
  sent_at timestamptz default now()
);

-- Email subscribers
create table email_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz default now()
);

-- RLS: public read, authenticated write
alter table blog_posts enable row level security;
alter table projects enable row level security;
alter table books enable row level security;
alter table book_notes enable row level security;
alter table learning_items enable row level security;
alter table building_projects enable row level security;
alter table messages enable row level security;
alter table newsletter_sends enable row level security;
alter table email_subscribers enable row level security;

create policy "public read" on blog_posts for select using (true);
create policy "public read" on projects for select using (true);
create policy "public read" on books for select using (true);
create policy "public read" on book_notes for select using (true);
create policy "public read" on learning_items for select using (true);
create policy "public read" on building_projects for select using (true);
create policy "auth write" on blog_posts for all using (auth.role() = 'authenticated');
create policy "auth write" on projects for all using (auth.role() = 'authenticated');
create policy "auth write" on books for all using (auth.role() = 'authenticated');
create policy "auth write" on book_notes for all using (auth.role() = 'authenticated');
create policy "auth write" on learning_items for all using (auth.role() = 'authenticated');
create policy "auth write" on building_projects for all using (auth.role() = 'authenticated');
-- Messages: only authenticated users can read/update/delete; anyone can insert via contact form
create policy "auth read" on messages for select using (auth.role() = 'authenticated');
create policy "auth update" on messages for update using (auth.role() = 'authenticated');
create policy "auth delete" on messages for delete using (auth.role() = 'authenticated');
create policy "anon insert" on messages for insert with check (true);
create policy "auth read write" on newsletter_sends for all using (auth.role() = 'authenticated');
create policy "anon insert" on email_subscribers for insert with check (true);
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# GitHub (for pinned repo sync)
GITHUB_USERNAME=michojekunle
GITHUB_TOKEN=github_pat_...    # Fine-grained PAT, read-only public repos

# Contact form
SENDGRID_API_KEY=SG....
CONTACT_TO_EMAIL=your@email.com
CONTACT_FROM_EMAIL=noreply@michaelojekunle.dev
```

`GITHUB_TOKEN` is required — GitHub's GraphQL API doesn't accept unauthenticated requests. Create a fine-grained PAT at **github.com/settings/tokens** with read-only access to public repositories.

### 4. Create your admin account

In the Supabase dashboard → **Authentication → Users → Add user** — set your email and password.

### 5. Run dev

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Sign in and seed content

- Visit `/admin/login`
- Go to `/admin/projects` → **Sync GitHub** to import your pinned repos
- Go to `/admin/now` to add books, learning items, and active builds
- Go to `/admin/blog/new` to write your first post

## Deployment

Deploy on [Vercel](https://vercel.com) — connect the repo and set all environment variables from step 3 in the Vercel project settings. ISR revalidation works out of the box.

## License

MIT
