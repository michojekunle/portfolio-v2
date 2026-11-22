import type { SupabaseClient } from "@supabase/supabase-js";
import type { LearnEvent } from "../domain/events";
import { PersistenceError } from "./errors";

/** Records one product event (service role). */
export async function recordEvent(admin: SupabaseClient, event: LearnEvent, userId: string | null): Promise<void> {
  const { error } = await admin.from("learn_events").insert({
    user_id: userId,
    language: event.language ?? null,
    name: event.name,
    props: event.props ?? {},
  });
  if (error) throw new PersistenceError("recordEvent", error);
}
