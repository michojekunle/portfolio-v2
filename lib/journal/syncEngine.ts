import { db, LocalEntry, LocalObjective, LocalMilestone, LocalChatMessage } from './db';
import { createClient } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export async function syncJournalData() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    // 1. Push pending local entries
    const pendingEntries = await db.entries.where('sync_status').equals('pending_push').toArray();
    for (const entry of pendingEntries) {
      const { sync_status, ...rest } = entry;
      const { error } = await supabase.from('jo_entries').upsert({
        ...rest,
        updated_at: new Date().toISOString()
      });
      if (!error) {
        await db.entries.update(entry.id, { sync_status: 'synced' });
      }
    }

    // 2. Pull remote entries (simplified: pull all for user)
    const { data: remoteEntries } = await supabase
      .from('jo_entries')
      .select('*')
      .eq('user_id', user.id);
    
    if (remoteEntries) {
      const localEntries = remoteEntries.map(e => ({ ...e, sync_status: 'synced' }));
      await db.entries.bulkPut(localEntries);
    }

    // 3. Push pending objectives
    const pendingObjectives = await db.objectives.where('sync_status').equals('pending_push').toArray();
    for (const obj of pendingObjectives) {
      const { sync_status, ...rest } = obj;
      const { error } = await supabase.from('jo_objectives').upsert({
        ...rest,
        updated_at: new Date().toISOString()
      });
      if (!error) {
        await db.objectives.update(obj.id, { sync_status: 'synced' });
      }
    }

    // 4. Pull remote objectives
    const { data: remoteObjectives } = await supabase
      .from('jo_objectives')
      .select('*')
      .eq('user_id', user.id);
    
    if (remoteObjectives) {
      const localObjectives = remoteObjectives.map(o => ({ ...o, sync_status: 'synced' }));
      await db.objectives.bulkPut(localObjectives);
    }

    // 5. Push pending milestones
    const pendingMilestones = await db.milestones.where('sync_status').equals('pending_push').toArray();
    for (const ms of pendingMilestones) {
      const { sync_status, ...rest } = ms;
      const { error } = await supabase.from('jo_milestones').upsert({
        ...rest,
        updated_at: new Date().toISOString()
      });
      if (!error) {
        await db.milestones.update(ms.id, { sync_status: 'synced' });
      }
    }

    // 6. Pull remote milestones
    const { data: remoteMilestones } = await supabase
      .from('jo_milestones')
      .select('jo_milestones.*')
      .eq('jo_objectives.user_id', user.id); // Assuming we can join or we just pull all user's milestones

    // More robust way to fetch user's milestones:
    const { data: userObjectives } = await supabase.from('jo_objectives').select('id').eq('user_id', user.id);
    if (userObjectives && userObjectives.length > 0) {
      const objIds = userObjectives.map(o => o.id);
      const { data: allMilestones } = await supabase.from('jo_milestones').select('*').in('objective_id', objIds);
      if (allMilestones) {
        const localMs = allMilestones.map(m => ({ ...m, sync_status: 'synced' }));
        await db.milestones.bulkPut(localMs);
      }
    }

  } catch (err) {
    console.error('[syncEngine] Sync failed:', err);
  }
}

export function generateId(): string {
  return uuidv4();
}
