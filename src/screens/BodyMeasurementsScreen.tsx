/**
 * @file BodyMeasurementsScreen.tsx
 * @module screens/BodyMeasurementsScreen
 * @description Body measurements screen — logs and charts key body measurements
 * (waist, chest, arms, etc.) over time.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
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
  Shadows,
} from '../theme/colors';
import AnimatedEntry from '../components/AnimatedEntry';
import SectionHeader from '../components/SectionHeader';
import AnimatedEmptyState from '../components/AnimatedEmptyState';
import { LineChart } from '../components/InteractiveChart';

const STORAGE_KEY = 'zenfit:measurements';

interface MeasurementEntry {
  date: string;
  weight?: number;
  waist?: number;
  chest?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  neck?: number;
}

type MeasurementKey = keyof Omit<MeasurementEntry, 'date'>;

const MEASUREMENT_FIELDS: { key: MeasurementKey; label: string; emoji: string; unit: string }[] = [
  { key: 'weight', label: 'Weight', emoji: '⚖️', unit: 'kg' },
  { key: 'waist', label: 'Waist', emoji: '📏', unit: 'cm' },
  { key: 'chest', label: 'Chest', emoji: '💪', unit: 'cm' },
  { key: 'hips', label: 'Hips', emoji: '🦴', unit: 'cm' },
  { key: 'arms', label: 'Arms', emoji: '💪', unit: 'cm' },
  { key: 'thighs', label: 'Thighs', emoji: '🦵', unit: 'cm' },
  { key: 'neck', label: 'Neck', emoji: '🧣', unit: 'cm' },
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function BodyMeasurementsScreen() {
  const [entries, setEntries] = useState<MeasurementEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Record<MeasurementKey, string>>>({});
  const [activeMetric, setActiveMetric] = useState<MeasurementKey>('weight');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
    setIsLoading(false);
  };

  const handleSave = async () => {
    const hasAny = MEASUREMENT_FIELDS.some((f) => form[f.key]?.trim());
    if (!hasAny) {
      Alert.alert('No Data', 'Enter at least one measurement.');
      return;
    }
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newEntry: MeasurementEntry = { date: todayKey() };
    MEASUREMENT_FIELDS.forEach((f) => {
      const val = parseFloat(form[f.key] ?? '');
      if (!isNaN(val) && val > 0) (newEntry as any)[f.key] = val;
    });

    const updated = [newEntry, ...entries.filter((e) => e.date !== todayKey())];
    setEntries(updated);
    setShowModal(false);
    setForm({});

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    setIsSaving(false);
  };

  // Build chart data for active metric (last 8 entries)
  const chartData = entries
    .filter((e) => e[activeMetric] !== undefined)
    .slice(0, 8)
    .reverse()
    .map((e) => ({
      label: formatDate(e.date),
      value: e[activeMetric] as number,
    }));

  // Latest vs first delta
  const latestEntry = entries[0];
  const firstEntry = entries[entries.length - 1];

  const getChange = (key: MeasurementKey) => {
    const latest = latestEntry?.[key];
    const first = firstEntry?.[key];
    if (!latest || !first || firstEntry === latestEntry) return null;
    const delta = latest - first;
    return { delta: delta.toFixed(1), positive: delta > 0 };
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={Gradients.cosmic} style={StyleSheet.absoluteFill} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <AnimatedEntry delay={0}>
          <View style={styles.header}>
            <Text style={styles.title}>📏 Measurements</Text>
            <Text style={styles.subtitle}>Track your body composition over time</Text>
            <TouchableOpacity
              style={styles.logBtn}
              onPress={() => setShowModal(true)}
              accessibilityLabel="Log measurements"
            >
              <LinearGradient colors={Gradients.aurora} style={styles.logBtnGradient}>
                <Text style={styles.logBtnText}>+ Log Today</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </AnimatedEntry>

        {/* Latest stats grid */}
        {latestEntry && (
          <AnimatedEntry delay={100}>
            <SectionHeader title="Current Measurements" style={styles.sectionHeader} />
            <View style={styles.statsGrid}>
              {MEASUREMENT_FIELDS.map((f) => {
                const val = latestEntry[f.key];
                if (!val) return null;
                const change = getChange(f.key);
                return (
                  <TouchableOpacity
                    key={f.key}
                    style={[styles.statCard, activeMetric === f.key && styles.statCardActive]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setActiveMetric(f.key);
                    }}
                  >
                    <LinearGradient
                      colors={activeMetric === f.key ? Gradients.cardPrimary : Gradients.cardSecondary}
                      style={styles.statCardGradient}
                    >
                      <Text style={styles.statEmoji}>{f.emoji}</Text>
                      <Text style={styles.statValue}>{val} {f.unit}</Text>
                      <Text style={styles.statLabel}>{f.label}</Text>
                      {change && (
                        <Text style={[styles.statChange, { color: change.positive ? Colors.error : Colors.sageLeaf }]}>
                          {change.positive ? '▲' : '▼'} {Math.abs(parseFloat(change.delta))} {f.unit}
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </AnimatedEntry>
        )}

        {/* Trend chart */}
        {chartData.length >= 2 && (
          <AnimatedEntry delay={200}>
            <SectionHeader
              title={`${MEASUREMENT_FIELDS.find((f) => f.key === activeMetric)?.label} Trend`}
              subtitle="Tap a stat card to switch metric"
              style={styles.sectionHeader}
            />
            <LinearGradient colors={Gradients.cardSecondary} style={styles.chartCard}>
              <LineChart
                data={chartData}
                color={Colors.cosmicBlue}
                gradientFrom="rgba(96,165,250,0.5)"
                gradientTo="rgba(96,165,250,0)"
                unit={` ${MEASUREMENT_FIELDS.find((f) => f.key === activeMetric)?.unit ?? ''}`}
                height={150}
                smooth
              />
            </LinearGradient>
          </AnimatedEntry>
        )}

        {/* History list */}
        {entries.length > 0 && (
          <AnimatedEntry delay={300}>
            <SectionHeader title="History" style={styles.sectionHeader} />
            {isLoading ? (
              <ActivityIndicator color={Colors.violet} />
            ) : (
              entries.slice(0, 10).map((entry, idx) => (
                <LinearGradient
                  key={idx}
                  colors={Gradients.cardSecondary}
                  style={styles.historyCard}
                >
                  <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
                  <View style={styles.historyMetrics}>
                    {MEASUREMENT_FIELDS.filter((f) => entry[f.key]).map((f) => (
                      <Text key={f.key} style={styles.historyMetric}>
                        {f.emoji} {entry[f.key]}{f.unit}
                      </Text>
                    ))}
                  </View>
                </LinearGradient>
              ))
            )}
          </AnimatedEntry>
        )}

        {entries.length === 0 && !isLoading && (
          <AnimatedEmptyState
            emoji="📏"
            title="Start Tracking"
            subtitle="Log your first measurements and see your transformation over time."
          />
        )}
      </ScrollView>

      {/* Log Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <LinearGradient colors={['#1A1730', '#2D2554']} style={styles.modal}>
            <Text style={styles.modalTitle}>📏 Log Measurements</Text>
            <Text style={styles.modalSubtitle}>Leave fields blank to skip</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {MEASUREMENT_FIELDS.map((f) => (
                <View key={f.key} style={styles.inputRow}>
                  <Text style={styles.inputLabel}>{f.emoji} {f.label} ({f.unit})</Text>
                  <TextInput
                    style={styles.input}
                    value={form[f.key] ?? ''}
                    onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
                    keyboardType="decimal-pad"
                    placeholder={`Enter ${f.label.toLowerCase()}`}
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
                <LinearGradient colors={Gradients.aurora} style={styles.saveBtnGradient}>
                  <Text style={styles.saveBtnText}>{isSaving ? 'Saving…' : 'Save'}</Text>
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
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },

  header: { paddingTop: Spacing.lg, marginBottom: Spacing.lg },
  title: { fontSize: FontSizes.xxxl, fontWeight: '900', color: Colors.textPrimary },
  subtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.md },
  logBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', alignSelf: 'flex-start' },
  logBtnGradient: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xl },
  logBtnText: { color: Colors.textPrimary, fontWeight: '800', fontSize: FontSizes.md },

  sectionHeader: { marginTop: Spacing.lg, marginBottom: Spacing.sm },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: {
    width: '30%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  statCardActive: { borderColor: Colors.violet },
  statCardGradient: { padding: Spacing.sm, alignItems: 'center', minHeight: 80 },
  statEmoji: { fontSize: 18, marginBottom: 2 },
  statValue: { fontSize: FontSizes.md, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  statChange: { fontSize: 9, fontWeight: '700', marginTop: 2 },

  chartCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },

  historyCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.sm,
  },
  historyDate: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  historyMetrics: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  historyMetric: { fontSize: FontSizes.xs, color: Colors.textSecondary },

  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyEmoji: { fontSize: 64, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.xs },
  emptySubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modal: {
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: FontSizes.xl, fontWeight: '900', color: Colors.textPrimary, marginBottom: 4 },
  modalSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  modalScroll: { maxHeight: 400 },
  inputRow: { marginBottom: Spacing.md },
  inputLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600', marginBottom: 4 },
  input: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  modalBtns: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
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
});
