# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience: Tech recruiters, engineering leaders, potential clients, and software/blockchain developers evaluating Michael Ojekunle's engineering expertise and projects. [Inferred from repository evidence]

## Product Purpose

A production-grade personal portfolio and blog site with a custom Supabase-backed CMS (protected at `/admin`). Showcases Michael's projects, technical writing, active learning notes, reading list, and contact avenues. [Inferred from repository evidence]

## Positioning

A bespoke, developer-owned digital home for Michael Ojekunle (michaelojekunle.dev) featuring a zero-headless-CMS architecture—server-rendered with ISR and dynamic OG generation. [Inferred from repository evidence]

## Operating Context

- Public-facing visitor surface (`/`, `/blog`, `/blog/[slug]`)
- Admin CMS management surface (`/admin`, `/admin/blog`, `/admin/projects`, `/admin/now`)
- Daily revalidated content feeds (books, learning, active builds, blog posts)

## Capabilities and Constraints

- Framework: Next.js 16 (App Router, Turbopack, React 19)
- Database & Auth: Supabase (Postgres with RLS & cookie session auth)
- Styling: Tailwind CSS v4 + custom CSS custom properties
- Content Management: Custom markdown editor with TipTap / Markdown rendering
- Security: CSP headers, middleware protection for `/admin` routes

## Brand Commitments

- Owner / Name: Michael Ojekunle (`michaelojekunle.dev`)
- GitHub: `@michojekunle` | Twitter/X: `@devvmichael`
- Font Family: Space Grotesk
- Domain: michaelojekunle.dev

## Evidence on Hand

- `README.md` documenting architecture, API routes, and schema
- Existing codebase (`app/`, `components/`, `lib/supabase/`)
- Live assets (`/public/logo.svg`, OG image generation)

## Product Principles

1. **Craft & Performance:** Server-rendered by default with fast ISR revalidation and clean web standards.
2. **First-Party Ownership:** No external CMS dependencies; complete control over data and admin experience.
3. **Transparency & Context:** Live feeds showing current reading (`Now`), learning, active builds, and technical blog posts.

## Accessibility & Inclusion

Accessible interactive components (built with Radix UI primitives), keyboard navigability, semantic HTML5, and responsive layout across desktop and mobile devices. [Inferred from repository evidence]
