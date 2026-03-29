/**
 * @file AnimatedEmptyState.tsx
 * @module components/AnimatedEmptyState
 * @description Animated empty-state placeholder rendered when a list has no items.
 * Includes a pulsing icon and descriptive copy.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../theme/colors';

interface AnimatedEmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  style?: object;
}

/**
 * AnimatedEmptyState — a reusable empty state with a floating + pulsing emoji,
 * replacing plain text placeholders across screens.
 */
export default function AnimatedEmptyState({
  emoji,
  title,
  subtitle,
  style,
}: AnimatedEmptyStateProps) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Floating up/down loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -12,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Gentle scale pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }, style]}>
      {/* Glow ring behind emoji */}
      <Animated.View
        style={[styles.glowRing, { transform: [{ translateY: floatAnim }, { scale: scaleAnim }] }]}
      />
      <Animated.Text
        style={[styles.emoji, { transform: [{ translateY: floatAnim }, { scale: scaleAnim }] }]}
      >
        {emoji}
      </Animated.Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  glowRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(124,58,237,0.12)',
    top: Spacing.xxl - 10,
  },
  emoji: {
    fontSize: 72,
    marginBottom: Spacing.md,
    textShadowColor: 'rgba(124,58,237,0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
