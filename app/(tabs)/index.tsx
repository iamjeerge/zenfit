import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
  HIT_SLOP,
} from '../../src/theme/colors';
import {
  GlassCard,
  StatCard,
  SectionHeader,
  AnimatedEntry,
} from '../../src/components';

const { width } = Dimensions.get('window');

const MANTRAS = [
  '"Every breath is a new beginning. Be present, be grateful, be whole."',
  '"Your body is a temple, but only if you treat it as one."',
  '"The pose begins when you want to leave it."',
  '"Peace comes from within. Do not seek it without."',
  '"Inhale the future, exhale the past."',
];

const QUICK_ACTIONS = [
  { icon: '🧘', label: 'Start Yoga', route: '/yoga' as const },
  { icon: '🌬️', label: 'Breathe', route: '/breathe' as const },
  { icon: '🍽️', label: 'Log Meal', route: '/nutrition' as const },
  { icon: '📊', label: 'Progress', route: '/profile' as const },
];

export default function HomeScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const [heartRate] = useState(72);
  const [heartZone] = useState<'rest' | 'fatburn' | 'cardio' | 'peak' | 'extreme'>('fatburn');

  const todayMantra = MANTRAS[new Date().getDay() % MANTRAS.length];

  const getHeartZoneColor = () => {
    const map = {
      rest: Colors.heartRest,
      fatburn: Colors.heartFatBurn,
      cardio: Colors.heartCardio,
      peak: Colors.heartPeak,
      extreme: Colors.heartExtreme,
    };
    return map[heartZone] ?? Colors.cosmicBlue;
  };

  const getHeartZoneLabel = () => {
    const map = {
      rest: 'Rest',
      fatburn: 'Fat Burn',
      cardio: 'Cardio',
      peak: 'Peak',
      extreme: 'Extreme',
    };
    return map[heartZone] ?? 'Unknown';
  };

  const handleQuickAction = useCallback((route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  }, [router]);

  const firstName = profile?.full_name?.split(' ')[0] || 'Friend';
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Aurora Gradient */}
        <AnimatedEntry delay={0} duration={600}>
          <LinearGradient
            colors={Gradients.aurora as unknown as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <Text style={styles.greetingSmall}>{greeting}</Text>
              <Text style={styles.greeting} accessibilityRole="header">
                {firstName} 🙏
              </Text>
            </View>
          </LinearGradient>
        </AnimatedEntry>

        {/* Daily Mantra Card */}
        <AnimatedEntry delay={100} duration={600}>
          <GlassCard style={styles.mantraCard}>
            <Text style={styles.mantraLabel}>DAILY MANTRA</Text>
            <Text style={styles.mantraText}>{todayMantra}</Text>
            <Text style={styles.mantraAuthor}>— Daily Wisdom</Text>
          </GlassCard>
        </AnimatedEntry>

        {/* Daily Stats Row */}
        <AnimatedEntry delay={200} duration={600}>
          <View style={styles.statsRow}>
            <StatCard
              value="8,432"
              label="Steps"
              progress={0.84}
              progressColor={Colors.sageLeaf}
              icon="👟"
            />
            <StatCard
              value="6/10"
              label="Water"
              progress={0.6}
              progressColor={Colors.cosmicBlue}
              icon="💧"
            />
            <StatCard
              value="320"
              label="Calories"
              progress={0.64}
              progressColor={Colors.sunriseOrange}
              icon="🔥"
            />
          </View>
        </AnimatedEntry>

        {/* Heart Rate Widget */}
        <AnimatedEntry delay={300} duration={600}>
          <GlassCard style={{ marginBottom: Spacing.lg }}>
            <View style={styles.heartRateContent}>
              <View style={styles.heartRateLeft}>
                <Text style={styles.heartRateLabel}>LIVE HEART RATE</Text>
                <View style={styles.heartRateDisplay}>
                  <Text
                    style={styles.heartRateValue}
                    accessibilityLabel={`Heart rate: ${heartRate} beats per minute`}
                  >
                    {heartRate}
                  </Text>
                  <Text style={styles.heartRateUnit}>BPM</Text>
                </View>
              </View>
              <View style={styles.heartRateRight}>
                <View
                  style={[
                    styles.heartRateZoneIndicator,
                    {
                      backgroundColor: getHeartZoneColor(),
                      shadowColor: getHeartZoneColor(),
                    },
                  ]}
                />
                <Text style={styles.heartZoneLabel}>{getHeartZoneLabel()}</Text>
              </View>
            </View>
          </GlassCard>
        </AnimatedEntry>

        {/* Quick Action Buttons */}
        <AnimatedEntry delay={400} duration={600}>
          <SectionHeader title="Quick Actions" />
          <View style={styles.actionButtonsRow}>
            {QUICK_ACTIONS.map((action, idx) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionButton}
                activeOpacity={0.7}
                onPress={() => handleQuickAction(action.route)}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                hitSlop={HIT_SLOP}
              >
                <LinearGradient
                  colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
                  style={styles.actionButtonGradient}
                >
                  <Text style={styles.actionButtonIcon}>{action.icon}</Text>
                  <Text style={styles.actionButtonText}>{action.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedEntry>

        {/* Streak & XP Section */}
        <AnimatedEntry delay={500} duration={600}>
          <View style={styles.streakContainer}>
            <GlassCard style={{ flex: 1 }}>
              <View style={styles.streakContent}>
                <Text style={styles.streakIcon}>🔥</Text>
                <View style={styles.streakInfo}>
                  <Text style={styles.streakDays}>{profile?.streak_days || 0}</Text>
                  <Text style={styles.streakLabel}>Day Streak</Text>
                </View>
              </View>
            </GlassCard>

            <GlassCard style={{ flex: 1 }}>
              <View style={styles.xpContent}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>LV</Text>
                  <Text style={styles.levelNumber}>{profile?.level || 1}</Text>
                </View>
                <View style={styles.xpInfo}>
                  <Text style={styles.xpValue}>{profile?.xp || 0}</Text>
                  <Text style={styles.xpLabel}>Total XP</Text>
                </View>
              </View>
            </GlassCard>
          </View>
        </AnimatedEntry>

        {/* Footer spacing for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  headerGradient: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  headerContent: {
    gap: Spacing.xs,
  },
  greetingSmall: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  greeting: {
    fontSize: FontSizes.display,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  mantraCard: {
    marginBottom: Spacing.lg,
  },
  mantraLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  mantraText: {
    fontSize: FontSizes.md,
    color: Colors.lavender,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  mantraAuthor: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  heartRateContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heartRateLeft: {
    flex: 1,
  },
  heartRateLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  heartRateDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  heartRateValue: {
    fontSize: FontSizes.display,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  heartRateUnit: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  heartRateRight: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heartRateZoneIndicator: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  heartZoneLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    width: (width - Spacing.md * 2 - Spacing.md) / 2,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.subtle,
  },
  actionButtonGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 100,
    justifyContent: 'center',
  },
  actionButtonIcon: {
    fontSize: 36,
  },
  actionButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  streakIcon: {
    fontSize: 40,
  },
  streakInfo: {
    flex: 1,
  },
  streakDays: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.sacredGold,
  },
  streakLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  xpContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.violet,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.glow,
  },
  levelText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.lavender,
  },
  levelNumber: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: -2,
  },
  xpInfo: {
    flex: 1,
  },
  xpValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.violetLight,
  },
  xpLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
});
