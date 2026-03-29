/**
 * @file WorkoutPlanScreen.tsx
 * @module screens/WorkoutPlanScreen
 * @description Workout plan screen — browse and activate structured multi-week
 * training programmes curated for different goals and fitness levels.
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
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from '../utils/haptics';
import { Colors, Gradients, Spacing, BorderRadius, FontSizes, Shadows } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import AnimatedEntry from '../components/AnimatedEntry';
import SectionHeader from '../components/SectionHeader';

interface PlanExercise {
  name: string;
  sets: number;
  reps: number;
  weight_kg: number;
}

interface PlanDay {
  day_number: number;
  name: string;
  exercises: PlanExercise[];
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string | null;
  days_per_week: number;
  plan_days: PlanDay[];
  is_active: boolean;
  created_at: string;
}

const DAY_NAMES = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

export default function WorkoutPlanScreen() {
  const user = useAuthStore((s) => s.user);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create plan modal state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState('3');
  const [planDays, setPlanDays] = useState<PlanDay[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [addExerciseVisible, setAddExerciseVisible] = useState(false);
  const [exName, setExName] = useState('');
  const [exSets, setExSets] = useState('3');
  const [exReps, setExReps] = useState('10');
  const [exWeight, setExWeight] = useState('0');

  useEffect(() => {
    if (user) fetchPlans();
  }, [user]);

  useEffect(() => {
    const n = Math.min(Math.max(parseInt(daysPerWeek) || 1, 1), 7);
    setPlanDays(
      Array.from({ length: n }, (_, i) => ({
        day_number: i + 1,
        name: DAY_NAMES[i],
        exercises: [],
      })),
    );
  }, [daysPerWeek]);

  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (err) throw err;
      setPlans((data || []) as WorkoutPlan[]);
    } catch {
      setError('Failed to load plans.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExercise = () => {
    if (!exName.trim()) return;
    const ex: PlanExercise = {
      name: exName.trim(),
      sets: parseInt(exSets) || 3,
      reps: parseInt(exReps) || 10,
      weight_kg: parseFloat(exWeight) || 0,
    };
    setPlanDays((prev) =>
      prev.map((d, idx) =>
        idx === selectedDayIndex ? { ...d, exercises: [...d.exercises, ex] } : d,
      ),
    );
    setExName('');
    setExSets('3');
    setExReps('10');
    setExWeight('0');
    setAddExerciseVisible(false);
  };

  const handleSavePlan = async () => {
    if (!planName.trim() || !user) return;
    setIsSaving(true);
    try {
      const { error: err } = await supabase.from('workout_plans').insert({
        user_id: user.id,
        name: planName.trim(),
        description: planDescription.trim() || null,
        days_per_week: planDays.length,
        plan_days: planDays,
        is_active: false,
      });
      if (err) throw err;
      setCreateModalVisible(false);
      setPlanName('');
      setPlanDescription('');
      setDaysPerWeek('3');
      await fetchPlans();
    } catch {
      setError('Failed to save plan.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActivePlan = async (planId: string, makeActive: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      // Deactivate all plans first
      if (makeActive) {
        await supabase.from('workout_plans').update({ is_active: false }).eq('user_id', user!.id);
      }
      await supabase.from('workout_plans').update({ is_active: makeActive }).eq('id', planId);
      await fetchPlans();
    } catch {
      setError('Failed to update plan.');
    }
  };

  const deletePlan = async (planId: string) => {
    Alert.alert('Delete Plan', 'Are you sure you want to delete this plan?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await supabase.from('workout_plans').delete().eq('id', planId);
            await fetchPlans();
          } catch {
            setError('Failed to delete plan.');
          }
        },
      },
    ]);
  };

  const activePlan = plans.find((p) => p.is_active);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.cosmic as unknown as [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Workout Plans</Text>
        <Text style={styles.subtitle}>Build your perfect programme</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Active Plan Banner */}
        {activePlan && (
          <AnimatedEntry delay={0}>
            <LinearGradient
              colors={Gradients.auroraSubtle as unknown as [string, string]}
              style={styles.activeBanner}
            >
              <Text style={styles.activeBannerLabel}>✅ Active Plan</Text>
              <Text style={styles.activeBannerName}>{activePlan.name}</Text>
              <Text style={styles.activeBannerMeta}>
                {activePlan.days_per_week} days/week ·{' '}
                {activePlan.plan_days.reduce((s, d) => s + d.exercises.length, 0)} exercises
              </Text>
            </LinearGradient>
          </AnimatedEntry>
        )}

        {/* Create Button */}
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCreateModalVisible(true);
          }}
        >
          <LinearGradient
            colors={Gradients.aurora as unknown as [string, string, ...string[]]}
            style={styles.createBtnGradient}
          >
            <Text style={styles.createBtnText}>+ Create New Plan</Text>
          </LinearGradient>
        </TouchableOpacity>

        <SectionHeader title="My Plans" emoji="📋" />

        {error ? (
          <TouchableOpacity onPress={fetchPlans}>
            <Text style={styles.errorText}>{error} Tap to retry.</Text>
          </TouchableOpacity>
        ) : isLoading ? (
          <ActivityIndicator color={Colors.violet} style={{ marginVertical: Spacing.xl }} />
        ) : plans.length === 0 ? (
          <Text style={styles.emptyText}>No plans yet. Create one above!</Text>
        ) : (
          plans.map((plan) => (
            <LinearGradient
              key={plan.id}
              colors={
                plan.is_active
                  ? (Gradients.auroraSubtle as unknown as [string, string])
                  : (Gradients.cardSecondary as unknown as [string, string])
              }
              style={[styles.planCard, plan.is_active && { borderColor: Colors.lavender }]}
            >
              <View style={styles.planHeader}>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  {plan.description ? (
                    <Text style={styles.planDesc}>{plan.description}</Text>
                  ) : null}
                  <Text style={styles.planMeta}>{plan.days_per_week} days/week</Text>
                </View>
                <View style={styles.planActions}>
                  <Switch
                    value={plan.is_active}
                    onValueChange={(v) => toggleActivePlan(plan.id, v)}
                    trackColor={{ false: Colors.textMuted, true: Colors.sageLeaf }}
                    thumbColor={plan.is_active ? Colors.sacredGold : Colors.textSecondary}
                  />
                </View>
              </View>
              <View style={styles.planDaysRow}>
                {plan.plan_days.map((d) => (
                  <View key={d.day_number} style={styles.dayChip}>
                    <Text style={styles.dayChipText}>D{d.day_number}</Text>
                    <Text style={styles.dayChipCount}>{d.exercises.length}ex</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deletePlan(plan.id)}>
                <Text style={styles.deleteBtnText}>🗑 Delete</Text>
              </TouchableOpacity>
            </LinearGradient>
          ))
        )}
      </ScrollView>

      {/* Create Plan Modal */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <LinearGradient
            colors={['#1A1730', '#2D2554']}
            style={[styles.modalContent, { borderColor: Colors.glassBorder }]}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>New Workout Plan</Text>

              <Text style={styles.inputLabel}>Plan Name</Text>
              <TextInput
                style={styles.textInput}
                value={planName}
                onChangeText={setPlanName}
                placeholder="e.g. Push/Pull/Legs"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.inputLabel}>Description (optional)</Text>
              <TextInput
                style={styles.textInput}
                value={planDescription}
                onChangeText={setPlanDescription}
                placeholder="e.g. 3-day beginner strength plan"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.inputLabel}>Days per Week (1-7)</Text>
              <TextInput
                style={styles.textInput}
                value={daysPerWeek}
                onChangeText={setDaysPerWeek}
                keyboardType="number-pad"
                placeholder="3"
                placeholderTextColor={Colors.textMuted}
              />

              {planDays.length > 0 && (
                <>
                  <Text style={styles.inputLabel}>Training Days</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.dayTabsScroll}
                  >
                    {planDays.map((d, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.dayTab, selectedDayIndex === idx && styles.dayTabActive]}
                        onPress={() => setSelectedDayIndex(idx)}
                      >
                        <Text
                          style={[
                            styles.dayTabText,
                            selectedDayIndex === idx && styles.dayTabTextActive,
                          ]}
                        >
                          {d.name}
                        </Text>
                        <Text style={styles.dayTabCount}>{d.exercises.length} ex</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <View style={styles.exerciseList}>
                    {planDays[selectedDayIndex]?.exercises.map((ex, i) => (
                      <Text key={i} style={styles.exerciseItem}>
                        • {ex.name}: {ex.sets}×{ex.reps}
                        {ex.weight_kg > 0 ? ` @ ${ex.weight_kg}kg` : ''}
                      </Text>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.addExBtn}
                    onPress={() => setAddExerciseVisible(true)}
                  >
                    <Text style={styles.addExBtnText}>
                      + Add Exercise to {planDays[selectedDayIndex]?.name}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => setCreateModalVisible(false)}
                >
                  <Text style={styles.cancelModalText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveModalBtn}
                  onPress={handleSavePlan}
                  disabled={isSaving}
                >
                  <LinearGradient
                    colors={Gradients.aurora as unknown as [string, string, ...string[]]}
                    style={styles.saveModalGradient}
                  >
                    {isSaving ? (
                      <ActivityIndicator color={Colors.textPrimary} />
                    ) : (
                      <Text style={styles.saveModalText}>Save Plan</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </LinearGradient>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Exercise Modal */}
      <Modal
        visible={addExerciseVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddExerciseVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <LinearGradient
            colors={['#1A1730', '#2D2554']}
            style={[styles.modalContent, { borderColor: Colors.glassBorder }]}
          >
            <Text style={styles.modalTitle}>Add Exercise</Text>
            <Text style={styles.inputLabel}>Exercise Name</Text>
            <TextInput
              style={styles.textInput}
              value={exName}
              onChangeText={setExName}
              placeholder="e.g. Bench Press"
              placeholderTextColor={Colors.textMuted}
            />
            <View style={styles.inputRow}>
              {[
                ['Sets', exSets, setExSets],
                ['Reps', exReps, setExReps],
                ['Weight (kg)', exWeight, setExWeight],
              ].map(([label, val, setter]) => (
                <View key={label as string} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{label as string}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={val as string}
                    onChangeText={setter as any}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setAddExerciseVisible(false)}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveModalBtn} onPress={handleAddExercise}>
                <LinearGradient
                  colors={Gradients.aurora as unknown as [string, string, ...string[]]}
                  style={styles.saveModalGradient}
                >
                  <Text style={styles.saveModalText}>Add</Text>
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
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, marginBottom: Spacing.md },
  title: { fontSize: FontSizes.xxxl, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 120 },
  activeBanner: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.lavender,
  },
  activeBannerLabel: {
    fontSize: FontSizes.xs,
    color: Colors.sageLeaf,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  activeBannerName: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary },
  activeBannerMeta: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4 },
  createBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: Spacing.lg },
  createBtnGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnText: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary },
  planCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  planInfo: { flex: 1 },
  planName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  planDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  planMeta: { fontSize: FontSizes.xs, color: Colors.lavender, marginTop: 4 },
  planActions: { marginLeft: Spacing.sm },
  planDaysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  dayChip: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    alignItems: 'center',
  },
  dayChipText: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  dayChipCount: { fontSize: 10, color: Colors.lavender },
  deleteBtn: { alignSelf: 'flex-start', paddingVertical: 4 },
  deleteBtnText: { fontSize: FontSizes.xs, color: Colors.error },
  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.error,
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: Spacing.lg,
  },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
    marginTop: Spacing.sm,
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
    marginBottom: Spacing.sm,
  },
  inputRow: { flexDirection: 'row', gap: Spacing.sm },
  inputGroup: { flex: 1 },
  dayTabsScroll: { marginBottom: Spacing.sm },
  dayTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    marginRight: Spacing.xs,
    alignItems: 'center',
  },
  dayTabActive: { backgroundColor: Colors.violet },
  dayTabText: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  dayTabTextActive: { color: Colors.textPrimary },
  dayTabCount: { fontSize: 10, color: Colors.lavender, marginTop: 2 },
  exerciseList: { marginBottom: Spacing.sm },
  exerciseItem: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: 4 },
  addExBtn: {
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  addExBtnText: { fontSize: FontSizes.sm, color: Colors.lavender, fontWeight: '600' },
  modalButtons: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  cancelModalText: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textSecondary },
  saveModalBtn: { flex: 1, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  saveModalGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveModalText: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary },
});
