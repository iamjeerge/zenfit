/**
 * Wearable Health Data Service
 *
 * Platform abstraction for reading health data from:
 *   iOS  → HealthKit via `react-native-health`
 *   Android → Health Connect via `react-native-health-connect`
 *
 * NOTE: Both native modules require additional native setup:
 *   iOS: Add HealthKit capability and NSHealthShareUsageDescription to Info.plist
 *   Android: Add Health Connect activity to AndroidManifest.xml
 *
 * Until the native modules are installed, this module no-ops gracefully so the
 * rest of the app continues to work.
 */
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

export type WearableSource = 'apple_watch' | 'android_watch' | 'health_connect';

export interface HealthSample {
  value: number;
  startDate: string;
  endDate: string;
  source: WearableSource;
}

export interface WearableSyncResult {
  steps: number | null;
  heartRate: number | null;
  activeCalories: number | null;
  sleepHours: number | null;
  syncedAt: Date;
}

// ─── iOS HealthKit Bridge ─────────────────────────────────────────────────

async function readHealthKitData(since: Date): Promise<WearableSyncResult> {
  try {
    // Dynamic import — only resolves on iOS with react-native-health installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AppleHealthKit = require('react-native-health').default;

    const options = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.Steps,
          AppleHealthKit.Constants.Permissions.HeartRate,
          AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
          AppleHealthKit.Constants.Permissions.SleepAnalysis,
        ],
        write: [],
      },
    };

    await new Promise<void>((resolve, reject) =>
      AppleHealthKit.initHealthKit(options, (err: Error | null) => (err ? reject(err) : resolve())),
    );

    const dateRange = { startDate: since.toISOString(), endDate: new Date().toISOString() };

    const [steps, heartRates, calories, sleep] = await Promise.allSettled([
      new Promise<number>((resolve, reject) =>
        AppleHealthKit.getStepCount(dateRange, (err: Error, res: { value: number }) =>
          err ? reject(err) : resolve(res?.value ?? 0),
        ),
      ),
      new Promise<number>((resolve, reject) =>
        AppleHealthKit.getHeartRateSamples(dateRange, (err: Error, results: { value: number }[]) =>
          err ? reject(err) : resolve(results?.at(-1)?.value ?? 0),
        ),
      ),
      new Promise<number>((resolve, reject) =>
        AppleHealthKit.getActiveEnergyBurned(
          dateRange,
          (err: Error, results: { value: number }[]) =>
            err ? reject(err) : resolve(results?.reduce((s, r) => s + r.value, 0) ?? 0),
        ),
      ),
      new Promise<number>((resolve, reject) =>
        AppleHealthKit.getSleepSamples(
          dateRange,
          (err: Error, results: { value: string; startDate: string; endDate: string }[]) => {
            if (err) {
              reject(err);
              return;
            }
            const asleepMs = (results ?? [])
              .filter(
                (s) =>
                  s.value === 'ASLEEP' ||
                  s.value === 'CORE' ||
                  s.value === 'DEEP' ||
                  s.value === 'REM',
              )
              .reduce(
                (sum, s) => sum + (new Date(s.endDate).getTime() - new Date(s.startDate).getTime()),
                0,
              );
            resolve(asleepMs / 3_600_000);
          },
        ),
      ),
    ]);

    return {
      steps: steps.status === 'fulfilled' ? steps.value : null,
      heartRate: heartRates.status === 'fulfilled' ? heartRates.value : null,
      activeCalories: calories.status === 'fulfilled' ? calories.value : null,
      sleepHours: sleep.status === 'fulfilled' ? sleep.value : null,
      syncedAt: new Date(),
    };
  } catch {
    // react-native-health not installed or permission denied
    return {
      steps: null,
      heartRate: null,
      activeCalories: null,
      sleepHours: null,
      syncedAt: new Date(),
    };
  }
}

// ─── Android Health Connect Bridge ───────────────────────────────────────────

async function readHealthConnectData(since: Date): Promise<WearableSyncResult> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { initialize, requestPermission, readRecords } = require('react-native-health-connect');

    await initialize();
    await requestPermission([
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'HeartRate' },
      { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
      { accessType: 'read', recordType: 'SleepSession' },
    ]);

    const timeRange = {
      operator: 'between',
      startTime: since.toISOString(),
      endTime: new Date().toISOString(),
    };

    const [stepsRes, hrRes, calRes, sleepRes] = await Promise.allSettled([
      readRecords('Steps', { timeRangeFilter: timeRange }),
      readRecords('HeartRate', { timeRangeFilter: timeRange }),
      readRecords('ActiveCaloriesBurned', { timeRangeFilter: timeRange }),
      readRecords('SleepSession', { timeRangeFilter: timeRange }),
    ]);

    const steps =
      stepsRes.status === 'fulfilled'
        ? (stepsRes.value?.records ?? []).reduce((s: number, r: any) => s + (r.count ?? 0), 0)
        : null;

    const heartRates = hrRes.status === 'fulfilled' ? (hrRes.value?.records ?? []) : [];
    const lastHR = heartRates.at(-1)?.samples?.at(-1)?.beatsPerMinute ?? null;

    const calories =
      calRes.status === 'fulfilled'
        ? (calRes.value?.records ?? []).reduce(
            (s: number, r: any) => s + (r.energy?.inKilocalories ?? 0),
            0,
          )
        : null;

    const sleepMs =
      sleepRes.status === 'fulfilled'
        ? (sleepRes.value?.records ?? []).reduce(
            (s: number, r: any) =>
              s + (new Date(r.endTime).getTime() - new Date(r.startTime).getTime()),
            0,
          )
        : 0;

    return {
      steps,
      heartRate: lastHR,
      activeCalories: calories,
      sleepHours: sleepMs > 0 ? sleepMs / 3_600_000 : null,
      syncedAt: new Date(),
    };
  } catch {
    return {
      steps: null,
      heartRate: null,
      activeCalories: null,
      sleepHours: null,
      syncedAt: new Date(),
    };
  }
}

// ─── Sync to Supabase ─────────────────────────────────────────────────────────

export async function syncWearableData(userId: string, since: Date): Promise<WearableSyncResult> {
  const source: WearableSource = Platform.OS === 'ios' ? 'apple_watch' : 'android_watch';

  const data =
    Platform.OS === 'ios' ? await readHealthKitData(since) : await readHealthConnectData(since);

  const today = new Date().toISOString().split('T')[0];
  const promises: PromiseLike<unknown>[] = [];

  if (data.steps !== null) {
    promises.push(
      supabase
        .from('daily_steps')
        .upsert(
          { user_id: userId, steps: Math.round(data.steps), date: today, source },
          { onConflict: 'user_id,date' },
        )
        .then(),
    );
  }

  if (data.heartRate !== null) {
    promises.push(
      supabase
        .from('heart_rate_logs')
        .insert({
          user_id: userId,
          bpm: Math.round(data.heartRate),
          recorded_at: new Date().toISOString(),
          source,
        })
        .then(),
    );
  }

  if (data.sleepHours !== null && data.sleepHours > 0) {
    const bedtime = new Date();
    bedtime.setHours(bedtime.getHours() - Math.round(data.sleepHours));
    promises.push(
      supabase
        .from('sleep_logs')
        .upsert(
          {
            user_id: userId,
            bedtime: bedtime.toISOString(),
            wake_time: new Date().toISOString(),
            quality: null,
            notes: `Auto-synced from ${source}`,
            date: today,
            source,
          },
          { onConflict: 'user_id,date' },
        )
        .then(),
    );
  }

  await Promise.allSettled(promises);
  return data;
}
