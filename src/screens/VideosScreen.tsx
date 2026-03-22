import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
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

type Category = 'All' | 'Yoga' | 'Meditation' | 'Strength' | 'Cardio' | 'HIIT' | 'Breathing';

interface Video {
  id: string;
  title: string;
  instructor: string;
  duration: number;
  category: Category;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  isPremium: boolean;
}

export default function VideosScreen() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  const categories: Category[] = [
    'All',
    'Yoga',
    'Meditation',
    'Strength',
    'Cardio',
    'HIIT',
    'Breathing',
  ];

  const videos: Video[] = [
    {
      id: '1',
      title: 'Morning Vinyasa Flow',
      instructor: 'Sarah Chen',
      duration: 30,
      category: 'Yoga',
      difficulty: 'Intermediate',
      rating: 4.8,
      isPremium: false,
    },
    {
      id: '2',
      title: 'Deep Relaxation Meditation',
      instructor: 'Marcus Silver',
      duration: 20,
      category: 'Meditation',
      difficulty: 'Beginner',
      rating: 4.9,
      isPremium: false,
    },
    {
      id: '3',
      title: 'Full Body Strength Training',
      instructor: 'Alex Rivera',
      duration: 45,
      category: 'Strength',
      difficulty: 'Advanced',
      rating: 4.7,
      isPremium: true,
    },
    {
      id: '4',
      title: 'HIIT Cardio Blast',
      instructor: 'Jordan Lee',
      duration: 25,
      category: 'HIIT',
      difficulty: 'Advanced',
      rating: 4.6,
      isPremium: true,
    },
    {
      id: '5',
      title: 'Breathing for Calm',
      instructor: 'Sophia Green',
      duration: 15,
      category: 'Breathing',
      difficulty: 'Beginner',
      rating: 4.8,
      isPremium: false,
    },
    {
      id: '6',
      title: 'Gentle Yoga for Flexibility',
      instructor: 'David Kumar',
      duration: 35,
      category: 'Yoga',
      difficulty: 'Beginner',
      rating: 4.7,
      isPremium: false,
    },
    {
      id: '7',
      title: 'High-Intensity Cardio Mix',
      instructor: 'Emma Stone',
      duration: 30,
      category: 'Cardio',
      difficulty: 'Intermediate',
      rating: 4.5,
      isPremium: false,
    },
    {
      id: '8',
      title: 'Advanced Meditation Journey',
      instructor: 'Marcus Silver',
      duration: 45,
      category: 'Meditation',
      difficulty: 'Advanced',
      rating: 4.9,
      isPremium: true,
    },
  ];

  const filteredVideos =
    selectedCategory === 'All'
      ? videos
      : videos.filter((video) => video.category === selectedCategory);

  const featuredVideo = filteredVideos[0];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return Colors.sageLeaf;
      case 'Intermediate':
        return Colors.sacredGold;
      case 'Advanced':
        return Colors.rosePetal;
      default:
        return Colors.textSecondary;
    }
  };

  const CategoryTab = ({ category }: { category: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === category && styles.categoryTabActive,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        style={[
          styles.categoryTabText,
          selectedCategory === category && styles.categoryTabTextActive,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  const FeaturedCard = ({ video }: { video: Video }) => (
    <LinearGradient
      colors={Gradients.cardPrimary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.featuredCard, { borderColor: Colors.glassBorder }]}
    >
      <View style={styles.featuredImageContainer}>
        <View style={styles.featuredImagePlaceholder}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      </View>
      <View style={styles.featuredContent}>
        <View style={styles.featuredHeader}>
          <Text style={styles.featuredTitle}>{video.title}</Text>
          {video.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>PRO</Text>
            </View>
          )}
        </View>
        <Text style={styles.featuredInstructor}>{video.instructor}</Text>
        <View style={styles.featuredMeta}>
          <Text style={styles.duration}>⏱ {video.duration} min</Text>
          <Text style={styles.rating}>⭐ {video.rating}</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const VideoCard = ({ video }: { video: Video }) => (
    <LinearGradient
      colors={Gradients.cardSecondary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.videoCard, { borderColor: Colors.glassBorder }]}
    >
      <View style={styles.videoThumbnail}>
        <View style={styles.videoThumbnailPlaceholder}>
          <Text style={styles.videoPlayIcon}>▶</Text>
        </View>
      </View>
      <View style={styles.videoContent}>
        <View style={styles.videoHeader}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {video.title}
          </Text>
          {video.isPremium && (
            <View style={styles.videoPremiumBadge}>
              <Text style={styles.videoPremiumText}>✨</Text>
            </View>
          )}
        </View>
        <Text style={styles.videoInstructor} numberOfLines={1}>
          {video.instructor}
        </Text>
        <View style={styles.videoMeta}>
          <View style={styles.metaItem}>
            <Text style={[styles.difficulty, { color: getDifficultyColor(video.difficulty) }]}>
              {video.difficulty}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.videoDuration}>⏱ {video.duration}m</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.videoRating}>⭐ {video.rating}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.downloadButton}>
          <Text style={styles.downloadIcon}>⬇</Text>
        </TouchableOpacity>
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
        <Text style={styles.title}>Videos</Text>
        <Text style={styles.subtitle}>Explore our video library</Text>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryTabsContainer}
        style={styles.categoryTabsScroll}
      >
        {categories.map((category) => (
          <CategoryTab key={category} category={category} />
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Featured Video */}
        {featuredVideo && (
          <View style={styles.featuredSection}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <FeaturedCard video={featuredVideo} />
          </View>
        )}

        {/* Video Grid */}
        <View style={styles.videosSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'All' ? 'All Videos' : selectedCategory}
          </Text>
          <View style={styles.videoGrid}>
            {filteredVideos.slice(1).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </View>
        </View>
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
  categoryTabsScroll: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.card,
  },
  categoryTabsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  categoryTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  categoryTabActive: {
    backgroundColor: Colors.violet,
    borderColor: Colors.violet,
  },
  categoryTabText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryTabTextActive: {
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  featuredSection: {
    marginBottom: Spacing.xl,
  },
  featuredCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.glassBackground,
    ...Shadows.card,
  },
  featuredImageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    overflow: 'hidden',
  },
  featuredImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 48,
    color: Colors.sacredGold,
  },
  featuredContent: {
    padding: Spacing.lg,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  featuredTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.md,
  },
  premiumBadge: {
    backgroundColor: Colors.sacredGold,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  premiumBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.background,
  },
  featuredInstructor: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  duration: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  rating: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  videosSection: {
    marginBottom: Spacing.md,
  },
  videoGrid: {
    gap: Spacing.md,
  },
  videoCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.glassBackground,
    flexDirection: 'row',
    ...Shadows.card,
  },
  videoThumbnail: {
    width: 100,
    height: 100,
    backgroundColor: Colors.card,
  },
  videoThumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.glassBorder,
  },
  videoPlayIcon: {
    fontSize: 32,
    color: Colors.sacredGold,
  },
  videoContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  videoTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  videoPremiumBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  videoPremiumText: {
    fontSize: FontSizes.sm,
  },
  videoInstructor: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  videoMeta: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  metaItem: {
    flex: 1,
  },
  difficulty: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  videoDuration: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  videoRating: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  downloadButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.card,
    alignSelf: 'flex-start',
  },
});
