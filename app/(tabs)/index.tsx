import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? '';
const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';
const BRIEFING_CACHE_KEY = 'zenfit:ai_briefing';

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
  { icon: '🍽️', label: 'Log Meal', route: '/nutrition' as const },  { icon: '📝', label: 'Journal', route: '/journal' as const },  { icon: '�', label: 'Habits', route: '/habits' as const },
  { icon: '�💧', label: 'Water', route: '/water' as const },
  { icon: '🩺', label: 'Recovery', route: '/recovery' as const },
  { icon: '📏', label: 'Measure', route: '/body-measurements' as const },
  { icon: '📊', label: 'Progress', route: '/profile' as const },
];

export default function HomeScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const [heartRate] = useState(72);
  const [heartZone] = useState<'rest' | 'fatburn' | 'cardio' | 'peak' | 'extreme'>('fatburn');
  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const hasFetched = useRef(false);

  // Aurora background animation
  const aurora1 = useRef(new Animated.Value(0)).current;
  const aurora2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(aurora1, { toValue: 1, duration: 6000, useNativeDriver: true }),
        Animated.timing(aurora1, { toValue: 0, duration: 6000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(3000),
        Animated.timing(aurora2, { toValue: 1, duration: 6000, useNativeDriver: true }),
        Animated.timing(aurora2, { toValue: 0, duration: 6000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const todayMantra = MANTRAS[new Date().getDay() % MANTRAS.length];

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchDailyBriefing();
  }, []);

  const fetchDailyBriefing = async () => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const cached = await AsyncStorage.getItem(BRIEFING_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.date === today && parsed.text) {
          setBriefing(parsed.text);
          return;
        }
      }
    } catch {}

    if (!CLAUDE_API_KEY || CLAUDE_API_KEY === 'your-claude-api-key') {
      setBriefing(getOfflineBriefing());
      return;
    }

    setBriefingLoading(true);
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const name = profile?.full_name?.split(' ')[0] || 'friend';

    try {
      const waterRaw = await AsyncStorage.getItem(`zenfit:water_intake:${today}`);
      const waterMl = waterRaw ? JSON.parse(waterRaw).totalMl ?? 0 : 0;
      const prompt = `You are a friendly wellness coach for the ZenFit app. Write a short, motivational daily ${timeOfDay} briefing for ${name}. Keep it to 2-3 sentences. Include one specific tip based on: water intake today ${waterMl}ml (goal 2000ml), streak ${profile?.streak_days ?? 0} days, current heart zone fatburn. Be warm, personal, and energising. No markdown, plain text only.`;
      const res = await fetch(CLAUDE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 150,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await res.json();
      const text: string = data?.content?.[0]?.text ?? getOfflineBriefing();
      setBriefing(text);
      await AsyncStorage.setItem(BRIEFING_CACHE_KEY, JSON.stringify({ date: today, text }));
    } catch {
      setBriefing(getOfflineBriefing());
    } finally {
      setBriefingLoading(false);
    }
  };

  const getOfflineBriefing = () => {
    const briefings = [
      'Start your day with intention. Move your body, nourish your mind, and embrace the journey ahead.',
      'Every small step counts. Stay hydrated, breathe deeply, and celebrate today\'s progress.',
      'Your consistency is building something beautiful. Keep showing up — your future self will thank you.',
    ];
    return briefings[new Date().getDay() % briefings.length];
  };

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
      {/* Aurora background blobs */}
      <Animated.View
        style={[
          styles.auroraBlob1,
          { opacity: aurora1 },
        ]}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          styles.auroraBlob2,
          { opacity: aurora2 },
        ]}
        pointerEvents="none"
      />
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

        {/* AI Daily Briefing Card */}
        <AnimatedEntry delay={80} duration={600}>
          <LinearGradient
            colors={['rgba(124,58,237,0.18)', 'rgba(244,114,182,0.10)']}
            style={styles.briefingCard}
          >
            <View style={styles.briefingHeader}>
              <Text style={styles.briefingIcon}>🤖</Text>
              <Text style={styles.briefingLabel}>AI DAILY BRIEFING</Text>
              <TouchableOpacity
                onPress={() => { hasFetched.current = false; setBriefing(null); fetchDailyBriefing(); }}
                accessibilityLabel="Refresh briefing"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.briefingRefresh}>↻</Text>
              </TouchableOpacity>
            </View>
            {briefingLoading ? (
              <View style={styles.briefingLoading}>
                <ActivityIndicator size="small" color={Colors.violet} />
                <Text style={styles.briefingLoadingText}>Crafting your briefing…</Text>
              </View>
            ) : (
              <Text style={styles.briefingText}>{briefing ?? 'Loading your personalized briefing…'}</Text>
            )}
          </LinearGradient>
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
  auroraBlob1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(124,58,237,0.18)',
    top: -width * 0.3,
    left: -width * 0.2,
  },
  auroraBlob2: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(244,114,182,0.12)',
    top: width * 0.2,
    right: -width * 0.25,
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
  briefingCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
  },
  briefingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  briefingIcon: { fontSize: 16 },
  briefingLabel: {
    flex: 1,
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: Colors.violet,
    letterSpacing: 0.8,
  },
  briefingRefresh: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  briefingText: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  briefingLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  briefingLoadingText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
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
