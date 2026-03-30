/**
 * @file TrainerMarketplaceScreen.tsx
 * @module screens/TrainerMarketplaceScreen
 * @description Trainer marketplace — browse certified trainers, view profiles,
 * book sessions, and manage trainer connections.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from '../utils/haptics';
import { Colors, Gradients, Spacing, BorderRadius, FontSizes, Shadows } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useRouter } from '../utils/router';
import AnimatedEntry from '../components/AnimatedEntry';
import SectionHeader from '../components/SectionHeader';
import GlassCard from '../components/GlassCard';

type Specialty = 'yoga' | 'strength' | 'cardio' | 'meditation' | 'nutrition' | 'hiit' | 'flexibility';

interface TrainerProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  specialties: Specialty[];
  certification: string;
  years_experience: number;
  rating: number;
  total_reviews: number;
  hourly_rate_cents: number;
  currency: string;
  is_available: boolean;
  avatar_initial: string;
  total_clients: number;
}

const SPECIALTIES: { key: Specialty; emoji: string; label: string }[] = [
  { key: 'yoga', emoji: '🧘', label: 'Yoga' },
  { key: 'strength', emoji: '🏋️', label: 'Strength' },
  { key: 'cardio', emoji: '🏃', label: 'Cardio' },
  { key: 'meditation', emoji: '🌸', label: 'Meditation' },
  { key: 'nutrition', emoji: '🥗', label: 'Nutrition' },
  { key: 'hiit', emoji: '⚡', label: 'HIIT' },
  { key: 'flexibility', emoji: '🤸', label: 'Flexibility' },
];

export default function TrainerMarketplaceScreen() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | 'all'>('all');
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerProfile | null>(null);

  useEffect(() => {
    fetchTrainers();
  }, [selectedSpecialty]);

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('trainer_profiles')
        .select('*')
        .eq('is_available', true)
        .order('rating', { ascending: false });

      if (selectedSpecialty !== 'all') {
        query = query.contains('specialties', [selectedSpecialty]);
      }

      const { data, error } = await query.limit(30);
      if (error) throw error;

      setTrainers(
        (data || []).map((t: any) => ({
          ...t,
          avatar_initial: (t.display_name?.[0] ?? 'T').toUpperCase(),
        })),
      );
    } catch {
      Alert.alert('Error', 'Failed to load trainers.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTrainers = searchQuery.trim()
    ? trainers.filter(
        (t) =>
          t.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.specialties.some((s) => s.includes(searchQuery.toLowerCase())),
      )
    : trainers;

  const handleBookSession = async (trainer: TrainerProfile) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const { error } = await supabase.from('trainer_bookings').insert({
        trainer_id: trainer.id,
        client_id: user!.id,
        status: 'pending',
        requested_at: new Date().toISOString(),
      });
      if (error) throw error;
      Alert.alert(
        'Request Sent!',
        `${trainer.display_name} will review your booking request.`,
      );
      setSelectedTrainer(null);
    } catch {
      Alert.alert('Error', 'Could not send booking request.');
    }
  };

  const renderStars = (rating: number) => {
    const filled = Math.round(rating);
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
  };

  const formatRate = (cents: number, currency: string) => {
    return `${currency === 'USD' ? '$' : currency}${(cents / 100).toFixed(0)}/hr`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.cosmic as unknown as [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Trainer Marketplace</Text>
          <Text style={styles.subtitle}>Find your perfect coach</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search trainers..."
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      {/* Specialty Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.specialtyScroll}
      >
        <TouchableOpacity
          style={[styles.specChip, selectedSpecialty === 'all' && styles.specChipActive]}
          onPress={() => setSelectedSpecialty('all')}
        >
          <Text style={styles.specChipText}>🌟 All</Text>
        </TouchableOpacity>
        {SPECIALTIES.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[styles.specChip, selectedSpecialty === s.key && styles.specChipActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedSpecialty(s.key);
            }}
          >
            <Text style={styles.specChipText}>
              {s.emoji} {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color={Colors.violet} style={{ marginVertical: Spacing.xl }} />
        ) : filteredTrainers.length === 0 ? (
          <AnimatedEntry>
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No trainers found</Text>
              <Text style={styles.emptySubtitle}>Try a different specialty or search term</Text>
            </GlassCard>
          </AnimatedEntry>
        ) : (
          filteredTrainers.map((trainer, idx) => (
            <AnimatedEntry key={trainer.id} delay={idx * 60}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedTrainer(selectedTrainer?.id === trainer.id ? null : trainer);
                }}
                activeOpacity={0.8}
              >
                <GlassCard style={styles.trainerCard}>
                  <View style={styles.trainerRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{trainer.avatar_initial}</Text>
                    </View>
                    <View style={styles.trainerInfo}>
                      <Text style={styles.trainerName}>{trainer.display_name}</Text>
                      <Text style={styles.trainerCert}>{trainer.certification}</Text>
                      <View style={styles.ratingRow}>
                        <Text style={styles.stars}>{renderStars(trainer.rating)}</Text>
                        <Text style={styles.reviewCount}>
                          {trainer.rating.toFixed(1)} ({trainer.total_reviews})
                        </Text>
                      </View>
                    </View>
                    <View style={styles.rateBox}>
                      <Text style={styles.rate}>
                        {formatRate(trainer.hourly_rate_cents, trainer.currency)}
                      </Text>
                      <Text style={styles.yearsExp}>{trainer.years_experience}y exp</Text>
                    </View>
                  </View>

                  {/* Specialties */}
                  <View style={styles.specTagRow}>
                    {trainer.specialties.map((s) => {
                      const info = SPECIALTIES.find((sp) => sp.key === s);
                      return (
                        <View key={s} style={styles.specTag}>
                          <Text style={styles.specTagText}>
                            {info?.emoji} {info?.label ?? s}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Expanded detail */}
                  {selectedTrainer?.id === trainer.id && (
                    <AnimatedEntry delay={0} duration={300}>
                      <View style={styles.expandedSection}>
                        <Text style={styles.bio}>{trainer.bio}</Text>
                        <View style={styles.statsRow}>
                          <View style={styles.stat}>
                            <Text style={styles.statValue}>{trainer.total_clients}</Text>
                            <Text style={styles.statLabel}>Clients</Text>
                          </View>
                          <View style={styles.stat}>
                            <Text style={styles.statValue}>{trainer.total_reviews}</Text>
                            <Text style={styles.statLabel}>Reviews</Text>
                          </View>
                          <View style={styles.stat}>
                            <Text style={styles.statValue}>{trainer.years_experience}y</Text>
                            <Text style={styles.statLabel}>Experience</Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.bookBtn}
                          onPress={() => handleBookSession(trainer)}
                        >
                          <LinearGradient
                            colors={Gradients.aurora as unknown as [string, string, ...string[]]}
                            style={styles.bookBtnGradient}
                          >
                            <Text style={styles.bookBtnText}>Book Session</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </AnimatedEntry>
                  )}
                </GlassCard>
              </TouchableOpacity>
            </AnimatedEntry>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  backBtn: { padding: Spacing.xs },
  backText: { fontSize: 24, color: Colors.textPrimary },
  headerText: { flex: 1 },
  title: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  searchRow: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  searchInput: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  specialtyScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  specChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginRight: Spacing.xs,
  },
  specChipActive: { backgroundColor: Colors.violet, borderColor: Colors.violet },
  specChipText: { color: Colors.textPrimary, fontSize: FontSizes.sm, fontWeight: '600' },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 120 },
  trainerCard: { marginBottom: Spacing.md },
  trainerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.violet,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: Colors.textPrimary, fontWeight: '700', fontSize: FontSizes.xl },
  trainerInfo: { flex: 1 },
  trainerName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  trainerCert: { fontSize: FontSizes.xs, color: Colors.lavender, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  stars: { color: Colors.sacredGold, fontSize: FontSizes.sm },
  reviewCount: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  rateBox: { alignItems: 'flex-end' },
  rate: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.sageLeaf },
  yearsExp: { fontSize: FontSizes.xs, color: Colors.textMuted },
  specTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.sm },
  specTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  specTagText: { color: Colors.lavender, fontSize: FontSizes.xs },
  expandedSection: { marginTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.glassBorder, paddingTop: Spacing.md },
  bio: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.md },
  stat: { alignItems: 'center' },
  statValue: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  bookBtn: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  bookBtnGradient: { paddingVertical: Spacing.md, alignItems: 'center' },
  bookBtnText: { color: Colors.textPrimary, fontWeight: '700', fontSize: FontSizes.lg },
  emptyCard: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.sm },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  emptySubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4 },
});
