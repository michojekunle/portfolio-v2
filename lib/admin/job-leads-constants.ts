// Shared between app/api/job-leads/route.ts (server), the initial
// server-rendered jobs page, and LeadsPanel.tsx (client) — kept in its own
// file with zero server-only imports, since a client component importing a
// *value* (not just a type) from route.ts would pull the whole server-only
// file (Supabase server client, Zod, next/server) into the client bundle.
export const JOB_LEADS_PAGE_SIZE = 10;
