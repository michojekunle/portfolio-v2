import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

type AuthResult =
  | { supabase: SupabaseClient; user: User; unauthorized: false }
  | { supabase: null; user: null; unauthorized: true };

export async function requireJournalAuth(): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, user: null, unauthorized: true };
  return { supabase, user, unauthorized: false };
}
