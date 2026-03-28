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
import { BarChart, LineChart } from '../components/InteractiveChart';

const CALENDAR_DAYS = 21;
const screenWidth = Dimensions.get('window').width;

interface Stat {
  label: string;
  value: string;
  change: string;
  icon: string;
}

interface Badge {
  id: string;
  emoji: string;
  label: string;
  description: string;
}

export default function ProgressScreen() {
  const currentStreak = 21;

  const stats: Stat[] = [
    { label: 'Total Workouts', value: '42', change: '+3 this week', icon: '💪' },
    { label: 'Meditation Time', value: '720m', change: '+60m this week', icon: '🧘' },
    { label: 'Avg Steps', value: '8,542', change: '+1,200 today', icon: '👟' },
    { label: 'Weight Change', value: '-2.5 kg', change: 'Since start', icon: '⚖️' },
  ];

  const badges: Badge[] = [
    { id: '1', emoji: '🔥', label: 'On Fire', description: '7-day streak' },
    { id: '2', emoji: '🏃', label: 'Runner', description: '10 workouts' },
    { id: '3', emoji: '🧠', label: 'Zen Master', description: '5h meditation' },
    { id: '4', emoji: '🌟', label: 'Glowing', description: '21-day streak' },
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

  const CalendarHeatmap = () => {
    const daysArray = Array.from({ length: CALENDAR_DAYS }, (_, i) => i + 1);
    const completedDays = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21];

    return (
      <View style={styles.heatmapContainer}>
        <View style={styles.heatmapGrid}>
          {daysArray.map((day) => {
            const isCompleted = completedDays.includes(day);
            const intensity = isCompleted ? 0.8 : 0.2;
            return (
              <View
                key={day}
                style={[
                  styles.heatmapCell,
                  {
                    backgroundColor: isCompleted
                      ? Colors.violet
                      : Colors.card,
                    opacity: intensity,
                  },
                ]}
              >
                <Text style={styles.heatmapCellText}>{day}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const StatCard = ({ stat }: { stat: Stat }) => (
    <LinearGradient
      colors={Gradients.cardSecondary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.statCard, { borderColor: Colors.glassBorder }]}
    >
      <View style={styles.statHeader}>
        <Text style={styles.statIcon}>{stat.icon}</Text>
        <Text style={styles.statLabel}>{stat.label}</Text>
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statChange}>{stat.change}</Text>
    </LinearGradient>
  );

  const weeklyBarData = weeklyData.map((d) => ({ label: d.day, value: d.steps }));

  const BadgeCard = ({ badge }: { badge: Badge }) => (
    <LinearGradient
      colors={Gradients.cardGold}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.badgeCard, { borderColor: Colors.sacredGold }]}
    >
      <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
      <Text style={styles.badgeLabel}>{badge.label}</Text>
      <Text style={styles.badgeDescription}>{badge.description}</Text>
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
          <Text style={styles.title}>Your Progress</Text>
        </View>
        </AnimatedEntry>

        {/* Streak Section */}
        <AnimatedEntry delay={100}>
        <LinearGradient
          colors={Gradients.cardPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.streakCard, { borderColor: Colors.glassBorder }]}
        >
          <View style={styles.streakContent}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View>
              <Text style={styles.streakLabel}>Current Streak</Text>
              <Text style={styles.streakNumber}>{currentStreak} Days</Text>
            </View>
          </View>
        </LinearGradient>

        </AnimatedEntry>

        {/* Calendar Heatmap */}
        <AnimatedEntry delay={200}>
        <View style={styles.heatmapSection}>
          <SectionHeader title="21-Day Habit Tracker" />
          <CalendarHeatmap />
        </View>

        </AnimatedEntry>

        {/* Stats Grid */}
        <AnimatedEntry delay={300}>
        <View style={styles.statsSection}>
          <SectionHeader title="Your Stats" />
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View
                key={index}
                style={[
                  styles.statGridItem,
                  index % 2 === 1 && { marginLeft: Spacing.md },
                ]}
              >
                <StatCard stat={stat} />
              </View>
            ))}
          </View>
        </View>

        </AnimatedEntry>

        {/* Weekly Chart */}
        <AnimatedEntry delay={400}>
        <View style={styles.chartSection}>
          <SectionHeader title="Weekly Steps" />
          <LinearGradient
            colors={Gradients.cardSecondary}
            style={styles.chartCard}
          >
            <BarChart
              data={weeklyBarData}
              height={150}
              unit=""
              goalLine={10000}
              barColor={Colors.violet}
              activeColor={Colors.lavender}
            />
          </LinearGradient>
        </View>
        </AnimatedEntry>

        {/* Badges Section */}
        <AnimatedEntry delay={500}>
        <View style={styles.badgesSection}>
          <SectionHeader title="Achievements" />
          <View style={styles.badgesGrid}>
            {badges.map((badge) => (
              <View key={badge.id} style={styles.badgeGridItem}>
                <BadgeCard badge={badge} />
              </View>
            ))}
          </View>
        </View>

        </AnimatedEntry>

        {/* Generate Report Button */}
        <AnimatedEntry delay={600}>
        <GradientButton
          title="Generate Health Report"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          icon="📊"
          style={{ marginBottom: Spacing.md }}
        />
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
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  streakCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.glassBackground,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.card,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  streakEmoji: {
    fontSize: 40,
    marginRight: Spacing.lg,
  },
  streakLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  streakNumber: {
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    color: Colors.sacredGold,
  },
  heatmapSection: {
    marginBottom: Spacing.xl,
  },
  heatmapContainer: {
    marginTop: Spacing.md,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  heatmapCell: {
    width: (screenWidth - Spacing.lg * 2 - Spacing.sm * 6) / 7,
    aspectRatio: 1,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heatmapCellText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  statsSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statGridItem: {
    width: '48%',
    marginBottom: Spacing.md,
  },
  statCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    backgroundColor: Colors.glassBackground,
    ...Shadows.card,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  statChange: {
    fontSize: FontSizes.xs,
    color: Colors.sageLeaf,
    fontWeight: '600',
  },
  chartSection: {
    marginBottom: Spacing.xl,
  },
  chartCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
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
    height: 140,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: BorderRadius.sm,
  },
  barValue: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontWeight: '600',
  },
  badgesSection: {
    marginBottom: Spacing.xl,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  badgeGridItem: {
    width: (screenWidth - Spacing.lg * 2 - Spacing.md) / 2,
  },
  badgeCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    backgroundColor: Colors.glassBackground,
    alignItems: 'center',
    ...Shadows.card,
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  badgeLabel: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  badgeDescription: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  reportButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  reportButtonGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
