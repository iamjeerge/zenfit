import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
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

type Gender = 'men' | 'women' | 'all';
type Category = 'Skin' | 'Hair' | 'Grooming' | 'Post-Workout' | 'Nutrition Beauty';

interface BeautyTip {
  id: string;
  title: string;
  category: Category;
  preview: string;
  gender: Gender | 'unisex';
  imageUrl: string;
}

export default function BeautyTipsScreen() {
  const [genderFilter, setGenderFilter] = useState<Gender>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');

  const tips: BeautyTip[] = [
    {
      id: '1',
      title: 'Glow-Up Skincare Routine',
      category: 'Skin',
      preview: 'Master the 10-step K-beauty routine for radiant skin',
      gender: 'women',
      imageUrl: 'https://via.placeholder.com/200x120?text=Skincare',
    },
    {
      id: '2',
      title: 'Post-Workout Face Care',
      category: 'Post-Workout',
      preview: 'Cleanse and refresh after your intense yoga session',
      gender: 'unisex',
      imageUrl: 'https://via.placeholder.com/200x120?text=Post-Workout',
    },
    {
      id: '3',
      title: 'Beard Grooming Essentials',
      category: 'Grooming',
      preview: 'Keep your beard healthy and hydrated',
      gender: 'men',
      imageUrl: 'https://via.placeholder.com/200x120?text=Beard',
    },
    {
      id: '4',
      title: 'Hydration from Within',
      category: 'Nutrition Beauty',
      preview: 'Foods that boost collagen and skin elasticity naturally',
      gender: 'women',
      imageUrl: 'https://via.placeholder.com/200x120?text=Nutrition',
    },
    {
      id: '5',
      title: 'Hair Mask Magic',
      category: 'Hair',
      preview: 'DIY natural hair masks for deep conditioning',
      gender: 'women',
      imageUrl: 'https://via.placeholder.com/200x120?text=Hair',
    },
    {
      id: '6',
      title: 'Men\'s Skincare 101',
      category: 'Skin',
      preview: 'Minimalist routine for clear, healthy skin',
      gender: 'men',
      imageUrl: 'https://via.placeholder.com/200x120?text=MensSkin',
    },
  ];

  const categories: Category[] = ['Skin', 'Hair', 'Grooming', 'Post-Workout', 'Nutrition Beauty'];

  const filteredTips = tips.filter((tip) => {
    const matchesGender = genderFilter === 'all' || tip.gender === genderFilter || tip.gender === 'unisex';
    const matchesCategory = selectedCategory === 'all' || tip.category === selectedCategory;
    return matchesGender && matchesCategory;
  });

  const GenderButton = ({ value, label }: { value: Gender; label: string }) => (
    <TouchableOpacity
      style={[
        styles.genderButton,
        genderFilter === value && styles.genderButtonActive,
      ]}
      onPress={() => setGenderFilter(value)}
    >
      <Text
        style={[
          styles.genderButtonText,
          genderFilter === value && styles.genderButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const CategoryChip = ({ category }: { category: Category | 'all' }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === category && styles.categoryChipActive,
      ]}
      onPress={() => setSelectedCategory(category as Category | 'all')}
    >
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === category && styles.categoryChipTextActive,
        ]}
      >
        {category === 'all' ? 'All' : category}
      </Text>
    </TouchableOpacity>
  );

  const TipCard = ({ tip }: { tip: BeautyTip }) => (
    <LinearGradient
      colors={Gradients.cardPrimary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.tipCard, { borderColor: Colors.glassBorder }]}
    >
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>📸</Text>
        </View>
      </View>
      <View style={styles.tipContent}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{tip.category}</Text>
        </View>
        <Text style={styles.tipTitle}>{tip.title}</Text>
        <Text style={styles.tipPreview}>{tip.preview}</Text>
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
        <Text style={styles.title}>Beauty Tips</Text>
        <Text style={styles.subtitle}>Glow from inside out</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Gender Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>For</Text>
          <View style={styles.genderButtonGroup}>
            <GenderButton value="women" label="Women" />
            <GenderButton value="men" label="Men" />
            <GenderButton value="all" label="All" />
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryChipContainer}
          >
            <CategoryChip category="all" />
            {categories.map((category) => (
              <CategoryChip key={category} category={category} />
            ))}
          </ScrollView>
        </View>

        {/* Tips Grid */}
        <View style={styles.tipsContainer}>
          {filteredTips.length > 0 ? (
            filteredTips.map((tip) => <TipCard key={tip.id} tip={tip} />)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No tips found</Text>
            </View>
          )}
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  filterSection: {
    marginBottom: Spacing.lg,
  },
  filterLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  genderButtonGroup: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  genderButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.textMuted,
  },
  genderButtonActive: {
    backgroundColor: Colors.violet,
    borderColor: Colors.violet,
  },
  genderButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  genderButtonTextActive: {
    color: Colors.textPrimary,
  },
  categoryChipContainer: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  categoryChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  categoryChipActive: {
    backgroundColor: Colors.lavender,
    borderColor: Colors.lavender,
  },
  categoryChipText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.background,
  },
  tipsContainer: {
    marginTop: Spacing.lg,
  },
  tipCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    backgroundColor: Colors.glassBackground,
    flexDirection: 'row',
    ...Shadows.card,
  },
  imageContainer: {
    width: 100,
    height: 100,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.glassBorder,
  },
  imagePlaceholderText: {
    fontSize: 32,
  },
  tipContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  categoryBadge: {
    backgroundColor: Colors.violet,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  categoryBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tipTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  tipPreview: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
});
