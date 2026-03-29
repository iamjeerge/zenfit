/**
 * @file NutritionScreen.tsx
 * @module screens/tabs/NutritionScreen
 * @description Nutrition tab — tracks daily calorie and macro intake.
 * Supports manual meal logging, barcode scanning, and AI meal suggestions.
 */

import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from '../../utils/haptics';
import { useRouter } from '../../utils/router';
import { Colors, Gradients, Spacing, BorderRadius, FontSizes, Shadows } from '../../theme/colors';
import { AnimatedEntry, SectionHeader, GlassCard, GradientButton } from '../../components';

const { width } = Dimensions.get('window');

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface Macro {
  label: string;
  current: number;
  target: number;
  color: string;
  icon: string;
}

export default function NutritionScreen() {
  const [waterGlasses, setWaterGlasses] = useState(6);
  const maxWaterGlasses = 10;
  const router = useRouter();

  const macros: Macro[] = [
    {
      label: 'Protein',
      current: 68,
      target: 75,
      color: Colors.rosePetal,
      icon: '🥩',
    },
    {
      label: 'Carbs',
      current: 180,
      target: 250,
      color: Colors.sacredGold,
      icon: '🍞',
    },
    {
      label: 'Fat',
      current: 42,
      target: 65,
      color: Colors.cosmicBlue,
      icon: '🥑',
    },
  ];

  const meals = [
    {
      id: 'breakfast',
      label: 'Breakfast',
      time: '8:30 AM',
      items: ['Oatmeal with berries', 'Greek yogurt', 'Almond milk'],
      calories: 380,
      icon: '🥣',
    },
    {
      id: 'lunch',
      label: 'Lunch',
      time: '12:45 PM',
      items: ['Grilled chicken', 'Quinoa', 'Mixed vegetables'],
      calories: 520,
      icon: '🍗',
    },
    {
      id: 'dinner',
      label: 'Dinner',
      time: '7:15 PM',
      items: [],
      calories: 0,
      icon: '🍽️',
      placeholder: true,
    },
    {
      id: 'snack',
      label: 'Snack',
      time: 'Anytime',
      items: [],
      calories: 0,
      icon: '🍎',
      placeholder: true,
    },
  ];

  const renderMacroRing = (macro: Macro) => {
    const percentage = Math.min((macro.current / macro.target) * 100, 100);
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <View key={macro.label} style={styles.macroRingContainer}>
        <View style={styles.macroRing}>
          <View style={styles.macroCircle}>
            <View style={[styles.ring, { borderColor: macro.color }]}>
              <Text style={styles.macroIcon}>{macro.icon}</Text>
            </View>
          </View>
          <View style={styles.macroDetails}>
            <Text style={styles.macroLabel}>{macro.label}</Text>
            <Text style={styles.macroValue}>
              {macro.current}
              <Text style={styles.macroUnit}>g</Text>
            </Text>
            <Text style={styles.macroTarget}>of {macro.target}g</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header with Aurora Gradient */}
        <AnimatedEntry delay={0} duration={600}>
          <LinearGradient
            colors={Gradients.aurora as unknown as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.title} accessibilityRole="header">
                    Nutrition
                  </Text>
                  <Text style={styles.subtitle}>Track your daily intake</Text>
                </View>
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/barcode-scanner');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.scanButtonEmoji}>📷</Text>
                  <Text style={styles.scanButtonLabel}>Scan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </AnimatedEntry>

        {/* Macro Tracking */}
        <AnimatedEntry delay={100} duration={600}>
          <View style={styles.macroSection}>
            <SectionHeader title="Macros" />
            <View style={styles.macroGrid}>{macros.map(renderMacroRing)}</View>
          </View>
        </AnimatedEntry>

        {/* Water Tracker */}
        <AnimatedEntry delay={200} duration={600}>
          <View style={styles.waterSection}>
            <View style={styles.waterHeader}>
              <Text style={styles.sectionTitle}>Water Intake</Text>
              <Text style={styles.waterGoal}>
                {waterGlasses}/{maxWaterGlasses} glasses
              </Text>
            </View>

            <View style={styles.waterGrid}>
              {Array.from({ length: maxWaterGlasses }).map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.waterGlass, index < waterGlasses && styles.waterGlassFilled]}
                  onPress={() => setWaterGlasses(index < waterGlasses ? index : index + 1)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={
                      index < waterGlasses
                        ? [Colors.cosmicBlue, Colors.violetLight]
                        : [Colors.glassBackground, Colors.glassBackgroundLight]
                    }
                    style={styles.waterGlassGradient}
                  >
                    <Text style={styles.waterIcon}>{index < waterGlasses ? '💧' : '🥤'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.addWaterButton}
              onPress={() => setWaterGlasses(Math.min(waterGlasses + 1, maxWaterGlasses))}
              activeOpacity={0.8}
            >
              <LinearGradient colors={Gradients.aurora} style={styles.buttonGradient}>
                <Text style={styles.addWaterButtonText}>+ Add Water</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </AnimatedEntry>

        {/* Today's Meals */}
        <AnimatedEntry delay={300} duration={600}>
          <View style={styles.mealsSection}>
            <SectionHeader title="Today's Meals" />
            <View style={styles.mealsList}>
              {meals.map((meal) => (
                <TouchableOpacity key={meal.id} style={styles.mealCard} activeOpacity={0.8}>
                  <LinearGradient
                    colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
                    style={styles.mealGradient}
                  >
                    <View style={styles.mealHeader}>
                      <View style={styles.mealTitle}>
                        <Text style={styles.mealIcon}>{meal.icon}</Text>
                        <View style={styles.mealTitleText}>
                          <Text style={styles.mealLabel}>{meal.label}</Text>
                          <Text style={styles.mealTime}>{meal.time}</Text>
                        </View>
                      </View>
                      <View style={styles.mealCalories}>
                        <Text style={styles.mealCaloriesValue}>{meal.calories}</Text>
                        <Text style={styles.mealCaloriesUnit}>cal</Text>
                      </View>
                    </View>

                    {meal.items && meal.items.length > 0 ? (
                      <View style={styles.mealItems}>
                        {meal.items.map((item, idx) => (
                          <View key={idx} style={styles.mealItem}>
                            <Text style={styles.mealItemDot}>•</Text>
                            <Text style={styles.mealItemText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.mealPlaceholder}>No meals logged yet</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </AnimatedEntry>

        {/* AI Food Recommendation */}
        <AnimatedEntry delay={400} duration={600}>
          <View style={styles.aiSection}>
            <SectionHeader title="AI Recommendation" />
            <TouchableOpacity style={styles.aiCard} activeOpacity={0.8}>
              <LinearGradient
                colors={Gradients.cardPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.aiGradient}
              >
                <View style={styles.aiHeader}>
                  <Text style={styles.aiIcon}>🤖</Text>
                  <Text style={styles.aiBadge}>Smart Suggestion</Text>
                </View>

                <Text style={styles.aiTitle}>Protein-Rich Buddha Bowl</Text>
                <Text style={styles.aiDescription}>
                  Perfect for dinner to meet your protein goals. Based on your preferences and
                  nutritional needs.
                </Text>

                <View style={styles.aiMacros}>
                  <View style={styles.aiMacroItem}>
                    <Text style={styles.aiMacroLabel}>Protein</Text>
                    <Text style={styles.aiMacroValue}>32g</Text>
                  </View>
                  <View style={styles.aiMacroItem}>
                    <Text style={styles.aiMacroLabel}>Carbs</Text>
                    <Text style={styles.aiMacroValue}>45g</Text>
                  </View>
                  <View style={styles.aiMacroItem}>
                    <Text style={styles.aiMacroLabel}>Fat</Text>
                    <Text style={styles.aiMacroValue}>18g</Text>
                  </View>
                </View>

                <View style={styles.aiLocation}>
                  <Text style={styles.aiLocationIcon}>📍</Text>
                  <Text style={styles.aiLocationText}>Available at local restaurants</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.suggestionsButton} activeOpacity={0.8}>
              <LinearGradient colors={Gradients.sunrise} style={styles.buttonGradient}>
                <Text style={styles.suggestionsButtonText}>Get AI Suggestions →</Text>
              </LinearGradient>
            </TouchableOpacity>
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
  headerGradient: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  headerContent: {
    gap: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  scanButtonEmoji: { fontSize: 22 },
  scanButtonLabel: { fontSize: FontSizes.xs, color: '#fff', fontWeight: '600', marginTop: 2 },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  macroSection: {
    marginBottom: Spacing.xl,
  },
  macroGrid: {
    gap: Spacing.md,
  },
  macroRingContainer: {
    marginBottom: Spacing.md,
  },
  macroRing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.glassBackground,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.subtle,
  },
  macroCircle: {
    position: 'relative',
  },
  ring: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  macroIcon: {
    fontSize: 28,
  },
  macroDetails: {
    flex: 1,
  },
  macroLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  macroValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  macroUnit: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  macroTarget: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  waterSection: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.glassBackground,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.subtle,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  waterGoal: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.cosmicBlue,
  },
  waterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  waterGlass: {
    width: (width - Spacing.md * 2 - Spacing.lg * 2 - Spacing.md * 4) / 5,
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  waterGlassFilled: {
    borderColor: Colors.cosmicBlue,
  },
  waterGlassGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterIcon: {
    fontSize: 24,
  },
  addWaterButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    minHeight: 48,
    ...Shadows.subtle,
  },
  buttonGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  addWaterButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  mealsSection: {
    marginBottom: Spacing.xl,
  },
  mealsList: {
    gap: Spacing.md,
  },
  mealCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.subtle,
  },
  mealGradient: {
    padding: Spacing.lg,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  mealTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  mealIcon: {
    fontSize: 32,
  },
  mealTitleText: {
    flex: 1,
  },
  mealLabel: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  mealTime: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  mealCalories: {
    alignItems: 'flex-end',
  },
  mealCaloriesValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.sacredGold,
  },
  mealCaloriesUnit: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  mealItems: {
    gap: Spacing.sm,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  mealItemDot: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  mealItemText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  mealPlaceholder: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  aiSection: {
    marginBottom: Spacing.lg,
  },
  aiCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  aiGradient: {
    padding: Spacing.lg,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  aiIcon: {
    fontSize: 32,
  },
  aiBadge: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.sacredGold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  aiTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  aiDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  aiMacros: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  aiMacroItem: {
    flex: 1,
    alignItems: 'center',
  },
  aiMacroLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  aiMacroValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  aiLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  aiLocationIcon: {
    fontSize: 20,
  },
  aiLocationText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  suggestionsButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    minHeight: 48,
    ...Shadows.subtle,
  },
  suggestionsButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
});
