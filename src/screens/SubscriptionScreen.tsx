/**
 * @file SubscriptionScreen.tsx
 * @module screens/SubscriptionScreen
 * @description Subscription / paywall screen — presents ZenFit Premium features
 * and handles in-app purchase or subscription flows.
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from '../utils/haptics';
import { Linking } from 'react-native';
// expo-web-browser replaced with Linking
const WebBrowser = {
  openAuthSessionAsync: async (url: string, _redirectUrl: string) => {
    await Linking.openURL(url);
    return { type: 'cancel' as const };
  },
  openBrowserAsync: async (url: string) => Linking.openURL(url),
};
import {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '../theme/colors';
import AnimatedEntry from '../components/AnimatedEntry';
import { GradientButton } from '../components';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

type BillingPeriod = 'monthly' | 'annual';

export default function SubscriptionScreen() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const profile = useAuthStore((s) => s.profile);
  const isPremium = profile?.subscription_status === 'premium';

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

  const handleSubscribe = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { billing_period: billingPeriod },
      });
      if (error || !data?.url) throw new Error(error?.message ?? 'No checkout URL returned');
      const result = await WebBrowser.openAuthSessionAsync(data.url, 'zenfit://subscription-success');
      if (result.type === 'success') {
        Alert.alert('Success!', 'Your subscription is now active. Enjoy ZenFit Premium!');
      } else if (result.type === 'cancel') {
        // User cancelled — no action needed
      }
    } catch (err: any) {
      Alert.alert('Checkout Failed', err?.message ?? 'Unable to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-customer-portal-session', {});
      if (error || !data?.url) throw new Error(error?.message ?? 'No portal URL');
      await WebBrowser.openBrowserAsync(data.url);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Unable to open subscription portal.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <Text style={styles.title}>Premium</Text>
          <Text style={styles.subtitle}>Unlock your full potential</Text>
        </View>
        </AnimatedEntry>

        {/* Billing Toggle */}
        <AnimatedEntry delay={100}>
        <View style={styles.billingToggleContainer}>
          <TouchableOpacity
            style={[
              styles.billingOption,
              billingPeriod === 'monthly' && styles.billingOptionActive,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setBillingPeriod('monthly');
            }}
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
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setBillingPeriod('annual');
            }}
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

        </AnimatedEntry>

        {/* Premium Plan Card */}
        <AnimatedEntry delay={200}>
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
            {isPremium ? (
              <View>
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>✅ You're Premium!</Text>
                </View>
                <GradientButton
                  title="Manage Subscription"
                  onPress={handleManageSubscription}
                  style={{ marginTop: Spacing.md }}
                />
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.ctaBtn, isLoading && styles.ctaBtnDisabled]}
                onPress={handleSubscribe}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={Gradients.sunrise as unknown as [string, string, ...string[]]}
                  style={styles.ctaBtnGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.textPrimary} />
                  ) : (
                    <Text style={styles.ctaBtnText}>Start Free Trial</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </LinearGradient>

        </AnimatedEntry>

        {/* Restore Purchase Link */}
        <AnimatedEntry delay={300}>
        <TouchableOpacity style={styles.restoreButton} onPress={handleManageSubscription}>
          <Text style={styles.restoreButtonText}>Restore Purchase</Text>
        </TouchableOpacity>
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
  premiumBadge: {
    alignItems: 'center', paddingVertical: Spacing.sm,
    backgroundColor: Colors.sageLeaf + '22', borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.sageLeaf + '44', marginBottom: Spacing.sm,
  },
  premiumBadgeText: { fontSize: FontSizes.md, color: Colors.sageLeaf, fontWeight: '700' },
  ctaBtn: { width: '100%', borderRadius: BorderRadius.lg, overflow: 'hidden', marginTop: Spacing.md },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnGradient: { paddingVertical: Spacing.md, alignItems: 'center', justifyContent: 'center' },
  ctaBtnText: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
});
