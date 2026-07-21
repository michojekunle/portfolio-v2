import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

type AuthResult =
  | { supabase: SupabaseClient; user: User; unauthorized: false }
  | { supabase: null; user: null; unauthorized: true };

/** Same gate as app/admin/(dashboard)/layout.tsx — a valid Supabase session belonging to the single admin email. */
export async function requireAdminAuth(): Promise<AuthResult> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  const adminEmail = process.env.CONTACT_TO_EMAIL || "info@michaelojekunle.dev";

  if (error) {
    console.error("[admin/auth] getUser error:", error.message);
    return { supabase: null, user: null, unauthorized: true };
  }
  if (!user || user.email !== adminEmail) {
    return { supabase: null, user: null, unauthorized: true };
  }
  return { supabase, user, unauthorized: false };
}
