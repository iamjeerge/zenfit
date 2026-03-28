import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '../theme/colors';
import AnimatedEntry from '../components/AnimatedEntry';
import SectionHeader from '../components/SectionHeader';

const { width: W } = Dimensions.get('window');
const WATER_KEY = 'zenfit:water_intake';

interface RecoveryFactors {
  sleepScore: number;      // 0-100 based on last sleep log quality & duration
  moodScore: number;       // 0-100 based on last mood
  heartRateScore: number;  // 0-100 based on wearable / manual resting HR
  hydrationScore: number;  // 0-100 based on today's water intake
  workoutScore: number;    // 0-100 — rewards rest days, penalizes overtraining
}

interface RecoveryData {
  score: number;
  factors: RecoveryFactors;
  recommendation: string;
  intensity: 'rest' | 'light' | 'moderate' | 'train';
  lastUpdated: Date;
}

// ── Scoring helpers ────────────────────────────────────────────────────────

function scoreSleep(durationHours: number, quality: number): number {
  const durationScore = Math.min(durationHours / 8, 1) * 50;
  const qualityScore = ((quality - 1) / 4) * 50;
  return Math.round(durationScore + qualityScore);
}

function scoreMood(moodLevel: number): number {
  return Math.round(((moodLevel - 1) / 4) * 100);
}

function scoreHydration(amountMl: number, goalMl = 2000): number {
  return Math.round(Math.min(amountMl / goalMl, 1) * 100);
}

function scoreWorkout(sessionCountLast3Days: number): number {
  // 0 sessions (rest) = 80, 1 = 100, 2 = 70, 3+ = 50 (overtraining signal)
  const map: Record<number, number> = { 0: 80, 1: 100, 2: 70 };
  return map[Math.min(sessionCountLast3Days, 2)] ?? 50;
}

function computeOverallScore(factors: RecoveryFactors): number {
  const { sleepScore, moodScore, heartRateScore, hydrationScore, workoutScore } = factors;
  // Weights: sleep 35%, mood 20%, HR 15%, hydration 15%, workout 15%
  return Math.round(
    sleepScore * 0.35 +
    moodScore * 0.20 +
    heartRateScore * 0.15 +
    hydrationScore * 0.15 +
    workoutScore * 0.15
  );
}

function getRecommendation(score: number, intensity: string) {
  if (score >= 80) return 'You\'re fully recovered. 💪 Push hard today — strength or HIIT is ideal.';
  if (score >= 65) return 'Good recovery. 🏃 Moderate cardio or functional training will serve you well.';
  if (score >= 45) return 'Partial recovery. 🧘 Light yoga or a walk — let your body repair.';
  return 'Low recovery. 😴 Prioritize rest, hydration, and sleep tonight.';
}

function getIntensity(score: number): RecoveryData['intensity'] {
  if (score >= 80) return 'train';
  if (score >= 65) return 'moderate';
  if (score >= 45) return 'light';
  return 'rest';
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#34D399';  // green
  if (score >= 65) return '#60A5FA';  // blue
  if (score >= 45) return '#FBBF24';  // yellow
  return '#F87171';                   // red
}

const INTENSITY_CONFIG = {
  train: { emoji: '💪', label: 'Train Hard', color: '#34D399' },
  moderate: { emoji: '🏃', label: 'Moderate', color: '#60A5FA' },
  light: { emoji: '🧘', label: 'Go Light', color: '#FBBF24' },
  rest: { emoji: '😴', label: 'Rest Day', color: '#F87171' },
};

// ── Score Dial ─────────────────────────────────────────────────────────────

function ScoreDial({ score, color }: { score: number; color: string }) {
  const progressAngle = useSharedValue(0);
  const scoreDisplay = useSharedValue(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    progressAngle.value = withDelay(300, withTiming(score, { duration: 1200, easing: Easing.out(Easing.cubic) }));
    // Count up animation
    let start = 0;
    const step = score / 40;
    const interval = setInterval(() => {
      start += step;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.round(start));
      }
    }, 30);
    return () => clearInterval(interval);
  }, [score]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${(progressAngle.value / 100) * 270 - 135}deg` }],
  }));

  const DIAL_SIZE = W * 0.52;

  return (
    <View style={[styles.dialContainer, { width: DIAL_SIZE, height: DIAL_SIZE }]}>
      {/* Background ring */}
      <View style={[styles.dialRing, { borderColor: 'rgba(255,255,255,0.08)' }]} />

      {/* Colored arc (approximate with border) */}
      <View style={[styles.dialRing, {
        borderColor: color,
        borderTopColor: color,
        borderRightColor: score > 25 ? color : 'transparent',
        borderBottomColor: score > 50 ? color : 'transparent',
        borderLeftColor: score > 75 ? color : 'transparent',
        opacity: 0.9,
      }]} />

      {/* Center content */}
      <View style={styles.dialCenter}>
        <Text style={[styles.dialScore, { color }]}>{displayScore}</Text>
        <Text style={styles.dialLabel}>Recovery</Text>
        <Text style={styles.dialSubLabel}>out of 100</Text>
      </View>
    </View>
  );
}

// ── Factor Bar ─────────────────────────────────────────────────────────────

function FactorBar({ label, score, icon, delay }: { label: string; score: number; icon: string; delay: number }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(delay, withTiming(score, { duration: 800, easing: Easing.out(Easing.cubic) }));
  }, [score, delay]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as any,
  }));

  const color = getScoreColor(score);

  return (
    <View style={styles.factorRow}>
      <Text style={styles.factorIcon}>{icon}</Text>
      <View style={styles.factorInfo}>
        <View style={styles.factorLabelRow}>
          <Text style={styles.factorLabel}>{label}</Text>
          <Text style={[styles.factorScore, { color }]}>{score}</Text>
        </View>
        <View style={styles.factorTrack}>
          <Animated.View style={[styles.factorBar, barStyle, { backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Screen
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function RecoveryScreen() {
  const user = useAuthStore((s) => s.user);
  const [recovery, setRecovery] = useState<RecoveryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) computeRecovery();
  }, [user]);

  const computeRecovery = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);

      // Fetch last sleep log
      const { data: sleepData } = await supabase
        .from('sleep_logs')
        .select('duration_hours, quality')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(1);

      const lastSleep = sleepData?.[0];
      const sleepScore = lastSleep
        ? scoreSleep(lastSleep.duration_hours ?? 7, lastSleep.quality ?? 3)
        : 60; // default if no data

      // Fetch last mood log
      const { data: moodData } = await supabase
        .from('mood_logs')
        .select('level')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(1);

      const lastMood = moodData?.[0];
      const moodScore = lastMood ? scoreMood(lastMood.level) : 60;

      // Heart rate score — use wearable data if available
      const { data: hrData } = await supabase
        .from('heart_rate_logs')
        .select('bpm')
        .eq('user_id', user!.id)
        .order('recorded_at', { ascending: false })
        .limit(1);

      const restingHR = hrData?.[0]?.bpm ?? 72;
      // 40-55 = elite (100), 56-69 = good (80), 70-84 = average (60), 85+ = poor (40)
      const heartRateScore =
        restingHR <= 55 ? 100 : restingHR <= 69 ? 80 : restingHR <= 84 ? 60 : 40;

      // Hydration from AsyncStorage
      const waterRaw = await AsyncStorage.getItem(`${WATER_KEY}:${today}`);
      const waterMl = waterRaw ? JSON.parse(waterRaw).amountMl : 0;
      const hydrationScore = scoreHydration(waterMl);

      // Workout sessions last 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const { data: workoutData } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('user_id', user!.id)
        .gte('started_at', threeDaysAgo.toISOString());

      const sessionCount = workoutData?.length ?? 0;
      const workoutScore = scoreWorkout(sessionCount);

      const factors: RecoveryFactors = {
        sleepScore,
        moodScore,
        heartRateScore,
        hydrationScore,
        workoutScore,
      };

      const score = computeOverallScore(factors);
      const intensity = getIntensity(score);

      setRecovery({
        score,
        factors,
        recommendation: getRecommendation(score, intensity),
        intensity,
        lastUpdated: new Date(),
      });
    } catch {
      // Fallback with default values
      const factors: RecoveryFactors = {
        sleepScore: 60,
        moodScore: 60,
        heartRateScore: 60,
        hydrationScore: 30,
        workoutScore: 80,
      };
      setRecovery({
        score: computeOverallScore(factors),
        factors,
        recommendation: 'Log sleep, mood, and water to improve your score accuracy.',
        intensity: 'moderate',
        lastUpdated: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !recovery) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={Gradients.cosmic} style={StyleSheet.absoluteFill} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculating your recovery…</Text>
          <Text style={styles.loadingEmoji}>🔬</Text>
        </View>
      </SafeAreaView>
    );
  }

  const scoreColor = getScoreColor(recovery.score);
  const intensityConfig = INTENSITY_CONFIG[recovery.intensity];
  const factors = [
    { label: 'Sleep Quality', score: recovery.factors.sleepScore, icon: '🌙' },
    { label: 'Mood', score: recovery.factors.moodScore, icon: '😊' },
    { label: 'Resting Heart Rate', score: recovery.factors.heartRateScore, icon: '❤️' },
    { label: 'Hydration', score: recovery.factors.hydrationScore, icon: '💧' },
    { label: 'Training Load', score: recovery.factors.workoutScore, icon: '🏋️' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={Gradients.cosmic} style={StyleSheet.absoluteFill} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <AnimatedEntry delay={0}>
          <View style={styles.header}>
            <Text style={styles.title}>🩺 Recovery Score</Text>
            <Text style={styles.subtitle}>
              Updated {recovery.lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <TouchableOpacity onPress={computeRecovery} style={styles.refreshBtn}>
              <Text style={styles.refreshBtnText}>↻ Refresh</Text>
            </TouchableOpacity>
          </View>
        </AnimatedEntry>

        {/* Score Dial */}
        <AnimatedEntry delay={100} style={styles.dialRow}>
          <ScoreDial score={recovery.score} color={scoreColor} />
        </AnimatedEntry>

        {/* Intensity Badge */}
        <AnimatedEntry delay={300}>
          <View style={[styles.intensityBadge, { borderColor: intensityConfig.color, backgroundColor: `${intensityConfig.color}20` }]}>
            <Text style={styles.intensityEmoji}>{intensityConfig.emoji}</Text>
            <Text style={[styles.intensityLabel, { color: intensityConfig.color }]}>{intensityConfig.label}</Text>
          </View>
        </AnimatedEntry>

        {/* Recommendation card */}
        <AnimatedEntry delay={400}>
          <LinearGradient
            colors={Gradients.cardPrimary}
            style={styles.recommendCard}
          >
            <Text style={styles.recommendTitle}>Today's Recommendation</Text>
            <Text style={styles.recommendText}>{recovery.recommendation}</Text>
          </LinearGradient>
        </AnimatedEntry>

        {/* Factor breakdown */}
        <AnimatedEntry delay={500}>
          <SectionHeader title="Score Breakdown" style={styles.sectionHeader} />
          <LinearGradient colors={Gradients.cardSecondary} style={styles.factorsCard}>
            {factors.map((f, idx) => (
              <FactorBar
                key={f.label}
                label={f.label}
                score={f.score}
                icon={f.icon}
                delay={600 + idx * 80}
              />
            ))}
          </LinearGradient>
        </AnimatedEntry>

        {/* How it works */}
        <AnimatedEntry delay={700}>
          <SectionHeader title="How It's Calculated" style={styles.sectionHeader} />
          <LinearGradient colors={Gradients.cardSecondary} style={styles.howCard}>
            {[
              { label: 'Sleep (35%)', desc: 'Last night\'s duration and quality rating' },
              { label: 'Mood (20%)', desc: 'Your most recent mood log entry' },
              { label: 'Heart Rate (15%)', desc: 'Resting HR from wearable or last log' },
              { label: 'Hydration (15%)', desc: "Today's water intake vs 2L goal" },
              { label: 'Training Load (15%)', desc: 'Workout sessions in last 3 days' },
            ].map((item, i) => (
              <View key={i} style={[styles.howRow, i > 0 && styles.howRowBorder]}>
                <Text style={styles.howLabel}>{item.label}</Text>
                <Text style={styles.howDesc}>{item.desc}</Text>
              </View>
            ))}
          </LinearGradient>
        </AnimatedEntry>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: FontSizes.lg, color: Colors.textSecondary, marginBottom: Spacing.md },
  loadingEmoji: { fontSize: 48 },

  header: {
    paddingTop: Spacing.lg,
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  title: { fontSize: FontSizes.xxxl, fontWeight: '900', color: Colors.textPrimary },
  subtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4 },
  refreshBtn: {
    position: 'absolute',
    right: 0,
    top: Spacing.lg,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  refreshBtnText: { color: Colors.lavender, fontSize: FontSizes.sm, fontWeight: '600' },

  dialRow: { alignItems: 'center', marginBottom: Spacing.xl },

  dialContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dialRing: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: 999,
    borderWidth: 12,
    borderColor: 'transparent',
  },
  dialCenter: { alignItems: 'center' },
  dialScore: { fontSize: 64, fontWeight: '900', lineHeight: 70 },
  dialLabel: { fontSize: FontSizes.md, color: Colors.textSecondary, fontWeight: '600' },
  dialSubLabel: { fontSize: FontSizes.xs, color: Colors.textMuted },

  intensityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  intensityEmoji: { fontSize: 22 },
  intensityLabel: { fontSize: FontSizes.lg, fontWeight: '800' },

  recommendCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.md,
  },
  recommendTitle: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  recommendText: { fontSize: FontSizes.md, color: Colors.textPrimary, lineHeight: 22 },

  sectionHeader: { marginTop: Spacing.lg, marginBottom: Spacing.sm },

  factorsCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: Spacing.md,
  },
  factorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  factorIcon: { fontSize: 20, width: 28 },
  factorInfo: { flex: 1 },
  factorLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  factorLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  factorScore: { fontSize: FontSizes.sm, fontWeight: '800' },
  factorTrack: {
    height: 6,
    backgroundColor: Colors.card,
    borderRadius: 3,
    overflow: 'hidden',
  },
  factorBar: { height: 6, borderRadius: 3 },

  howCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  howRow: { paddingVertical: Spacing.sm },
  howRowBorder: { borderTopWidth: 1, borderTopColor: Colors.glassBorder },
  howLabel: { fontSize: FontSizes.sm, color: Colors.textPrimary, fontWeight: '700', marginBottom: 2 },
  howDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary },
});
