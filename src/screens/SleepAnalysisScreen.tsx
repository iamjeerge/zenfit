/**
 * @file SleepAnalysisScreen.tsx
 * @module screens/SleepAnalysisScreen
 * @description Advanced sleep quality analysis — sleep stage breakdown,
 * consistency scoring, weekly trends, and personalised recommendations.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from '../utils/haptics';
import { Colors, Gradients, Spacing, BorderRadius, FontSizes } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import AnimatedEntry from '../components/AnimatedEntry';
import SectionHeader from '../components/SectionHeader';
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { useRouter } from '../utils/router';

const { width: SCREEN_W } = Dimensions.get('window');

/* ─── types ─── */
interface SleepEntry {
  id: string;
  date: string;
  bedtime: string | null;
  wake_time: string | null;
  duration_hours: number;
  quality: number; // 1-5
  deep_pct: number | null;
  rem_pct: number | null;
  light_pct: number | null;
  awake_pct: number | null;
  source: string;
}

interface SleepScore {
  overall: number;       // 0-100
  duration: number;      // 0-100
  consistency: number;   // 0-100
  quality: number;       // 0-100
  efficiency: number;    // 0-100
}

type TimeRange = '7d' | '14d' | '30d';

const STAGE_COLORS: Record<string, string> = {
  deep: '#5B4AE4',
  rem: Colors.cosmicBlue,
  light: Colors.sageLeaf,
  awake: Colors.rosePetal,
};

const QUALITY_EMOJI = ['', '😴', '🥱', '😐', '😊', '🌟'];

export default function SleepAnalysisScreen() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [score, setScore] = useState<SleepScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState<TimeRange>('7d');
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    if (user) loadData();
  }, [user, range]);

  const getDaysAgo = (r: TimeRange) => {
    const days = r === '7d' ? 7 : r === '14d' ? 14 : 30;
    return new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const since = getDaysAgo(range);
      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', user!.id)
        .gte('date', since)
        .order('date', { ascending: false });

      if (error) throw error;
      const logs = data || [];
      setEntries(logs);
      computeScore(logs);
      generateRecommendations(logs);
    } catch {
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const computeScore = (logs: SleepEntry[]) => {
    if (logs.length === 0) {
      setScore(null);
      return;
    }

    const avgDuration = logs.reduce((s, l) => s + Number(l.duration_hours), 0) / logs.length;
    const avgQuality = logs.reduce((s, l) => s + (l.quality || 3), 0) / logs.length;

    // Duration score: optimal 7-9h
    const durationScore = avgDuration >= 7 && avgDuration <= 9
      ? 100
      : avgDuration >= 6
        ? Math.round(70 + (avgDuration - 6) * 30)
        : Math.round(Math.max(0, avgDuration / 6 * 70));

    // Consistency: std deviation of bedtimes
    const bedtimes = logs
      .filter((l) => l.bedtime)
      .map((l) => {
        const [h, m] = l.bedtime!.split(':').map(Number);
        return h < 12 ? h + 24 + m / 60 : h + m / 60;
      });
    const bedtimeStd = bedtimes.length > 1
      ? Math.sqrt(bedtimes.reduce((s, b) => s + (b - bedtimes.reduce((a, c) => a + c, 0) / bedtimes.length) ** 2, 0) / bedtimes.length)
      : 0;
    const consistencyScore = Math.round(Math.max(0, 100 - bedtimeStd * 25));

    // Quality score: based on user ratings
    const qualityScore = Math.round((avgQuality / 5) * 100);

    // Efficiency: deep+rem percentage
    const withStages = logs.filter((l) => l.deep_pct != null);
    const avgDeepRem = withStages.length > 0
      ? withStages.reduce((s, l) => s + (l.deep_pct || 0) + (l.rem_pct || 0), 0) / withStages.length
      : 50;
    const efficiencyScore = Math.round(Math.min(100, (avgDeepRem / 50) * 100));

    const overall = Math.round(
      durationScore * 0.3 + consistencyScore * 0.25 + qualityScore * 0.25 + efficiencyScore * 0.2,
    );

    setScore({ overall, duration: durationScore, consistency: consistencyScore, quality: qualityScore, efficiency: efficiencyScore });
  };

  const generateRecommendations = (logs: SleepEntry[]) => {
    const recs: string[] = [];
    if (logs.length === 0) {
      recs.push('Start logging your sleep to get personalised recommendations.');
      setRecommendations(recs);
      return;
    }

    const avgDuration = logs.reduce((s, l) => s + Number(l.duration_hours), 0) / logs.length;
    const avgQuality = logs.reduce((s, l) => s + (l.quality || 3), 0) / logs.length;

    if (avgDuration < 7) {
      recs.push('🕐 Try going to bed 30 minutes earlier — you\'re averaging under 7 hours.');
    }
    if (avgDuration > 9) {
      recs.push('⏰ You\'re sleeping over 9 hours. Consider setting a consistent wake time.');
    }
    if (avgQuality < 3) {
      recs.push('🌙 Sleep quality is low. Avoid screens 1 hour before bed and keep the room cool (18-20°C).');
    }

    const withStages = logs.filter((l) => l.deep_pct != null);
    if (withStages.length > 0) {
      const avgDeep = withStages.reduce((s, l) => s + (l.deep_pct || 0), 0) / withStages.length;
      if (avgDeep < 15) {
        recs.push('💤 Deep sleep is below 15%. Exercise earlier in the day and avoid caffeine after 2 PM.');
      }
    }

    // Consistency check
    const bedtimes = logs.filter((l) => l.bedtime).map((l) => {
      const [h, m] = l.bedtime!.split(':').map(Number);
      return h < 12 ? h + 24 + m / 60 : h + m / 60;
    });
    if (bedtimes.length > 1) {
      const range = Math.max(...bedtimes) - Math.min(...bedtimes);
      if (range > 2) {
        recs.push('🔄 Your bedtime varies by over 2 hours. A consistent schedule improves sleep quality significantly.');
      }
    }

    if (recs.length === 0) {
      recs.push('✨ Your sleep habits look great! Keep maintaining this routine.');
    }
    setRecommendations(recs);
  };

  const getScoreColor = (val: number) => {
    if (val >= 80) return Colors.sageLeaf;
    if (val >= 60) return Colors.sacredGold;
    if (val >= 40) return '#FF8C42';
    return Colors.rosePetal;
  };

  const getAvgDuration = () => {
    if (entries.length === 0) return '0';
    return (entries.reduce((s, e) => s + Number(e.duration_hours), 0) / entries.length).toFixed(1);
  };

  const getAvgQuality = () => {
    if (entries.length === 0) return '0';
    return (entries.reduce((s, e) => s + (e.quality || 3), 0) / entries.length).toFixed(1);
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
            <Text style={styles.title}>Sleep Analysis</Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/sleep');
              }}
              style={styles.logBtn}
            >
              <Text style={styles.logText}>＋ Log</Text>
            </TouchableOpacity>
          </View>
        </AnimatedEntry>

        {/* Time Range Picker */}
        <AnimatedEntry delay={50}>
          <View style={styles.rangeRow}>
            {(['7d', '14d', '30d'] as TimeRange[]).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => {
                  Haptics.selectionAsync();
                  setRange(r);
                }}
                style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}
              >
                <Text style={[styles.rangeLabel, range === r && styles.rangeLabelActive]}>
                  {r === '7d' ? '7 Days' : r === '14d' ? '14 Days' : '30 Days'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedEntry>

        {isLoading ? (
          <SkeletonLoader variant="default" />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Sleep Score */}
            {score && (
              <AnimatedEntry delay={100}>
                <GlassCard style={styles.scoreCard}>
                  <View style={styles.scoreCircle}>
                    <Text style={[styles.scoreValue, { color: getScoreColor(score.overall) }]}>
                      {score.overall}
                    </Text>
                    <Text style={styles.scoreLabel}>Sleep Score</Text>
                  </View>

                  <View style={styles.scoreBreakdown}>
                    {[
                      { key: 'duration', label: 'Duration', emoji: '⏱️' },
                      { key: 'consistency', label: 'Consistency', emoji: '🔄' },
                      { key: 'quality', label: 'Quality', emoji: '⭐' },
                      { key: 'efficiency', label: 'Efficiency', emoji: '🧠' },
                    ].map((item) => (
                      <View key={item.key} style={styles.breakdownItem}>
                        <Text style={styles.breakdownEmoji}>{item.emoji}</Text>
                        <View style={styles.breakdownBar}>
                          <View
                            style={[
                              styles.breakdownFill,
                              {
                                width: `${score[item.key as keyof SleepScore]}%`,
                                backgroundColor: getScoreColor(score[item.key as keyof SleepScore]),
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.breakdownValue}>
                          {score[item.key as keyof SleepScore]}
                        </Text>
                      </View>
                    ))}
                  </View>
                </GlassCard>
              </AnimatedEntry>
            )}

            {/* Overview Stats */}
            <AnimatedEntry delay={150}>
              <View style={styles.statsRow}>
                <StatCard
                  value={`${getAvgDuration()}h`}
                  label="Avg Duration"
                  icon="😴"
                  progress={Math.min(Number(getAvgDuration()) / 9, 1)}
                  progressColor={Colors.cosmicBlue}
                />
                <StatCard
                  value={getAvgQuality()}
                  label="Avg Quality"
                  icon="⭐"
                  progress={Number(getAvgQuality()) / 5}
                  progressColor={Colors.sacredGold}
                />
              </View>
            </AnimatedEntry>

            <AnimatedEntry delay={175}>
              <View style={styles.statsRow}>
                <StatCard
                  value={`${entries.length}`}
                  label="Nights Logged"
                  icon="🌙"
                  progress={Math.min(entries.length / (range === '7d' ? 7 : range === '14d' ? 14 : 30), 1)}
                  progressColor={Colors.violet}
                />
                <StatCard
                  value={entries.length > 0 ? `${QUALITY_EMOJI[Math.round(Number(getAvgQuality()))]}` : '—'}
                  label="Overall Feel"
                  icon=""
                  progress={0}
                  progressColor={Colors.sageLeaf}
                />
              </View>
            </AnimatedEntry>

            {/* Sleep Stages (if available) */}
            {entries.some((e) => e.deep_pct != null) && (
              <AnimatedEntry delay={200}>
                <SectionHeader title="Sleep Stages" emoji="🧠" />
                <GlassCard>
                  {(() => {
                    const withStages = entries.filter((e) => e.deep_pct != null);
                    const avgDeep = Math.round(withStages.reduce((s, e) => s + (e.deep_pct || 0), 0) / withStages.length);
                    const avgRem = Math.round(withStages.reduce((s, e) => s + (e.rem_pct || 0), 0) / withStages.length);
                    const avgLight = Math.round(withStages.reduce((s, e) => s + (e.light_pct || 0), 0) / withStages.length);
                    const avgAwake = Math.round(withStages.reduce((s, e) => s + (e.awake_pct || 0), 0) / withStages.length);

                    return (
                      <>
                        {/* Stage Bar */}
                        <View style={styles.stageBar}>
                          {[
                            { pct: avgDeep, color: STAGE_COLORS.deep },
                            { pct: avgRem, color: STAGE_COLORS.rem },
                            { pct: avgLight, color: STAGE_COLORS.light },
                            { pct: avgAwake, color: STAGE_COLORS.awake },
                          ].map((stage, i) => (
                            <View
                              key={i}
                              style={[
                                styles.stageSegment,
                                { flex: stage.pct || 1, backgroundColor: stage.color },
                              ]}
                            />
                          ))}
                        </View>

                        {/* Legend */}
                        <View style={styles.stageLegend}>
                          {[
                            { label: 'Deep', pct: avgDeep, color: STAGE_COLORS.deep },
                            { label: 'REM', pct: avgRem, color: STAGE_COLORS.rem },
                            { label: 'Light', pct: avgLight, color: STAGE_COLORS.light },
                            { label: 'Awake', pct: avgAwake, color: STAGE_COLORS.awake },
                          ].map((item) => (
                            <View key={item.label} style={styles.legendItem}>
                              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                              <Text style={styles.legendLabel}>{item.label}</Text>
                              <Text style={styles.legendValue}>{item.pct}%</Text>
                            </View>
                          ))}
                        </View>
                      </>
                    );
                  })()}
                </GlassCard>
              </AnimatedEntry>
            )}

            {/* Recommendations */}
            <AnimatedEntry delay={250}>
              <SectionHeader title="Recommendations" emoji="💡" />
              {recommendations.map((rec, i) => (
                <GlassCard key={i} style={styles.recCard}>
                  <Text style={styles.recText}>{rec}</Text>
                </GlassCard>
              ))}
            </AnimatedEntry>

            {/* Recent Nights */}
            <AnimatedEntry delay={300}>
              <SectionHeader title="Recent Nights" emoji="🌙" />
              {entries.length === 0 ? (
                <GlassCard style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>😴</Text>
                  <Text style={styles.emptyTitle}>No sleep data yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Log your sleep to get analysis and recommendations
                  </Text>
                </GlassCard>
              ) : (
                entries.slice(0, 7).map((entry) => (
                  <GlassCard key={entry.id} style={styles.nightCard}>
                    <View style={styles.nightHeader}>
                      <Text style={styles.nightDate}>
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                      <Text style={styles.nightQuality}>
                        {QUALITY_EMOJI[entry.quality || 3]}
                      </Text>
                    </View>

                    <View style={styles.nightStats}>
                      <View style={styles.nightStat}>
                        <Text style={styles.nightStatValue}>{Number(entry.duration_hours).toFixed(1)}h</Text>
                        <Text style={styles.nightStatLabel}>Duration</Text>
                      </View>
                      {entry.bedtime && (
                        <View style={styles.nightStat}>
                          <Text style={styles.nightStatValue}>{entry.bedtime}</Text>
                          <Text style={styles.nightStatLabel}>Bedtime</Text>
                        </View>
                      )}
                      {entry.wake_time && (
                        <View style={styles.nightStat}>
                          <Text style={styles.nightStatValue}>{entry.wake_time}</Text>
                          <Text style={styles.nightStatLabel}>Wake</Text>
                        </View>
                      )}
                      <View style={styles.nightStat}>
                        <Text style={styles.nightStatValue}>📱 {entry.source}</Text>
                        <Text style={styles.nightStatLabel}>Source</Text>
                      </View>
                    </View>

                    {/* Stage mini-bar */}
                    {entry.deep_pct != null && (
                      <View style={styles.miniStageBar}>
                        {[
                          { pct: entry.deep_pct, color: STAGE_COLORS.deep },
                          { pct: entry.rem_pct || 0, color: STAGE_COLORS.rem },
                          { pct: entry.light_pct || 0, color: STAGE_COLORS.light },
                          { pct: entry.awake_pct || 0, color: STAGE_COLORS.awake },
                        ].map((s, i) => (
                          <View
                            key={i}
                            style={[styles.miniSegment, { flex: s.pct || 1, backgroundColor: s.color }]}
                          />
                        ))}
                      </View>
                    )}
                  </GlassCard>
                ))
              )}
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
  logBtn: { backgroundColor: Colors.violet, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.pill },
  logText: { fontSize: FontSizes.sm, fontWeight: '600', color: '#fff' },

  // Range
  rangeRow: {
    flexDirection: 'row', marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    backgroundColor: Colors.card, borderRadius: BorderRadius.md, padding: 4,
  },
  rangeBtn: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: BorderRadius.sm },
  rangeBtnActive: { backgroundColor: Colors.violet },
  rangeLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textMuted },
  rangeLabelActive: { color: '#fff' },

  scroll: { paddingHorizontal: Spacing.lg },

  // Score
  scoreCard: { alignItems: 'center' },
  scoreCircle: { alignItems: 'center', marginBottom: Spacing.md },
  scoreValue: { fontSize: 56, fontWeight: '800' },
  scoreLabel: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  scoreBreakdown: { width: '100%' },
  breakdownItem: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  breakdownEmoji: { fontSize: 18, width: 30 },
  breakdownBar: {
    flex: 1, height: 8, backgroundColor: Colors.background,
    borderRadius: 4, marginHorizontal: Spacing.sm, overflow: 'hidden',
  },
  breakdownFill: { height: '100%', borderRadius: 4 },
  breakdownValue: { width: 30, textAlign: 'right', fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textPrimary },

  // Stats
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },

  // stages
  stageBar: { flexDirection: 'row', height: 20, borderRadius: 10, overflow: 'hidden', marginBottom: Spacing.md },
  stageSegment: { height: '100%' },
  stageLegend: { flexDirection: 'row', justifyContent: 'space-around' },
  legendItem: { alignItems: 'center' },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginBottom: 4 },
  legendLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  legendValue: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.textPrimary },

  // Recommendations
  recCard: { marginBottom: Spacing.sm },
  recText: { fontSize: FontSizes.md, color: Colors.textSecondary, lineHeight: 22 },

  // Recent
  nightCard: { marginBottom: Spacing.sm },
  nightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  nightDate: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary },
  nightQuality: { fontSize: 24 },
  nightStats: { flexDirection: 'row', justifyContent: 'space-around' },
  nightStat: { alignItems: 'center' },
  nightStatValue: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary },
  nightStatLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  miniStageBar: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: Spacing.sm },
  miniSegment: { height: '100%' },

  // Empty
  emptyCard: { alignItems: 'center', padding: Spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary },
  emptySubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xs },
});
