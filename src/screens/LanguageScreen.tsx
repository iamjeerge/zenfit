/**
 * @file LanguageScreen.tsx
 * @module screens/LanguageScreen
 * @description Language selection screen — allows users to switch between
 * 8 supported languages including RTL support for Arabic.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from '../utils/haptics';
import { Colors, Gradients, Spacing, BorderRadius, FontSizes } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import AnimatedEntry from '../components/AnimatedEntry';
import GlassCard from '../components/GlassCard';
import { useRouter } from '../utils/router';
import {
  SupportedLocale,
  LOCALE_META,
  getLocale,
  setLocale,
  t,
} from '../lib/i18n';

const LOCALES = Object.keys(LOCALE_META) as SupportedLocale[];

export default function LanguageScreen() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [selected, setSelected] = useState<SupportedLocale>(getLocale());
  const [isSaving, setIsSaving] = useState(false);

  const handleSelect = async (locale: SupportedLocale) => {
    if (locale === selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);
    try {
      await setLocale(locale);
      setSelected(locale);

      // Persist preference to Supabase
      if (user) {
        await supabase
          .from('profiles')
          .update({ preferred_language: locale })
          .eq('id', user.id);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Language Changed',
        'Some changes may require restarting the app to fully take effect.',
        [{ text: 'OK' }],
      );
    } catch {
      Alert.alert('Error', 'Could not change language. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={Gradients.cosmic as [string, string, ...string[]]} style={styles.bg} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AnimatedEntry delay={0}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{t('profile_language')}</Text>
            <View style={{ width: 36 }} />
          </View>
        </AnimatedEntry>

        <AnimatedEntry delay={100}>
          <Text style={styles.subtitle}>
            Choose your preferred language. ZenFit supports 8 languages including RTL.
          </Text>
        </AnimatedEntry>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {LOCALES.map((locale, i) => {
            const meta = LOCALE_META[locale];
            const isActive = locale === selected;

            return (
              <AnimatedEntry key={locale} delay={150 + i * 50}>
                <TouchableOpacity
                  onPress={() => handleSelect(locale)}
                  activeOpacity={0.7}
                  disabled={isSaving}
                >
                  <GlassCard
                    style={[
                      styles.langCard,
                      isActive && styles.langCardActive,
                    ]}
                  >
                    <Text style={styles.flag}>{meta.flag}</Text>
                    <View style={styles.langInfo}>
                      <Text style={[styles.langName, isActive && styles.langNameActive]}>
                        {meta.name}
                      </Text>
                      <Text style={styles.langNative}>{meta.nativeName}</Text>
                    </View>
                    {isActive && (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                    )}
                  </GlassCard>
                </TouchableOpacity>
              </AnimatedEntry>
            );
          })}

          <AnimatedEntry delay={600}>
            <GlassCard style={styles.infoCard} variant="subtle">
              <Text style={styles.infoEmoji}>🌍</Text>
              <Text style={styles.infoTitle}>RTL Support</Text>
              <Text style={styles.infoText}>
                Arabic is fully supported with right-to-left layout. The app interface
                will mirror automatically when Arabic is selected.
              </Text>
            </GlassCard>
          </AnimatedEntry>

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bg: { ...StyleSheet.absoluteFillObject },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  backText: { fontSize: FontSizes.xxl, color: Colors.textPrimary },
  title: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  scroll: { paddingHorizontal: Spacing.lg },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  langCardActive: {
    borderWidth: 1,
    borderColor: Colors.violet,
  },
  flag: { fontSize: 28, marginRight: Spacing.md },
  langInfo: { flex: 1 },
  langName: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.textPrimary },
  langNameActive: { color: Colors.violet },
  langNative: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.violet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  infoCard: { alignItems: 'center', padding: Spacing.lg, marginTop: Spacing.md },
  infoEmoji: { fontSize: 32, marginBottom: Spacing.sm },
  infoTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  infoText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
