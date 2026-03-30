/**
 * @file HRVStressScreen.tsx
 * @module screens/HRVStressScreen
 * @description Mood and stress tracking powered by Heart Rate Variability (HRV) data.
 * Correlates HRV readings with mood entries, displays stress trends, and provides
 * insights and breathing recommendations.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from '../utils/haptics';
import { Colors, Gradients, Spacing, BorderRadius, FontSizes, Shadows } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import AnimatedEntry from '../components/AnimatedEntry';
import SectionHeader from '../components/SectionHeader';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import StatCard from '../components/StatCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { useRouter } from '../utils/router';

/* ─── types ─── */
interface HRVReading {
  id: string;
  hrv_ms: number;
  resting_hr: number;
  stress_level: 'low' | 'moderate' | 'high' | 'very_high';
  source: string;
  recorded_at: string;
  note: string | null;
}

interface MoodCorrelation {
  date: string;
  hrv: number;
  mood: number;
  stress: string;
}

const STRESS_COLORS: Record<string, string> = {
  low: Colors.sageLeaf,
  moderate: Colors.sacredGold,
  high: '#FF8C42',
  very_high: Colors.rosePetal,
};

const STRESS_EMOJI: Record<string, string> = {
  low: '😌',
  moderate: '😐',
  high: '😰',
  very_high: '🔴',
};

const MOOD_OPTIONS = [
  { level: 1, emoji: '😢', label: 'Terrible' },
  { level: 2, emoji: '😞', label: 'Bad' },
  { level: 3, emoji: '😐', label: 'Okay' },
  { level: 4, emoji: '😊', label: 'Good' },
  { level: 5, emoji: '😄', label: 'Great' },
];

export default function HRVStressScreen() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const [readings, setReadings] = useState<HRVReading[]>([]);
  const [correlations, setCorrelations] = useState<MoodCorrelation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState(3);
  const [hrvInput, setHrvInput] = useState('');
  const [hrInput, setHrInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [todayStress, setTodayStress] = useState<string>('low');
  const [avgHRV, setAvgHRV] = useState(0);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

      const [hrvRes, moodRes] = await Promise.all([
        supabase
          .from('hrv_readings')
          .select('*')
          .eq('user_id', user!.id)
          .gte('recorded_at', sevenDaysAgo)
          .order('recorded_at', { ascending: false })
          .limit(50),
        supabase
          .from('mood_journal')
          .select('mood_level, date')
          .eq('user_id', user!.id)
          .gte('date', sevenDaysAgo)
          .order('date', { ascending: false }),
      ]);

      const hrvData = hrvRes.data || [];
      const moodData = moodRes.data || [];
      setReadings(hrvData);

      // Calculate averages
      if (hrvData.length > 0) {
        setAvgHRV(Math.round(hrvData.reduce((s, r) => s + r.hrv_ms, 0) / hrvData.length));
        setTodayStress(hrvData[0].stress_level);
      }

      // Build correlations
      const corr: MoodCorrelation[] = [];
      for (const mood of moodData) {
        const matchingHRV = hrvData.find((h) =>
          h.recorded_at.startsWith(mood.date),
        );
        if (matchingHRV) {
          corr.push({
            date: mood.date,
            hrv: matchingHRV.hrv_ms,
            mood: mood.mood_level,
            stress: matchingHRV.stress_level,
          });
        }
      }
      setCorrelations(corr);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const classifyStress = (hrv: number): 'low' | 'moderate' | 'high' | 'very_high' => {
    if (hrv >= 60) return 'low';
    if (hrv >= 40) return 'moderate';
    if (hrv >= 20) return 'high';
    return 'very_high';
  };

  const handleLog = async () => {
    if (!user || !hrvInput) return;
    const hrv = parseInt(hrvInput, 10);
    const hr = hrInput ? parseInt(hrInput, 10) : 0;
    if (isNaN(hrv) || hrv <= 0 || hrv > 300) {
      Alert.alert('Invalid HRV', 'Enter a value between 1-300 ms');
      return;
    }

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const stressLevel = classifyStress(hrv);
      const today = new Date().toISOString().slice(0, 10);

      // Insert HRV reading
      const { error: hrvError } = await supabase.from('hrv_readings').insert({
        user_id: user.id,
        hrv_ms: hrv,
        resting_hr: hr || null,
        stress_level: stressLevel,
        source: 'manual',
        recorded_at: new Date().toISOString(),
        note: noteInput || null,
      });
      if (hrvError) throw hrvError;

      // Also log mood if different from default
      const { error: moodError } = await supabase.from('mood_journal').upsert(
        {
          user_id: user.id,
          date: today,
          mood_level: selectedMood,
          note: noteInput || null,
        },
        { onConflict: 'user_id,date' },
      );
      if (moodError) throw moodError;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowLogModal(false);
      resetForm();
      loadData();
    } catch {
      Alert.alert('Error', 'Could not save reading. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setHrvInput('');
    setHrInput('');
    setNoteInput('');
    setSelectedMood(3);
  };

  const getInsight = () => {
    if (correlations.length < 2) return 'Log more data to see mood-stress correlations.';

    const highStressDays = correlations.filter((c) => c.stress === 'high' || c.stress === 'very_high');
    const lowMoodOnStress = highStressDays.filter((c) => c.mood <= 2).length;

    if (highStressDays.length > correlations.length / 2) {
      return '⚠️ Stress has been elevated this week. Consider adding breathing exercises or meditation to your routine.';
    }
    if (lowMoodOnStress > 0) {
      return '📊 Your mood tends to dip on high-stress days. The Breathe tab can help you decompress.';
    }
    if (avgHRV >= 50) {
      return '💚 Your HRV is in a healthy range. Keep maintaining your recovery habits!';
    }
    return '📈 Track consistently to unlock deeper insights into your stress-mood patterns.';
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={Gradients.cosmic as [string, string, ...string[]]} style={styles.bg} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <AnimatedEntry delay={0}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Stress & HRV</Text>
            <TouchableOpacity onPress={() => setShowLogModal(true)} style={styles.addBtn}>
              <Text style={styles.addText}>＋</Text>
            </TouchableOpacity>
          </View>
        </AnimatedEntry>

        {isLoading ? (
          <SkeletonLoader variant="default" />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Current Status */}
            <AnimatedEntry delay={100}>
              <GlassCard style={styles.statusCard}>
                <Text style={styles.statusEmoji}>{STRESS_EMOJI[todayStress] ?? '😐'}</Text>
                <Text style={styles.statusLabel}>Current Stress Level</Text>
                <View style={[styles.stressBadge, { backgroundColor: STRESS_COLORS[todayStress] }]}>
                  <Text style={styles.stressBadgeText}>
                    {todayStress.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </GlassCard>
            </AnimatedEntry>

            {/* Key Stats */}
            <AnimatedEntry delay={150}>
              <View style={styles.statsRow}>
                <StatCard
                  value={`${avgHRV} ms`}
                  label="Avg HRV (7d)"
                  icon="💓"
                  progress={Math.min(avgHRV / 100, 1)}
                  progressColor={Colors.sageLeaf}
                />
                <StatCard
                  value={`${readings.length}`}
                  label="Readings"
                  icon="📏"
                  progress={Math.min(readings.length / 14, 1)}
                  progressColor={Colors.violet}
                />
              </View>
            </AnimatedEntry>

            {/* Insight */}
            <AnimatedEntry delay={200}>
              <SectionHeader title="AI Insight" emoji="🧠" />
              <GlassCard>
                <Text style={styles.insightText}>{getInsight()}</Text>
              </GlassCard>
            </AnimatedEntry>

            {/* Mood–HRV Correlation */}
            {correlations.length > 0 && (
              <AnimatedEntry delay={250}>
                <SectionHeader title="Mood ↔ HRV Correlation" emoji="📊" />
                <GlassCard>
                  {correlations.slice(0, 7).map((c) => (
                    <View key={c.date} style={styles.corrRow}>
                      <Text style={styles.corrDate}>
                        {new Date(c.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </Text>
                      <Text style={styles.corrHRV}>{c.hrv} ms</Text>
                      <Text style={styles.corrMood}>
                        {MOOD_OPTIONS.find((m) => m.level === c.mood)?.emoji ?? '😐'}
                      </Text>
                      <View style={[styles.corrDot, { backgroundColor: STRESS_COLORS[c.stress] }]} />
                    </View>
                  ))}
                </GlassCard>
              </AnimatedEntry>
            )}

            {/* Recent Readings */}
            <AnimatedEntry delay={300}>
              <SectionHeader title="Recent Readings" emoji="📋" />
              {readings.length === 0 ? (
                <GlassCard style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>📏</Text>
                  <Text style={styles.emptyTitle}>No HRV readings yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Tap ＋ to log your first reading or sync from a wearable
                  </Text>
                </GlassCard>
              ) : (
                readings.slice(0, 10).map((r) => (
                  <GlassCard key={r.id} style={styles.readingCard}>
                    <View style={styles.readingHeader}>
                      <Text style={styles.readingHRV}>{r.hrv_ms} ms</Text>
                      <View style={[styles.stressDot, { backgroundColor: STRESS_COLORS[r.stress_level] }]}>
                        <Text style={styles.stressDotText}>
                          {r.stress_level.replace('_', ' ')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.readingMeta}>
                      {r.resting_hr > 0 && (
                        <Text style={styles.readingDetail}>❤️ {r.resting_hr} bpm</Text>
                      )}
                      <Text style={styles.readingDetail}>
                        📱 {r.source}
                      </Text>
                      <Text style={styles.readingTime}>
                        {new Date(r.recorded_at).toLocaleString()}
                      </Text>
                    </View>
                    {r.note && <Text style={styles.readingNote}>💬 {r.note}</Text>}
                  </GlassCard>
                ))
              )}
            </AnimatedEntry>

            {/* Quick Actions */}
            <AnimatedEntry delay={350}>
              <SectionHeader title="Quick Actions" emoji="⚡" />
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/mood');
                  }}
                >
                  <Text style={styles.actionEmoji}>😊</Text>
                  <Text style={styles.actionLabel}>Log Mood</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/(tabs)');
                  }}
                >
                  <Text style={styles.actionEmoji}>🧘</Text>
                  <Text style={styles.actionLabel}>Breathe</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/sleep');
                  }}
                >
                  <Text style={styles.actionEmoji}>😴</Text>
                  <Text style={styles.actionLabel}>Sleep</Text>
                </TouchableOpacity>
              </View>
            </AnimatedEntry>

            <View style={{ height: Spacing.xxl }} />
          </ScrollView>
        )}

        {/* Log Modal */}
        <Modal
          visible={showLogModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowLogModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <LinearGradient
                colors={[Colors.card, Colors.background]}
                style={styles.modalGradient}
              >
                <Text style={styles.modalTitle}>Log HRV & Mood</Text>

                {/* HRV Input */}
                <Text style={styles.inputLabel}>HRV (ms)</Text>
                <TextInput
                  style={styles.input}
                  value={hrvInput}
                  onChangeText={setHrvInput}
                  placeholder="e.g. 55"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                />

                {/* Resting HR */}
                <Text style={styles.inputLabel}>Resting Heart Rate (bpm, optional)</Text>
                <TextInput
                  style={styles.input}
                  value={hrInput}
                  onChangeText={setHrInput}
                  placeholder="e.g. 62"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                />

                {/* Mood Picker */}
                <Text style={styles.inputLabel}>How are you feeling?</Text>
                <View style={styles.moodRow}>
                  {MOOD_OPTIONS.map((m) => (
                    <TouchableOpacity
                      key={m.level}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedMood(m.level);
                      }}
                      style={[
                        styles.moodBtn,
                        selectedMood === m.level && styles.moodBtnActive,
                      ]}
                    >
                      <Text style={styles.moodEmoji}>{m.emoji}</Text>
                      <Text style={styles.moodLabel}>{m.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Note */}
                <Text style={styles.inputLabel}>Note (optional)</Text>
                <TextInput
                  style={[styles.input, styles.noteInput]}
                  value={noteInput}
                  onChangeText={setNoteInput}
                  placeholder="How's your day going?"
                  placeholderTextColor={Colors.textMuted}
                  multiline
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowLogModal(false);
                      resetForm();
                    }}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <GradientButton
                    title="Save"
                    onPress={handleLog}
                    loading={isSaving}
                    variant="primary"
                    icon="💓"
                  />
                </View>
              </LinearGradient>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bg: { ...StyleSheet.absoluteFillObject },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  backText: { fontSize: FontSizes.xxl, color: Colors.textPrimary },
  title: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  addBtn: { padding: Spacing.xs },
  addText: { fontSize: FontSizes.xxl, color: Colors.sageLeaf },
  scroll: { paddingHorizontal: Spacing.lg },

  // Status
  statusCard: { alignItems: 'center', marginBottom: Spacing.md },
  statusEmoji: { fontSize: 56 },
  statusLabel: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  stressBadge: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, borderRadius: BorderRadius.pill, marginTop: Spacing.sm },
  stressBadgeText: { fontSize: FontSizes.sm, fontWeight: '700', color: '#fff' },

  // Stats
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },

  // Insight
  insightText: { fontSize: FontSizes.md, color: Colors.textSecondary, lineHeight: 22 },

  // Correlations
  corrRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  corrDate: { flex: 2, fontSize: FontSizes.sm, color: Colors.textSecondary },
  corrHRV: { flex: 1, fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  corrMood: { flex: 0.5, fontSize: 20, textAlign: 'center' },
  corrDot: { width: 12, height: 12, borderRadius: 6 },

  // Readings
  readingCard: { marginBottom: Spacing.sm },
  readingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  readingHRV: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary },
  stressDot: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.sm },
  stressDotText: { fontSize: FontSizes.xs, fontWeight: '600', color: '#fff', textTransform: 'capitalize' },
  readingMeta: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xs },
  readingDetail: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  readingTime: { fontSize: FontSizes.sm, color: Colors.textMuted },
  readingNote: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: Spacing.xs, fontStyle: 'italic' },

  // Empty
  emptyCard: { alignItems: 'center', padding: Spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary },
  emptySubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xs },

  // Actions
  actionsRow: { flexDirection: 'row', gap: Spacing.md },
  actionBtn: {
    flex: 1, alignItems: 'center', padding: Spacing.md,
    backgroundColor: Colors.card, borderRadius: BorderRadius.md,
  },
  actionEmoji: { fontSize: 28, marginBottom: Spacing.xs },
  actionLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, overflow: 'hidden' },
  modalGradient: { padding: Spacing.lg },
  modalTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.lg },
  inputLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.md },
  input: {
    backgroundColor: Colors.background, borderRadius: BorderRadius.md,
    padding: Spacing.md, fontSize: FontSizes.md, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border,
  },
  noteInput: { minHeight: 80, textAlignVertical: 'top' },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xs },
  moodBtn: { alignItems: 'center', padding: Spacing.sm, borderRadius: BorderRadius.md, flex: 1 },
  moodBtnActive: { backgroundColor: Colors.violet + '30' },
  moodEmoji: { fontSize: 28 },
  moodLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 4 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.lg },
  cancelBtn: { padding: Spacing.md },
  cancelText: { fontSize: FontSizes.md, color: Colors.textMuted },
});
