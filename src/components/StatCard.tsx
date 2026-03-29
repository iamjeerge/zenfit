/**
 * @file StatCard.tsx
 * @module components/StatCard
 * @description Compact stat-display card — shows a labelled numeric value with an
 * optional icon and gradient accent. Used in dashboard stat strips.
 */

import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../theme/colors';

interface StatCardProps {
  value: string;
  label: string;
  progress?: number; // 0-1
  progressColor?: string;
  icon?: string;
  style?: ViewStyle;
}

export default function StatCard({
  value,
  label,
  progress,
  progressColor = Colors.violet,
  icon,
  style,
}: StatCardProps) {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
        style={styles.gradient}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={styles.value} accessibilityLabel={`${label}: ${value}`}>
          {value}
        </Text>
        <Text style={styles.label}>{label}</Text>
        {progress !== undefined && (
          <View
            style={styles.progressTrack}
            accessibilityLabel={`${Math.round(progress * 100)}% complete`}
          >
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(progress * 100, 100)}%`,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.subtle,
  },
  gradient: {
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 90,
  },
  icon: {
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
});
