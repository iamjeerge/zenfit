/**
 * @file ActiveWorkoutScreen.tsx
 * @module screens/ActiveWorkoutScreen
 * @description Active workout session screen — provides a real-time timer,
 * set-by-set logging, and rest-period countdowns during an in-progress workout.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Vibration,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolateColor,
  useAnimatedProps,
} from 'react-native-reanimated';
import * as Haptics from '../utils/haptics';
import { useRouter, useLocalSearchParams } from '../utils/router';
import {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '../theme/colors';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useCelebration } from '../components/CelebrationOverlay';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMER_SIZE = SCREEN_WIDTH * 0.55;
const STROKE_WIDTH = 10;
const RADIUS = (TIMER_SIZE - STROKE_WIDTH * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weightKg: number;
}

type Phase = 'exercise' | 'rest' | 'done';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ exercises: string }>();
  const user = useAuthStore((s) => s.user);
  const { celebrate, overlay: celebrationOverlay } = useCelebration();

  const exercises: Exercise[] = React.useMemo(() => {
    try {
      return JSON.parse(params.exercises ?? '[]');
    } catch {
      return [];
    }
  }, [params.exercises]);

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0); // 0-based current set
  const [phase, setPhase] = useState<Phase>('exercise');
  const [restSecondsLeft, setRestSecondsLeft] = useState(60);
  const restDuration = 60;

  // Elapsed workout timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const workoutStartRef = useRef(Date.now());
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Rest countdown interval
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation values
  const pulseScale = useSharedValue(1);
  const progressValue = useSharedValue(0);
  const completedSets = useSharedValue(0);

  const currentExercise = exercises[exerciseIndex];
  const totalSets = currentExercise?.sets ?? 0;
  const isLastSet = setIndex >= totalSets - 1;
  const isLastExercise = exerciseIndex >= exercises.length - 1;

  // Elapsed timer
  useEffect(() => {
    elapsedIntervalRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - workoutStartRef.current) / 1000));
    }, 1000);
    return () => {
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    };
  }, []);

  // Rest countdown
  useEffect(() => {
    if (phase !== 'rest') {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      progressValue.value = withTiming(0, { duration: 300 });
      return;
    }

    setRestSecondsLeft(restDuration);
    progressValue.value = 1;
    progressValue.value = withTiming(0, {
      duration: restDuration * 1000,
      easing: Easing.linear,
    });

    restIntervalRef.current = setInterval(() => {
      setRestSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(restIntervalRef.current!);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Vibration.vibrate([0, 200, 100, 200]);
          advanceAfterRest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [phase]);

  // Pulse animation when in exercise phase
  useEffect(() => {
    if (phase === 'exercise') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 900, easing: Easing.inOut(Easing.sine) }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sine) })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [phase]);

  const advanceAfterRest = useCallback(() => {
    setPhase('exercise');
  }, []);

  const handleSetDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isLastSet && isLastExercise) {
      // All done
      finishWorkout();
      return;
    }

    if (isLastSet) {
      // Move to next exercise
      setExerciseIndex((i) => i + 1);
      setSetIndex(0);
      setPhase('rest');
    } else {
      // Next set, rest first
      setSetIndex((s) => s + 1);
      setPhase('rest');
    }
  };

  const handleSkipRest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    advanceAfterRest();
  };

  const finishWorkout = async () => {
    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    if (user) {
      try {
        await supabase.from('workout_sessions').insert({
          user_id: user.id,
          exercises,
          duration_minutes: durationMinutes,
          notes: '',
          started_at: new Date(workoutStartRef.current).toISOString(),
          completed_at: new Date().toISOString(),
        });
      } catch {
        // Silent — workout is still shown as done
      }
    }

    setPhase('done');
    celebrate('🏆', 'Workout Complete!', `${exercises.length} exercises crushed!`);
  };

  const handleFinishEarly = () => {
    Alert.alert('End Workout?', 'Your progress will be saved.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End', style: 'destructive', onPress: finishWorkout },
    ]);
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const strokeDashoffsetStyle = useAnimatedStyle(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progressValue.value),
  })) as any;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Done screen
  if (phase === 'done') {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={Gradients.cosmic} style={StyleSheet.absoluteFill} />
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>🏆</Text>
          <Text style={styles.doneTitle}>Workout Complete!</Text>
          <Text style={styles.doneSub}>
            {exercises.length} exercises · {formatTime(elapsedSeconds)}
          </Text>

          <LinearGradient
            colors={Gradients.cardPrimary}
            style={styles.doneStats}
          >
            {[
              { label: 'Total Sets', value: exercises.reduce((s, e) => s + e.sets, 0).toString(), icon: '🎯' },
              { label: 'Duration', value: formatTime(elapsedSeconds), icon: '⏱️' },
              {
                label: 'Volume',
                value: `${exercises.reduce((s, e) => s + (e.weightKg > 0 ? e.sets * e.reps * e.weightKg : 0), 0).toLocaleString()} kg`,
                icon: '🔥',
              },
            ].map((stat) => (
              <View key={stat.label} style={styles.doneStat}>
                <Text style={styles.doneStatIcon}>{stat.icon}</Text>
                <Text style={styles.doneStatValue}>{stat.value}</Text>
                <Text style={styles.doneStatLabel}>{stat.label}</Text>
              </View>
            ))}
          </LinearGradient>

          <TouchableOpacity onPress={() => router.back()} style={styles.doneBtn}>
            <LinearGradient colors={Gradients.aurora} style={styles.doneBtnGradient}>
              <Text style={styles.doneBtnText}>Back to Workouts</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        {celebrationOverlay}
      </SafeAreaView>
    );
  }

  if (!currentExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={Gradients.cosmic} style={StyleSheet.absoluteFill} />
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>❌</Text>
          <Text style={styles.doneTitle}>No exercises loaded</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.doneBtn}>
            <LinearGradient colors={Gradients.aurora} style={styles.doneBtnGradient}>
              <Text style={styles.doneBtnText}>Go Back</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={Gradients.cosmic} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleFinishEarly} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕ End</Text>
        </TouchableOpacity>
        <View style={styles.elapsedBadge}>
          <Text style={styles.elapsedText}>⏱ {formatTime(elapsedSeconds)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Progress bar: exercises */}
        <View style={styles.exerciseProgressContainer}>
          {exercises.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.exerciseProgressDot,
                idx < exerciseIndex && styles.exerciseProgressDotDone,
                idx === exerciseIndex && styles.exerciseProgressDotActive,
              ]}
            />
          ))}
        </View>

        {/* Exercise name */}
        <Text style={styles.exerciseLabel}>
          Exercise {exerciseIndex + 1} of {exercises.length}
        </Text>
        <Text style={styles.exerciseName}>{currentExercise.name}</Text>
        {currentExercise.weightKg > 0 && (
          <Text style={styles.exerciseWeight}>{currentExercise.weightKg} kg</Text>
        )}

        {/* Main timer circle */}
        {phase === 'rest' ? (
          <View style={styles.timerContainer}>
            {/* SVG-like timer ring using View trick */}
            <View style={[styles.timerRing, { width: TIMER_SIZE, height: TIMER_SIZE, borderRadius: TIMER_SIZE / 2 }]}>
              <View style={styles.timerInner}>
                <Text style={styles.timerPhaseLabel}>REST</Text>
                <Text style={styles.timerCountdown}>{restSecondsLeft}</Text>
                <Text style={styles.timerUnit}>sec</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.skipRestBtn} onPress={handleSkipRest}>
              <Text style={styles.skipRestText}>Skip Rest →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View style={[styles.timerContainer, pulseStyle]}>
            <LinearGradient
              colors={Gradients.cardPrimary}
              style={[styles.exerciseCircle, { width: TIMER_SIZE, height: TIMER_SIZE, borderRadius: TIMER_SIZE / 2 }]}
            >
              <Text style={styles.setLabel}>SET</Text>
              <Text style={styles.setNumber}>{setIndex + 1}</Text>
              <Text style={styles.setOf}>of {totalSets}</Text>
              <Text style={styles.repsLabel}>{currentExercise.reps} reps</Text>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Set dots */}
        <View style={styles.setDotsRow}>
          {Array.from({ length: totalSets }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.setDot,
                i < setIndex && styles.setDotDone,
                i === setIndex && styles.setDotActive,
              ]}
            />
          ))}
        </View>

        {/* Action button */}
        {phase === 'exercise' && (
          <TouchableOpacity
            style={styles.doneSetBtn}
            onPress={handleSetDone}
            accessibilityLabel={isLastSet && isLastExercise ? 'Finish workout' : 'Set complete'}
          >
            <LinearGradient
              colors={isLastSet && isLastExercise ? Gradients.sunrise : Gradients.aurora}
              style={styles.doneSetBtnGradient}
            >
              <Text style={styles.doneSetBtnText}>
                {isLastSet && isLastExercise ? '🏆 Finish Workout' : '✅ Set Complete'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Up next */}
        {!isLastExercise && exerciseIndex < exercises.length - 1 && (
          <View style={styles.upNext}>
            <Text style={styles.upNextLabel}>Up Next</Text>
            <Text style={styles.upNextName}>{exercises[exerciseIndex + 1].name}</Text>
            <Text style={styles.upNextMeta}>
              {exercises[exerciseIndex + 1].sets} sets × {exercises[exerciseIndex + 1].reps} reps
            </Text>
          </View>
        )}

        {/* Remaining exercises */}
        {exercises.length > 1 && (
          <View style={styles.remainingList}>
            <Text style={styles.remainingTitle}>All Exercises</Text>
            {exercises.map((ex, idx) => (
              <View
                key={ex.id}
                style={[
                  styles.remainingItem,
                  idx === exerciseIndex && styles.remainingItemActive,
                  idx < exerciseIndex && styles.remainingItemDone,
                ]}
              >
                <Text style={styles.remainingItemText}>
                  {idx < exerciseIndex ? '✅' : idx === exerciseIndex ? '▶️' : '⬜'}{' '}
                  {ex.name} — {ex.sets}×{ex.reps}
                  {ex.weightKg > 0 ? ` @ ${ex.weightKg}kg` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  closeBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: 'rgba(248,113,113,0.2)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
  },
  closeBtnText: { color: Colors.error, fontSize: FontSizes.sm, fontWeight: '600' },
  elapsedBadge: {
    backgroundColor: 'rgba(124,58,237,0.25)',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  elapsedText: { color: Colors.lavender, fontSize: FontSizes.sm, fontWeight: '700' },

  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, alignItems: 'center' },

  exerciseProgressContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  exerciseProgressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  exerciseProgressDotDone: { backgroundColor: Colors.sageLeaf, borderColor: Colors.sageLeaf },
  exerciseProgressDotActive: { width: 24, backgroundColor: Colors.violet, borderColor: Colors.violet },

  exerciseLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  exerciseName: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  exerciseWeight: {
    fontSize: FontSizes.md,
    color: Colors.sacredGold,
    fontWeight: '600',
    marginBottom: Spacing.xl,
  },

  timerContainer: { alignItems: 'center', marginVertical: Spacing.xl },

  // Rest timer ring
  timerRing: {
    borderWidth: STROKE_WIDTH,
    borderColor: Colors.violet,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(124,58,237,0.12)',
    ...Shadows.glow,
  },
  timerInner: { alignItems: 'center' },
  timerPhaseLabel: {
    fontSize: FontSizes.sm,
    color: Colors.lavender,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  timerCountdown: { fontSize: 72, fontWeight: '900', color: Colors.textPrimary, lineHeight: 80 },
  timerUnit: { fontSize: FontSizes.md, color: Colors.textSecondary, fontWeight: '600' },

  skipRestBtn: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    backgroundColor: 'rgba(196,181,253,0.15)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  skipRestText: { color: Colors.lavender, fontSize: FontSizes.md, fontWeight: '600' },

  // Exercise circle
  exerciseCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: STROKE_WIDTH,
    borderColor: Colors.violet,
    ...Shadows.glow,
  },
  setLabel: {
    fontSize: FontSizes.sm,
    color: Colors.lavender,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  setNumber: { fontSize: 72, fontWeight: '900', color: Colors.textPrimary, lineHeight: 80 },
  setOf: { fontSize: FontSizes.md, color: Colors.textSecondary, fontWeight: '600' },
  repsLabel: {
    fontSize: FontSizes.lg,
    color: Colors.sacredGold,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },

  setDotsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  setDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.glassBorder,
  },
  setDotDone: { backgroundColor: Colors.sageLeaf, borderColor: Colors.sageLeaf },
  setDotActive: { backgroundColor: Colors.violet, borderColor: Colors.violetLight },

  doneSetBtn: { width: '100%', borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadows.card },
  doneSetBtnGradient: { paddingVertical: 18, alignItems: 'center', borderRadius: BorderRadius.xl },
  doneSetBtnText: { color: Colors.textPrimary, fontSize: FontSizes.lg, fontWeight: '800' },

  upNext: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(196,181,253,0.08)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    width: '100%',
  },
  upNextLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  upNextName: { fontSize: FontSizes.lg, color: Colors.textPrimary, fontWeight: '700' },
  upNextMeta: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },

  remainingList: { marginTop: Spacing.xl, width: '100%', gap: Spacing.xs },
  remainingTitle: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  remainingItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  remainingItemActive: { borderColor: Colors.violet, backgroundColor: 'rgba(124,58,237,0.15)' },
  remainingItemDone: { opacity: 0.5 },
  remainingItemText: { color: Colors.textPrimary, fontSize: FontSizes.sm },

  // Done screen
  doneContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  doneEmoji: { fontSize: 72, marginBottom: Spacing.lg },
  doneTitle: { fontSize: FontSizes.xxxl, fontWeight: '900', color: Colors.textPrimary, marginBottom: Spacing.sm },
  doneSub: { fontSize: FontSizes.md, color: Colors.textSecondary, marginBottom: Spacing.xl },
  doneStats: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.xl,
    width: '100%',
    justifyContent: 'space-around',
  },
  doneStat: { alignItems: 'center' },
  doneStatIcon: { fontSize: 24, marginBottom: Spacing.xs },
  doneStatValue: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.textPrimary },
  doneStatLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  doneBtn: { width: '100%', borderRadius: BorderRadius.xl, overflow: 'hidden' },
  doneBtnGradient: { paddingVertical: 18, alignItems: 'center' },
  doneBtnText: { color: Colors.textPrimary, fontSize: FontSizes.lg, fontWeight: '800' },
});
