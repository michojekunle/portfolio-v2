import Dexie, { type Table } from 'dexie';

export interface LocalEntry {
  id: string; // uuid
  user_id: string;
  date: string; // YYYY-MM-DD
  top_priorities: string[];
  accomplished: string[];
  blockers: string | null;
  notes: string | null;
  energy_level: number | null;
  objective_ids: string[];
  created_at: string;
  updated_at: string;
  sync_status: 'synced' | 'pending_push';
}

export interface LocalObjective {
  id: string; // uuid
  user_id: string;
  title: string;
  description: string | null;
  status: 'active' | 'completed' | 'paused' | 'dropped';
  target_date: string | null;
  priority: 'high' | 'medium' | 'low';
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
  sync_status: 'synced' | 'pending_push';
}

export interface LocalMilestone {
  id: string; // uuid
  user_id: string;
  objective_id: string;
  title: string;
  is_done: boolean;
  due_date: string | null;
  created_at: string;
  sync_status: 'synced' | 'pending_push';
}

export interface LocalChatMessage {
  id?: number; // auto-increment local id
  server_id?: string; // uuid from server
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  executed: any | null; // JSON
  created_at: string;
  sync_status: 'synced' | 'pending_push';
}

export class JournalDatabase extends Dexie {
  entries!: Table<LocalEntry, string>;
  objectives!: Table<LocalObjective, string>;
  milestones!: Table<LocalMilestone, string>;
  chats!: Table<LocalChatMessage, number>;

  constructor() {
    super('VelaJournalDB');
    this.version(1).stores({
      entries: 'id, user_id, date, sync_status',
      objectives: 'id, user_id, status, sync_status',
      milestones: 'id, objective_id, is_done, sync_status',
      chats: '++id, server_id, user_id, role, sync_status',
    });
  }
}

export const db = new JournalDatabase();
