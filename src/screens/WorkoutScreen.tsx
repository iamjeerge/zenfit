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

export default function WorkoutScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('0');
  const [todayExercises, setTodayExercises] = useState<Exercise[]>([]);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);

  const recentSessions: WorkoutSession[] = [
    {
      id: '1',
      date: 'Yesterday',
      exercises: [
        { id: 'a', name: 'Push-ups', sets: 3, reps: 15, weightKg: 0 },
        { id: 'b', name: 'Squats', sets: 4, reps: 12, weightKg: 60 },
      ],
      durationMinutes: 45,
      notes: 'Great session!',
    },
    {
      id: '2',
      date: '2 days ago',
      exercises: [
        { id: 'c', name: 'Deadlift', sets: 3, reps: 8, weightKg: 80 },
        { id: 'd', name: 'Pull-ups', sets: 3, reps: 10, weightKg: 0 },
      ],
      durationMinutes: 60,
      notes: '',
    },
  ];

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
          onPress={() => setIsWorkoutActive((v) => !v)}
          accessibilityLabel={isWorkoutActive ? 'End workout' : 'Start workout'}
        >
          <LinearGradient
            colors={isWorkoutActive ? Gradients.sunrise : Gradients.aurora}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.workoutToggleGradient}
          >
            <Text style={styles.workoutToggleIcon}>{isWorkoutActive ? '🛑' : '🏋️'}</Text>
            <Text style={styles.workoutToggleText}>
              {isWorkoutActive ? 'End Workout' : 'Start Workout'}
            </Text>
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
          {recentSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
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
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sets</Text>
                <TextInput
                  style={styles.textInput}
                  value={sets}
                  onChangeText={setSets}
                  keyboardType="number-pad"
                  placeholder="3"
                  placeholderTextColor={Colors.textMuted}
                  accessibilityLabel="Sets input"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  style={styles.textInput}
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="number-pad"
                  placeholder="10"
                  placeholderTextColor={Colors.textMuted}
                  accessibilityLabel="Reps input"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.textInput}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  accessibilityLabel="Weight input"
                />
              </View>
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
  inputGroup: {
    flex: 1,
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
});
