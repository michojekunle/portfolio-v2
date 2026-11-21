/**
 * Groups of five: user-scoped (RLS + SECURITY DEFINER functions in
 * 20261125_learn_groups.sql). The client never writes membership directly.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { localDateString } from "../domain/dates";
import { GROUP_STREAK_MAX_DAYS, generateInviteCode, groupStreak, normaliseInviteCode, type MemberActivity } from "../domain/groups";
import type { LanguagePack } from "../domain/language";
import { fallbackLessonFor } from "../domain/lessons";
import type { GroupAction } from "../domain/schemas";
import { GroupError, PersistenceError } from "./errors";

export interface GroupPostDto {
  readonly userId: string;
  readonly displayName: string;
  readonly durationMs: number;
  /** Short-lived signed URL; the bucket is private. */
  readonly audioUrl: string | null;
}

export interface GroupDto {
  readonly id: string;
  readonly name: string;
  readonly inviteCode: string;
  readonly today: string;
  readonly streak: number;
  readonly members: readonly (MemberActivity & { readonly doneToday: boolean; readonly isYou: boolean })[];
  readonly question: { readonly fr: string; readonly en: string };
  readonly posts: readonly GroupPostDto[];
}

const SIGNED_URL_SECONDS = 60 * 60;
const FRIENDLY: Record<string, string> = {
  "already in a group for this language": "You're already in a group for this language. Leave it first to join another.",
  "invite not found": "That invite code doesn't match a group. Check it and try again.",
  "group is full": "That group already has five people.",
};

function fail(operation: string, cause: unknown): never {
  throw new PersistenceError(operation, cause);
}

/** Turns the database's guard messages into errors the learner can act on. */
function fromRpc(error: { message: string }): never {
  const known = Object.keys(FRIENDLY).find((key) => error.message.includes(key));
  if (known) throw new GroupError(FRIENDLY[known]);
  fail("group rpc", error);
}

async function myGroupId(db: SupabaseClient, userId: string, pack: LanguagePack): Promise<string | null> {
  const { data, error } = await db
    .from("learn_group_members")
    .select("group_id, learn_groups!inner(language)")
    .eq("user_id", userId)
    .eq("learn_groups.language", pack.id)
    .maybeSingle<{ group_id: string }>();
  if (error) fail("myGroupId", error);
  return data?.group_id ?? null;
}

export async function getMyGroup(db: SupabaseClient, userId: string, pack: LanguagePack, timezone: string): Promise<GroupDto | null> {
  const groupId = await myGroupId(db, userId, pack);
  if (!groupId) return null;
  const today = localDateString(timezone, new Date());

  const [{ data: group, error: groupError }, { data: activity, error: activityError }, { data: posts, error: postsError }] = await Promise.all([
    db.from("learn_groups").select("id, name, invite_code").eq("id", groupId).single<{ id: string; name: string; invite_code: string }>(),
    db.rpc("learn_group_activity", { p_group: groupId, p_days: GROUP_STREAK_MAX_DAYS }),
    db.from("learn_group_posts").select("user_id, audio_path, duration_ms").eq("group_id", groupId).eq("post_date", today),
  ]);
  if (groupError) fail("getGroup", groupError);
  if (activityError) fail("groupActivity", activityError);
  if (postsError) fail("groupPosts", postsError);

  const rows = (activity ?? []) as { user_id: string; display_name: string; joined_on: string; completed_on: string[] | null }[];
  const members: MemberActivity[] = rows.map((r) => ({ userId: r.user_id, displayName: r.display_name, joinedOn: r.joined_on, completedOn: r.completed_on ?? [] }));
  const names = new Map(members.map((m) => [m.userId, m.displayName]));

  const postRows = (posts ?? []) as { user_id: string; audio_path: string; duration_ms: number }[];
  const signed = postRows.length
    ? await db.storage.from("learn-voice").createSignedUrls(postRows.map((p) => p.audio_path), SIGNED_URL_SECONDS)
    : { data: [], error: null };
  if (signed.error) fail("signVoiceNotes", signed.error);

  const question = fallbackLessonFor(pack.fallbackLessons, today).ask ?? { fr: "Raconte ta journée.", en: "Tell us about your day." };

  return {
    id: group.id,
    name: group.name,
    inviteCode: group.invite_code,
    today,
    streak: groupStreak(members, today),
    members: members.map((m) => ({ ...m, doneToday: m.completedOn.includes(today), isYou: m.userId === userId })),
    question,
    posts: postRows.map((p, i) => ({
      userId: p.user_id,
      displayName: names.get(p.user_id) ?? "Someone",
      durationMs: p.duration_ms,
      audioUrl: signed.data?.[i]?.signedUrl ?? null,
    })),
  };
}

export async function applyGroupAction(db: SupabaseClient, userId: string, pack: LanguagePack, action: GroupAction): Promise<GroupDto | null> {
  switch (action.action) {
    case "create": {
      // A collision on the unique code is astronomically unlikely; retry once anyway.
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const { error } = await db.rpc("learn_create_group", {
          p_language: pack.id,
          p_name: action.name,
          p_display_name: action.displayName,
          p_invite_code: generateInviteCode(),
        });
        if (!error) return getMyGroup(db, userId, pack, action.timezone);
        if (!error.message.includes("invite_code")) fromRpc(error);
      }
      throw new GroupError("Couldn't create the group. Try again.");
    }
    case "join": {
      const { error } = await db.rpc("learn_join_group", { p_invite_code: normaliseInviteCode(action.code), p_display_name: action.displayName });
      if (error) fromRpc(error);
      return getMyGroup(db, userId, pack, action.timezone);
    }
    case "leave": {
      const groupId = await myGroupId(db, userId, pack);
      if (!groupId) return null;
      const { error } = await db.from("learn_group_members").delete().eq("group_id", groupId).eq("user_id", userId);
      if (error) fail("leaveGroup", error);
      return null;
    }
    case "post": {
      const groupId = await myGroupId(db, userId, pack);
      if (!groupId) throw new GroupError("Join a group first.");
      const [pathGroup, pathDate, file] = action.path.split("/");
      const today = localDateString(action.timezone, new Date());
      // The path must be this learner's own file for today in their own group.
      if (pathGroup !== groupId || pathDate !== today || !file.startsWith(`${userId}.`)) throw new GroupError("That recording couldn't be attached.");
      const { error } = await db
        .from("learn_group_posts")
        .upsert({ group_id: groupId, user_id: userId, post_date: today, audio_path: action.path, duration_ms: action.durationMs }, { onConflict: "group_id,user_id,post_date" });
      if (error) fail("postVoiceNote", error);
      return getMyGroup(db, userId, pack, action.timezone);
    }
  }
}
