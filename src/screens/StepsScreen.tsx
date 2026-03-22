import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '../theme/colors';
import AnimatedEntry from '../components/AnimatedEntry';
import SectionHeader from '../components/SectionHeader';
import { GradientButton } from '../components';

const screenWidth = Dimensions.get('window').width;

interface Stat {
  icon: string;
  label: string;
  value: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  steps: number;
  avatar: string;
  isCurrentUser: boolean;
}

export default function StepsScreen() {
  const currentSteps = 8542;
  const stepGoal = 10000;
  const progress = currentSteps / stepGoal;

  const stats: Stat[] = [
    { icon: '📏', label: 'Distance', value: '6.2 km' },
    { icon: '🔥', label: 'Calories', value: '427 kcal' },
    { icon: '⚡', label: 'Active Time', value: '1h 24m' },
  ];

  const weeklyData = [
    { day: 'Mon', steps: 8200 },
    { day: 'Tue', steps: 9100 },
    { day: 'Wed', steps: 7800 },
    { day: 'Thu', steps: 10200 },
    { day: 'Fri', steps: 8900 },
    { day: 'Sat', steps: 12100 },
    { day: 'Sun', steps: 9500 },
  ];

  const maxSteps = Math.max(...weeklyData.map((d) => d.steps));

  const leaderboard: LeaderboardEntry[] = [
    { id: '1', name: 'You', steps: 8542, avatar: '👤', isCurrentUser: true },
    { id: '2', name: 'Alex', steps: 12450, avatar: '👥', isCurrentUser: false },
    { id: '3', name: 'Jamie', steps: 11230, avatar: '👥', isCurrentUser: false },
  ];

  const CircularProgress = () => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - progress * circumference;
    const radius = 45;
    const centerX = 60;
    const centerY = 60;

    return (
      <View style={styles.circularProgressContainer}>
        <View style={styles.circularProgressOuter}>
          <LinearGradient
            colors={['rgba(124, 58, 237, 0.1)', 'rgba(244, 114, 182, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.circularProgressInner}
          >
            <View style={styles.circleBackground}>
              <View style={styles.circleText}>
                <Text style={styles.stepCount}>{currentSteps.toLocaleString()}</Text>
                <Text style={styles.stepGoal}>of {stepGoal.toLocaleString()}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
        <View
          style={[
            styles.progressRing,
            {
              borderColor: Colors.violet,
            },
          ]}
        />
      </View>
    );
  };

  const WeeklyChart = () => (
    <View style={styles.chartContainer}>
      <View style={styles.chartBars}>
        {weeklyData.map((data) => (
          <View key={data.day} style={styles.barWrapper}>
            <View style={styles.barLabel}>
              <Text style={styles.barLabelText}>{data.day}</Text>
            </View>
            <View style={styles.barContainer}>
              <LinearGradient
                colors={Gradients.aurora}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={[
                  styles.bar,
                  {
                    height: `${(data.steps / maxSteps) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const getHeartRateZone = (bpm: number) => {
    if (bpm < 100) return { zone: 'Rest', color: Colors.heartRest };
    if (bpm < 120) return { zone: 'Fat Burn', color: Colors.heartFatBurn };
    if (bpm < 150) return { zone: 'Cardio', color: Colors.heartCardio };
    if (bpm < 170) return { zone: 'Peak', color: Colors.heartPeak };
    return { zone: 'Extreme', color: Colors.heartExtreme };
  };

  const currentBPM = 78;
  const heartRateZone = getHeartRateZone(currentBPM);

  const StatCard = ({ stat }: { stat: Stat }) => (
    <LinearGradient
      colors={Gradients.cardSecondary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.statCard, { borderColor: Colors.glassBorder }]}
    >
      <Text style={styles.statIcon}>{stat.icon}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
      <Text style={styles.statValue}>{stat.value}</Text>
    </LinearGradient>
  );

  const LeaderboardCard = ({ entry }: { entry: LeaderboardEntry }) => (
    <LinearGradient
      colors={
        entry.isCurrentUser
          ? Gradients.cardPrimary
          : Gradients.cardSecondary
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.leaderboardCard,
        { borderColor: Colors.glassBorder },
        entry.isCurrentUser && styles.leaderboardCardActive,
      ]}
    >
      <View style={styles.leaderboardContent}>
        <Text style={styles.leaderboardAvatar}>{entry.avatar}</Text>
        <View style={styles.leaderboardInfo}>
          <Text style={styles.leaderboardName}>{entry.name}</Text>
          <Text style={styles.leaderboardSteps}>
            {entry.steps.toLocaleString()} steps
          </Text>
        </View>
        <View style={styles.leaderboardRank}>
          <Text style={styles.leaderboardRankText}>
            {leaderboard.indexOf(entry) + 1}
          </Text>
        </View>
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
        <AnimatedEntry delay={0}>
        <View style={styles.header}>
          <Text style={styles.title}>Steps</Text>
          <Text style={styles.subtitle}>Today</Text>
        </View>
        </AnimatedEntry>

        {/* Circular Progress */}
        <AnimatedEntry delay={100}>
        <View style={styles.progressSection}>
          <CircularProgress />
          <Text style={styles.progressLabel}>
            {Math.round(progress * 100)}% of daily goal
          </Text>
        </View>

        </AnimatedEntry>

        {/* Stats Row */}
        <AnimatedEntry delay={200}>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statGridItem}>
              <StatCard stat={stat} />
            </View>
          ))}
        </View>

        </AnimatedEntry>

        {/* Weekly Chart */}
        <AnimatedEntry delay={300}>
        <View style={styles.chartSection}>
          <SectionHeader title="This Week" />
          <WeeklyChart />
        </View>

        </AnimatedEntry>

        {/* Heart Rate Section */}
        <AnimatedEntry delay={400}>
        <View style={styles.heartRateSection}>
          <SectionHeader title="Live Heart Rate" />
          <LinearGradient
            colors={Gradients.cardPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heartRateCard, { borderColor: Colors.glassBorder }]}
          >
            <View style={styles.heartRateContent}>
              <View style={styles.heartRateLeft}>
                <Text style={styles.heartEmoji}>❤️</Text>
                <View style={styles.heartRateInfo}>
                  <Text style={styles.bpmValue}>{currentBPM}</Text>
                  <Text style={styles.bpmLabel}>BPM</Text>
                </View>
              </View>
              <View
                style={[
                  styles.zoneIndicator,
                  { backgroundColor: heartRateZone.color },
                ]}
              >
                <Text style={styles.zoneText}>{heartRateZone.zone}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        </AnimatedEntry>

        {/* Sync Watch Button */}
        <AnimatedEntry delay={500}>
        <GradientButton
          title="⌚ Sync Watch"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          style={{ marginBottom: Spacing.xl }}
        />
        </AnimatedEntry>

        {/* Leaderboard */}
        <AnimatedEntry delay={600}>
        <View style={styles.leaderboardSection}>
          <SectionHeader title="Friend Leaderboard" />
          <View style={styles.leaderboardList}>
            {leaderboard.map((entry) => (
              <LeaderboardCard key={entry.id} entry={entry} />
            ))}
          </View>
        </View>
        </AnimatedEntry>
      </ScrollView>
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
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  circularProgressContainer: {
    position: 'relative',
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  circularProgressOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
  },
  circularProgressInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBackground: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.glassBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  circleText: {
    alignItems: 'center',
  },
  stepCount: {
    fontSize: FontSizes.display,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stepGoal: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  progressRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 6,
    borderColor: Colors.violet,
    opacity: 0.3,
  },
  progressLabel: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statGridItem: {
    flex: 1,
  },
  statCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    backgroundColor: Colors.glassBackground,
    alignItems: 'center',
    ...Shadows.card,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: Spacing.sm,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  chartSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  chartContainer: {
    marginTop: Spacing.md,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 160,
    gap: Spacing.sm,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barLabel: {
    marginBottom: Spacing.sm,
  },
  barLabelText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  barContainer: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: BorderRadius.sm,
  },
  heartRateSection: {
    marginBottom: Spacing.xl,
  },
  heartRateCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.glassBackground,
    ...Shadows.card,
  },
  heartRateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heartRateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartEmoji: {
    fontSize: 32,
    marginRight: Spacing.lg,
  },
  heartRateInfo: {
    alignItems: 'flex-start',
  },
  bpmValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bpmLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  zoneIndicator: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  zoneText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  syncButton: {
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  syncButtonGradient: {
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  syncButtonIcon: {
    fontSize: 20,
  },
  syncButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  leaderboardSection: {
    marginBottom: Spacing.md,
  },
  leaderboardList: {
    gap: Spacing.md,
  },
  leaderboardCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    backgroundColor: Colors.glassBackground,
    ...Shadows.card,
  },
  leaderboardCardActive: {
    borderColor: Colors.violet,
  },
  leaderboardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardAvatar: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  leaderboardSteps: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  leaderboardRank: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.violet,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardRankText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
