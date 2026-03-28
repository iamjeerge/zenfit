/**
 * @file OfflineBanner.tsx
 * @module components/OfflineBanner
 * @description Sticky banner shown when the device is offline or there are pending
 * offline-queue mutations. Auto-dismisses when connectivity is restored.
 */

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, FontSizes, Spacing } from '../theme/colors';

interface Props {
  isConnected: boolean;
  pendingCount: number;
  isSyncing: boolean;
}

export default function OfflineBanner({ isConnected, pendingCount, isSyncing }: Props) {
  if (isConnected && pendingCount === 0) return null;

  const message = isSyncing
    ? `Syncing ${pendingCount} pending ${pendingCount === 1 ? 'item' : 'items'}…`
    : !isConnected && pendingCount > 0
    ? `Offline · ${pendingCount} pending ${pendingCount === 1 ? 'item' : 'items'}`
    : !isConnected
    ? 'Offline · data will sync when connected'
    : null;

  if (!message) return null;

  return (
    <View style={[styles.banner, isSyncing && styles.syncing]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#374151',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  syncing: {
    backgroundColor: Colors.violet,
  },
  text: {
    color: '#E5E7EB',
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
});
