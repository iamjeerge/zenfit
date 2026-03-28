/**
 * @file GratitudeJournalScreen.tsx
 * @module screens/GratitudeJournalScreen
 * @description Gratitude journal screen — daily journaling prompts to support
 * mental wellness alongside physical fitness tracking.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
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
import AnimatedEmptyState from '../components/AnimatedEmptyState';

const STORAGE_KEY = 'zenfit:gratitude_journal';

const PROMPTS = [
  'What are 3 things you are grateful for today?',
  'Describe one small win from today.',
  'Who made you smile today, and why?',
  'What challenged you today, and what did you learn?',
  'What is one thing you did well today?',
  'What are you looking forward to tomorrow?',
  'Describe a moment of peace or joy you experienced today.',
];

interface JournalEntry {
  id: string;
  date: string; // ISO
  gratitude: string;
  reflection: string;
  mood: number; // 1-5
  prompt: string;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

const MOOD_EMOJIS = ['😔', '😕', '😐', '🙂', '😄'];

export default function GratitudeJournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);
  const [gratitudeText, setGratitudeText] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [selectedMood, setSelectedMood] = useState(3);
  const [todayPrompt] = useState(PROMPTS[new Date().getDay() % PROMPTS.length]);

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
    setIsLoading(false);
  };

  const hasTodayEntry = entries.some((e) => e.date === todayKey());

  const handleSave = async () => {
    if (!gratitudeText.trim() && !reflectionText.trim()) {
      Alert.alert('Empty Entry', 'Write something before saving.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const entry: JournalEntry = {
      id: `${Date.now()}`,
      date: todayKey(),
      gratitude: gratitudeText.trim(),
      reflection: reflectionText.trim(),
      mood: selectedMood,
      prompt: todayPrompt,
    };

    const updated = [entry, ...entries.filter((e) => e.date !== todayKey())];
    setEntries(updated);
    setGratitudeText('');
    setReflectionText('');
    setSelectedMood(3);
    setIsWriting(false);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Entry', 'Remove this journal entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = entries.filter((e) => e.id !== id);
          setEntries(updated);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        },
      },
    ]);
  };

  // Weekly streak: count consecutive days with entries
  const streak = (() => {
    let s = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (entries.some((e) => e.date === key)) {
        s++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return s;
  })();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={Gradients.cosmic} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <AnimatedEntry delay={0}>
            <View style={styles.header}>
              <Text style={styles.title}>📝 Gratitude Journal</Text>
              <Text style={styles.subtitle}>Reflect daily, grow consistently</Text>
              <View style={styles.streakBadge}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakText}>{streak} day streak</Text>
              </View>
            </View>
          </AnimatedEntry>

          {/* Today's writing area */}
          {isWriting ? (
            <AnimatedEntry delay={0}>
              <LinearGradient colors={Gradients.cardPrimary} style={styles.writingCard}>
                <Text style={styles.promptText}>"{todayPrompt}"</Text>

                {/* Mood picker */}
                <Text style={styles.fieldLabel}>How are you feeling?</Text>
                <View style={styles.moodRow}>
                  {MOOD_EMOJIS.map((emoji, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.moodBtn, selectedMood === i + 1 && styles.moodBtnActive]}
                      onPress={() => { setSelectedMood(i + 1); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    >
                      <Text style={styles.moodEmoji}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Gratitude */}
                <Text style={styles.fieldLabel}>🙏 Gratitude</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={4}
                  value={gratitudeText}
                  onChangeText={setGratitudeText}
                  placeholder="I am grateful for…"
                  placeholderTextColor={Colors.textMuted}
                  textAlignVertical="top"
                />

                {/* Reflection */}
                <Text style={styles.fieldLabel}>💭 Reflection</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={4}
                  value={reflectionText}
                  onChangeText={setReflectionText}
                  placeholder="Today I noticed…"
                  placeholderTextColor={Colors.textMuted}
                  textAlignVertical="top"
                />

                <View style={styles.writingBtns}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => { setIsWriting(false); setGratitudeText(''); setReflectionText(''); }}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <LinearGradient colors={Gradients.aurora} style={styles.saveBtnGradient}>
                      <Text style={styles.saveBtnText}>Save Entry</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </AnimatedEntry>
          ) : (
            <AnimatedEntry delay={100}>
              {hasTodayEntry ? (
                <LinearGradient colors={['rgba(52, 211, 153, 0.15)', 'rgba(52, 211, 153, 0.05)']} style={styles.todayDoneCard}>
                  <Text style={styles.todayDoneEmoji}>✅</Text>
                  <Text style={styles.todayDoneText}>Today's entry saved!</Text>
                  <Text style={styles.todayDoneHint}>Come back tomorrow to continue your streak.</Text>
                </LinearGradient>
              ) : (
                <TouchableOpacity onPress={() => setIsWriting(true)}>
                  <LinearGradient colors={Gradients.cardPrimary} style={styles.startCard}>
                    <Text style={styles.startPromptLabel}>TODAY'S PROMPT</Text>
                    <Text style={styles.startPrompt}>"{todayPrompt}"</Text>
                    <LinearGradient colors={Gradients.aurora} style={styles.startBtn}>
                      <Text style={styles.startBtnText}>✍️ Write Today's Entry</Text>
                    </LinearGradient>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </AnimatedEntry>
          )}

          {/* Past entries */}
          <SectionHeader
            title="Past Entries"
            subtitle={`${entries.length} total`}
            style={styles.sectionHeader}
          />

          {entries.length === 0 && !isLoading ? (
            <AnimatedEmptyState
              emoji="📝"
              title="Your journal awaits"
              subtitle="Write your first entry to start building a reflection practice."
            />
          ) : (
            entries.map((entry, idx) => (
              <AnimatedEntry key={entry.id} delay={idx * 60}>
                <LinearGradient colors={Gradients.cardSecondary} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <View>
                      <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                      <Text style={styles.entryMood}>
                        {MOOD_EMOJIS[entry.mood - 1]} {['Sad', 'Low', 'Okay', 'Good', 'Great'][entry.mood - 1]}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDelete(entry.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.deleteBtn}>🗑️</Text>
                    </TouchableOpacity>
                  </View>

                  {entry.gratitude ? (
                    <View style={styles.entrySection}>
                      <Text style={styles.entrySectionLabel}>🙏 Gratitude</Text>
                      <Text style={styles.entryText}>{entry.gratitude}</Text>
                    </View>
                  ) : null}

                  {entry.reflection ? (
                    <View style={styles.entrySection}>
                      <Text style={styles.entrySectionLabel}>💭 Reflection</Text>
                      <Text style={styles.entryText}>{entry.reflection}</Text>
                    </View>
                  ) : null}
                </LinearGradient>
              </AnimatedEntry>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },

  header: { paddingTop: Spacing.lg, marginBottom: Spacing.md },
  title: { fontSize: FontSizes.xxxl, fontWeight: '900', color: Colors.textPrimary },
  subtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.sm },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251,191,36,0.15)',
    borderRadius: BorderRadius.md,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
  },
  streakEmoji: { fontSize: 16 },
  streakText: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.sacredGold },

  writingCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.md,
  },
  promptText: {
    fontSize: FontSizes.md,
    color: Colors.violet,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  fieldLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  moodRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  moodBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.glassBorder,
  },
  moodBtnActive: { backgroundColor: Colors.violet },
  moodEmoji: { fontSize: 22 },
  textArea: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    minHeight: 100,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  writingBtns: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  cancelBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
  },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: '600' },
  saveBtn: { flex: 2, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  saveBtnGradient: { padding: Spacing.md, alignItems: 'center' },
  saveBtnText: { color: Colors.textPrimary, fontWeight: '800', fontSize: FontSizes.md },

  startCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.md,
  },
  startPromptLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: Colors.violet,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  startPrompt: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  startBtn: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  startBtnText: { color: Colors.textPrimary, fontWeight: '800', fontSize: FontSizes.md },

  todayDoneCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.25)',
    marginBottom: Spacing.md,
  },
  todayDoneEmoji: { fontSize: 40, marginBottom: Spacing.xs },
  todayDoneText: { fontSize: FontSizes.lg, fontWeight: '800', color: Colors.textPrimary },
  todayDoneHint: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },

  sectionHeader: { marginTop: Spacing.lg, marginBottom: Spacing.sm },

  entryCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  entryDate: { fontSize: FontSizes.md, fontWeight: '800', color: Colors.textPrimary },
  entryMood: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  deleteBtn: { fontSize: 18, opacity: 0.6 },
  entrySection: { marginBottom: Spacing.sm },
  entrySectionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  entryText: { fontSize: FontSizes.sm, color: Colors.textPrimary, lineHeight: 20 },
});
