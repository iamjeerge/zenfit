/**
 * @file SectionHeader.tsx
 * @module components/SectionHeader
 * @description Reusable section heading with optional right-side action link.
 * Provides consistent typographic treatment for all section headers in the app.
 */

import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, FontSizes, Spacing, Gradients, BorderRadius } from '../theme/colors';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
}

export default function SectionHeader({
  title,
  subtitle,
  emoji,
  rightElement,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftRow}>
        <LinearGradient
          colors={Gradients.auroraSubtle as [string, string, ...string[]]}
          style={styles.accent}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{emoji ? `${emoji} ${title}` : title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  leftRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  accent: {
    width: 3,
    height: 18,
    borderRadius: BorderRadius.full,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
