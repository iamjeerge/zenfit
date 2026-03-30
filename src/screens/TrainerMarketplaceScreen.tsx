/**
 * @file TrainerMarketplaceScreen.tsx
 * @module screens/TrainerMarketplaceScreen
 * @description Trainer marketplace — browse, book, and review fitness trainers
 * in the ZenFit community.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from '../utils/haptics';
import { Colors, Gradients, Spacing, BorderRadius, FontSizes, Shadows } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import AnimatedEntry from '../components/AnimatedEntry';
import SectionHeader from '../components/SectionHeader';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import SkeletonLoader from '../components/SkeletonLoader';
import { useRouter } from '../utils/router';

type Specialty = 'yoga' | 'strength' | 'cardio' | 'nutrition' | 'meditation' | 'flexibility';

interface Trainer {
  id: string;
  user_id: string;
  full_name: string;
  bio: string;
  specialties: Specialty[];
  hourly_rate_cents: number;
  currency: string;
  rating: number;
  total_reviews: number;
  total_sessions: number;
  is_verified: boolean;
  avatar_url: string | null;
}

interface TrainerReview {
  id: string;
  reviewer_name: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

const SPECIALTIES: Record<Specialty, { emoji: string; label: string }> = {
  yoga: { emoji: '🧘', label: 'Yoga' },
  strength: { emoji: '💪', label: 'Strength' },
  cardio: { emoji: '🏃', label: 'Cardio' },
  nutrition: { emoji: '🥗', label: 'Nutrition' },
  meditation: { emoji: '🧠', label: 'Meditation' },
  flexibility: { emoji: '🤸', label: 'Flexibility' },
};

export default function TrainerMarketplaceScreen() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState<Specialty | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [reviews, setReviews] = useState<TrainerReview[]>([]);

  useEffect(() => {
    fetchTrainers();
  }, [filterSpecialty]);

  const fetchTrainers = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('trainers')
        .select(`
          id, user_id, bio, specialties, hourly_rate_cents, currency,
          rating, total_reviews, total_sessions, is_verified,
          profile:profiles!user_id(full_name, avatar_url)
        `)
        .order('rating', { ascending: false });

      if (filterSpecialty) {
        query = query.contains('specialties', [filterSpecialty]);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mapped: Trainer[] = (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        full_name: row.profile?.full_name ?? 'Trainer',
        bio: row.bio ?? '',
        specialties: row.specialties ?? [],
        hourly_rate_cents: row.hourly_rate_cents,
        currency: row.currency ?? 'USD',
        rating: row.rating ?? 0,
        total_reviews: row.total_reviews ?? 0,
        total_sessions: row.total_sessions ?? 0,
        is_verified: row.is_verified ?? false,
        avatar_url: row.profile?.avatar_url,
      }));

      setTrainers(
        searchQuery
          ? mapped.filter((t) =>
              t.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
            )
          : mapped,
      );
    } catch {
      setTrainers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchTrainers();
  };

  const handleBook = async (trainer: Trainer) => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const { error } = await supabase.from('trainer_bookings').insert({
        trainer_id: trainer.id,
        user_id: user.id,
        status: 'pending',
        requested_at: new Date().toISOString(),
      });
      if (error) throw error;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Booked!', `Session request sent to ${trainer.full_name}.`);
    } catch {
      Alert.alert('Error', 'Could not book session. Please try again.');
    }
  };

  const formatPrice = (cents: number, currency: string) => {
    const amount = cents / 100;
    return `${currency === 'USD' ? '$' : currency} ${amount.toFixed(0)}/hr`;
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={Gradients.cosmic as [string, string, ...string[]]} style={styles.bg} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <AnimatedEntry delay={0}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Trainers</Text>
            <View style={{ width: 36 }} />
          </View>
        </AnimatedEntry>

        {/* Search */}
        <AnimatedEntry delay={100}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search trainers..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
        </AnimatedEntry>

        {/* Specialty Filter */}
        <AnimatedEntry delay={150}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <TouchableOpacity
              onPress={() => { setFilterSpecialty(null); Haptics.selectionAsync(); }}
              style={[styles.filterBtn, !filterSpecialty && styles.filterActive]}
            >
              <Text style={[styles.filterText, !filterSpecialty && styles.filterTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {(Object.keys(SPECIALTIES) as Specialty[]).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => { setFilterSpecialty(s); Haptics.selectionAsync(); }}
                style={[styles.filterBtn, filterSpecialty === s && styles.filterActive]}
              >
                <Text style={styles.filterEmoji}>{SPECIALTIES[s].emoji}</Text>
                <Text style={[styles.filterText, filterSpecialty === s && styles.filterTextActive]}>
                  {SPECIALTIES[s].label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </AnimatedEntry>

        {isLoading ? (
          <SkeletonLoader variant="list" />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {trainers.length === 0 ? (
              <AnimatedEntry delay={200}>
                <GlassCard style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>🏋️</Text>
                  <Text style={styles.emptyTitle}>No trainers found</Text>
                  <Text style={styles.emptySubtitle}>Try changing your filters</Text>
                </GlassCard>
              </AnimatedEntry>
            ) : (
              trainers.map((trainer, i) => (
                <AnimatedEntry key={trainer.id} delay={200 + i * 80}>
                  <GlassCard style={styles.trainerCard}>
                    <View style={styles.trainerHeader}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {trainer.full_name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.trainerInfo}>
                        <View style={styles.nameRow}>
                          <Text style={styles.trainerName}>{trainer.full_name}</Text>
                          {trainer.is_verified && <Text style={styles.verified}>✓</Text>}
                        </View>
                        <Text style={styles.ratingText}>
                          {renderStars(trainer.rating)} ({trainer.total_reviews})
                        </Text>
                        <Text style={styles.sessionsText}>
                          {trainer.total_sessions} sessions completed
                        </Text>
                      </View>
                      <Text style={styles.priceText}>
                        {formatPrice(trainer.hourly_rate_cents, trainer.currency)}
                      </Text>
                    </View>

                    {trainer.bio ? (
                      <Text style={styles.bio} numberOfLines={2}>
                        {trainer.bio}
                      </Text>
                    ) : null}

                    <View style={styles.specialtyRow}>
                      {trainer.specialties.map((s) => (
                        <View key={s} style={styles.specialtyPill}>
                          <Text style={styles.specialtyPillText}>
                            {SPECIALTIES[s]?.emoji} {SPECIALTIES[s]?.label}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <GradientButton
                      title="Book Session"
                      onPress={() => handleBook(trainer)}
                      variant="primary"
                      icon="📅"
                    />
                  </GlassCard>
                </AnimatedEntry>
              ))
            )}
            <View style={{ height: Spacing.xxl }} />
          </ScrollView>
        )}
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
  searchRow: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  searchInput: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  filterRow: { paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.md },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    gap: 4,
  },
  filterActive: { backgroundColor: Colors.violet },
  filterEmoji: { fontSize: 14 },
  filterText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  scroll: { paddingHorizontal: Spacing.lg },
  emptyCard: { alignItems: 'center', padding: Spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary },
  emptySubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  trainerCard: { marginBottom: Spacing.md },
  trainerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.violet,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: { fontSize: FontSizes.xl, fontWeight: '700', color: '#fff' },
  trainerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  trainerName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  verified: {
    fontSize: FontSizes.sm,
    color: Colors.sageLeaf,
    fontWeight: '700',
    backgroundColor: 'rgba(52,211,153,0.15)',
    paddingHorizontal: 6,
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingText: { fontSize: FontSizes.sm, color: Colors.sacredGold, marginTop: 2 },
  sessionsText: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 1 },
  priceText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.sageLeaf,
  },
  bio: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  specialtyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  specialtyPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(124,58,237,0.12)',
  },
  specialtyPillText: { fontSize: FontSizes.xs, color: Colors.lavender },
});
