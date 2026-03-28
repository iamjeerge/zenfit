/**
 * SkeletonLoader — Reusable shimmer placeholder component
 * Mimics the shape of content while data is loading,
 * giving users a perceived performance boost.
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, BorderRadius, Spacing } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/** Single skeleton line/block with shimmer animation */
export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const shimmer = useSharedValue(-1);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value * (SCREEN_WIDTH * 0.6) }],
  }));

  return (
    <View
      style={[
        styles.base,
        { width: width as any, height, borderRadius },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={[
            'transparent',
            'rgba(196,181,253,0.12)',
            'rgba(196,181,253,0.2)',
            'rgba(196,181,253,0.12)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

/** Card-sized skeleton placeholder */
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton height={14} width="40%" style={{ marginBottom: Spacing.sm }} />
      <Skeleton height={28} width="70%" style={{ marginBottom: Spacing.sm }} />
      <Skeleton height={12} width="55%" />
    </View>
  );
}

/** Stat row skeleton (3 side-by-side cards) */
export function SkeletonStatRow() {
  return (
    <View style={styles.statRow}>
      {[1, 2, 3].map((k) => (
        <View key={k} style={styles.statCard}>
          <Skeleton height={20} width={36} borderRadius={10} style={{ marginBottom: Spacing.xs, alignSelf: 'center' }} />
          <Skeleton height={24} width="60%" style={{ marginBottom: Spacing.xs, alignSelf: 'center' }} />
          <Skeleton height={12} width="80%" style={{ alignSelf: 'center' }} />
        </View>
      ))}
    </View>
  );
}

/** List item skeleton */
export function SkeletonListItem({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.listItem, style]}>
      <View style={styles.listItemLeft}>
        <Skeleton height={44} width={44} borderRadius={22} style={{ marginRight: Spacing.md }} />
        <View style={{ flex: 1 }}>
          <Skeleton height={14} width="60%" style={{ marginBottom: Spacing.xs }} />
          <Skeleton height={12} width="40%" />
        </View>
      </View>
      <Skeleton height={12} width={48} borderRadius={6} />
    </View>
  );
}

/** Default export — a full-page skeleton layout (header + stat row + 3 cards) */
export default function SkeletonLoader({ variant = 'default' }: { variant?: 'default' | 'list' | 'minimal' }) {
  if (variant === 'list') {
    return (
      <View style={styles.container}>
        {[1, 2, 3, 4].map((k) => <SkeletonListItem key={k} style={{ marginBottom: Spacing.sm }} />)}
      </View>
    );
  }

  if (variant === 'minimal') {
    return (
      <View style={styles.container}>
        <Skeleton height={28} width="50%" style={{ marginBottom: Spacing.md }} />
        <Skeleton height={14} width="35%" style={{ marginBottom: Spacing.xl }} />
        <SkeletonCard style={{ marginBottom: Spacing.md }} />
        <SkeletonCard />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Skeleton height={28} width="50%" style={{ marginBottom: Spacing.xs }} />
      <Skeleton height={14} width="35%" style={{ marginBottom: Spacing.xl }} />

      {/* Stat row */}
      <SkeletonStatRow />

      {/* Cards */}
      <Skeleton height={14} width="40%" style={{ marginTop: Spacing.xl, marginBottom: Spacing.sm }} />
      <SkeletonCard style={{ marginBottom: Spacing.sm }} />
      <SkeletonCard style={{ marginBottom: Spacing.sm }} />
      <SkeletonCard />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.card,
    overflow: 'hidden',
  },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    minHeight: 90,
    justifyContent: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
});
