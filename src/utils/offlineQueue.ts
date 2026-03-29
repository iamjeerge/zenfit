/**
 * Offline mutation queue backed by AsyncStorage.
 *
 * Every write that should be replayed when connectivity is restored
 * is added here.  The queue persists across app restarts.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const QUEUE_KEY = 'zenfit:offline_queue';

export type MutationTable =
  | 'workout_sessions'
  | 'sleep_logs'
  | 'mood_journal'
  | 'water_intake'
  | 'weight_logs'
  | 'nutrition_logs';

export interface QueuedMutation {
  id: string; // UUID generated client-side
  table: MutationTable;
  operation: 'insert' | 'upsert';
  payload: Record<string, unknown>;
  conflictKey?: string; // column(s) for upsert conflict resolution
  enqueuedAt: string; // ISO timestamp
}

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Read the full queue from AsyncStorage */
export async function readQueue(): Promise<QueuedMutation[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedMutation[]) : [];
  } catch {
    return [];
  }
}

/** Append a new mutation to the queue */
export async function enqueue(
  table: MutationTable,
  operation: 'insert' | 'upsert',
  payload: Record<string, unknown>,
  conflictKey?: string,
): Promise<void> {
  const queue = await readQueue();
  const mutation: QueuedMutation = {
    id: uuid(),
    table,
    operation,
    payload,
    conflictKey,
    enqueuedAt: new Date().toISOString(),
  };
  queue.push(mutation);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/** Remove a successfully synced mutation from the queue */
async function dequeue(id: string): Promise<void> {
  const queue = await readQueue();
  const updated = queue.filter((m) => m.id !== id);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
}

/** Return true when Supabase is reachable */
export async function isOnline(): Promise<boolean> {
  try {
    // Lightweight HEAD request – Supabase responds even on the auth endpoint
    const url = (supabase as any).supabaseUrl as string | undefined;
    if (!url) return false;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(`${url}/auth/v1/settings`, {
      method: 'HEAD',
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

/** Attempt to flush all queued mutations to Supabase.
 *  Returns { synced, failed } counts. */
export async function flushQueue(): Promise<{ synced: number; failed: number }> {
  const queue = await readQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const mutation of queue) {
    try {
      let error: unknown = null;
      if (mutation.operation === 'upsert' && mutation.conflictKey) {
        ({ error } = await supabase
          .from(mutation.table)
          .upsert(mutation.payload, { onConflict: mutation.conflictKey }));
      } else {
        ({ error } = await supabase.from(mutation.table).insert(mutation.payload));
      }
      if (error) throw error;
      await dequeue(mutation.id);
      synced++;
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}
