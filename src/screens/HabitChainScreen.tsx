/**
 * @file HabitChainScreen.tsx
 * @module screens/HabitChainScreen
 * @description Habit chain (habit stacking) screen — lets users build and
 * track chains of daily micro-habits with streak visualisation.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from '../utils/haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  FontSizes,
} from '../theme/colors';
import AnimatedEntry from '../components/AnimatedEntry';
import SectionHeader from '../components/SectionHeader';
import { useCelebration } from '../components/CelebrationOverlay';
import BottomSheet, { useBottomSheet } from '../components/BottomSheet';

const STORAGE_KEY = 'zenfit:habits';

interface Habit {
  id: string;
  name: string;
  emoji: string;
  completions: string[]; // ISO date strings
  streak: number;
  createdAt: string;
}

const DEFAULT_HABITS: Omit<Habit, 'completions' | 'streak' | 'createdAt'>[] = [
  { id: 'stretch', name: 'Morning Stretch', emoji: '🤸' },
  { id: 'meditate', name: 'Meditate 5 min', emoji: '🧘' },
  { id: 'water', name: 'Drink 8 glasses', emoji: '💧' },
  { id: 'walk', name: 'Walk 10 min', emoji: '🚶' },
  { id: 'journal', name: 'Journal entry', emoji: '📝' },
  { id: 'screen', name: 'No screens 1hr', emoji: '📵' },
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function last14Days() {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });
}

function calcStreak(completions: string[]): number {
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (completions.includes(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function HabitCell({ filled, isToday }: { filled: boolean; isToday: boolean }) {
  return (
    <View
      style={[
        styles.cell,
        filled && styles.cellFilled,
        isToday && styles.cellToday,
      ]}
    />
  );
}

function HabitRow({ habit, onToggle }: { habit: Habit; onToggle: (id: string) => void }) {
  const scale = useSharedValue(1);
  const days = last14Days();
  const today = todayKey();
  const isDoneToday = habit.completions.includes(today);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(withTiming(0.92, { duration: 80 }), withSpring(1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle(habit.id);
  };

  return (
    <Animated.View style={[animStyle]}>
      <LinearGradient colors={Gradients.cardSecondary} style={styles.habitRow}>
        <TouchableOpacity style={styles.habitLeft} onPress={handlePress} activeOpacity={0.8}>
          <Text style={styles.habitEmoji}>{habit.emoji}</Text>
          <View>
            <Text style={styles.habitName}>{habit.name}</Text>
            <Text style={styles.habitStreak}>
              {habit.streak > 0 ? `🔥 ${habit.streak} day streak` : 'Start your streak!'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.habitGrid}>
          {days.map((day) => (
            <HabitCell
              key={day}
              filled={habit.completions.includes(day)}
              isToday={day === today}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.checkBtn, isDoneToday && styles.checkBtnDone]}
          onPress={handlePress}
          accessibilityLabel={isDoneToday ? 'Mark incomplete' : 'Mark complete'}
        >
          <Text style={styles.checkBtnText}>{isDoneToday ? '✓' : '+'}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

export default function HabitChainScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('⭐');
  const { celebrate, overlay } = useCelebration();
  const sheet = useBottomSheet();

  useEffect(() => { loadHabits(); }, []);

  const loadHabits = async () => {
    setIsLoading(true);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setHabits(JSON.parse(raw));
      } else {
        // Seed defaults
        const defaults: Habit[] = DEFAULT_HABITS.map((h) => ({
          ...h,
          completions: [],
          streak: 0,
          createdAt: todayKey(),
        }));
        setHabits(defaults);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      }
    } catch {}
    setIsLoading(false);
  };

  const saveHabits = async (updated: Habit[]) => {
    setHabits(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const toggleHabit = useCallback(async (id: string) => {
    const today = todayKey();
    const updated = habits.map((h) => {
      if (h.id !== id) return h;
      const done = h.completions.includes(today);
      const completions = done
        ? h.completions.filter((d) => d !== today)
        : [...h.completions, today];
      const streak = calcStreak(completions);
      return { ...h, completions, streak };
    });
    saveHabits(updated);

    const habit = updated.find((h) => h.id === id);
    const isDoneNow = habit?.completions.includes(today);
    if (isDoneNow) {
      // Check if all habits done today
      const allDone = updated.every((h) => h.completions.includes(today));
      if (allDone) {
        celebrate('🏆 All Habits Done!', 'Perfect day achieved!');
      }
    }
  }, [habits, celebrate]);

  const addHabit = async () => {
    if (!newName.trim()) {
      Alert.alert('Name required', 'Enter a name for your habit.');
      return;
    }
    const habit: Habit = {
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      emoji: newEmoji,
      completions: [],
      streak: 0,
      createdAt: todayKey(),
    };
    await saveHabits([...habits, habit]);
    sheet.close();
    setNewName('');
    setNewEmoji('⭐');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteHabit = (id: string) => {
    Alert.alert('Delete Habit', 'Remove this habit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => saveHabits(habits.filter((h) => h.id !== id)),
      },
    ]);
  };

  const today = todayKey();
  const completedToday = habits.filter((h) => h.completions.includes(today)).length;
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  const EMOJI_OPTIONS = ['⭐', '💪', '🧠', '❤️', '🎯', '🌱', '🏃', '📖', '🎨', '🍎', '☀️', '🌙'];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={Gradients.cosmic} style={StyleSheet.absoluteFill} />
      {overlay}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <AnimatedEntry delay={0}>
          <View style={styles.header}>
            <Text style={styles.title}>🔗 Daily Rituals</Text>
            <Text style={styles.subtitle}>Build lasting habits, one day at a time</Text>
          </View>
        </AnimatedEntry>

        {/* Progress ring summary */}
        <AnimatedEntry delay={100}>
          <LinearGradient colors={Gradients.cardPrimary} style={styles.summaryCard}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryBig}>{completedToday}/{totalHabits}</Text>
              <Text style={styles.summaryLabel}>Completed Today</Text>
            </View>
            <View style={styles.summaryRight}>
              <View style={styles.progressRing}>
                <Text style={styles.progressPct}>{completionRate}%</Text>
              </View>
              <Text style={styles.progressLabel}>{completionRate === 100 ? '🏆 Perfect!' : 'Keep going!'}</Text>
            </View>
          </LinearGradient>
        </AnimatedEntry>

        {/* Legend */}
        <AnimatedEntry delay={150}>
          <View style={styles.legendRow}>
            <View style={[styles.legendCell, styles.cellFilled]} />
            <Text style={styles.legendText}>Completed  </Text>
            <View style={[styles.legendCell, styles.cellToday]} />
            <Text style={styles.legendText}>Today  </Text>
            <View style={styles.legendCell} />
            <Text style={styles.legendText}>Missed</Text>
          </View>
          <Text style={styles.legendDays}>← 14 days ago &nbsp;&nbsp;&nbsp;&nbsp; Today →</Text>
        </AnimatedEntry>

        {/* Habits */}
        <AnimatedEntry delay={200}>
          <View style={styles.sectionRow}>
            <SectionHeader title="Your Habits" style={{ flex: 1 }} />
            <TouchableOpacity
              style={styles.addBtn}
              onPress={sheet.open}
            >
              <LinearGradient colors={Gradients.aurora} style={styles.addBtnGradient}>
                <Text style={styles.addBtnText}>+ Add</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              onToggle={toggleHabit}
            />
          ))}
        </AnimatedEntry>
      </ScrollView>

      {/* Add Habit Bottom Sheet */}
      <BottomSheet ref={sheet.ref} snapHeight={420} onClose={() => { setNewName(''); setNewEmoji('⭐'); }}>
        <Text style={styles.modalTitle}>New Habit</Text>

        <Text style={styles.inputLabel}>Choose Emoji</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScroll}>
          {EMOJI_OPTIONS.map((e) => (
            <TouchableOpacity
              key={e}
              style={[styles.emojiOption, newEmoji === e && styles.emojiOptionActive]}
              onPress={() => setNewEmoji(e)}
            >
              <Text style={styles.emojiOptionText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.inputLabel}>Habit Name</Text>
        <TextInput
          style={styles.input}
          value={newName}
          onChangeText={setNewName}
          placeholder="e.g. Read 20 pages"
          placeholderTextColor={Colors.textMuted}
          maxLength={40}
        />

        <View style={styles.modalBtns}>
          <TouchableOpacity style={styles.cancelBtn} onPress={sheet.close}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={addHabit}>
            <LinearGradient colors={Gradients.aurora} style={styles.saveBtnGradient}>
              <Text style={styles.saveBtnText}>Add Habit</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const CELL_SIZE = 14;
const CELL_GAP = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },

  header: { paddingTop: Spacing.lg, marginBottom: Spacing.md },
  title: { fontSize: FontSizes.xxxl, fontWeight: '900', color: Colors.textPrimary },
  subtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4 },

  summaryCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  summaryLeft: {},
  summaryBig: { fontSize: 40, fontWeight: '900', color: Colors.textPrimary },
  summaryLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  summaryRight: { alignItems: 'center' },
  progressRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: Colors.violet,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  progressPct: { fontSize: FontSizes.md, fontWeight: '800', color: Colors.textPrimary },
  progressLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary },

  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 4,
  },
  legendCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 3,
    backgroundColor: Colors.glassBorder,
  },
  legendText: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  legendDays: { fontSize: 10, color: Colors.textMuted, marginBottom: Spacing.md },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  addBtn: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  addBtnGradient: { paddingVertical: 6, paddingHorizontal: Spacing.md },
  addBtnText: { color: Colors.textPrimary, fontWeight: '800', fontSize: FontSizes.sm },

  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: Spacing.sm,
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
    minWidth: 0,
  },
  habitEmoji: { fontSize: 22 },
  habitName: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  habitStreak: { fontSize: 10, color: Colors.textSecondary },

  habitGrid: {
    flexDirection: 'row',
    gap: CELL_GAP,
    flexWrap: 'nowrap',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cellFilled: { backgroundColor: Colors.violet },
  cellToday: { borderWidth: 1.5, borderColor: Colors.violet },

  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnDone: { backgroundColor: Colors.sageLeaf },
  checkBtnText: { fontSize: 16, color: Colors.textPrimary, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: {
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  emojiScroll: { marginBottom: Spacing.lg },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  emojiOptionActive: { backgroundColor: Colors.violet },
  emojiOptionText: { fontSize: 22 },
  input: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.xl,
  },
  modalBtns: { flexDirection: 'row', gap: Spacing.md },
  cancelBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
  },
  cancelText: { color: Colors.textSecondary, fontWeight: '600' },
  saveBtn: { flex: 2, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  saveBtnGradient: { padding: Spacing.md, alignItems: 'center' },
  saveBtnText: { color: Colors.textPrimary, fontWeight: '800', fontSize: FontSizes.md },
});
