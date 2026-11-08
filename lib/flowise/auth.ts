import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

/** Shared auth helper for all Flowise route handlers. */
export async function requireFlowiseAuth(): Promise<
  | { supabase: SupabaseClient; user: User; unauthorized: false }
  | { supabase: null; user: null; unauthorized: true }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase: null, user: null, unauthorized: true };
  return { supabase, user, unauthorized: false };
}
