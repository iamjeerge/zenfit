/**
 * @file RemindersScreen.tsx
 * @module screens/RemindersScreen
 * @description Reminders management screen — allows the user to create, edit,
 * and delete scheduled wellness reminders.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
// expo-notifications removed – scheduled notifications disabled pending react-native-push-notification migration
const Notifications = {
  setNotificationHandler: (_: any) => {},
  requestPermissionsAsync: async () => ({ status: 'denied' as const }),
  getPermissionsAsync: async () => ({ status: 'denied' as const }),
  scheduleNotificationAsync: async (_: any) => 'stub-id',
  cancelScheduledNotificationAsync: async (_: any) => {},
  SchedulableTriggerInputTypes: { CALENDAR: 'calendar' },
};
import * as Haptics from '../utils/haptics';
import { Colors, Gradients, Spacing, BorderRadius, FontSizes, Shadows } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import AnimatedEntry from '../components/AnimatedEntry';

// Show notifications even in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Types ──────────────────────────────────────────────────────────────────

type ReminderType = 'water' | 'workout' | 'sleep' | 'meal' | 'mood' | 'meditation' | 'supplement';

interface Reminder {
  id: string;
  type: ReminderType;
  emoji: string;
  title: string;
  body: string;
  time_hh: number;
  time_mm: number;
  days_of_week: number[];
  enabled: boolean;
  notification_id: string | null;
}

const TEMPLATES: Record<ReminderType, { emoji: string; title: string; body: string }> = {
  water: { emoji: '💧', title: 'Hydration Time', body: 'Time to drink a glass of water!' },
  workout: { emoji: '🏋️', title: 'Workout Time', body: 'Time for your scheduled workout!' },
  sleep: { emoji: '🌙', title: 'Bedtime Soon', body: 'Wind down — your sleep goal is 8 hours.' },
  meal: { emoji: '🍽️', title: 'Meal Reminder', body: 'Log your meal to hit your macros.' },
  mood: {
    emoji: '😊',
    title: 'How are you feeling?',
    body: "Take 10 seconds to log today's mood.",
  },
  meditation: {
    emoji: '🧘',
    title: 'Mindfulness Break',
    body: 'Take a moment to breathe and be present.',
  },
  supplement: { emoji: '💊', title: 'Supplement Reminder', body: 'Time to take your supplements!' },
};

const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7];
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  if ((status as string) !== 'granted') {
    Alert.alert(
      'Notifications Disabled',
      'Enable notifications in Settings to receive reminders.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ],
    );
    return false;
  }
  return true;
}

async function scheduleNotifications(reminder: Reminder): Promise<string> {
  const ids: string[] = [];
  for (const weekday of reminder.days_of_week) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${reminder.emoji} ${reminder.title}`,
        body: reminder.body,
        data: { type: reminder.type },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        weekday,
        hour: reminder.time_hh,
        minute: reminder.time_mm,
        repeats: true,
      },
    });
    ids.push(id);
  }
  return JSON.stringify(ids);
}

async function cancelNotifications(notificationId: string | null): Promise<void> {
  if (!notificationId) return;
  try {
    const ids: string[] = JSON.parse(notificationId);
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  } catch {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
}

function formatTime(hh: number, mm: number): string {
  const period = hh >= 12 ? 'PM' : 'AM';
  const h = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  return `${h}:${String(mm).padStart(2, '0')} ${period}`;
}

const DEFAULT_REMINDERS: Reminder[] = [
  {
    id: 'r-water',
    type: 'water',
    ...TEMPLATES.water,
    time_hh: 9,
    time_mm: 0,
    days_of_week: ALL_DAYS,
    enabled: true,
    notification_id: null,
  },
  {
    id: 'r-workout',
    type: 'workout',
    ...TEMPLATES.workout,
    time_hh: 7,
    time_mm: 0,
    days_of_week: [1, 3, 5],
    enabled: true,
    notification_id: null,
  },
  {
    id: 'r-sleep',
    type: 'sleep',
    ...TEMPLATES.sleep,
    time_hh: 22,
    time_mm: 30,
    days_of_week: ALL_DAYS,
    enabled: true,
    notification_id: null,
  },
  {
    id: 'r-meal',
    type: 'meal',
    ...TEMPLATES.meal,
    time_hh: 13,
    time_mm: 0,
    days_of_week: ALL_DAYS,
    enabled: false,
    notification_id: null,
  },
  {
    id: 'r-mood',
    type: 'mood',
    ...TEMPLATES.mood,
    time_hh: 21,
    time_mm: 0,
    days_of_week: ALL_DAYS,
    enabled: true,
    notification_id: null,
  },
  {
    id: 'r-meditation',
    type: 'meditation',
    ...TEMPLATES.meditation,
    time_hh: 7,
    time_mm: 30,
    days_of_week: [1, 2, 3, 4, 5],
    enabled: false,
    notification_id: null,
  },
  {
    id: 'r-supplement',
    type: 'supplement',
    ...TEMPLATES.supplement,
    time_hh: 9,
    time_mm: 0,
    days_of_week: ALL_DAYS,
    enabled: false,
    notification_id: null,
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RemindersScreen() {
  const user = useAuthStore((s) => s.user);
  const [reminders, setReminders] = useState<Reminder[]>(DEFAULT_REMINDERS);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [editHH, setEditHH] = useState('');
  const [editMM, setEditMM] = useState('');
  const [editDays, setEditDays] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    checkPermission();
    if (user) loadReminders();
  }, [user]);

  const checkPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionGranted((status as string) === 'granted');
  };

  const loadReminders = async () => {
    if (!user) return;
    const { data } = await supabase.from('reminders').select('*').eq('user_id', user.id);
    if (data && data.length > 0) {
      setReminders((prev) =>
        prev.map((r) => {
          const row = (data as any[]).find((d) => d.type === r.type);
          if (!row) return r;
          return {
            ...r,
            time_hh: row.time_hh ?? r.time_hh,
            time_mm: row.time_mm ?? r.time_mm,
            days_of_week: row.days_of_week ?? r.days_of_week,
            enabled: row.enabled ?? r.enabled,
            notification_id: row.notification_id ?? r.notification_id,
          };
        }),
      );
    }
  };

  const persist = async (reminder: Reminder) => {
    if (!user) return;
    await supabase.from('reminders').upsert(
      {
        user_id: user.id,
        type: reminder.type,
        time_hh: reminder.time_hh,
        time_mm: reminder.time_mm,
        days_of_week: reminder.days_of_week,
        enabled: reminder.enabled,
        notification_id: reminder.notification_id,
      },
      { onConflict: 'user_id,type' },
    );
  };

  const handleToggle = async (reminder: Reminder) => {
    if (!permissionGranted && !reminder.enabled) {
      const granted = await requestPermissions();
      if (!granted) return;
      setPermissionGranted(true);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    let updated = { ...reminder, enabled: !reminder.enabled };
    if (updated.enabled) {
      await cancelNotifications(reminder.notification_id);
      const notifId = await scheduleNotifications(updated);
      updated = { ...updated, notification_id: notifId };
    } else {
      await cancelNotifications(reminder.notification_id);
      updated = { ...updated, notification_id: null };
    }
    setReminders((prev) => prev.map((r) => (r.id === reminder.id ? updated : r)));
    await persist(updated);
  };

  const openEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setEditHH(String(reminder.time_hh));
    setEditMM(String(reminder.time_mm));
    setEditDays([...reminder.days_of_week]);
  };

  const saveEdit = async () => {
    if (!editingReminder) return;
    setIsSaving(true);
    const hh = Math.min(Math.max(parseInt(editHH) || 0, 0), 23);
    const mm = Math.min(Math.max(parseInt(editMM) || 0, 0), 59);
    const days = editDays.length > 0 ? editDays : ALL_DAYS;
    let updated: Reminder = { ...editingReminder, time_hh: hh, time_mm: mm, days_of_week: days };
    if (updated.enabled) {
      await cancelNotifications(editingReminder.notification_id);
      const notifId = await scheduleNotifications(updated);
      updated = { ...updated, notification_id: notifId };
    }
    setReminders((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    await persist(updated);
    setEditingReminder(null);
    setIsSaving(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.cosmic as unknown as [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
      />

      <AnimatedEntry delay={0}>
        <View style={styles.header}>
          <Text style={styles.title}>Reminders</Text>
          <Text style={styles.subtitle}>Stay on track with daily habits</Text>
          {permissionGranted === false && (
            <TouchableOpacity onPress={requestPermissions} style={styles.permBanner}>
              <Text style={styles.permText}>🔔 Tap to enable notifications</Text>
            </TouchableOpacity>
          )}
        </View>
      </AnimatedEntry>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {reminders.map((reminder, index) => (
          <AnimatedEntry key={reminder.id} delay={100 + index * 50}>
            <LinearGradient
              colors={Gradients.cardPrimary as unknown as [string, string]}
              style={[styles.reminderCard, { borderColor: Colors.glassBorder }]}
            >
              <View style={styles.reminderContent}>
                <TouchableOpacity style={styles.reminderLeft} onPress={() => openEdit(reminder)}>
                  <Text style={styles.emoji}>{reminder.emoji}</Text>
                  <View style={styles.reminderInfo}>
                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                    <Text style={styles.reminderTime}>
                      {formatTime(reminder.time_hh, reminder.time_mm)}
                    </Text>
                    <View style={styles.daysRow}>
                      {ALL_DAYS.map((d, i) => (
                        <Text
                          key={d}
                          style={[
                            styles.dayDot,
                            reminder.days_of_week.includes(d) && styles.dayDotActive,
                          ]}
                        >
                          {DAY_LABELS[i]}
                        </Text>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
                <Switch
                  value={reminder.enabled}
                  onValueChange={() => handleToggle(reminder)}
                  trackColor={{ false: Colors.textMuted, true: Colors.sageLeaf }}
                  thumbColor={reminder.enabled ? Colors.sacredGold : Colors.textSecondary}
                />
              </View>
            </LinearGradient>
          </AnimatedEntry>
        ))}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={!!editingReminder}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingReminder(null)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#1A1730', '#2D2554']}
            style={[styles.modalContent, { borderColor: Colors.glassBorder }]}
          >
            <Text style={styles.modalTitle}>Edit Reminder</Text>
            <View style={styles.timeRow}>
              <View style={styles.timeGroup}>
                <Text style={styles.inputLabel}>Hour (0–23)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editHH}
                  onChangeText={setEditHH}
                  keyboardType="number-pad"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.timeGroup}>
                <Text style={styles.inputLabel}>Minute (0–59)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editMM}
                  onChangeText={setEditMM}
                  keyboardType="number-pad"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>
            <Text style={styles.inputLabel}>Days of Week</Text>
            <View style={styles.daysEditRow}>
              {ALL_DAYS.map((d, i) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayChip, editDays.includes(d) && styles.dayChipActive]}
                  onPress={() =>
                    setEditDays((prev) =>
                      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
                    )
                  }
                >
                  <Text
                    style={[styles.dayChipText, editDays.includes(d) && styles.dayChipTextActive]}
                  >
                    {DAY_LABELS[i]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingReminder(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveEdit} disabled={isSaving}>
                <LinearGradient
                  colors={Gradients.aurora as unknown as [string, string, ...string[]]}
                  style={styles.saveBtnGradient}
                >
                  {isSaving ? (
                    <ActivityIndicator color={Colors.textPrimary} />
                  ) : (
                    <Text style={styles.saveText}>Save</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary },
  permBanner: {
    backgroundColor: '#F59E0B20',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: '#F59E0B40',
  },
  permText: { fontSize: FontSizes.sm, color: '#F59E0B', fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  scrollContent: { paddingBottom: 120 },
  reminderCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.glassBackground,
    ...Shadows.card,
  },
  reminderContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reminderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  emoji: { fontSize: 32, marginRight: Spacing.md },
  reminderInfo: { flex: 1 },
  reminderTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  reminderTime: { fontSize: FontSizes.sm, color: Colors.lavender, marginBottom: 6 },
  daysRow: { flexDirection: 'row', gap: 4 },
  dayDot: { fontSize: 10, color: Colors.textMuted, width: 16, textAlign: 'center' },
  dayDotActive: { color: Colors.sageLeaf, fontWeight: '700' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    paddingBottom: 48,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  timeRow: { flexDirection: 'row', gap: Spacing.md },
  timeGroup: { flex: 1 },
  inputLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: 6,
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
  },
  daysEditRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  dayChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  dayChipActive: { backgroundColor: Colors.violet, borderColor: Colors.violet },
  dayChipText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  dayChipTextActive: { color: Colors.textPrimary },
  modalButtons: { flexDirection: 'row', gap: Spacing.md },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  cancelText: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textSecondary },
  saveBtn: { flex: 1, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  saveBtnGradient: { paddingVertical: Spacing.md, alignItems: 'center', justifyContent: 'center' },
  saveText: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary },
});
