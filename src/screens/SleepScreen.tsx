import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
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

type QualityRating = 1 | 2 | 3 | 4 | 5;

interface SleepLog {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  durationHours: number;
  quality: QualityRating;
  notes?: string;
}

interface SleepTip {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

const QUALITY_LABELS: Record<QualityRating, string> = {
  1: 'Terrible',
  2: 'Poor',
  3: 'Fair',
  4: 'Good',
  5: 'Excellent',
};

const QUALITY_EMOJIS: Record<QualityRating, string> = {
  1: '😴',
  2: '😞',
  3: '😐',
  4: '😊',
  5: '🌟',
};

const QUALITY_COLORS: Record<QualityRating, string> = {
  1: Colors.error,
  2: Colors.sunriseOrange,
  3: Colors.sacredGold,
  4: Colors.cosmicBlue,
  5: Colors.sageLeaf,
};

const SLEEP_TIPS: SleepTip[] = [
  {
    id: '1',
    emoji: '🌙',
    title: 'Consistent Schedule',
    description: 'Go to bed and wake up at the same time every day, even on weekends.',
  },
  {
    id: '2',
    emoji: '📵',
    title: 'Screen-Free Wind Down',
    description: 'Avoid screens at least 30 minutes before bed to help your mind relax.',
  },
  {
    id: '3',
    emoji: '❄️',
    title: 'Cool Room',
    description: 'Keep your bedroom between 16–20 °C for optimal sleep quality.',
  },
  {
    id: '4',
    emoji: '🫖',
    title: 'Herbal Tea',
    description: 'Chamomile or valerian root tea before bed promotes deeper sleep.',
  },
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_HOURS = 10;

export default function SleepScreen() {
  const user = useAuthStore((s) => s.user);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [selectedBedtime, setSelectedBedtime] = useState('10:30 PM');
  const [selectedWakeTime, setSelectedWakeTime] = useState('6:30 AM');
  const [selectedQuality, setSelectedQuality] = useState<QualityRating>(4);
  const [todayLog, setTodayLog] = useState<SleepLog | null>(null);
  const [recentLogs, setRecentLogs] = useState<SleepLog[]>([]);
  const [weekData, setWeekData] = useState<{ day: string; hours: number }[]>(
    DAYS_OF_WEEK.map((d) => ({ day: d, hours: 0 }))
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchSleepLogs();
  }, [user]);

  const fetchSleepLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const since = new Date();
      since.setDate(since.getDate() - 14);
      const { data, error: fetchError } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', user!.id)
        .gte('date', since.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      const logs: SleepLog[] = (data || []).map((row: any) => ({
        id: row.id,
        date: new Date(row.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        bedtime: row.bedtime ? new Date(row.bedtime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--',
        wakeTime: row.wake_time ? new Date(row.wake_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--',
        durationHours: parseFloat(row.duration_hours ?? 0),
        quality: (row.quality ?? 3) as QualityRating,
        notes: row.notes ?? undefined,
      }));
      setRecentLogs(logs);

      // Build this week's chart data
      const today = new Date();
      const dayMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().split('T')[0];
        dayMap[key] = 0;
      }
      (data || []).forEach((row: any) => {
        if (dayMap[row.date] !== undefined) {
          dayMap[row.date] = parseFloat(row.duration_hours ?? 0);
        }
      });
      const sorted = Object.entries(dayMap).sort(([a], [b]) => a.localeCompare(b));
      setWeekData(sorted.map(([dateStr, hours]) => ({
        day: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
        hours,
      })));

      if (logs.length > 0) setTodayLog(logs[0]);
    } catch {
      setError('Failed to load sleep data.');
    } finally {
      setIsLoading(false);
    }
  };

  const avgHours = weekData.length > 0
    ? weekData.reduce((sum, d) => sum + d.hours, 0) / weekData.filter((d) => d.hours > 0).length || 0
    : 0;

  const handleSaveLog = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const { error: saveError } = await supabase.from('sleep_logs').insert({
        user_id: user.id,
        bedtime: new Date(`${todayStr} ${selectedBedtime}`).toISOString(),
        wake_time: new Date(`${todayStr} ${selectedWakeTime}`).toISOString(),
        quality: selectedQuality,
        date: todayStr,
      });
      if (saveError) throw saveError;
      setLogModalVisible(false);
      await fetchSleepLogs();
    } catch {
      setError('Failed to save sleep log. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const QualitySelector = () => (
    <View style={styles.qualityRow}>
      {([1, 2, 3, 4, 5] as QualityRating[]).map((q) => (
        <TouchableOpacity
          key={q}
          style={[
            styles.qualityButton,
            selectedQuality === q && {
              backgroundColor: QUALITY_COLORS[q],
              borderColor: QUALITY_COLORS[q],
            },
          ]}
          onPress={() => setSelectedQuality(q)}
          accessibilityLabel={`Quality ${QUALITY_LABELS[q]}`}
        >
          <Text style={styles.qualityEmoji}>{QUALITY_EMOJIS[q]}</Text>
          <Text
            style={[
              styles.qualityLabel,
              selectedQuality === q && { color: Colors.textPrimary },
            ]}
          >
            {QUALITY_LABELS[q]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const SleepLogCard = ({ log }: { log: SleepLog }) => (
    <LinearGradient
      colors={Gradients.cardSecondary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.logCard, { borderColor: Colors.glassBorder }]}
    >
      <View style={styles.logHeader}>
        <View>
          <Text style={styles.logDate}>{log.date}</Text>
          <Text style={styles.logTime}>
            {log.bedtime} → {log.wakeTime}
          </Text>
        </View>
        <View
          style={[
            styles.qualityBadge,
            { backgroundColor: QUALITY_COLORS[log.quality] },
          ]}
        >
          <Text style={styles.qualityBadgeEmoji}>{QUALITY_EMOJIS[log.quality]}</Text>
          <Text style={styles.qualityBadgeText}>{QUALITY_LABELS[log.quality]}</Text>
        </View>
      </View>
      <View style={styles.logStats}>
        <Text style={styles.logDuration}>🌙 {log.durationHours}h sleep</Text>
        {log.notes ? (
          <Text style={styles.logNotes}>💬 {log.notes}</Text>
        ) : null}
      </View>
    </LinearGradient>
  );

  const SleepTipCard = ({ tip }: { tip: SleepTip }) => (
    <LinearGradient
      colors={Gradients.cardSecondary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.tipCard, { borderColor: Colors.glassBorder }]}
    >
      <Text style={styles.tipEmoji}>{tip.emoji}</Text>
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{tip.title}</Text>
        <Text style={styles.tipDescription}>{tip.description}</Text>
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

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sleep Tracker</Text>
          <Text style={styles.subtitle}>Rest well. Recover fully.</Text>
        </View>

        {/* Tonight's Stats */}
        <LinearGradient
          colors={Gradients.cardPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.nightCard, { borderColor: Colors.glassBorder }]}
        >
          <Text style={styles.nightCardTitle}>🌙 Last Night</Text>
          {todayLog ? (
            <View style={styles.nightCardStats}>
              <View style={styles.nightStat}>
                <Text style={styles.nightStatValue}>{todayLog.durationHours}h</Text>
                <Text style={styles.nightStatLabel}>Duration</Text>
              </View>
              <View style={styles.nightStat}>
                <Text style={styles.nightStatValue}>
                  {QUALITY_EMOJIS[todayLog.quality]}
                </Text>
                <Text style={styles.nightStatLabel}>
                  {QUALITY_LABELS[todayLog.quality]}
                </Text>
              </View>
              <View style={styles.nightStat}>
                <Text style={styles.nightStatValue}>{todayLog.wakeTime}</Text>
                <Text style={styles.nightStatLabel}>Wake Time</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noLogText}>No sleep logged yet tonight.</Text>
          )}
          <TouchableOpacity
            style={styles.logSleepButton}
            onPress={() => setLogModalVisible(true)}
            accessibilityLabel="Log sleep"
          >
            <LinearGradient
              colors={Gradients.ocean}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logSleepButtonGradient}
            >
              <Text style={styles.logSleepButtonText}>
                {todayLog ? '✏️ Edit Log' : '+ Log Sleep'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* Weekly Average */}
        <View style={styles.section}>
          <View style={styles.avgRow}>
            <LinearGradient
              colors={Gradients.cardPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.avgCard, { borderColor: Colors.glassBorder }]}
            >
              <Text style={styles.avgIcon}>📊</Text>
              <Text style={styles.avgValue}>{isNaN(avgHours) ? '—' : `${avgHours.toFixed(1)}h`}</Text>
              <Text style={styles.avgLabel}>Weekly Avg</Text>
            </LinearGradient>
            <LinearGradient
              colors={Gradients.cardPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.avgCard, { borderColor: Colors.glassBorder }]}
            >
              <Text style={styles.avgIcon}>🎯</Text>
              <Text style={styles.avgValue}>8h</Text>
              <Text style={styles.avgLabel}>Goal</Text>
            </LinearGradient>
            <LinearGradient
              colors={Gradients.cardPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.avgCard, { borderColor: Colors.glassBorder }]}
            >
              <Text style={styles.avgIcon}>✅</Text>
              <Text style={styles.avgValue}>
                {weekData.filter((d) => d.hours >= 7).length}/{weekData.length}
              </Text>
              <Text style={styles.avgLabel}>Goal Met</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.chart}>
            {weekData.map((d) => (
              <View key={d.day} style={styles.barWrapper}>
                <Text style={styles.barValue}>{d.hours > 0 ? `${d.hours}h` : '—'}</Text>
                <View style={styles.barContainer}>
                  <LinearGradient
                    colors={
                      d.hours >= 8
                        ? Gradients.ocean
                        : d.hours >= 6
                        ? Gradients.auroraSubtle
                        : d.hours > 0
                        ? [Colors.error, Colors.sunriseOrange]
                        : [Colors.glassBackground, Colors.glassBackground]
                    }
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={[styles.bar, { height: `${(d.hours / MAX_HOURS) * 100}%` }]}
                  />
                </View>
                <Text style={styles.barDay}>{d.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Logs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep History</Text>
          {error ? (
            <TouchableOpacity onPress={fetchSleepLogs}>
              <Text style={styles.errorText}>{error} Tap to retry.</Text>
            </TouchableOpacity>
          ) : isLoading ? (
            <ActivityIndicator color={Colors.violet} style={{ marginVertical: Spacing.lg }} />
          ) : recentLogs.length === 0 ? (
            <Text style={styles.noLogText}>No sleep logs yet. Tap "+ Log Sleep" to start!</Text>
          ) : (
            recentLogs.map((log) => <SleepLogCard key={log.id} log={log} />)
          )}
        </View>

        {/* Sleep Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep Tips</Text>
          {SLEEP_TIPS.map((tip) => (
            <SleepTipCard key={tip.id} tip={tip} />
          ))}
        </View>
      </ScrollView>

      {/* Log Sleep Modal */}
      <Modal
        visible={logModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLogModalVisible(false)}
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
            <Text style={styles.modalTitle}>Log Sleep</Text>

            <View style={styles.timeRow}>
              <View style={styles.timeGroup}>
                <Text style={styles.inputLabel}>Bedtime</Text>
                <TouchableOpacity
                  style={styles.timePicker}
                  onPress={() => setSelectedBedtime('10:30 PM')}
                  accessibilityLabel="Select bedtime"
                >
                  <Text style={styles.timePickerText}>{selectedBedtime}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.timeArrow}>→</Text>
              <View style={styles.timeGroup}>
                <Text style={styles.inputLabel}>Wake Time</Text>
                <TouchableOpacity
                  style={styles.timePicker}
                  onPress={() => setSelectedWakeTime('6:30 AM')}
                  accessibilityLabel="Select wake time"
                >
                  <Text style={styles.timePickerText}>{selectedWakeTime}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.inputLabel}>Sleep Quality</Text>
            <QualitySelector />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setLogModalVisible(false)}
                accessibilityLabel="Cancel"
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveLog}
                disabled={isSaving}
                accessibilityLabel="Save sleep log"
              >
                <LinearGradient
                  colors={Gradients.aurora}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalSaveGradient}
                >
                  {isSaving ? (
                    <ActivityIndicator color={Colors.textPrimary} />
                  ) : (
                    <Text style={styles.modalSaveText}>Save</Text>
                  )}
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
  nightCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.glassBackground,
    ...Shadows.card,
  },
  nightCardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  nightCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  nightStat: {
    alignItems: 'center',
  },
  nightStatValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  nightStatLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  noLogText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  logSleepButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  logSleepButtonGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logSleepButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
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
  avgRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  avgCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.glassBackground,
    ...Shadows.card,
  },
  avgIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  avgValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  avgLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 180,
    gap: Spacing.sm,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  barContainer: {
    width: '100%',
    height: 130,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: BorderRadius.sm,
  },
  barDay: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  logCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.glassBackground,
    ...Shadows.card,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  logDate: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  logTime: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  qualityBadgeEmoji: {
    fontSize: 14,
  },
  qualityBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  logStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logDuration: {
    fontSize: FontSizes.sm,
    color: Colors.cosmicBlue,
    fontWeight: '600',
  },
  logNotes: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  tipCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.glassBackground,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    ...Shadows.card,
  },
  tipEmoji: {
    fontSize: 28,
    marginTop: Spacing.xs,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  tipDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  timeGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  timeArrow: {
    fontSize: FontSizes.xl,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
  },
  timePicker: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
  },
  timePickerText: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  qualityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  qualityButton: {
    flex: 1,
    minWidth: 55,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.card,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  qualityEmoji: {
    fontSize: 20,
  },
  qualityLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
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
});
