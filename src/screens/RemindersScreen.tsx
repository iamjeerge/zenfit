import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Text,
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

interface Reminder {
  id: string;
  emoji: string;
  title: string;
  time: string;
  enabled: boolean;
}

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', emoji: '💧', title: 'Water', time: 'Every 2 hours', enabled: true },
    { id: '2', emoji: '🥗', title: 'Breakfast', time: '8:00 AM', enabled: true },
    { id: '3', emoji: '🍜', title: 'Lunch', time: '1:00 PM', enabled: true },
    { id: '4', emoji: '🍲', title: 'Dinner', time: '7:00 PM', enabled: true },
    { id: '5', emoji: '🥑', title: 'Snack', time: '4:00 PM', enabled: true },
    { id: '6', emoji: '💊', title: 'Supplement', time: '9:00 AM', enabled: false },
    { id: '7', emoji: '💪', title: 'Workout', time: '6:00 AM', enabled: true },
    { id: '8', emoji: '🧘', title: 'Meditation', time: '10:00 PM', enabled: true },
    { id: '9', emoji: '😴', title: 'Sleep', time: '11:00 PM', enabled: true },
  ]);

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id
          ? { ...reminder, enabled: !reminder.enabled }
          : reminder
      )
    );
  };

  const ReminderCard = ({ reminder }: { reminder: Reminder }) => (
    <LinearGradient
      colors={Gradients.cardPrimary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.reminderCard, { borderColor: Colors.glassBorder }]}
    >
      <View style={styles.reminderContent}>
        <View style={styles.reminderLeft}>
          <Text style={styles.emoji}>{reminder.emoji}</Text>
          <View style={styles.reminderInfo}>
            <Text style={styles.reminderTitle}>{reminder.title}</Text>
            <Text style={styles.reminderTime}>{reminder.time}</Text>
          </View>
        </View>
        <Switch
          value={reminder.enabled}
          onValueChange={() => toggleReminder(reminder.id)}
          trackColor={{
            false: Colors.textMuted,
            true: Colors.sageLeaf,
          }}
          thumbColor={reminder.enabled ? Colors.sacredGold : Colors.textSecondary}
        />
      </View>
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

      <View style={styles.header}>
        <Text style={styles.title}>Reminders</Text>
        <Text style={styles.subtitle}>Stay on track with daily habits</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {reminders.map((reminder) => (
          <ReminderCard key={reminder.id} reminder={reminder} />
        ))}

        <TouchableOpacity style={styles.addButton}>
          <LinearGradient
            colors={Gradients.aurora}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButtonGradient}
          >
            <Text style={styles.addButtonText}>+ Add Custom Reminder</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  reminderCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.glassBackground,
    ...Shadows.card,
  },
  reminderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  reminderTime: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  addButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  addButtonGradient: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
  },
  addButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
