import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Spacing, BorderRadius, FontSizes } from '../theme/colors';
import { WearableSyncResult } from '../services/wearableService';

interface Props {
  isSyncing: boolean;
  hasWearable: boolean;
  lastSyncedAt: Date | null;
  lastResult: WearableSyncResult | null;
}

function formatRelative(date: Date | null): string {
  if (!date) return 'Never';
  const diff = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff} min ago`;
  const hours = Math.floor(diff / 60);
  return `${hours} hr ago`;
}

export default function WearableCard({ isSyncing, hasWearable, lastSyncedAt, lastResult }: Props) {
  return (
    <LinearGradient
      colors={Gradients.card as unknown as [string, string]}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.title}>⌚ Wearable Sync</Text>
        {isSyncing ? (
          <ActivityIndicator color={Colors.lavender} size="small" />
        ) : (
          <Text style={styles.syncTime}>
            {hasWearable ? `Synced ${formatRelative(lastSyncedAt)}` : 'No wearable detected'}
          </Text>
        )}
      </View>

      {hasWearable && lastResult ? (
        <View style={styles.metrics}>
          {lastResult.steps !== null && (
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{Math.round(lastResult.steps).toLocaleString()}</Text>
              <Text style={styles.metricLabel}>Steps</Text>
            </View>
          )}
          {lastResult.heartRate !== null && (
            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: '#F87171' }]}>{Math.round(lastResult.heartRate)}</Text>
              <Text style={styles.metricLabel}>BPM</Text>
            </View>
          )}
          {lastResult.activeCalories !== null && (
            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: Colors.sacredGold }]}>{Math.round(lastResult.activeCalories)}</Text>
              <Text style={styles.metricLabel}>kcal</Text>
            </View>
          )}
          {lastResult.sleepHours !== null && (
            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: Colors.lavender }]}>{lastResult.sleepHours.toFixed(1)}h</Text>
              <Text style={styles.metricLabel}>Sleep</Text>
            </View>
          )}
        </View>
      ) : (
        <Text style={styles.noWearableText}>
          Install Apple Watch (iOS) or pair a Health Connect device (Android) to auto-sync health data.
        </Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.glassBorder,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  title: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary },
  syncTime: { fontSize: FontSizes.xs, color: Colors.textMuted },
  metrics: { flexDirection: 'row', justifyContent: 'space-around' },
  metric: { alignItems: 'center' },
  metricValue: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.sageLeaf },
  metricLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  noWearableText: { fontSize: FontSizes.xs, color: Colors.textMuted, lineHeight: 18 },
});
