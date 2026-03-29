/**
 * @file SettingsScreen.tsx
 * @module screens/SettingsScreen
 * @description Settings screen — provides toggles for notifications, appearance,
 * measurement units, and account management options.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Switch, TouchableOpacity, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useRouter } from '../utils/router';
import * as Haptics from '../utils/haptics';
import { Colors, Gradients, Spacing, BorderRadius, FontSizes, Shadows } from '../theme/colors';
import AnimatedEntry from '../components/AnimatedEntry';
import SectionHeader from '../components/SectionHeader';
import { GradientButton } from '../components';
import { useAuthStore } from '../store/authStore';

interface SettingRow {
  id: string;
  icon: string;
  label: string;
  value?: boolean;
  onPress?: () => void;
  onToggle?: (val: boolean) => void;
  isToggle?: boolean;
  destructive?: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const profile = useAuthStore((s) => s.profile);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [notifications, setNotifications] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const handleSignOut = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/auth');
        },
      },
    ]);
  };

  const accountRows: SettingRow[] = [
    {
      id: 'edit-profile',
      icon: '✏️',
      label: 'Edit Profile',
      onPress: () => {},
    },
    {
      id: 'change-password',
      icon: '🔑',
      label: 'Change Password',
      onPress: () => {},
    },
    {
      id: 'data-export',
      icon: '📤',
      label: 'Export My Data',
      onPress: () => {},
    },
  ];

  const preferenceRows: SettingRow[] = [
    {
      id: 'notifications',
      icon: '🔔',
      label: 'Push Notifications',
      isToggle: true,
      value: notifications,
      onToggle: setNotifications,
    },
    {
      id: 'haptics',
      icon: '📳',
      label: 'Haptic Feedback',
      isToggle: true,
      value: haptics,
      onToggle: setHaptics,
    },
    {
      id: 'analytics',
      icon: '📊',
      label: 'Share Analytics',
      isToggle: true,
      value: analyticsEnabled,
      onToggle: setAnalyticsEnabled,
    },
  ];

  const supportRows: SettingRow[] = [
    {
      id: 'privacy',
      icon: '🔒',
      label: 'Privacy Policy',
      onPress: () => {},
    },
    {
      id: 'terms',
      icon: '📄',
      label: 'Terms of Service',
      onPress: () => {},
    },
    {
      id: 'support',
      icon: '💬',
      label: 'Contact Support',
      onPress: () => {},
    },
    {
      id: 'rate',
      icon: '⭐',
      label: 'Rate ZenFit',
      onPress: () => {},
    },
  ];

  const SettingItem = ({ row }: { row: SettingRow }) => (
    <TouchableOpacity
      style={[styles.row, row.destructive && styles.rowDestructive]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        row.onPress?.();
      }}
      disabled={row.isToggle}
      activeOpacity={row.isToggle ? 1 : 0.7}
    >
      <View style={styles.rowLeft}>
        <Text style={styles.rowIcon}>{row.icon}</Text>
        <Text style={[styles.rowLabel, row.destructive && styles.rowLabelDestructive]}>
          {row.label}
        </Text>
      </View>
      {row.isToggle ? (
        <Switch
          value={row.value}
          onValueChange={row.onToggle}
          trackColor={{ false: Colors.textMuted, true: Colors.sageLeaf }}
          thumbColor={row.value ? Colors.sacredGold : Colors.textSecondary}
        />
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.cosmic as unknown as [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Account */}
        <AnimatedEntry delay={0}>
          <SectionHeader title="Account" emoji="👤" />
          <LinearGradient
            colors={Gradients.cardPrimary as unknown as [string, string]}
            style={styles.card}
          >
            {accountRows.map((row, idx) => (
              <View key={row.id}>
                <SettingItem row={row} />
                {idx < accountRows.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </LinearGradient>
        </AnimatedEntry>

        {/* Preferences */}
        <AnimatedEntry delay={100}>
          <SectionHeader title="Preferences" emoji="⚙️" />
          <LinearGradient
            colors={Gradients.cardPrimary as unknown as [string, string]}
            style={styles.card}
          >
            {preferenceRows.map((row, idx) => (
              <View key={row.id}>
                <SettingItem row={row} />
                {idx < preferenceRows.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </LinearGradient>
        </AnimatedEntry>

        {/* Support */}
        <AnimatedEntry delay={200}>
          <SectionHeader title="Support" emoji="🛟" />
          <LinearGradient
            colors={Gradients.cardPrimary as unknown as [string, string]}
            style={styles.card}
          >
            {supportRows.map((row, idx) => (
              <View key={row.id}>
                <SettingItem row={row} />
                {idx < supportRows.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </LinearGradient>
        </AnimatedEntry>

        {/* Version */}
        <AnimatedEntry delay={300}>
          <Text style={styles.version}>ZenFit v1.0.0</Text>
        </AnimatedEntry>

        {/* Sign Out */}
        <AnimatedEntry delay={350}>
          <GradientButton
            title="Sign Out"
            onPress={handleSignOut}
            colors={['rgba(248,113,113,0.3)', 'rgba(239,68,68,0.15)']}
            style={styles.signOutBtn}
            textStyle={{ color: Colors.error }}
          />
        </AnimatedEntry>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.glassBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  backIcon: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '300',
    marginTop: -2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
    gap: Spacing.xs,
  },
  card: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  rowDestructive: {},
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rowIcon: {
    fontSize: 20,
  },
  rowLabel: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  rowLabelDestructive: {
    color: Colors.error,
  },
  chevron: {
    fontSize: 22,
    color: Colors.textMuted,
    fontWeight: '300',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.glassBorder,
    marginHorizontal: Spacing.lg,
  },
  version: {
    textAlign: 'center',
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginVertical: Spacing.md,
  },
  signOutBtn: {
    marginTop: Spacing.sm,
  },
});
