import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { useCelebration } from '../components/CelebrationOverlay';

const { width: W } = Dimensions.get('window');
const GLASS_ML = 250; // ml per glass
const DAILY_GOAL_ML = 2000; // 8 glasses = 2000ml
const STORAGE_KEY = 'zenfit:water_intake';

interface WaterLog {
  date: string; // YYYY-MM-DD
  amountMl: number;
  logs: { time: string; ml: number }[];
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// ── Animated water fill component ──────────────────────────────────────────

interface WaterFillProps {
  progress: number; // 0–1
  amountMl: number;
  goalMl: number;
}

function WaterFill({ progress, amountMl, goalMl }: WaterFillProps) {
  const fillHeight = useSharedValue(0);
  const waveOffset = useSharedValue(0);

  useEffect(() => {
    fillHeight.value = withTiming(Math.min(progress, 1), {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    height: `${fillHeight.value * 100}%` as any,
  }));

  const CONTAINER_SIZE = W * 0.52;
  const glasses = Math.round(amountMl / GLASS_ML);
  const goalGlasses = Math.round(goalMl / GLASS_ML);
  const pct = Math.round(Math.min(progress, 1) * 100);

  return (
    <View style={[styles.fillContainer, { width: CONTAINER_SIZE, height: CONTAINER_SIZE * 1.3 }]}>
      {/* Bottle outline */}
      <LinearGradient
        colors={['rgba(96,165,250,0.15)', 'rgba(96,165,250,0.05)']}
        style={styles.bottleOuter}
      >
        {/* Water fill */}
        <View style={styles.bottleInner}>
          <Animated.View style={[styles.waterFill, fillStyle]}>
            <LinearGradient
              colors={pct >= 100
                ? ['#34D399', '#059669']
                : ['#60A5FA', '#3B82F6']}
              style={StyleSheet.absoluteFill}
            />
            {/* Wave ripple effect using opacity pulse */}
            <View style={styles.wave} />
          </Animated.View>
        </View>

        {/* Center text overlay */}
        <View style={styles.bottleCenterText}>
          <Text style={styles.bottlePercent}>{pct}%</Text>
          <Text style={styles.bottleMl}>{amountMl} ml</Text>
          <Text style={styles.bottleGlasses}>
            {glasses} / {goalGlasses} glasses
          </Text>
        </View>
      </LinearGradient>

      {/* Goal label */}
      {progress >= 1 && (
        <View style={styles.goalReachedBadge}>
          <Text style={styles.goalReachedText}>✅ Daily Goal!</Text>
        </View>
      )}
    </View>
  );
}

// ── Quick add amounts ───────────────────────────────────────────────────────

const QUICK_AMOUNTS = [
  { label: '1 glass', ml: 250, emoji: '🥤' },
  { label: '500ml', ml: 500, emoji: '🫙' },
  { label: '750ml', ml: 750, emoji: '🍶' },
  { label: '1L', ml: 1000, emoji: '🫗' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Screen
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function WaterTrackerScreen() {
  const [todayLog, setTodayLog] = useState<WaterLog>({
    date: todayKey(),
    amountMl: 0,
    logs: [],
  });
  const [weeklyData, setWeeklyData] = useState<{ day: string; ml: number }[]>([]);
  const { celebrate, overlay: celebrationOverlay } = useCelebration();
  const addBtnScale = useSharedValue(1);
  const prevGoalReached = React.useRef(false);

  useEffect(() => {
    loadTodayData();
    loadWeeklyData();
  }, []);

  const loadTodayData = async () => {
    try {
      const raw = await AsyncStorage.getItem(`${STORAGE_KEY}:${todayKey()}`);
      if (raw) setTodayLog(JSON.parse(raw));
    } catch {}
  };

  const loadWeeklyData = async () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const results: { day: string; ml: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      const raw = await AsyncStorage.getItem(`${STORAGE_KEY}:${key}`);
      const ml = raw ? JSON.parse(raw).amountMl : 0;
      results.push({ day: days[date.getDay() === 0 ? 6 : date.getDay() - 1], ml });
    }
    setWeeklyData(results);
  };

  const handleAdd = useCallback(async (ml: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Bounce animation
    addBtnScale.value = withSequence(
      withSpring(0.93, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );

    const newAmount = todayLog.amountMl + ml;
    const newLog: WaterLog = {
      date: todayKey(),
      amountMl: newAmount,
      logs: [
        ...todayLog.logs,
        { time: formatTime(new Date()), ml },
      ],
    };

    setTodayLog(newLog);

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(`${STORAGE_KEY}:${todayKey()}`, JSON.stringify(newLog));
    } catch {}

    // Celebrate on goal reached (first time only)
    if (!prevGoalReached.current && newAmount >= DAILY_GOAL_ML) {
      prevGoalReached.current = true;
      setTimeout(() => celebrate('💧', 'Hydrated!', '2L daily goal reached!'), 400);
    }

    // Update weekly
    setWeeklyData((prev) =>
      prev.map((d, i) => (i === prev.length - 1 ? { ...d, ml: newAmount } : d))
    );
  }, [todayLog]);

  const handleReset = () => {
    Alert.alert('Reset Today?', 'This will clear today\'s water intake.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          const empty: WaterLog = { date: todayKey(), amountMl: 0, logs: [] };
          setTodayLog(empty);
          prevGoalReached.current = false;
          await AsyncStorage.removeItem(`${STORAGE_KEY}:${todayKey()}`);
        },
      },
    ]);
  };

  const progress = todayLog.amountMl / DAILY_GOAL_ML;
  const maxWeekly = Math.max(...weeklyData.map((d) => d.ml), DAILY_GOAL_ML);
  const addBtnStyle = useAnimatedStyle(() => ({ transform: [{ scale: addBtnScale.value }] }));

  const tips = [
    { emoji: '🌅', text: 'Drink a glass first thing when you wake up.' },
    { emoji: '🍋', text: 'Add lemon slices to make water more enjoyable.' },
    { emoji: '⏰', text: 'Set hourly reminders to stay on track.' },
    { emoji: '🥗', text: 'Eat water-rich foods: cucumber, watermelon, celery.' },
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
            <Text style={styles.title}>💧 Hydration</Text>
            <Text style={styles.subtitle}>Stay hydrated today</Text>
            <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </AnimatedEntry>

        {/* Water fill circle */}
        <AnimatedEntry delay={100} style={styles.fillRow}>
          <WaterFill
            progress={progress}
            amountMl={todayLog.amountMl}
            goalMl={DAILY_GOAL_ML}
          />
        </AnimatedEntry>

        {/* Quick add buttons */}
        <AnimatedEntry delay={200}>
          <SectionHeader title="Add Water" style={styles.sectionHeader} />
          <View style={styles.quickAddGrid}>
            {QUICK_AMOUNTS.map((item) => (
              <Animated.View key={item.ml} style={[styles.quickAddBtnWrap, addBtnStyle]}>
                <TouchableOpacity
                  style={styles.quickAddBtn}
                  onPress={() => handleAdd(item.ml)}
                  accessibilityLabel={`Add ${item.label}`}
                >
                  <LinearGradient
                    colors={['rgba(96,165,250,0.25)', 'rgba(59,130,246,0.12)']}
                    style={styles.quickAddGradient}
                  >
                    <Text style={styles.quickAddEmoji}>{item.emoji}</Text>
                    <Text style={styles.quickAddLabel}>{item.label}</Text>
                    <Text style={styles.quickAddMl}>+{item.ml} ml</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </AnimatedEntry>

        {/* Weekly bar chart */}
        <AnimatedEntry delay={300}>
          <SectionHeader title="Weekly Overview" style={styles.sectionHeader} />
          <LinearGradient
            colors={Gradients.cardSecondary}
            style={styles.weeklyCard}
          >
            <View style={styles.weeklyBars}>
              {weeklyData.map((d, idx) => {
                const barHeight = Math.max((d.ml / maxWeekly) * 90, 4);
                const isToday = idx === weeklyData.length - 1;
                return (
                  <View key={idx} style={styles.weeklyBarCol}>
                    <Text style={styles.weeklyBarMl}>
                      {d.ml >= 1000 ? `${(d.ml / 1000).toFixed(1)}L` : d.ml > 0 ? `${d.ml}` : ''}
                    </Text>
                    <View style={styles.weeklyBarTrack}>
                      <LinearGradient
                        colors={isToday
                          ? (d.ml >= DAILY_GOAL_ML ? ['#34D399', '#059669'] : ['#60A5FA', '#3B82F6'])
                          : ['rgba(96,165,250,0.5)', 'rgba(59,130,246,0.3)']}
                        style={[styles.weeklyBar, { height: barHeight }]}
                      />
                    </View>
                    <View style={styles.weeklyGoalLine} />
                    <Text style={[styles.weeklyBarDay, isToday && styles.weeklyBarDayToday]}>
                      {d.day}
                    </Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.weeklyGoalLabel}>— 2L goal</Text>
          </LinearGradient>
        </AnimatedEntry>

        {/* Today's log */}
        {todayLog.logs.length > 0 && (
          <AnimatedEntry delay={400}>
            <SectionHeader title="Today's Log" style={styles.sectionHeader} />
            <LinearGradient colors={Gradients.cardSecondary} style={styles.logCard}>
              {[...todayLog.logs].reverse().map((entry, idx) => (
                <View key={idx} style={styles.logRow}>
                  <Text style={styles.logTime}>{entry.time}</Text>
                  <Text style={styles.logAmount}>💧 {entry.ml} ml</Text>
                </View>
              ))}
            </LinearGradient>
          </AnimatedEntry>
        )}

        {/* Tips */}
        <AnimatedEntry delay={500}>
          <SectionHeader title="Hydration Tips" style={styles.sectionHeader} />
          {tips.map((tip, i) => (
            <LinearGradient
              key={i}
              colors={Gradients.cardSecondary}
              style={styles.tipCard}
            >
              <Text style={styles.tipEmoji}>{tip.emoji}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </LinearGradient>
          ))}
        </AnimatedEntry>
      </ScrollView>

      {celebrationOverlay}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },

  header: {
    paddingTop: Spacing.lg,
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  title: { fontSize: FontSizes.xxxl, fontWeight: '900', color: Colors.textPrimary },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: 2 },
  resetBtn: {
    position: 'absolute',
    right: 0,
    top: Spacing.lg,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: 'rgba(248,113,113,0.15)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
  },
  resetBtnText: { color: Colors.error, fontSize: FontSizes.sm, fontWeight: '600' },

  fillRow: { alignItems: 'center', marginBottom: Spacing.xl },

  // Bottle
  fillContainer: { alignItems: 'center', justifyContent: 'center' },
  bottleOuter: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.xxl,
    borderWidth: 2,
    borderColor: 'rgba(96,165,250,0.4)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    ...Shadows.card,
  },
  bottleInner: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
  },
  waterFill: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
  },
  bottleCenterText: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottlePercent: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.textPrimary,
    ...Shadows.glow,
  },
  bottleMl: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.cosmicBlue, marginTop: 4 },
  bottleGlasses: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4 },
  goalReachedBadge: {
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(52,211,153,0.2)',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.sageLeaf,
  },
  goalReachedText: { color: Colors.sageLeaf, fontWeight: '700', fontSize: FontSizes.sm },

  sectionHeader: { marginTop: Spacing.lg, marginBottom: Spacing.sm },

  // Quick add
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  quickAddBtnWrap: { width: '47%' },
  quickAddBtn: { borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(96,165,250,0.3)' },
  quickAddGradient: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  quickAddEmoji: { fontSize: 28, marginBottom: Spacing.xs },
  quickAddLabel: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary },
  quickAddMl: { fontSize: FontSizes.sm, color: Colors.cosmicBlue, marginTop: 2 },

  // Weekly chart
  weeklyCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.sm,
  },
  weeklyBars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  weeklyBarCol: { alignItems: 'center', flex: 1 },
  weeklyBarMl: { fontSize: 9, color: Colors.textMuted, marginBottom: 2 },
  weeklyBarTrack: { width: 20, alignItems: 'center', height: 90, justifyContent: 'flex-end' },
  weeklyBar: { width: 16, borderRadius: 4 },
  weeklyGoalLine: { height: 1, width: 16, backgroundColor: 'rgba(96,165,250,0.4)', marginTop: 2 },
  weeklyBarDay: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 4, fontWeight: '600' },
  weeklyBarDayToday: { color: Colors.cosmicBlue },
  weeklyGoalLabel: { fontSize: FontSizes.xs, color: 'rgba(96,165,250,0.6)', marginTop: Spacing.xs, textAlign: 'right' },

  // Log
  logCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  logTime: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  logAmount: { fontSize: FontSizes.sm, color: Colors.cosmicBlue, fontWeight: '600' },

  // Tips
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  tipEmoji: { fontSize: 22 },
  tipText: { flex: 1, fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
});
