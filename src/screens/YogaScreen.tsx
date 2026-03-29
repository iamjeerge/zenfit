/**
 * @file YogaScreen.tsx
 * @module screens/YogaScreen
 * @description Yoga screen — guided yoga sessions with pose instructions
 * and timer-based holds.
 */

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from '../utils/haptics';
import {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
  HIT_SLOP,
} from '../theme/colors';
import { AnimatedEntry, SectionHeader, GlassCard } from '../components';

const { width } = Dimensions.get('window');

type FilterType = 'all' | 'hatha' | 'vinyasa' | 'kundalini' | 'yin' | 'power';

const YOGA_CLASSES = [
  {
    id: '1',
    title: 'Morning Flow',
    type: 'vinyasa',
    duration: 30,
    difficulty: 'Beginner',
    instructor: 'Maya Patel',
    description: 'Start your day with an energizing vinyasa flow',
  },
  {
    id: '2',
    title: 'Gentle Hatha',
    type: 'hatha',
    duration: 45,
    difficulty: 'Beginner',
    instructor: 'James Chen',
    description: 'Slow-paced traditional hatha yoga for flexibility',
  },
  {
    id: '3',
    title: 'Kundalini Awakening',
    type: 'kundalini',
    duration: 60,
    difficulty: 'Intermediate',
    instructor: 'Priya Singh',
    description: 'Unlock your inner energy with kundalini practices',
  },
  {
    id: '4',
    title: 'Yin & Relaxation',
    type: 'yin',
    duration: 50,
    difficulty: 'Beginner',
    instructor: 'Emma Wilson',
    description: 'Deep stretching and meditation for recovery',
  },
  {
    id: '5',
    title: 'Power Yoga',
    type: 'power',
    duration: 40,
    difficulty: 'Advanced',
    instructor: 'David Kumar',
    description: 'Build strength and endurance with dynamic poses',
  },
  {
    id: '6',
    title: 'Sunset Vinyasa',
    type: 'vinyasa',
    duration: 55,
    difficulty: 'Intermediate',
    instructor: 'Maya Patel',
    description: 'Flow with the energy of sunset',
  },
];

const FEATURED_CLASS = {
  id: 'featured',
  title: 'Sunrise Meditation & Yoga',
  type: 'vinyasa',
  duration: 60,
  difficulty: 'All Levels',
  instructor: 'Maya Patel',
  rating: 4.9,
  students: 2847,
  description: 'Begin your day with intention and mindful movement',
};

export default function YogaScreen() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Hatha', value: 'hatha' },
    { label: 'Vinyasa', value: 'vinyasa' },
    { label: 'Kundalini', value: 'kundalini' },
    { label: 'Yin', value: 'yin' },
    { label: 'Power', value: 'power' },
  ];

  const filteredClasses =
    selectedFilter === 'all'
      ? YOGA_CLASSES
      : YOGA_CLASSES.filter((cls) => cls.type === selectedFilter);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return Colors.sageLeaf;
      case 'Intermediate':
        return Colors.sacredGold;
      case 'Advanced':
        return Colors.rosePetal;
      default:
        return Colors.cosmicBlue;
    }
  };

  const renderClassCard = ({ item }: any) => (
    <TouchableOpacity style={styles.classCard} activeOpacity={0.8}>
      <LinearGradient
        colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
        style={styles.classCardGradient}
      >
        {/* Thumbnail Placeholder */}
        <View style={styles.thumbnail}>
          <LinearGradient colors={Gradients.lotus} style={styles.thumbnailGradient}>
            <Text style={styles.thumbnailIcon}>🧘</Text>
          </LinearGradient>
        </View>

        {/* Class Info */}
        <View style={styles.classInfo}>
          <Text style={styles.className}>{item.title}</Text>
          <View style={styles.classMetaRow}>
            <View style={styles.classMetaRow}>
              <Text style={styles.classMetaIcon}>⏱️</Text>
              <Text style={styles.classMetaText}>{item.duration} min</Text>
            </View>
            <View
              style={[
                styles.difficultyBadge,
                {
                  backgroundColor: `${getDifficultyColor(item.difficulty)}20`,
                  borderColor: getDifficultyColor(item.difficulty),
                },
              ]}
            >
              <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
                {item.difficulty}
              </Text>
            </View>
          </View>
          <Text style={styles.instructor}>with {item.instructor}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <AnimatedEntry delay={0} duration={500}>
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              Yoga & Meditation
            </Text>
            <Text style={styles.subtitle}>Find your perfect practice</Text>
          </View>
        </AnimatedEntry>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterChip,
                selectedFilter === filter.value && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter.value)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  selectedFilter === filter.value
                    ? Gradients.aurora
                    : [Colors.glassBackground, Colors.glassBackgroundLight]
                }
                style={styles.filterChipGradient}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === filter.value && styles.filterChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Class */}
        <AnimatedEntry delay={200} duration={600}>
          <View style={styles.featuredContainer}>
            <SectionHeader title="Featured Class" />
            <TouchableOpacity style={styles.featuredCard} activeOpacity={0.8}>
              <LinearGradient colors={Gradients.cardPrimary} style={styles.featuredGradient}>
                {/* Featured Header */}
                <View style={styles.featuredHeader}>
                  <View style={styles.featuredThumbnail}>
                    <LinearGradient
                      colors={Gradients.sunrise}
                      style={styles.featuredThumbnailGradient}
                    >
                      <Text style={styles.featuredIcon}>🌅</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.featuredBadge}>
                    <Text style={styles.badgeText}>Featured</Text>
                  </View>
                </View>

                {/* Featured Info */}
                <Text style={styles.featuredTitle}>{FEATURED_CLASS.title}</Text>
                <Text style={styles.featuredDescription}>{FEATURED_CLASS.description}</Text>

                {/* Featured Stats */}
                <View style={styles.featuredStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>⭐</Text>
                    <Text style={styles.statText}>{FEATURED_CLASS.rating}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>👥</Text>
                    <Text style={styles.statText}>{FEATURED_CLASS.students.toLocaleString()}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>⏱️</Text>
                    <Text style={styles.statText}>{FEATURED_CLASS.duration}m</Text>
                  </View>
                </View>

                {/* Instructor */}
                <View style={styles.instructorInfo}>
                  <View style={styles.instructorAvatar}>
                    <Text style={styles.avatarInitial}>{FEATURED_CLASS.instructor.charAt(0)}</Text>
                  </View>
                  <View style={styles.instructorDetails}>
                    <Text style={styles.instructorName}>{FEATURED_CLASS.instructor}</Text>
                    <Text style={styles.instructorTitle}>Yoga Instructor</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </AnimatedEntry>

        {/* Class List */}
        <AnimatedEntry delay={400} duration={600}>
          <View style={styles.classesContainer}>
            <SectionHeader title="All Classes" />
            <FlatList
              data={filteredClasses}
              renderItem={renderClassCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.classListContent}
            />
          </View>
        </AnimatedEntry>

        {/* Footer spacing */}
        <View style={{ height: 100 }} />
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
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  filterContainer: {
    marginBottom: Spacing.lg,
    paddingRight: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.subtle,
  },
  filterChipGradient: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    borderColor: Colors.violet,
  },
  filterChipText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  featuredContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  featuredCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.card,
  },
  featuredGradient: {
    padding: Spacing.lg,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  featuredThumbnail: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  featuredThumbnailGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredIcon: {
    fontSize: 40,
  },
  featuredBadge: {
    backgroundColor: Colors.sacredGold,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.background,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featuredTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  featuredDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  featuredStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statIcon: {
    fontSize: FontSizes.lg,
  },
  statText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  instructorAvatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.violet,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  instructorDetails: {
    flex: 1,
  },
  instructorName: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  instructorTitle: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  classesContainer: {
    marginBottom: Spacing.lg,
  },
  classListContent: {
    gap: Spacing.md,
  },
  classCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.subtle,
  },
  classCardGradient: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumbnailGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailIcon: {
    fontSize: 32,
  },
  classInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  className: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  classMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  classMetaIcon: {
    fontSize: FontSizes.sm,
  },
  classMetaText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  classMetaRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  instructor: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
});
