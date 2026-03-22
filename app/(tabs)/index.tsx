import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/store/authStore';
import {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '../../src/theme/colors';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const profile = useAuthStore((s) => s.profile);
  const [heartRate] = useState(72);
  const [heartZone] = useState<'rest' | 'fatburn' | 'cardio' | 'peak' | 'extreme'>('fatburn');

  const getHeartZoneColor = () => {
    switch (heartZone) {
      case 'rest':
        return Colors.heartRest;
      case 'fatburn':
        return Colors.heartFatBurn;
      case 'cardio':
        return Colors.heartCardio;
      case 'peak':
        return Colors.heartPeak;
      case 'extreme':
        return Colors.heartExtreme;
      default:
        return Colors.cosmicBlue;
    }
  };

  const getHeartZoneLabel = () => {
    switch (heartZone) {
      case 'rest':
        return 'Rest';
      case 'fatburn':
        return 'Fat Burn';
      case 'cardio':
        return 'Cardio';
      case 'peak':
        return 'Peak';
      case 'extreme':
        return 'Extreme';
      default:
        return 'Unknown';
    }
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'Friend';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Aurora Gradient */}
        <LinearGradient
          colors={Gradients.aurora}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Namaste, {firstName}🙏</Text>
            <Text style={styles.mantraLabel}>Daily Mantra</Text>
          </View>
        </LinearGradient>

        {/* Daily Mantra Card */}
        <View style={styles.mantraCard}>
          <LinearGradient
            colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
            style={styles.mantraGradient}
          >
            <Text style={styles.mantraText}>
              "Every breath is a new beginning. Be present, be grateful, be whole."
            </Text>
            <Text style={styles.mantraAuthor}>— Daily Wisdom</Text>
          </LinearGradient>
        </View>

        {/* Daily Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
              style={styles.statGradient}
            >
              <Text style={styles.statValue}>8,432</Text>
              <Text style={styles.statLabel}>Steps</Text>
              <View style={styles.statProgress}>
                <View
                  style={[
                    styles.progressBar,
                    { width: '84%', backgroundColor: Colors.sageLeaf },
                  ]}
                />
              </View>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
              style={styles.statGradient}
            >
              <Text style={styles.statValue}>6/10</Text>
              <Text style={styles.statLabel}>Water</Text>
              <View style={styles.statProgress}>
                <View
                  style={[
                    styles.progressBar,
                    { width: '60%', backgroundColor: Colors.cosmicBlue },
                  ]}
                />
              </View>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
              style={styles.statGradient}
            >
              <Text style={styles.statValue}>320</Text>
              <Text style={styles.statLabel}>Calories</Text>
              <View style={styles.statProgress}>
                <View
                  style={[
                    styles.progressBar,
                    { width: '64%', backgroundColor: Colors.sunriseOrange },
                  ]}
                />
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Heart Rate Widget */}
        <View style={styles.heartRateCard}>
          <LinearGradient
            colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
            style={styles.heartRateGradient}
          >
            <View style={styles.heartRateContent}>
              <View style={styles.heartRateLeft}>
                <Text style={styles.heartRateLabel}>Live Heart Rate</Text>
                <View style={styles.heartRateDisplay}>
                  <Text style={styles.heartRateValue}>{heartRate}</Text>
                  <Text style={styles.heartRateUnit}>BPM</Text>
                </View>
              </View>
              <View style={styles.heartRateRight}>
                <View
                  style={[
                    styles.heartRateZoneIndicator,
                    { backgroundColor: getHeartZoneColor() },
                  ]}
                />
                <Text style={styles.heartZoneLabel}>{getHeartZoneLabel()}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
              <LinearGradient
                colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonIcon}>🧘</Text>
                <Text style={styles.actionButtonText}>Start Yoga</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
              <LinearGradient
                colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonIcon}>🌬️</Text>
                <Text style={styles.actionButtonText}>Breathe</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
              <LinearGradient
                colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonIcon}>🍽️</Text>
                <Text style={styles.actionButtonText}>Log Meal</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
              <LinearGradient
                colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonIcon}>💄</Text>
                <Text style={styles.actionButtonText}>Beauty Tips</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Streak & XP Section */}
        <View style={styles.streakContainer}>
          <View style={styles.streakCard}>
            <LinearGradient
              colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
              style={styles.streakGradient}
            >
              <View style={styles.streakContent}>
                <Text style={styles.streakIcon}>🔥</Text>
                <View style={styles.streakInfo}>
                  <Text style={styles.streakDays}>{profile?.streak_days || 0}</Text>
                  <Text style={styles.streakLabel}>Day Streak</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.xpCard}>
            <LinearGradient
              colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
              style={styles.xpGradient}
            >
              <View style={styles.xpContent}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>LV</Text>
                  <Text style={styles.levelNumber}>{profile?.level || 1}</Text>
                </View>
                <View style={styles.xpInfo}>
                  <Text style={styles.xpValue}>{profile?.xp || 0}</Text>
                  <Text style={styles.xpLabel}>Total XP</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Footer spacing for tab bar */}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  headerGradient: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  headerContent: {
    gap: Spacing.xs,
  },
  greeting: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  mantraLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  mantraCard: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.subtle,
  },
  mantraGradient: {
    padding: Spacing.lg,
    minHeight: 100,
    justifyContent: 'center',
  },
  mantraText: {
    fontSize: FontSizes.md,
    color: Colors.lavender,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  mantraAuthor: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.subtle,
  },
  statGradient: {
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  statProgress: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  heartRateCard: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.subtle,
  },
  heartRateGradient: {
    padding: Spacing.lg,
  },
  heartRateContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heartRateLeft: {
    flex: 1,
  },
  heartRateLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heartRateDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  heartRateValue: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  heartRateUnit: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  heartRateRight: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heartRateZoneIndicator: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  heartZoneLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  quickActionsContainer: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  actionButton: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.subtle,
  },
  actionButtonGradient: {
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: 100,
    justifyContent: 'center',
  },
  actionButtonIcon: {
    fontSize: 32,
  },
  actionButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  streakCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.subtle,
  },
  streakGradient: {
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  streakIcon: {
    fontSize: 40,
  },
  streakInfo: {
    flex: 1,
  },
  streakDays: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.sacredGold,
  },
  streakLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  xpCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.subtle,
  },
  xpGradient: {
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  xpContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  levelBadge: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.violet,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  levelText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  levelNumber: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  xpInfo: {
    flex: 1,
  },
  xpValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  xpLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
});
