import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncWearableData, WearableSyncResult } from '../services/wearableService';
import { useAuthStore } from '../store/authStore';

const LAST_SYNC_KEY = 'zenfit:wearable_last_sync';

interface WearableSyncState {
  lastSyncedAt: Date | null;
  lastResult: WearableSyncResult | null;
  isSyncing: boolean;
  hasWearable: boolean;   // true when at least one metric was received
}

export function useWearableSync(): WearableSyncState {
  const user = useAuthStore((s) => s.user);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [lastResult, setLastResult] = useState<WearableSyncResult | null>(null);

  const sync = useCallback(async () => {
    if (!user || isSyncing) return;
    setIsSyncing(true);
    try {
      const raw = await AsyncStorage.getItem(LAST_SYNC_KEY);
      const since = raw ? new Date(raw) : new Date(Date.now() - 24 * 60 * 60 * 1000); // default: last 24 h
      const result = await syncWearableData(user.id, since);
      await AsyncStorage.setItem(LAST_SYNC_KEY, result.syncedAt.toISOString());
      setLastSyncedAt(result.syncedAt);
      setLastResult(result);
    } catch {
      // Wearable unavailable — ignore
    } finally {
      setIsSyncing(false);
    }
  }, [user, isSyncing]);

  useEffect(() => {
    if (!user) return;
    // Load last sync timestamp from storage
    AsyncStorage.getItem(LAST_SYNC_KEY).then((raw) => {
      if (raw) setLastSyncedAt(new Date(raw));
    });
    // Sync on mount
    sync();

    // Sync when app comes to foreground
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') sync();
    });
    return () => sub.remove();
  }, [user]);

  const hasWearable = !!(
    lastResult &&
    (lastResult.steps !== null ||
      lastResult.heartRate !== null ||
      lastResult.activeCalories !== null ||
      lastResult.sleepHours !== null)
  );

  return { lastSyncedAt, lastResult, isSyncing, hasWearable };
}
