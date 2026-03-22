import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '../theme/colors';

type MoodLevel = 1 | 2 | 3 | 4 | 5;

interface MoodEntry {
  id: string;
  date: string;
  level: MoodLevel;
  notes: string;
  timestamp: string;
}

const MOOD_CONFIG: Record<
  MoodLevel,
  { emoji: string; label: string; color: string; gradientColors: string[] }
> = {
  1: {
    emoji: '😢',
    label: 'Awful',
    color: Colors.error,
    gradientColors: ['rgba(248, 113, 113, 0.3)', 'rgba(248, 113, 113, 0.05)'],
  },
  2: {
    emoji: '😞',
    label: 'Bad',
    color: Colors.sunriseOrange,
    gradientColors: ['rgba(251, 146, 60, 0.3)', 'rgba(251, 146, 60, 0.05)'],
  },
  3: {
    emoji: '😐',
    label: 'Okay',
    color: Colors.sacredGold,
    gradientColors: ['rgba(251, 191, 36, 0.3)', 'rgba(251, 191, 36, 0.05)'],
  },
  4: {
    emoji: '😊',
    label: 'Good',
    color: Colors.cosmicBlue,
    gradientColors: ['rgba(96, 165, 250, 0.3)', 'rgba(96, 165, 250, 0.05)'],
  },
  5: {
    emoji: '😄',
    label: 'Amazing',
    color: Colors.sageLeaf,
    gradientColors: ['rgba(52, 211, 153, 0.3)', 'rgba(52, 211, 153, 0.05)'],
  },
};

const MOOD_PROMPTS: string[] = [
  'How are you feeling today?',
  'What made you smile today?',
  'What are you grateful for?',
  'What challenged you today?',
  'How did you take care of yourself today?',
];

const RECENT_ENTRIES: MoodEntry[] = [
  { id: '1', date: 'Today', level: 4, notes: 'Had a great yoga session!', timestamp: '9:30 AM' },
  { id: '2', date: 'Yesterday', level: 3, notes: 'Bit stressed with work.', timestamp: '8:15 PM' },
  { id: '3', date: '2 days ago', level: 5, notes: 'Best day ever! Hit my step goal.', timestamp: '7:00 PM' },
  { id: '4', date: '3 days ago', level: 2, notes: "Didn't sleep well.", timestamp: '9:00 PM' },
  { id: '5', date: '4 days ago', level: 4, notes: 'Good meditation session.', timestamp: '6:45 PM' },
  { id: '6', date: '5 days ago', level: 5, notes: 'Went for a long hike!', timestamp: '8:00 PM' },
  { id: '7', date: '6 days ago', level: 3, notes: '', timestamp: '10:00 PM' },
];

export default function MoodScreen() {
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodLevel>(4);
  const [notes, setNotes] = useState('');
  const [entries, setEntries] = useState<MoodEntry[]>(RECENT_ENTRIES);
  const [randomPromptIndex] = useState(
    Math.floor(Math.random() * MOOD_PROMPTS.length)
  );

  const todayEntry = entries.find((e) => e.date === 'Today');
  const avgMood =
    entries.reduce((sum, e) => sum + e.level, 0) / entries.length;

  const weekTrend = entries
    .slice(0, 7)
    .map((e) => ({ label: e.date.replace(' days ago', 'd').replace('Yesterday', 'Y').replace('Today', 'T'), level: e.level }))
    .reverse();

  const handleSaveEntry = () => {
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: 'Today',
      level: selectedMood,
      notes: notes.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setEntries((prev) => {
      const withoutToday = prev.filter((e) => e.date !== 'Today');
      return [newEntry, ...withoutToday];
    });
    setNotes('');
    setLogModalVisible(false);
  };

  const MoodSelector = () => (
    <View style={styles.moodSelectorRow}>
      {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => {
        const cfg = MOOD_CONFIG[level];
        const isSelected = selectedMood === level;
        return (
          <TouchableOpacity
            key={level}
            style={[
              styles.moodOption,
              isSelected && { backgroundColor: cfg.color, borderColor: cfg.color },
            ]}
            onPress={() => setSelectedMood(level)}
            accessibilityLabel={`Mood: ${cfg.label}`}
          >
            <Text style={styles.moodOptionEmoji}>{cfg.emoji}</Text>
            <Text
              style={[
                styles.moodOptionLabel,
                isSelected && { color: Colors.textPrimary },
              ]}
            >
              {cfg.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const MoodEntryCard = ({ entry }: { entry: MoodEntry }) => {
    const cfg = MOOD_CONFIG[entry.level];
    return (
      <LinearGradient
        colors={cfg.gradientColors as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.entryCard, { borderColor: cfg.color + '40' }]}
      >
        <View style={styles.entryHeader}>
          <View style={styles.entryLeft}>
            <Text style={styles.entryEmoji}>{cfg.emoji}</Text>
            <View>
              <Text style={styles.entryDate}>{entry.date}</Text>
              <Text style={styles.entryTimestamp}>{entry.timestamp}</Text>
            </View>
          </View>
          <View style={[styles.entryBadge, { backgroundColor: cfg.color }]}>
            <Text style={styles.entryBadgeText}>{cfg.label}</Text>
          </View>
        </View>
        {entry.notes ? (
          <Text style={styles.entryNotes}>💬 {entry.notes}</Text>
        ) : null}
      </LinearGradient>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={Gradients.cosmic}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mood Journal</Text>
          <Text style={styles.subtitle}>Check in with yourself daily.</Text>
        </View>

        {/* Today's Check-In Card */}
        <LinearGradient
          colors={
            todayEntry
              ? (MOOD_CONFIG[todayEntry.level].gradientColors as [string, string])
              : Gradients.cardPrimary
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.checkinCard, { borderColor: Colors.glassBorder }]}
        >
          {todayEntry ? (
            <>
              <View style={styles.checkinHeader}>
                <Text style={styles.checkinEmoji}>
                  {MOOD_CONFIG[todayEntry.level].emoji}
                </Text>
                <View>
                  <Text style={styles.checkinTitle}>Today's Mood</Text>
                  <Text
                    style={[
                      styles.checkinMoodLabel,
                      { color: MOOD_CONFIG[todayEntry.level].color },
                    ]}
                  >
                    {MOOD_CONFIG[todayEntry.level].label}
                  </Text>
                </View>
              </View>
              {todayEntry.notes ? (
                <Text style={styles.checkinNotes}>"{todayEntry.notes}"</Text>
              ) : null}
            </>
          ) : (
            <>
              <Text style={styles.checkinPrompt}>
                {MOOD_PROMPTS[randomPromptIndex]}
              </Text>
              <Text style={styles.checkinHint}>Tap below to log your mood</Text>
            </>
          )}
          <TouchableOpacity
            style={styles.checkinButton}
            onPress={() => setLogModalVisible(true)}
            accessibilityLabel={todayEntry ? 'Edit mood entry' : 'Log mood'}
          >
            <LinearGradient
              colors={Gradients.aurora}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.checkinButtonGradient}
            >
              <Text style={styles.checkinButtonText}>
                {todayEntry ? '✏️ Update Mood' : '+ Log Mood'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* Weekly Stats */}
        <View style={styles.statsRow}>
          <LinearGradient
            colors={Gradients.cardPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.statCard, { borderColor: Colors.glassBorder }]}
          >
            <Text style={styles.statIcon}>📈</Text>
            <Text style={styles.statValue}>{avgMood.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg Mood</Text>
          </LinearGradient>
          <LinearGradient
            colors={Gradients.cardPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.statCard, { borderColor: Colors.glassBorder }]}
          >
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{entries.length}</Text>
            <Text style={styles.statLabel}>Days Logged</Text>
          </LinearGradient>
          <LinearGradient
            colors={Gradients.cardPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.statCard, { borderColor: Colors.glassBorder }]}
          >
            <Text style={styles.statIcon}>
              {MOOD_CONFIG[Math.max(1, Math.min(5, Math.round(avgMood))) as MoodLevel]?.emoji ?? '😐'}
            </Text>
            <Text style={styles.statValue}>
              {MOOD_CONFIG[Math.max(1, Math.min(5, Math.round(avgMood))) as MoodLevel]?.label ?? 'Okay'}
            </Text>
            <Text style={styles.statLabel}>Overall</Text>
          </LinearGradient>
        </View>

        {/* Mood Trend Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7-Day Trend</Text>
          <LinearGradient
            colors={Gradients.cardSecondary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.trendChart, { borderColor: Colors.glassBorder }]}
          >
            {weekTrend.map((point, idx) => {
              const cfg = MOOD_CONFIG[point.level as MoodLevel];
              return (
                <View key={idx} style={styles.trendPoint}>
                  <Text style={styles.trendEmoji}>{cfg.emoji}</Text>
                  <View style={styles.trendBarContainer}>
                    <View
                      style={[
                        styles.trendBar,
                        {
                          height: point.level * 14,
                          backgroundColor: cfg.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.trendLabel}>{point.label}</Text>
                </View>
              );
            })}
          </LinearGradient>
        </View>

        {/* Mood History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood History</Text>
          {entries.map((entry) => (
            <MoodEntryCard key={entry.id} entry={entry} />
          ))}
        </View>
      </ScrollView>

      {/* Log Mood Modal */}
      <Modal
        visible={logModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLogModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <LinearGradient
            colors={['#1A1730', '#2D2554']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.modalContent, { borderColor: Colors.glassBorder }]}
          >
            <Text style={styles.modalTitle}>How are you feeling?</Text>
            <MoodSelector />

            <Text style={styles.inputLabel}>
              {MOOD_PROMPTS[randomPromptIndex]} (optional)
            </Text>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Write something…"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              accessibilityLabel="Mood notes input"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setLogModalVisible(false)}
                accessibilityLabel="Cancel"
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveEntry}
                accessibilityLabel="Save mood entry"
              >
                <LinearGradient
                  colors={Gradients.aurora}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalSaveGradient}
                >
                  <Text style={styles.modalSaveText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  checkinCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.glassBackground,
    ...Shadows.card,
  },
  checkinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  checkinEmoji: {
    fontSize: 48,
  },
  checkinTitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  checkinMoodLabel: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
  checkinNotes: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  checkinPrompt: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    lineHeight: 24,
  },
  checkinHint: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  checkinButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  checkinButtonGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkinButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.glassBackground,
    ...Shadows.card,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  trendChart: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: Colors.glassBackground,
    ...Shadows.card,
  },
  trendPoint: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  trendEmoji: {
    fontSize: 16,
  },
  trendBarContainer: {
    height: 70,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  trendBar: {
    width: 12,
    borderRadius: BorderRadius.sm,
  },
  trendLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  entryCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.glassBackground,
    ...Shadows.card,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  entryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  entryEmoji: {
    fontSize: 28,
  },
  entryDate: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  entryTimestamp: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  entryBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  entryBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  entryNotes: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  modalTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  moodSelectorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  moodOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.card,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  moodOptionEmoji: {
    fontSize: 22,
  },
  moodOptionLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.md,
  },
  notesInput: {
    height: 90,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  modalCancelText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalSaveButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  modalSaveGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
