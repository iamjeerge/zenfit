/**
 * @file HealthReportsScreen.tsx
 * @module screens/HealthReportsScreen
 * @description Monthly health PDF reports — aggregates steps, sleep, mood, workouts,
 * nutrition, and body composition into a visual monthly summary with export capability.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Share,
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
import { BarChart } from '../components/InteractiveChart';
import { useRouter } from '../utils/router';

interface MonthlyReport {
  month: string; // 'YYYY-MM'
  label: string;
  totalSteps: number;
  avgDailySteps: number;
  totalWorkouts: number;
  totalWorkoutMinutes: number;
  avgSleepHours: number;
  avgMoodScore: number;
  waterGoalDays: number;
  meditationMinutes: number;
  weightStart: number | null;
  weightEnd: number | null;
  caloriesBurned: number;
  isGenerated: boolean;
}

interface StoredReport {
  id: string;
  month: string;
  report_data: MonthlyReport;
  created_at: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function HealthReportsScreen() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const router = useRouter();

  const [reports, setReports] = useState<StoredReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user) fetchReports();
  }, [user]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('health_reports')
        .select('*')
        .eq('user_id', user!.id)
        .order('month', { ascending: false })
        .limit(12);

      if (error) throw error;
      setReports(data || []);
      if (data && data.length > 0) {
        setSelectedReport(data[0].report_data);
      }
    } catch {
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (month: string) => {
    if (!user) return;
    setIsGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const startDate = `${month}-01`;
      const endDate = getEndOfMonth(month);

      // Fetch all health data for the month in parallel
      const [stepsRes, workoutsRes, sleepRes, moodRes, waterRes, meditationRes, weightRes] =
        await Promise.all([
          supabase.from('daily_steps').select('steps, calories_burned')
            .eq('user_id', user.id).gte('date', startDate).lte('date', endDate),
          supabase.from('workout_sessions').select('duration_minutes')
            .eq('user_id', user.id).gte('started_at', startDate).lte('started_at', `${endDate}T23:59:59`),
          supabase.from('sleep_logs').select('duration_hours')
            .eq('user_id', user.id).gte('date', startDate).lte('date', endDate),
          supabase.from('mood_journal').select('mood_level')
            .eq('user_id', user.id).gte('date', startDate).lte('date', endDate),
          supabase.from('water_logs').select('glasses, target_glasses')
            .eq('user_id', user.id).gte('date', startDate).lte('date', endDate),
          supabase.from('meditation_sessions').select('duration_minutes')
            .eq('user_id', user.id).gte('completed_at', startDate).lte('completed_at', `${endDate}T23:59:59`),
          supabase.from('weight_logs').select('weight_kg, logged_at')
            .eq('user_id', user.id).gte('logged_at', startDate).lte('logged_at', endDate)
            .order('logged_at', { ascending: true }),
        ]);

      const steps = stepsRes.data || [];
      const workouts = workoutsRes.data || [];
      const sleepLogs = sleepRes.data || [];
      const moods = moodRes.data || [];
      const waterLogs = waterRes.data || [];
      const meditations = meditationRes.data || [];
      const weights = weightRes.data || [];

      const daysInMonth = new Date(parseInt(month.slice(0, 4)), parseInt(month.slice(5, 7)), 0).getDate();
      const [year, monthNum] = month.split('-').map(Number);

      const report: MonthlyReport = {
        month,
        label: `${MONTH_NAMES[monthNum - 1]} ${year}`,
        totalSteps: steps.reduce((sum, s) => sum + (s.steps || 0), 0),
        avgDailySteps: Math.round(steps.reduce((sum, s) => sum + (s.steps || 0), 0) / daysInMonth),
        totalWorkouts: workouts.length,
        totalWorkoutMinutes: workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0),
        avgSleepHours: sleepLogs.length > 0
          ? parseFloat((sleepLogs.reduce((sum, s) => sum + (Number(s.duration_hours) || 0), 0) / sleepLogs.length).toFixed(1))
          : 0,
        avgMoodScore: moods.length > 0
          ? parseFloat((moods.reduce((sum, m) => sum + (m.mood_level || 0), 0) / moods.length).toFixed(1))
          : 0,
        waterGoalDays: waterLogs.filter((w) => w.glasses >= w.target_glasses).length,
        meditationMinutes: meditations.reduce((sum, m) => sum + (m.duration_minutes || 0), 0),
        weightStart: weights.length > 0 ? Number(weights[0].weight_kg) : null,
        weightEnd: weights.length > 0 ? Number(weights[weights.length - 1].weight_kg) : null,
        caloriesBurned: steps.reduce((sum, s) => sum + (s.calories_burned || 0), 0),
        isGenerated: true,
      };

      // Store report
      const { error } = await supabase.from('health_reports').upsert(
        {
          user_id: user.id,
          month,
          report_data: report,
        },
        { onConflict: 'user_id,month' },
      );

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedReport(report);
      fetchReports();
    } catch (err) {
      Alert.alert('Error', 'Could not generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!selectedReport || !profile) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const text = formatReportText(selectedReport, profile.full_name ?? 'User');
    try {
      await Share.share({ message: text, title: `ZenFit Health Report - ${selectedReport.label}` });
    } catch {
      // Share cancelled
    }
  };

  const formatReportText = (report: MonthlyReport, name: string) => {
    const weightChange = report.weightStart && report.weightEnd
      ? (report.weightEnd - report.weightStart).toFixed(1)
      : 'N/A';

    return `🧘 ZenFit Health Report — ${report.label}
━━━━━━━━━━━━━━━━━━━━━
👤 ${name}

🚶 Activity
   Total Steps: ${report.totalSteps.toLocaleString()}
   Avg Daily: ${report.avgDailySteps.toLocaleString()}
   Calories Burned: ${report.caloriesBurned.toLocaleString()} kcal

💪 Workouts
   Sessions: ${report.totalWorkouts}
   Total Time: ${report.totalWorkoutMinutes} min

😴 Sleep
   Avg Duration: ${report.avgSleepHours} hrs

😊 Mood
   Avg Score: ${report.avgMoodScore}/5

💧 Hydration
   Goal Days: ${report.waterGoalDays}

🧘 Meditation
   Total: ${report.meditationMinutes} min

⚖️ Weight
   Start: ${report.weightStart ?? 'N/A'} kg
   End: ${report.weightEnd ?? 'N/A'} kg
   Change: ${weightChange} kg
━━━━━━━━━━━━━━━━━━━━━
Generated by ZenFit`;
  };

  const getEndOfMonth = (month: string) => {
    const [year, m] = month.split('-').map(Number);
    const lastDay = new Date(year, m, 0).getDate();
    return `${month}-${lastDay.toString().padStart(2, '0')}`;
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const getRecentMonths = () => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`);
    }
    return months;
  };

  const getMoodEmoji = (score: number) => {
    if (score >= 4.5) return '😄';
    if (score >= 3.5) return '😊';
    if (score >= 2.5) return '😐';
    if (score >= 1.5) return '😞';
    return '😢';
  };

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
            <Text style={styles.title}>Health Reports</Text>
            <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
              <Text style={styles.shareText}>📤</Text>
            </TouchableOpacity>
          </View>
        </AnimatedEntry>

        {/* Month Selector */}
        <AnimatedEntry delay={100}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.monthRow}
          >
            {getRecentMonths().map((m) => {
              const [y, mo] = m.split('-').map(Number);
              const isSelected = selectedReport?.month === m;
              const hasReport = reports.some((r) => r.month === m);
              return (
                <TouchableOpacity
                  key={m}
                  onPress={() => {
                    Haptics.selectionAsync();
                    const stored = reports.find((r) => r.month === m);
                    if (stored) {
                      setSelectedReport(stored.report_data);
                    } else {
                      generateReport(m);
                    }
                  }}
                  style={[styles.monthBtn, isSelected && styles.monthBtnActive]}
                >
                  <Text style={[styles.monthLabel, isSelected && styles.monthLabelActive]}>
                    {MONTH_NAMES[mo - 1].slice(0, 3)}
                  </Text>
                  <Text style={[styles.monthYear, isSelected && styles.monthLabelActive]}>
                    {y}
                  </Text>
                  {hasReport && <View style={styles.monthDot} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </AnimatedEntry>

        {isLoading ? (
          <SkeletonLoader variant="default" />
        ) : !selectedReport ? (
          <AnimatedEntry delay={200}>
            <View style={styles.emptyContainer}>
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>📊</Text>
                <Text style={styles.emptyTitle}>No reports yet</Text>
                <Text style={styles.emptySubtitle}>
                  Select a month above to generate your health report
                </Text>
                <GradientButton
                  title="Generate This Month"
                  onPress={() => generateReport(getCurrentMonth())}
                  loading={isGenerating}
                  variant="primary"
                  icon="📋"
                />
              </GlassCard>
            </View>
          </AnimatedEntry>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Report Title */}
            <AnimatedEntry delay={150}>
              <GlassCard style={styles.reportHeader}>
                <Text style={styles.reportTitle}>📋 {selectedReport.label}</Text>
                <Text style={styles.reportSubtitle}>Monthly Health Summary</Text>
              </GlassCard>
            </AnimatedEntry>

            {/* Key Stats */}
            <AnimatedEntry delay={200}>
              <View style={styles.statsGrid}>
                <StatCard
                  value={selectedReport.totalSteps.toLocaleString()}
                  label="Total Steps"
                  icon="👟"
                  progress={Math.min(selectedReport.totalSteps / 300000, 1)}
                  progressColor={Colors.sageLeaf}
                />
                <StatCard
                  value={`${selectedReport.totalWorkouts}`}
                  label="Workouts"
                  icon="💪"
                  progress={Math.min(selectedReport.totalWorkouts / 20, 1)}
                  progressColor={Colors.violet}
                />
              </View>
            </AnimatedEntry>

            <AnimatedEntry delay={250}>
              <View style={styles.statsGrid}>
                <StatCard
                  value={`${selectedReport.avgSleepHours}h`}
                  label="Avg Sleep"
                  icon="😴"
                  progress={Math.min(selectedReport.avgSleepHours / 9, 1)}
                  progressColor={Colors.cosmicBlue}
                />
                <StatCard
                  value={`${getMoodEmoji(selectedReport.avgMoodScore)} ${selectedReport.avgMoodScore}`}
                  label="Avg Mood"
                  icon=""
                  progress={selectedReport.avgMoodScore / 5}
                  progressColor={Colors.sacredGold}
                />
              </View>
            </AnimatedEntry>

            {/* Detailed Sections */}
            <AnimatedEntry delay={300}>
              <SectionHeader title="Activity Summary" emoji="🚶" />
              <GlassCard>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailValue}>{selectedReport.avgDailySteps.toLocaleString()}</Text>
                    <Text style={styles.detailLabel}>Avg Daily Steps</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailValue}>{selectedReport.caloriesBurned.toLocaleString()}</Text>
                    <Text style={styles.detailLabel}>Calories Burned</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailValue}>{selectedReport.totalWorkoutMinutes}</Text>
                    <Text style={styles.detailLabel}>Workout Min</Text>
                  </View>
                </View>
              </GlassCard>
            </AnimatedEntry>

            <AnimatedEntry delay={350}>
              <SectionHeader title="Wellness" emoji="🧘" />
              <GlassCard>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailValue}>{selectedReport.waterGoalDays}</Text>
                    <Text style={styles.detailLabel}>💧 Hydrated Days</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailValue}>{selectedReport.meditationMinutes}</Text>
                    <Text style={styles.detailLabel}>🧘 Meditation Min</Text>
                  </View>
                </View>
              </GlassCard>
            </AnimatedEntry>

            {/* Weight Change */}
            {selectedReport.weightStart != null && selectedReport.weightEnd != null && (
              <AnimatedEntry delay={400}>
                <SectionHeader title="Weight Change" emoji="⚖️" />
                <GlassCard>
                  <View style={styles.weightRow}>
                    <View style={styles.weightItem}>
                      <Text style={styles.weightValue}>{selectedReport.weightStart} kg</Text>
                      <Text style={styles.weightLabel}>Start</Text>
                    </View>
                    <Text style={styles.weightArrow}>→</Text>
                    <View style={styles.weightItem}>
                      <Text style={styles.weightValue}>{selectedReport.weightEnd} kg</Text>
                      <Text style={styles.weightLabel}>End</Text>
                    </View>
                    <View style={styles.weightItem}>
                      <Text
                        style={[
                          styles.weightChange,
                          selectedReport.weightEnd - selectedReport.weightStart < 0
                            ? styles.changeGreen
                            : styles.changeRed,
                        ]}
                      >
                        {(selectedReport.weightEnd - selectedReport.weightStart) > 0 ? '+' : ''}
                        {(selectedReport.weightEnd - selectedReport.weightStart).toFixed(1)} kg
                      </Text>
                      <Text style={styles.weightLabel}>Change</Text>
                    </View>
                  </View>
                </GlassCard>
              </AnimatedEntry>
            )}

            {/* Export */}
            <AnimatedEntry delay={500}>
              <GlassCard style={styles.exportCard}>
                <Text style={styles.exportTitle}>Share Your Report</Text>
                <Text style={styles.exportSubtitle}>
                  Export a text summary to share with your trainer or doctor
                </Text>
                <GradientButton
                  title="Share Report"
                  onPress={handleShare}
                  variant="primary"
                  icon="📤"
                />
              </GlassCard>
            </AnimatedEntry>

            <View style={{ height: Spacing.xxl }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bg: { ...StyleSheet.absoluteFillObject },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  backText: { fontSize: FontSizes.xxl, color: Colors.textPrimary },
  title: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  shareBtn: { padding: Spacing.xs },
  shareText: { fontSize: 24 },
  monthRow: { paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.md },
  monthBtn: {
    alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md, backgroundColor: Colors.card,
  },
  monthBtnActive: { backgroundColor: Colors.violet },
  monthLabel: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textSecondary },
  monthLabelActive: { color: '#fff' },
  monthYear: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  monthDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.sageLeaf, marginTop: 4,
  },
  scroll: { paddingHorizontal: Spacing.lg },
  emptyContainer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  emptyCard: { alignItems: 'center', padding: Spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary },
  emptySubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center', marginBottom: Spacing.lg },
  reportHeader: { alignItems: 'center', marginBottom: Spacing.md },
  reportTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  reportSubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  statsGrid: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-around' },
  detailItem: { alignItems: 'center', paddingVertical: Spacing.sm },
  detailValue: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary },
  detailLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4 },
  weightRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  weightItem: { alignItems: 'center' },
  weightValue: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary },
  weightLabel: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: 4 },
  weightArrow: { fontSize: FontSizes.xxl, color: Colors.textMuted },
  weightChange: { fontSize: FontSizes.xl, fontWeight: '700' },
  changeGreen: { color: Colors.sageLeaf },
  changeRed: { color: Colors.rosePetal },
  exportCard: { alignItems: 'center', marginTop: Spacing.md },
  exportTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  exportSubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.md },
});
