import { cookies } from "next/headers";
import { createClient as createSupabaseAdmin, type SupabaseClient } from "@supabase/supabase-js";
import { requireAdminAuth } from "@/lib/admin/auth";
import {
  SPEAKING_GATE_COOKIE,
  verifySpeakingGateToken,
} from "./gate-token";

type SpeakingAuthResult =
  | { supabase: SupabaseClient; unauthorized: false; via: "admin_session" | "password_gate" }
  | { supabase: null; unauthorized: true };

export function getSpeakingServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) return null;
  return createSupabaseAdmin(url, key, {
    auth: { persistSession: false },
  });
}

/**
 * Authorizes access to The Speaking Ledger using either:
 * 1. An active Supabase admin session (CONTACT_TO_EMAIL), or
 * 2. A valid HMAC-signed password-gate cookie set by /api/speaking/unlock.
 */
export async function requireSpeakingAuth(): Promise<SpeakingAuthResult> {
  const adminAuth = await requireAdminAuth();
  if (!adminAuth.unauthorized) {
    return {
      supabase: getSpeakingServiceClient() ?? adminAuth.supabase,
      unauthorized: false,
      via: "admin_session",
    };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SPEAKING_GATE_COOKIE)?.value;
  const validGate = await verifySpeakingGateToken(token);
  if (!validGate) {
    return { supabase: null, unauthorized: true };
  }

  const serviceClient = getSpeakingServiceClient();
  if (!serviceClient) {
    return { supabase: null, unauthorized: true };
  }

  return {
    supabase: serviceClient,
    unauthorized: false,
    via: "password_gate",
  };
}
