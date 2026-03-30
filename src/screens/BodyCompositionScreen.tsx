/**
 * @file BodyCompositionScreen.tsx
 * @module screens/BodyCompositionScreen
 * @description Body composition tracking with progress photos — track weight,
 * body fat %, measurements, and visual progress with front/side/back photos.
 */

import React, { useState, useEffect } from 'react';
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
import { LineChart } from '../components/InteractiveChart';
import { useRouter } from '../utils/router';

interface CompositionEntry {
  id: string;
  weight_kg: number;
  body_fat_pct: number | null;
  muscle_mass_kg: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  hips_cm: number | null;
  arms_cm: number | null;
  thighs_cm: number | null;
  notes: string | null;
  logged_at: string;
}

interface ProgressPhoto {
  id: string;
  photo_url: string;
  category: 'front' | 'side' | 'back' | 'other';
  weight_kg: number | null;
  taken_at: string;
}

export default function BodyCompositionScreen() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const router = useRouter();

  const [entries, setEntries] = useState<CompositionEntry[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formWeight, setFormWeight] = useState('');
  const [formBodyFat, setFormBodyFat] = useState('');
  const [formMuscleMass, setFormMuscleMass] = useState('');
  const [formWaist, setFormWaist] = useState('');
  const [formChest, setFormChest] = useState('');
  const [formHips, setFormHips] = useState('');
  const [formArms, setFormArms] = useState('');
  const [formThighs, setFormThighs] = useState('');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    if (user) {
      fetchEntries();
      fetchPhotos();
    }
  }, [user]);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('body_composition')
        .select('*')
        .eq('user_id', user!.id)
        .order('logged_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setEntries(data || []);
    } catch {
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user!.id)
        .order('taken_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      setPhotos(data || []);
    } catch {
      setPhotos([]);
    }
  };

  const handleSave = async () => {
    if (!user || !formWeight) return;
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const parseNum = (v: string) => {
        const n = parseFloat(v);
        return isNaN(n) ? null : n;
      };

      const { error } = await supabase.from('body_composition').insert({
        user_id: user.id,
        weight_kg: parseFloat(formWeight),
        body_fat_pct: parseNum(formBodyFat),
        muscle_mass_kg: parseNum(formMuscleMass),
        waist_cm: parseNum(formWaist),
        chest_cm: parseNum(formChest),
        hips_cm: parseNum(formHips),
        arms_cm: parseNum(formArms),
        thighs_cm: parseNum(formThighs),
        notes: formNotes.trim() || null,
        logged_at: new Date().toISOString().split('T')[0],
      });

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowLogModal(false);
      resetForm();
      fetchEntries();
    } catch {
      Alert.alert('Error', 'Could not save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormWeight('');
    setFormBodyFat('');
    setFormMuscleMass('');
    setFormWaist('');
    setFormChest('');
    setFormHips('');
    setFormArms('');
    setFormThighs('');
    setFormNotes('');
  };

  const latest = entries[0];
  const previous = entries[1];

  const getChange = (current: number | null | undefined, prev: number | null | undefined) => {
    if (current == null || prev == null) return null;
    const diff = current - prev;
    return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
  };

  const weightData = entries
    .slice(0, 14)
    .reverse()
    .map((e) => ({ label: e.logged_at.slice(5), value: e.weight_kg }));

  const bodyFatData = entries
    .slice(0, 14)
    .reverse()
    .filter((e) => e.body_fat_pct != null)
    .map((e) => ({ label: e.logged_at.slice(5), value: e.body_fat_pct! }));

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
            <Text style={styles.title}>Body Composition</Text>
            <TouchableOpacity onPress={() => setShowLogModal(true)} style={styles.addBtn}>
              <Text style={styles.addText}>＋</Text>
            </TouchableOpacity>
          </View>
        </AnimatedEntry>

        {isLoading ? (
          <SkeletonLoader variant="default" />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Current Stats */}
            {latest && (
              <AnimatedEntry delay={100}>
                <View style={styles.statsGrid}>
                  <StatCard
                    value={`${latest.weight_kg}`}
                    label="Weight (kg)"
                    icon="⚖️"
                    progress={0}
                    progressColor={Colors.violet}
                  />
                  <StatCard
                    value={latest.body_fat_pct != null ? `${latest.body_fat_pct}%` : '—'}
                    label="Body Fat"
                    icon="📊"
                    progress={latest.body_fat_pct ? latest.body_fat_pct / 40 : 0}
                    progressColor={Colors.rosePetal}
                  />
                </View>
              </AnimatedEntry>
            )}

            {/* Changes */}
            {latest && previous && (
              <AnimatedEntry delay={200}>
                <GlassCard style={styles.changeCard}>
                  <Text style={styles.changeTitle}>Changes since last entry</Text>
                  <View style={styles.changeRow}>
                    {[
                      { label: 'Weight', change: getChange(latest.weight_kg, previous.weight_kg), unit: 'kg' },
                      { label: 'Body Fat', change: getChange(latest.body_fat_pct, previous.body_fat_pct), unit: '%' },
                      { label: 'Muscle', change: getChange(latest.muscle_mass_kg, previous.muscle_mass_kg), unit: 'kg' },
                    ].map((item) => (
                      <View key={item.label} style={styles.changeItem}>
                        <Text style={styles.changeLabel}>{item.label}</Text>
                        <Text
                          style={[
                            styles.changeValue,
                            item.change && parseFloat(item.change) < 0
                              ? styles.changeGreen
                              : item.change && parseFloat(item.change) > 0
                              ? styles.changeRed
                              : null,
                          ]}
                        >
                          {item.change ? `${item.change} ${item.unit}` : '—'}
                        </Text>
                      </View>
                    ))}
                  </View>
                </GlassCard>
              </AnimatedEntry>
            )}

            {/* Weight Chart */}
            {weightData.length >= 2 && (
              <AnimatedEntry delay={300}>
                <SectionHeader title="Weight Trend" emoji="📈" />
                <GlassCard>
                  <LineChart
                    data={weightData}
                    height={180}
                    color={Colors.violet}
                    showDots
                  />
                </GlassCard>
              </AnimatedEntry>
            )}

            {/* Body Fat Chart */}
            {bodyFatData.length >= 2 && (
              <AnimatedEntry delay={400}>
                <SectionHeader title="Body Fat Trend" emoji="📉" />
                <GlassCard>
                  <LineChart
                    data={bodyFatData}
                    height={180}
                    color={Colors.rosePetal}
                    showDots
                  />
                </GlassCard>
              </AnimatedEntry>
            )}

            {/* Measurements */}
            {latest && (latest.waist_cm || latest.chest_cm || latest.hips_cm || latest.arms_cm || latest.thighs_cm) && (
              <AnimatedEntry delay={500}>
                <SectionHeader title="Measurements" emoji="📏" />
                <GlassCard>
                  <View style={styles.measureGrid}>
                    {[
                      { label: 'Waist', value: latest.waist_cm, unit: 'cm' },
                      { label: 'Chest', value: latest.chest_cm, unit: 'cm' },
                      { label: 'Hips', value: latest.hips_cm, unit: 'cm' },
                      { label: 'Arms', value: latest.arms_cm, unit: 'cm' },
                      { label: 'Thighs', value: latest.thighs_cm, unit: 'cm' },
                    ]
                      .filter((m) => m.value != null)
                      .map((m) => (
                        <View key={m.label} style={styles.measureItem}>
                          <Text style={styles.measureValue}>
                            {m.value} {m.unit}
                          </Text>
                          <Text style={styles.measureLabel}>{m.label}</Text>
                        </View>
                      ))}
                  </View>
                </GlassCard>
              </AnimatedEntry>
            )}

            {/* Progress Photos */}
            <AnimatedEntry delay={600}>
              <SectionHeader
                title="Progress Photos"
                emoji="📸"
                rightElement={
                  <TouchableOpacity onPress={() => router.push('/progress-photos')}>
                    <Text style={styles.seeAll}>See All</Text>
                  </TouchableOpacity>
                }
              />
              {photos.length === 0 ? (
                <GlassCard style={styles.emptyPhotos}>
                  <Text style={styles.emptyEmoji}>📷</Text>
                  <Text style={styles.emptyText}>No progress photos yet</Text>
                  <GradientButton
                    title="Add Photo"
                    onPress={() => router.push('/progress-photos')}
                    variant="secondary"
                    icon="📸"
                  />
                </GlassCard>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {photos.slice(0, 6).map((photo) => (
                    <GlassCard key={photo.id} style={styles.photoCard}>
                      <View style={styles.photoPlaceholder}>
                        <Text style={styles.photoPlaceholderText}>
                          {photo.category === 'front' ? '🧍' : photo.category === 'side' ? '🧍‍♂️' : '🧍‍♀️'}
                        </Text>
                      </View>
                      <Text style={styles.photoDate}>{photo.taken_at}</Text>
                      <Text style={styles.photoCategory}>{photo.category}</Text>
                    </GlassCard>
                  ))}
                </ScrollView>
              )}
            </AnimatedEntry>

            {/* History */}
            <AnimatedEntry delay={700}>
              <SectionHeader title="History" emoji="📋" />
              {entries.slice(0, 10).map((entry) => (
                <GlassCard key={entry.id} style={styles.historyCard}>
                  <View style={styles.historyRow}>
                    <Text style={styles.historyDate}>{entry.logged_at}</Text>
                    <View style={styles.historyStats}>
                      <Text style={styles.historyStat}>⚖️ {entry.weight_kg} kg</Text>
                      {entry.body_fat_pct != null && (
                        <Text style={styles.historyStat}>📊 {entry.body_fat_pct}%</Text>
                      )}
                      {entry.muscle_mass_kg != null && (
                        <Text style={styles.historyStat}>💪 {entry.muscle_mass_kg} kg</Text>
                      )}
                    </View>
                  </View>
                </GlassCard>
              ))}
            </AnimatedEntry>

            <View style={{ height: Spacing.xxl }} />
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Log Modal */}
      <Modal visible={showLogModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <LinearGradient
              colors={Gradients.cosmic as [string, string, ...string[]]}
              style={styles.modalGradient}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Log Body Composition</Text>

                <Text style={styles.inputLabel}>Weight (kg) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 75.5"
                  placeholderTextColor={Colors.textMuted}
                  value={formWeight}
                  onChangeText={setFormWeight}
                  keyboardType="decimal-pad"
                />

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Body Fat %</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 15"
                      placeholderTextColor={Colors.textMuted}
                      value={formBodyFat}
                      onChangeText={setFormBodyFat}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Muscle Mass (kg)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 35"
                      placeholderTextColor={Colors.textMuted}
                      value={formMuscleMass}
                      onChangeText={setFormMuscleMass}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
                  Measurements (cm)
                </Text>
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <TextInput
                      style={styles.input}
                      placeholder="Waist"
                      placeholderTextColor={Colors.textMuted}
                      value={formWaist}
                      onChangeText={setFormWaist}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <TextInput
                      style={styles.input}
                      placeholder="Chest"
                      placeholderTextColor={Colors.textMuted}
                      value={formChest}
                      onChangeText={setFormChest}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.thirdInput}>
                    <TextInput
                      style={styles.input}
                      placeholder="Hips"
                      placeholderTextColor={Colors.textMuted}
                      value={formHips}
                      onChangeText={setFormHips}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={styles.thirdInput}>
                    <TextInput
                      style={styles.input}
                      placeholder="Arms"
                      placeholderTextColor={Colors.textMuted}
                      value={formArms}
                      onChangeText={setFormArms}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={styles.thirdInput}>
                    <TextInput
                      style={styles.input}
                      placeholder="Thighs"
                      placeholderTextColor={Colors.textMuted}
                      value={formThighs}
                      onChangeText={setFormThighs}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.inputMulti]}
                  placeholder="How are you feeling?"
                  placeholderTextColor={Colors.textMuted}
                  value={formNotes}
                  onChangeText={setFormNotes}
                  multiline
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={() => setShowLogModal(false)} style={styles.cancelBtn}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <GradientButton
                    title="Save"
                    onPress={handleSave}
                    loading={isSaving}
                    disabled={!formWeight.trim()}
                    variant="primary"
                    icon="💾"
                  />
                </View>
              </ScrollView>
            </LinearGradient>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bg: { ...StyleSheet.absoluteFillObject },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  backText: { fontSize: FontSizes.xxl, color: Colors.textPrimary },
  title: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.violet, alignItems: 'center', justifyContent: 'center',
  },
  addText: { fontSize: FontSizes.xl, color: '#fff' },
  scroll: { paddingHorizontal: Spacing.lg },
  statsGrid: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  changeCard: { marginBottom: Spacing.md },
  changeTitle: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm },
  changeRow: { flexDirection: 'row', justifyContent: 'space-around' },
  changeItem: { alignItems: 'center' },
  changeLabel: { fontSize: FontSizes.sm, color: Colors.textMuted, marginBottom: 4 },
  changeValue: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  changeGreen: { color: Colors.sageLeaf },
  changeRed: { color: Colors.rosePetal },
  measureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  measureItem: { alignItems: 'center', minWidth: 70 },
  measureValue: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  measureLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  seeAll: { fontSize: FontSizes.md, color: Colors.violet, fontWeight: '600' },
  emptyPhotos: { alignItems: 'center', padding: Spacing.lg },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSizes.md, color: Colors.textSecondary, marginBottom: Spacing.md },
  photoCard: { width: 120, marginRight: Spacing.sm, alignItems: 'center' },
  photoPlaceholder: {
    width: 100, height: 100, borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(124,58,237,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  photoPlaceholderText: { fontSize: 40 },
  photoDate: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: Spacing.xs },
  photoCategory: { fontSize: FontSizes.xs, color: Colors.textMuted, textTransform: 'capitalize' },
  historyCard: { marginBottom: Spacing.sm },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyDate: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary },
  historyStats: { flexDirection: 'row', gap: Spacing.md },
  historyStat: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, overflow: 'hidden', maxHeight: '85%' },
  modalGradient: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  modalTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.lg, textAlign: 'center' },
  inputLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.sm },
  input: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    fontSize: FontSizes.md, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  halfInput: { flex: 1 },
  thirdInput: { flex: 1 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.lg, gap: Spacing.md },
  cancelBtn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  cancelText: { fontSize: FontSizes.lg, color: Colors.textSecondary, fontWeight: '600' },
});
