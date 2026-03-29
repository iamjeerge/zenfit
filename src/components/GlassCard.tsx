/**
 * @file GlassCard.tsx
 * @module components/GlassCard
 * @description Glassmorphism card container with a subtle gradient border and
 * frosted-glass background. Used as the primary card surface throughout the ZenFit UI.
 */

import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, BorderRadius, Shadows, Spacing } from '../theme/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: readonly string[];
  padded?: boolean;
  variant?: 'default' | 'elevated' | 'subtle';
}

export default function GlassCard({
  children,
  style,
  gradient,
  padded = true,
  variant = 'default',
}: GlassCardProps) {
  const shadowStyle = variant === 'elevated' ? Shadows.card : Shadows.subtle;

  return (
    <View
      style={[styles.container, shadowStyle, variant === 'subtle' && styles.subtleContainer, style]}
    >
      <LinearGradient
        colors={
          (gradient ?? [Colors.glassBackgroundLight, Colors.glassBackground]) as [
            string,
            string,
            ...string[],
          ]
        }
        style={[styles.gradient, padded && styles.padded]}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  subtleContainer: {
    borderColor: 'rgba(196, 181, 253, 0.1)',
  },
  gradient: {},
  padded: {
    padding: Spacing.lg,
  },
});
