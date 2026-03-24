import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { isOnline, flushQueue, readQueue, QueuedMutation } from '../utils/offlineQueue';

interface OfflineSyncState {
  isConnected: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
}

const POLL_INTERVAL_MS = 15_000; // check every 15 s

/**
 * Hook that:
 *  - Polls network connectivity
 *  - Flushes the offline queue when connectivity is restored
 *  - Exposes state for the offline banner
 */
export function useOfflineSync(): OfflineSyncState {
  const [isConnected, setIsConnected] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const prevConnected = useRef(true);

  const refreshQueue = useCallback(async () => {
    const q: QueuedMutation[] = await readQueue();
    setPendingCount(q.length);
  }, []);

  const checkAndSync = useCallback(async () => {
    const online = await isOnline();
    setIsConnected(online);

    // Became online — flush the queue
    if (online && !prevConnected.current) {
      setIsSyncing(true);
      await flushQueue();
      setIsSyncing(false);
      setLastSyncedAt(new Date());
    }
    prevConnected.current = online;
    await refreshQueue();
  }, [refreshQueue]);

  useEffect(() => {
    // Check immediately on mount
    checkAndSync();

    // Poll on an interval
    const interval = setInterval(checkAndSync, POLL_INTERVAL_MS);

    // Also check when the app comes to the foreground
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') checkAndSync();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [checkAndSync]);

  return { isConnected, pendingCount, isSyncing, lastSyncedAt };
}
