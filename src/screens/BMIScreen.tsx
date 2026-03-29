/**
 * @file BMIScreen.tsx
 * @module screens/BMIScreen
 * @description BMI calculator screen — computes Body Mass Index from the user's
 * height and weight and places the result on a categorised scale.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Gradients, Spacing, BorderRadius, FontSizes, Shadows } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import AnimatedEntry from '../components/AnimatedEntry';
import SectionHeader from '../components/SectionHeader';
import AnimatedEmptyState from '../components/AnimatedEmptyState';

// ─── Calculation Helpers ────────────────────────────────────────────────────

export function calcBMI(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return weightKg / (h * h);
}

export function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#60A5FA' };
  if (bmi < 25) return { label: 'Normal', color: Colors.sageLeaf };
  if (bmi < 30) return { label: 'Overweight', color: '#FBBF24' };
  return { label: 'Obese', color: Colors.error };
}

// Mifflin-St Jeor
export function calcBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female' | 'other',
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'female' ? base - 161 : base + 5;
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

export function calcTDEE(bmr: number, activityLevel: string): number {
  return bmr * (ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2);
}

// Devine formula
export function calcIdealWeight(
  heightCm: number,
  gender: 'male' | 'female' | 'other',
): [number, number] {
  const inchesOver5Ft = Math.max(heightCm / 2.54 - 60, 0);
  const base = gender === 'female' ? 45.5 : 50;
  const mid = base + 2.3 * inchesOver5Ft;
  return [mid * 0.9, mid * 1.1];
}

function getAgeFromDob(dob: string | null): number {
  if (!dob) return 30;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return Math.max(age, 1);
}

// ─── BMI Gauge ───────────────────────────────────────────────────────────────

function BMIGauge({ bmi }: { bmi: number }) {
  const { label, color } = bmiCategory(bmi);
  const clamped = Math.min(Math.max(bmi, 10), 40);
  const pct = (clamped - 10) / 30; // 10–40 range
  const zones = [
    { label: 'Underweight', color: '#60A5FA', from: 0, to: 0.283 }, // 10–18.5
    { label: 'Normal', color: Colors.sageLeaf, from: 0.283, to: 0.5 }, // 18.5–25
    { label: 'Overweight', color: '#FBBF24', from: 0.5, to: 0.667 }, // 25–30
    { label: 'Obese', color: Colors.error, from: 0.667, to: 1 }, // 30–40
  ];

  return (
    <View style={gaugeStyles.container}>
      <View style={gaugeStyles.bar}>
        {zones.map((z) => (
          <View
            key={z.label}
            style={[
              gaugeStyles.zone,
              {
                flex: z.to - z.from,
                backgroundColor: z.color,
                opacity: 0.7,
              },
            ]}
          />
        ))}
        <View style={[gaugeStyles.needle, { left: `${pct * 100}%` as any }]} />
      </View>
      <View style={gaugeStyles.labels}>
        {zones.map((z) => (
          <Text
            key={z.label}
            style={[gaugeStyles.zoneLabel, { flex: z.to - z.from, color: z.color }]}
          >
            {z.label}
          </Text>
        ))}
      </View>
      <Text style={[gaugeStyles.value, { color }]}>
        BMI: {bmi.toFixed(1)} — <Text style={{ fontWeight: '700' }}>{label}</Text>
      </Text>
    </View>
  );
}

const gaugeStyles = StyleSheet.create({
  container: { marginVertical: Spacing.md },
  bar: {
    flexDirection: 'row',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.card,
    position: 'relative',
  },
  zone: { height: 20 },
  needle: {
    position: 'absolute',
    top: -4,
    width: 4,
    height: 28,
    backgroundColor: Colors.textPrimary,
    borderRadius: 2,
    marginLeft: -2,
  },
  labels: { flexDirection: 'row', marginTop: 6 },
  zoneLabel: { fontSize: 9, textAlign: 'center' },
  value: { fontSize: FontSizes.md, fontWeight: '600', textAlign: 'center', marginTop: Spacing.sm },
});

// ─── Weight Entry Row ─────────────────────────────────────────────────────────

interface WeightLog {
  id: string;
  weight_kg: number;
  logged_at: string;
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

const ACTIVITY_OPTIONS = [
  { key: 'sedentary', label: 'Sedentary', detail: 'Little/no exercise' },
  { key: 'lightly_active', label: 'Light', detail: '1-3 days/week' },
  { key: 'moderately_active', label: 'Moderate', detail: '3-5 days/week' },
  { key: 'very_active', label: 'Very Active', detail: '6-7 days/week' },
  { key: 'extra_active', label: 'Extra Active', detail: 'Hard daily/physical job' },
];

export default function BMIScreen() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  // Inputs (pre-filled from profile)
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [activityLevel, setActivityLevel] = useState('moderately_active');

  // Weight log state
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logInput, setLogInput] = useState('');

  useEffect(() => {
    if (profile) {
      if (profile.weight_kg) setWeightKg(String(profile.weight_kg));
      if (profile.height_cm) setHeightCm(String(profile.height_cm));
      setAge(String(getAgeFromDob(profile.date_of_birth ?? null)));
      if (profile.gender === 'male' || profile.gender === 'female' || profile.gender === 'other') {
        setGender(profile.gender as 'male' | 'female' | 'other');
      }
      if (profile.activity_level) setActivityLevel(profile.activity_level);
    }
  }, [profile]);

  useEffect(() => {
    if (user) fetchWeightLogs();
  }, [user]);

  const fetchWeightLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', user!.id)
        .order('logged_at', { ascending: false })
        .limit(30);
      if (err) throw err;
      setWeightLogs(data || []);
    } catch {
      setError('Failed to load weight history.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogWeight = async () => {
    const w = parseFloat(logInput);
    if (!w || w <= 0 || !user) return;
    setIsSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error: err } = await supabase
        .from('weight_logs')
        .upsert(
          { user_id: user.id, weight_kg: w, logged_at: today },
          { onConflict: 'user_id,logged_at' },
        );
      if (err) throw err;
      setLogInput('');
      setWeightKg(String(w));
      await fetchWeightLogs();
    } catch {
      setError('Failed to save weight.');
    } finally {
      setIsSaving(false);
    }
  };

  // Computed metrics
  const w = parseFloat(weightKg);
  const h = parseFloat(heightCm);
  const a = parseInt(age);
  const hasValues = w > 0 && h > 0 && a > 0;

  const bmi = hasValues ? calcBMI(w, h) : null;
  const bmr = hasValues ? calcBMR(w, h, a, gender) : null;
  const tdee = bmr ? calcTDEE(bmr, activityLevel) : null;
  const [idealMin, idealMax] = hasValues ? calcIdealWeight(h, gender) : [0, 0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.cosmic as unknown as [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Body Metrics</Text>
        <Text style={styles.subtitle}>BMI, BMR & calorie needs</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Inputs */}
        <AnimatedEntry delay={0}>
          <LinearGradient
            colors={Gradients.card as unknown as [string, string]}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Your Measurements</Text>
            <View style={styles.inputRow}>
              {[
                { label: 'Weight (kg)', val: weightKg, set: setWeightKg },
                { label: 'Height (cm)', val: heightCm, set: setHeightCm },
                { label: 'Age', val: age, set: setAge },
              ].map(({ label, val, set }) => (
                <View key={label} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{label}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={val}
                    onChangeText={set}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              ))}
            </View>
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.genderRow}>
              {(['male', 'female', 'other'] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.chip, gender === g && styles.chipActive]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>
        </AnimatedEntry>

        {/* BMI Gauge */}
        {bmi !== null && (
          <AnimatedEntry delay={50}>
            <LinearGradient
              colors={Gradients.card as unknown as [string, string]}
              style={styles.card}
            >
              <Text style={styles.cardTitle}>BMI Analysis</Text>
              <BMIGauge bmi={bmi} />
              {hasValues && (
                <Text style={styles.idealText}>
                  Ideal weight for your height: {idealMin.toFixed(1)}–{idealMax.toFixed(1)} kg
                </Text>
              )}
            </LinearGradient>
          </AnimatedEntry>
        )}

        {/* Activity & Calorie Needs */}
        <AnimatedEntry delay={100}>
          <LinearGradient
            colors={Gradients.card as unknown as [string, string]}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Calorie Needs</Text>
            <Text style={styles.inputLabel}>Activity Level</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: Spacing.md }}
            >
              {ACTIVITY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.activityChip,
                    activityLevel === opt.key && styles.activityChipActive,
                  ]}
                  onPress={() => setActivityLevel(opt.key)}
                >
                  <Text
                    style={[
                      styles.activityLabel,
                      activityLevel === opt.key && styles.activityLabelActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text style={styles.activityDetail}>{opt.detail}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {bmr !== null && tdee !== null ? (
              <View style={styles.metricsRow}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>{Math.round(bmr)}</Text>
                  <Text style={styles.metricLabel}>BMR (kcal)</Text>
                  <Text style={styles.metricSub}>At complete rest</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricBox}>
                  <Text style={[styles.metricValue, { color: Colors.sacredGold }]}>
                    {Math.round(tdee)}
                  </Text>
                  <Text style={styles.metricLabel}>TDEE (kcal)</Text>
                  <Text style={styles.metricSub}>Daily total</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.emptyText}>
                Fill in measurements above to see your calorie needs.
              </Text>
            )}
          </LinearGradient>
        </AnimatedEntry>

        {/* Weight Logging */}
        <SectionHeader title="Weight Journal" emoji="⚖️" />
        <AnimatedEntry delay={150}>
          <LinearGradient
            colors={Gradients.card as unknown as [string, string]}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Log Today's Weight</Text>
            <View style={styles.logRow}>
              <TextInput
                style={[styles.textInput, { flex: 1, marginBottom: 0, marginRight: Spacing.sm }]}
                value={logInput}
                onChangeText={setLogInput}
                keyboardType="decimal-pad"
                placeholder="Weight in kg"
                placeholderTextColor={Colors.textMuted}
              />
              <TouchableOpacity style={styles.logBtn} onPress={handleLogWeight} disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator color={Colors.textPrimary} size="small" />
                ) : (
                  <Text style={styles.logBtnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
            {error && (
              <TouchableOpacity onPress={fetchWeightLogs}>
                <Text style={styles.errorText}>{error} Tap to retry.</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </AnimatedEntry>

        {/* Weight History */}
        <AnimatedEntry delay={200}>
          <LinearGradient
            colors={Gradients.card as unknown as [string, string]}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Weight History (last 30 days)</Text>
            {isLoading ? (
              <ActivityIndicator color={Colors.violet} style={{ marginVertical: Spacing.lg }} />
            ) : weightLogs.length === 0 ? (
              <AnimatedEmptyState
                emoji="⚖️"
                title="No entries yet"
                subtitle="Log your weight above to start tracking!"
              />
            ) : (
              weightLogs.slice(0, 10).map((log) => (
                <View key={log.id} style={styles.logEntry}>
                  <Text style={styles.logDate}>{log.logged_at}</Text>
                  <Text style={styles.logWeight}>{log.weight_kg} kg</Text>
                </View>
              ))
            )}
            {weightLogs.length > 10 && (
              <Text style={styles.moreText}>+{weightLogs.length - 10} more entries</Text>
            )}
          </LinearGradient>
        </AnimatedEntry>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, marginBottom: Spacing.md },
  title: { fontSize: FontSizes.xxxl, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 120 },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  inputRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  inputGroup: { flex: 1 },
  inputLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: 6,
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
    marginBottom: Spacing.sm,
  },
  genderRow: { flexDirection: 'row', gap: Spacing.sm },
  chip: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  chipActive: { backgroundColor: Colors.violet, borderColor: Colors.violet },
  chipText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: Colors.textPrimary },
  idealText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  activityChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
  },
  activityChipActive: { backgroundColor: Colors.violet, borderColor: Colors.violet },
  activityLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '700' },
  activityLabelActive: { color: Colors.textPrimary },
  activityDetail: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  metricsRow: { flexDirection: 'row', alignItems: 'center' },
  metricBox: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm },
  metricDivider: { width: 1, height: 60, backgroundColor: Colors.glassBorder },
  metricValue: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.lavender },
  metricLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  metricSub: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  logRow: { flexDirection: 'row', alignItems: 'center' },
  logBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.violet,
  },
  logBtnText: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.textPrimary },
  logEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.glassBorder,
  },
  logDate: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  logWeight: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.textPrimary },
  emptyText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  moreText: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
