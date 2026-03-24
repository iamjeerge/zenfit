import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Gradients, Spacing, BorderRadius, FontSizes } from '../src/theme/colors';
import { GradientButton } from '../src/components';

export const PENDING_PROFILE_KEY = 'zenfit:pending_profile';

const TOTAL_STEPS = 7;

const FITNESS_GOALS = [
  { key: 'lose_weight', label: '🔥 Lose Weight' },
  { key: 'build_muscle', label: '💪 Build Muscle' },
  { key: 'improve_flexibility', label: '🤸 Flexibility' },
  { key: 'boost_energy', label: '⚡ Boost Energy' },
  { key: 'reduce_stress', label: '🧘 Reduce Stress' },
  { key: 'general_fitness', label: '🏃 General Fitness' },
];

const ACTIVITY_LEVELS = [
  { key: 'sedentary', label: '🪑 Sedentary', sub: 'Little or no exercise' },
  { key: 'lightly_active', label: '🚶 Lightly Active', sub: '1–3 days/week' },
  { key: 'moderately_active', label: '🏃 Moderately Active', sub: '3–5 days/week' },
  { key: 'very_active', label: '🏋️ Very Active', sub: '6–7 days/week' },
  { key: 'extra_active', label: '⚡ Extra Active', sub: 'Twice daily training' },
];

const WORKOUT_OPTIONS = ['🧘 Yoga', '🏋️ Strength', '🏃 Running', '⚡ HIIT', '🚴 Cycling', '🏊 Swimming', '🤸 Pilates', '🥊 Boxing'];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0-indexed, 0 = "Step 1 of 7"

  // Step 2: About You
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(null);

  // Step 3: Body Metrics
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // Step 4: Fitness Goal
  const [fitnessGoal, setFitnessGoal] = useState('');

  // Step 5: Activity Level
  const [activityLevel, setActivityLevel] = useState('');

  // Step 6: Workout Types
  const [workoutTypes, setWorkoutTypes] = useState<string[]>([]);

  // Step 7: Sleep & Reminders
  const [bedtime, setBedtime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [enableReminders, setEnableReminders] = useState(true);

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      await handleFinish();
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/auth');
  };

  const handleFinish = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const pending = {
      full_name: name.trim() || null,
      date_of_birth: dob.trim() || null,
      gender: gender || null,
      height_cm: height ? parseFloat(height) : null,
      weight_kg: weight ? parseFloat(weight) : null,
      fitness_goal: fitnessGoal || null,
      activity_level: activityLevel || null,
    };
    await AsyncStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(pending));
    router.replace('/auth');
  };

  const toggleWorkoutType = (type: string) => {
    setWorkoutTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // ── Render helpers ──────────────────────────────────────────────────

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` as any }]} />
      </View>
      <Text style={styles.progressLabel}>Step {step + 1} of {TOTAL_STEPS}</Text>
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 0: return renderWelcome();
      case 1: return renderAboutYou();
      case 2: return renderBodyMetrics();
      case 3: return renderFitnessGoal();
      case 4: return renderActivityLevel();
      case 5: return renderWorkoutTypes();
      case 6: return renderSleepReminders();
      default: return null;
    }
  };

  const renderWelcome = () => (
    <View style={styles.stepContent}>
      <Text style={styles.bigIcon}>🧘</Text>
      <Text style={styles.stepTitle}>Welcome to ZenFit</Text>
      <Text style={styles.stepSubtitle}>Your Personal Wellness Journey</Text>
      <Text style={styles.stepDescription}>
        Let's personalise your experience in just a few steps. We'll set up your profile so
        you get the most relevant workouts, nutrition goals, and reminders from day one.
      </Text>
      <View style={styles.featureList}>
        {['🏋️  Personalised workouts', '🥗  Smart nutrition goals', '😴  Sleep tracking', '🔔  Smart reminders'].map((f) => (
          <Text key={f} style={styles.featureItem}>{f}</Text>
        ))}
      </View>
    </View>
  );

  const renderAboutYou = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kaView}>
      <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.bigIcon}>👤</Text>
        <Text style={styles.stepTitle}>About You</Text>
        <Text style={styles.stepDescription}>Tell us a little about yourself</Text>

        <Text style={styles.fieldLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor={Colors.textMuted}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <Text style={styles.fieldLabel}>Date of Birth</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Colors.textMuted}
          value={dob}
          onChangeText={setDob}
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.fieldLabel}>Gender</Text>
        <View style={styles.chipRow}>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderBodyMetrics = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kaView}>
      <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.bigIcon}>📏</Text>
        <Text style={styles.stepTitle}>Body Metrics</Text>
        <Text style={styles.stepDescription}>
          Used to calculate your BMI, daily calorie goal, and ideal weight range
        </Text>

        <Text style={styles.fieldLabel}>Height (cm)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 175"
          placeholderTextColor={Colors.textMuted}
          keyboardType="decimal-pad"
          value={height}
          onChangeText={setHeight}
        />

        <Text style={styles.fieldLabel}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 70"
          placeholderTextColor={Colors.textMuted}
          keyboardType="decimal-pad"
          value={weight}
          onChangeText={setWeight}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderFitnessGoal = () => (
    <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.bigIcon}>🎯</Text>
      <Text style={styles.stepTitle}>Fitness Goal</Text>
      <Text style={styles.stepDescription}>What do you most want to achieve?</Text>

      <View style={styles.chipGrid}>
        {FITNESS_GOALS.map((g) => (
          <TouchableOpacity
            key={g.key}
            style={[styles.chip, styles.chipWide, fitnessGoal === g.key && styles.chipActive]}
            onPress={() => setFitnessGoal(g.key)}
          >
            <Text style={[styles.chipText, fitnessGoal === g.key && styles.chipTextActive]}>
              {g.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderActivityLevel = () => (
    <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.bigIcon}>⚡</Text>
      <Text style={styles.stepTitle}>Activity Level</Text>
      <Text style={styles.stepDescription}>How active are you currently?</Text>

      {ACTIVITY_LEVELS.map((a) => (
        <TouchableOpacity
          key={a.key}
          style={[styles.optionRow, activityLevel === a.key && styles.optionRowActive]}
          onPress={() => setActivityLevel(a.key)}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.optionLabel, activityLevel === a.key && styles.chipTextActive]}>
              {a.label}
            </Text>
            <Text style={styles.optionSub}>{a.sub}</Text>
          </View>
          {activityLevel === a.key && (
            <Text style={{ color: Colors.lavender, fontSize: 18 }}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderWorkoutTypes = () => (
    <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.bigIcon}>💪</Text>
      <Text style={styles.stepTitle}>Workout Preferences</Text>
      <Text style={styles.stepDescription}>Select all types you enjoy</Text>

      <View style={styles.chipGrid}>
        {WORKOUT_OPTIONS.map((w) => (
          <TouchableOpacity
            key={w}
            style={[styles.chip, workoutTypes.includes(w) && styles.chipActive]}
            onPress={() => toggleWorkoutType(w)}
          >
            <Text style={[styles.chipText, workoutTypes.includes(w) && styles.chipTextActive]}>
              {w}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderSleepReminders = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kaView}>
      <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.bigIcon}>😴</Text>
        <Text style={styles.stepTitle}>Sleep Schedule</Text>
        <Text style={styles.stepDescription}>
          Help us track and improve your sleep quality
        </Text>

        <Text style={styles.fieldLabel}>Bedtime (HH:MM)</Text>
        <TextInput
          style={styles.input}
          placeholder="22:30"
          placeholderTextColor={Colors.textMuted}
          value={bedtime}
          onChangeText={setBedtime}
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.fieldLabel}>Wake Time (HH:MM)</Text>
        <TextInput
          style={styles.input}
          placeholder="06:30"
          placeholderTextColor={Colors.textMuted}
          value={wakeTime}
          onChangeText={setWakeTime}
          keyboardType="numbers-and-punctuation"
        />

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Enable Reminders</Text>
            <Text style={styles.optionSub}>Daily nudges to stay on track</Text>
          </View>
          <Switch
            value={enableReminders}
            onValueChange={setEnableReminders}
            trackColor={{ false: Colors.card, true: Colors.violet }}
            thumbColor={Colors.moonlight}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ── Layout ──────────────────────────────────────────────────────────

  const isLastStep = step === TOTAL_STEPS - 1;
  const showBack = step > 0;
  const showSkip = step >= 1;

  return (
    <LinearGradient
      colors={Gradients.cosmic}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Header row */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={handleBack}
          disabled={!showBack}
          activeOpacity={0.7}
        >
          {showBack && <Text style={styles.backText}>← Back</Text>}
        </TouchableOpacity>

        {showSkip && (
          <TouchableOpacity style={styles.headerBtn} onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress */}
      {renderProgressBar()}

      {/* Content */}
      <View style={styles.contentArea}>
        {renderStep()}
      </View>

      {/* CTA */}
      <View style={styles.buttonContainer}>
        <GradientButton
          title={isLastStep ? 'Get Started 🚀' : 'Next →'}
          onPress={handleNext}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: Spacing.lg,
  },
  headerBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minWidth: 70,
  },
  backText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    fontWeight: '500',
    textAlign: 'right',
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.card,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.violet,
    borderRadius: 2,
  },
  progressLabel: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
    textAlign: 'right',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  kaView: {
    flex: 1,
    width: '100%',
  },
  stepContent: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    width: '100%',
  },
  bigIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  stepTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.moonlight,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.lavender,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  stepDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  featureList: {
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  featureItem: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.glassBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  fieldLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    width: '100%',
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    width: '100%',
    backgroundColor: Colors.card,
    color: Colors.moonlight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: FontSizes.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    width: '100%',
    justifyContent: 'center',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    width: '100%',
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  chipWide: {
    minWidth: '44%',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    borderColor: Colors.violet,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  chipTextActive: {
    color: Colors.lavender,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.sm,
  },
  optionRowActive: {
    borderColor: Colors.violet,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  optionLabel: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  optionSub: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.md,
  },
});
