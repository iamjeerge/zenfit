import React, { useState, useEffect, useRef } from 'react';
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
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? '';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

interface AIExercise {
  name: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  muscle_group: string;
  tips: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weightKg: number;
}

interface WorkoutSession {
  id: string;
  date: string;
  exercises: Exercise[];
  durationMinutes: number;
  notes: string;
}

const PRESET_EXERCISES = [
  { name: 'Push-ups', emoji: '💪' },
  { name: 'Squats', emoji: '🦵' },
  { name: 'Pull-ups', emoji: '🏋️' },
  { name: 'Deadlift', emoji: '🔩' },
  { name: 'Bench Press', emoji: '🏋️‍♂️' },
  { name: 'Plank', emoji: '🧘' },
];

interface NumberInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType: 'number-pad' | 'decimal-pad';
  accessibilityLabel: string;
}

const NumberInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  accessibilityLabel,
}: NumberInputProps) => (
  <View style={numberInputStyles.group}>
    <Text style={numberInputStyles.label}>{label}</Text>
    <TextInput
      style={numberInputStyles.input}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={Colors.textMuted}
      accessibilityLabel={accessibilityLabel}
    />
  </View>
);

const numberInputStyles = StyleSheet.create({
  group: {
    flex: 1,
  },
  label: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  input: {
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
});

export default function WorkoutScreen() {
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('0');
  const [todayExercises, setTodayExercises] = useState<Exercise[]>([]);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [aiExercises, setAiExercises] = useState<AIExercise[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workoutStartTime = useRef<Date | null>(null);

  useEffect(() => {
    if (user) fetchRecentSessions();
  }, [user]);

  const fetchRecentSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user!.id)
        .order('started_at', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;
      const sessions: WorkoutSession[] = (data || []).map((row: any) => ({
        id: row.id,
        date: new Date(row.started_at).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        exercises: Array.isArray(row.exercises) ? row.exercises : [],
        durationMinutes: row.duration_minutes ?? 0,
        notes: row.notes ?? '',
      }));
      setRecentSessions(sessions);
    } catch (err: any) {
      setError('Failed to load sessions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkoutToggle = async () => {
    if (!isWorkoutActive) {
      workoutStartTime.current = new Date();
      setIsWorkoutActive(true);
      return;
    }

    // End workout — save to Supabase
    if (!user) { setIsWorkoutActive(false); return; }
    setIsSaving(true);
    const startedAt = workoutStartTime.current ?? new Date();
    const durationMinutes = Math.round((Date.now() - startedAt.getTime()) / 60000);
    const newSession: Omit<WorkoutSession, 'id' | 'date'> & { user_id: string; started_at: string; completed_at: string; duration_minutes: number } = {
      user_id: user.id,
      exercises: todayExercises,
      durationMinutes,
      duration_minutes: durationMinutes,
      notes: '',
      started_at: startedAt.toISOString(),
      completed_at: new Date().toISOString(),
    };

    // Optimistic update
    const optimistic: WorkoutSession = {
      id: `temp-${Date.now()}`,
      date: 'Just now',
      exercises: todayExercises,
      durationMinutes,
      notes: '',
    };
    setRecentSessions((prev) => [optimistic, ...prev]);
    setTodayExercises([]);
    setIsWorkoutActive(false);

    try {
      const { data, error: saveError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: newSession.user_id,
          exercises: newSession.exercises,
          duration_minutes: newSession.duration_minutes,
          notes: newSession.notes,
          started_at: newSession.started_at,
          completed_at: newSession.completed_at,
        })
        .select()
        .single();

      if (saveError) throw saveError;
      // Replace optimistic entry with real one
      setRecentSessions((prev) =>
        prev.map((s) =>
          s.id === optimistic.id
            ? { ...optimistic, id: data.id }
            : s
        )
      );
    } catch {
      setError('Failed to save workout. Check your connection.');
      // Remove optimistic entry on failure
      setRecentSessions((prev) => prev.filter((s) => s.id !== optimistic.id));
    } finally {
      setIsSaving(false);
    }
  };

  const generateAIWorkout = async () => {
    if (!CLAUDE_API_KEY) {
      Alert.alert('API key not configured', 'Set EXPO_PUBLIC_CLAUDE_API_KEY in your .env file.');
      return;
    }
    setIsGeneratingAI(true);
    setAiError(null);
    try {
      const goal = profile?.fitness_goal ?? 'stay_fit';
      const level = profile?.level ?? 1;
      const prompt = `You are a professional fitness coach. Create a workout for someone with goal: ${goal}, level: ${level}.
Return ONLY a JSON array with exactly 4-5 exercises. Format: [{"name":"string","sets":number,"reps":number,"rest_seconds":number,"muscle_group":"string","tips":"string"}]
No explanation, no markdown, just the JSON array.`;

      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const text: string = data.content?.[0]?.text ?? '[]';
      const exercises: AIExercise[] = JSON.parse(text);
      setAiExercises(exercises);
    } catch {
      setAiError('Failed to generate workout. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const applyAIWorkout = () => {
    const mapped: Exercise[] = aiExercises.map((ex, i) => ({
      id: `ai-${i}-${Date.now()}`,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      weightKg: 0,
    }));
    setTodayExercises(mapped);
    setAiExercises([]);
    if (!isWorkoutActive) setIsWorkoutActive(true);
  };

  const handleAddExercise = () => {
    if (!exerciseName.trim()) return;
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName.trim(),
      sets: parseInt(sets, 10) || 3,
      reps: parseInt(reps, 10) || 10,
      weightKg: parseFloat(weight) || 0,
    };
    setTodayExercises((prev) => [...prev, newExercise]);
    setModalVisible(false);
    setExerciseName('');
    setSets('3');
    setReps('10');
    setWeight('0');
  };

  const handleQuickAdd = (name: string) => {
    setExerciseName(name);
    setModalVisible(true);
  };

  const handleRemoveExercise = (id: string) => {
    setTodayExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const totalVolume = todayExercises.reduce(
    (sum, e) => sum + (e.weightKg > 0 ? e.sets * e.reps * e.weightKg : 0),
    0
  );

  const ExerciseCard = ({ exercise }: { exercise: Exercise }) => (
    <LinearGradient
      colors={Gradients.cardSecondary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.exerciseCard, { borderColor: Colors.glassBorder }]}
    >
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseMeta}>
          {exercise.sets} sets × {exercise.reps} reps
          {exercise.weightKg > 0 ? ` @ ${exercise.weightKg} kg` : ''}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveExercise(exercise.id)}
        accessibilityLabel="Remove exercise"
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </LinearGradient>
  );

  const SessionCard = ({ session }: { session: WorkoutSession }) => (
    <LinearGradient
      colors={Gradients.cardSecondary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.sessionCard, { borderColor: Colors.glassBorder }]}
    >
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionDate}>{session.date}</Text>
        <Text style={styles.sessionDuration}>⏱ {session.durationMinutes} min</Text>
      </View>
      <Text style={styles.sessionExerciseCount}>
        {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
      </Text>
      {session.exercises.map((ex) => (
        <Text key={ex.id} style={styles.sessionExerciseItem}>
          • {ex.name}: {ex.sets}×{ex.reps}
          {ex.weightKg > 0 ? ` @ ${ex.weightKg} kg` : ''}
        </Text>
      ))}
      {session.notes ? (
        <Text style={styles.sessionNotes}>💬 {session.notes}</Text>
      ) : null}
    </LinearGradient>
  );

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
          <Text style={styles.title}>Workout Tracker</Text>
          <Text style={styles.subtitle}>Build strength. Track progress.</Text>
        </View>

        {/* Start / Stop Workout Button */}
        <TouchableOpacity
          style={styles.workoutToggle}
          onPress={handleWorkoutToggle}
          disabled={isSaving}
          accessibilityLabel={isWorkoutActive ? 'End workout' : 'Start workout'}
        >
          <LinearGradient
            colors={isWorkoutActive ? Gradients.sunrise : Gradients.aurora}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.workoutToggleGradient}
          >
            {isSaving ? (
              <ActivityIndicator color={Colors.textPrimary} />
            ) : (
              <>
                <Text style={styles.workoutToggleIcon}>{isWorkoutActive ? '🛑' : '🏋️'}</Text>
                <Text style={styles.workoutToggleText}>
                  {isWorkoutActive ? 'End Workout' : 'Start Workout'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Today's Summary */}
        <View style={styles.summaryRow}>
          <LinearGradient
            colors={Gradients.cardPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.summaryCard, { borderColor: Colors.glassBorder }]}
          >
            <Text style={styles.summaryIcon}>🏋️</Text>
            <Text style={styles.summaryValue}>{todayExercises.length}</Text>
            <Text style={styles.summaryLabel}>Exercises</Text>
          </LinearGradient>
          <LinearGradient
            colors={Gradients.cardPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.summaryCard, { borderColor: Colors.glassBorder }]}
          >
            <Text style={styles.summaryIcon}>🔥</Text>
            <Text style={styles.summaryValue}>{totalVolume.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Volume (kg)</Text>
          </LinearGradient>
          <LinearGradient
            colors={Gradients.cardPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.summaryCard, { borderColor: Colors.glassBorder }]}
          >
            <Text style={styles.summaryIcon}>✅</Text>
            <Text style={styles.summaryValue}>
              {todayExercises.reduce((s, e) => s + e.sets, 0)}
            </Text>
            <Text style={styles.summaryLabel}>Total Sets</Text>
          </LinearGradient>
        </View>

        {/* AI Recommendation */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>🤖 AI Recommendation</Text>
          </View>
          <LinearGradient
            colors={['rgba(124,58,237,0.2)', 'rgba(196,181,253,0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.aiCard, { borderColor: Colors.violetLight + '40' }]}
          >
            {aiExercises.length > 0 ? (
              <>
                <Text style={styles.aiTitle}>✨ Your personalised workout is ready!</Text>
                {aiExercises.map((ex, i) => (
                  <View key={i} style={styles.aiExerciseRow}>
                    <Text style={styles.aiExerciseName}>{ex.name}</Text>
                    <Text style={styles.aiExerciseMeta}>
                      {ex.sets}×{ex.reps} · {ex.muscle_group}
                    </Text>
                    {ex.tips ? <Text style={styles.aiExerciseTip}>💡 {ex.tips}</Text> : null}
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.aiApplyBtn}
                  onPress={applyAIWorkout}
                  accessibilityLabel="Start AI workout"
                >
                  <LinearGradient
                    colors={Gradients.aurora as unknown as [string, string, ...string[]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.aiApplyGradient}
                  >
                    <Text style={styles.aiApplyText}>🏋️ Start This Workout</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.aiDescription}>
                  Get a personalised workout plan based on your fitness goal and level.
                </Text>
                {aiError ? <Text style={styles.aiError}>{aiError}</Text> : null}
                <TouchableOpacity
                  style={styles.aiGenerateBtn}
                  onPress={generateAIWorkout}
                  disabled={isGeneratingAI}
                  accessibilityLabel="Generate AI workout"
                >
                  <LinearGradient
                    colors={Gradients.auroraSubtle as unknown as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.aiGenerateGradient}
                  >
                    {isGeneratingAI ? (
                      <>
                        <ActivityIndicator color={Colors.textPrimary} size="small" />
                        <Text style={styles.aiGenerateText}>Generating…</Text>
                      </>
                    ) : (
                      <Text style={styles.aiGenerateText}>✨ Generate Workout</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </LinearGradient>
        </View>

        {/* Quick-add presets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.presetsGrid}>
            {PRESET_EXERCISES.map((preset) => (
              <TouchableOpacity
                key={preset.name}
                style={styles.presetChip}
                onPress={() => handleQuickAdd(preset.name)}
                accessibilityLabel={`Add ${preset.name}`}
              >
                <LinearGradient
                  colors={Gradients.cardSecondary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.presetChipGradient, { borderColor: Colors.glassBorder }]}
                >
                  <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                  <Text style={styles.presetName}>{preset.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Exercises */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Today's Exercises</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
              accessibilityLabel="Add exercise"
            >
              <LinearGradient
                colors={Gradients.auroraSubtle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addButtonGradient}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {todayExercises.length === 0 ? (
            <LinearGradient
              colors={Gradients.cardSecondary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.emptyState, { borderColor: Colors.glassBorder }]}
            >
              <Text style={styles.emptyStateEmoji}>🏋️‍♀️</Text>
              <Text style={styles.emptyStateText}>No exercises logged yet.</Text>
              <Text style={styles.emptyStateHint}>Tap "+ Add" or use Quick Add above.</Text>
            </LinearGradient>
          ) : (
            todayExercises.map((ex) => <ExerciseCard key={ex.id} exercise={ex} />)
          )}
        </View>

        {/* Recent Sessions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {error ? (
            <TouchableOpacity onPress={fetchRecentSessions}>
              <Text style={styles.errorText}>{error} Tap to retry.</Text>
            </TouchableOpacity>
          ) : isLoading ? (
            <ActivityIndicator color={Colors.violet} style={{ marginVertical: Spacing.lg }} />
          ) : recentSessions.length === 0 ? (
            <Text style={styles.emptyStateHint}>No sessions logged yet. Start your first workout!</Text>
          ) : (
            recentSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Exercise Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
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
            <Text style={styles.modalTitle}>Add Exercise</Text>

            <Text style={styles.inputLabel}>Exercise Name</Text>
            <TextInput
              style={styles.textInput}
              value={exerciseName}
              onChangeText={setExerciseName}
              placeholder="e.g. Push-ups"
              placeholderTextColor={Colors.textMuted}
              accessibilityLabel="Exercise name input"
            />

            <View style={styles.inputRow}>
              <NumberInput
                label="Sets"
                value={sets}
                onChangeText={setSets}
                placeholder="3"
                keyboardType="number-pad"
                accessibilityLabel="Sets input"
              />
              <NumberInput
                label="Reps"
                value={reps}
                onChangeText={setReps}
                placeholder="10"
                keyboardType="number-pad"
                accessibilityLabel="Reps input"
              />
              <NumberInput
                label="Weight (kg)"
                value={weight}
                onChangeText={setWeight}
                placeholder="0"
                keyboardType="decimal-pad"
                accessibilityLabel="Weight input"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
                accessibilityLabel="Cancel"
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleAddExercise}
                accessibilityLabel="Save exercise"
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
  workoutToggle: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  workoutToggleGradient: {
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  workoutToggleIcon: {
    fontSize: 22,
  },
  workoutToggleText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.glassBackground,
    ...Shadows.card,
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  summaryLabel: {
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  presetChip: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  presetChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  presetEmoji: {
    fontSize: 16,
  },
  presetName: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  addButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  addButtonGradient: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  addButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  exerciseCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.glassBackground,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.card,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  exerciseMeta: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(248, 113, 113, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.error,
    fontWeight: '700',
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.glassBackground,
    ...Shadows.card,
  },
  emptyStateEmoji: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  emptyStateText: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  emptyStateHint: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  sessionCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.glassBackground,
    ...Shadows.card,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  sessionDate: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sessionDuration: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  sessionExerciseCount: {
    fontSize: FontSizes.sm,
    color: Colors.lavender,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  sessionExerciseItem: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  sessionNotes: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
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
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
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
  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.error,
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  aiCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  aiTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.lavender,
    marginBottom: Spacing.md,
  },
  aiDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  aiError: {
    fontSize: FontSizes.xs,
    color: Colors.error,
    marginBottom: Spacing.sm,
  },
  aiExerciseRow: {
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  aiExerciseName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  aiExerciseMeta: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  aiExerciseTip: {
    fontSize: FontSizes.xs,
    color: Colors.lavender,
    marginTop: 4,
    fontStyle: 'italic',
  },
  aiGenerateBtn: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  aiGenerateGradient: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  aiGenerateText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  aiApplyBtn: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  aiApplyGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiApplyText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
