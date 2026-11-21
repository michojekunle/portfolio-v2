import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client for trusted server jobs (webhooks, audio cache, reminders).
 * Never expose to the browser; never use for anything a learner's own RLS can do.
 * Returns null when not configured, so callers can degrade instead of crashing.
 */
export function adminClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  // SUPABASE_KEY is this project's existing service-role key (the French reminder cron uses it too).
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
