import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
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

type BillingPeriod = 'monthly' | 'annual';

export default function SubscriptionScreen() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  const features = [
    'All yoga classes',
    'AI nutrition insights',
    'HD video quality',
    'Wearable sync',
    'Beauty tips & routines',
    'Ad-free experience',
  ];

  const monthlyPrice = 9.99;
  const annualPrice = 79.99;
  const annualSavings = Math.round(((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12)) * 100);
  const currentPrice = billingPeriod === 'monthly' ? monthlyPrice : annualPrice;
  const billingText = billingPeriod === 'monthly' ? '/month' : '/year';

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
        <View style={styles.header}>
          <Text style={styles.title}>Premium</Text>
          <Text style={styles.subtitle}>Unlock your full potential</Text>
        </View>

        {/* Billing Toggle */}
        <View style={styles.billingToggleContainer}>
          <TouchableOpacity
            style={[
              styles.billingOption,
              billingPeriod === 'monthly' && styles.billingOptionActive,
            ]}
            onPress={() => setBillingPeriod('monthly')}
          >
            <Text
              style={[
                styles.billingOptionText,
                billingPeriod === 'monthly' && styles.billingOptionTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.billingOption,
              billingPeriod === 'annual' && styles.billingOptionActive,
            ]}
            onPress={() => setBillingPeriod('annual')}
          >
            <Text
              style={[
                styles.billingOptionText,
                billingPeriod === 'annual' && styles.billingOptionTextActive,
              ]}
            >
              Annual
            </Text>
            {billingPeriod === 'annual' && (
              <Text style={styles.savingsText}>Save {annualSavings}%</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Premium Plan Card */}
        <LinearGradient
          colors={Gradients.aurora}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.planCardBorder}
        >
          <LinearGradient
            colors={Gradients.cardPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.planCard}
          >
            {/* Free Trial Badge */}
            <View style={styles.badgeContainer}>
              <LinearGradient
                colors={Gradients.sunrise}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.badge}
              >
                <Text style={styles.badgeText}>7-Day Free Trial</Text>
              </LinearGradient>
            </View>

            {/* Price */}
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${currentPrice.toFixed(2)}</Text>
              <Text style={styles.billingLabel}>{billingText}</Text>
            </View>

            {/* Features List */}
            <View style={styles.featuresList}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* CTA Button */}
            <TouchableOpacity style={styles.ctaButton}>
              <LinearGradient
                colors={Gradients.aurora}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaButtonGradient}
              >
                <Text style={styles.ctaButtonText}>Start Free Trial</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </LinearGradient>

        {/* Restore Purchase Link */}
        <TouchableOpacity style={styles.restoreButton}>
          <Text style={styles.restoreButtonText}>Restore Purchase</Text>
        </TouchableOpacity>
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
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
  },
  billingToggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  billingOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  billingOptionActive: {
    backgroundColor: Colors.violet,
  },
  billingOptionText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  billingOptionTextActive: {
    color: Colors.textPrimary,
  },
  savingsText: {
    fontSize: FontSizes.xs,
    color: Colors.sacredGold,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  planCardBorder: {
    borderRadius: BorderRadius.xl,
    padding: 2,
    marginBottom: Spacing.xl,
  },
  planCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.glassBackground,
    alignItems: 'center',
  },
  badgeContainer: {
    marginBottom: Spacing.lg,
  },
  badge: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  priceContainer: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  price: {
    fontSize: FontSizes.display,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  billingLabel: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  featuresList: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  checkmark: {
    fontSize: FontSizes.lg,
    color: Colors.sageLeaf,
    marginRight: Spacing.md,
    fontWeight: '700',
  },
  featureText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    flex: 1,
  },
  ctaButton: {
    width: '100%',
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  ctaButtonGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  restoreButtonText: {
    fontSize: FontSizes.md,
    color: Colors.lavender,
    fontWeight: '500',
  },
});
