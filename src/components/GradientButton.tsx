/**
 * @file GradientButton.tsx
 * @module components/GradientButton
 * @description Primary action button with a linear gradient fill.
 * Supports disabled / loading states and triggers haptic feedback on press.
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ViewStyle, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from '../utils/haptics';
import { Colors, Gradients, BorderRadius, FontSizes, Shadows, Spacing } from '../theme/colors';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  gradient?: readonly string[];
  colors?: string[];
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: object;
  icon?: string;
  accessibilityLabel?: string;
}

export default function GradientButton({
  title,
  onPress,
  variant = 'primary',
  gradient,
  disabled = false,
  loading = false,
  style,
  icon,
  accessibilityLabel,
}: GradientButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getGradient = (): readonly string[] => {
    if (gradient) return gradient;
    switch (variant) {
      case 'primary':
        return Gradients.aurora;
      case 'secondary':
        return [Colors.glassBackgroundLight, Colors.glassBackground];
      case 'ghost':
        return ['transparent', 'transparent'];
      case 'danger':
        return ['rgba(248, 113, 113, 0.3)', 'rgba(248, 113, 113, 0.1)'];
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return Colors.textPrimary;
      case 'secondary':
        return Colors.lavender;
      case 'ghost':
        return Colors.textSecondary;
      case 'danger':
        return Colors.error;
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.container,
        variant !== 'ghost' && Shadows.subtle,
        variant === 'secondary' && styles.secondaryBorder,
        variant === 'danger' && styles.dangerBorder,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      <LinearGradient
        colors={getGradient() as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator size="small" color={getTextColor()} />
        ) : (
          <>
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    minHeight: 52,
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  dangerBorder: {
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 18,
  },
  text: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
