import { db } from './db';
import { createClient } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export async function syncJournalData(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    // 1. Push pending local entries. jo_entries has two identities: the
    // primary key `id` and the business key (user_id, date) — a plain
    // upsert() defaults to conflict-on-`id`, so if the local row's id
    // doesn't match whatever the server already has for that date (e.g.
    // this device created it offline before ever syncing, while another
    // device's copy is canonical), the insert would violate the
    // (user_id, date) unique constraint. Look the row up by date first and
    // reconcile onto its real id instead of blindly upserting — upserting
    // with onConflict on (user_id, date) would "fix" the constraint error
    // but silently rewrite the existing row's id to this device's, which
    // corrupts the canonical id other devices still hold.
    const pendingEntries = await db.entries.where('sync_status').equals('pending_push').toArray();
    for (const entry of pendingEntries) {
      const { sync_status, id, ...fields } = entry;
      try {
        const { data: existing, error: lookupError } = await supabase
          .from('jo_entries')
          .select('id')
          .eq('user_id', entry.user_id)
          .eq('date', entry.date)
          .maybeSingle();
        if (lookupError) throw lookupError;

        if (existing && existing.id !== id) {
          const { error } = await supabase
            .from('jo_entries')
            .update({ ...fields, updated_at: new Date().toISOString() })
            .eq('id', existing.id);
          if (error) throw error;
          await db.transaction('rw', db.entries, async () => {
            await db.entries.delete(id);
            await db.entries.put({ ...entry, id: existing.id, sync_status: 'synced' });
          });
        } else {
          const { error } = await supabase
            .from('jo_entries')
            .upsert({ id, ...fields, updated_at: new Date().toISOString() });
          if (error) throw error;
          await db.entries.update(id, { sync_status: 'synced' });
        }
      } catch (err) {
        console.error('[syncEngine] entry push failed:', err);
      }
    }

    // 2. Pull remote entries
    const { data: remoteEntries } = await supabase
      .from('jo_entries')
      .select('*')
      .eq('user_id', user.id);

    if (remoteEntries) {
      const localEntries = remoteEntries.map((e) => ({ ...e, sync_status: 'synced' as const }));
      await db.entries.bulkPut(localEntries);
    }

    // 3. Push pending objectives
    const pendingObjectives = await db.objectives.where('sync_status').equals('pending_push').toArray();
    for (const obj of pendingObjectives) {
      const { sync_status, ...rest } = obj;
      const { error } = await supabase.from('jo_objectives').upsert({
        ...rest,
        updated_at: new Date().toISOString(),
      });
      if (!error) {
        await db.objectives.update(obj.id, { sync_status: 'synced' });
      } else {
        console.error('[syncEngine] objective push failed:', error);
      }
    }

    // 4. Pull remote objectives
    const { data: remoteObjectives } = await supabase
      .from('jo_objectives')
      .select('*')
      .eq('user_id', user.id);

    if (remoteObjectives) {
      const localObjectives = remoteObjectives.map((o) => ({ ...o, sync_status: 'synced' as const }));
      await db.objectives.bulkPut(localObjectives);
    }

    // 5. Push pending milestones
    const pendingMilestones = await db.milestones.where('sync_status').equals('pending_push').toArray();
    for (const ms of pendingMilestones) {
      const { sync_status, ...rest } = ms;
      const { error } = await supabase.from('jo_milestones').upsert(rest);
      if (!error) {
        await db.milestones.update(ms.id, { sync_status: 'synced' });
      } else {
        console.error('[syncEngine] milestone push failed:', error);
      }
    }

    // 6. Pull remote milestones — jo_milestones carries user_id directly, no join needed
    const { data: remoteMilestones } = await supabase
      .from('jo_milestones')
      .select('*')
      .eq('user_id', user.id);

    if (remoteMilestones) {
      const localMs = remoteMilestones.map((m) => ({ ...m, sync_status: 'synced' as const }));
      await db.milestones.bulkPut(localMs);
    }
  } catch (err) {
    console.error('[syncEngine] Sync failed:', err);
  }
}

export function generateId(): string {
  return uuidv4();
}
