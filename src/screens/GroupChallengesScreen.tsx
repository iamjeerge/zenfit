/**
 * @file GroupChallengesScreen.tsx
 * @module screens/GroupChallengesScreen
 * @description Group challenges screen — create, join, and compete in team-based
 * fitness challenges with friends and the ZenFit community.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
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

type ChallengeType = 'steps' | 'workouts' | 'meditation' | 'water' | 'streak';

interface GroupChallenge {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  target_value: number;
  start_date: string;
  end_date: string;
  created_by: string;
  creator_name: string | null;
  participant_count: number;
  is_joined: boolean;
}

interface Participant {
  user_id: string;
  full_name: string | null;
  progress: number;
  rank: number;
}

const CHALLENGE_TYPES: Record<ChallengeType, { emoji: string; label: string; unit: string }> = {
  steps: { emoji: '👟', label: 'Steps', unit: 'steps' },
  workouts: { emoji: '💪', label: 'Workouts', unit: 'sessions' },
  meditation: { emoji: '🧘', label: 'Meditation', unit: 'minutes' },
  water: { emoji: '💧', label: 'Hydration', unit: 'glasses' },
  streak: { emoji: '🔥', label: 'Streak', unit: 'days' },
};

export default function GroupChallengesScreen() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const router = useRouter();

  const [challenges, setChallenges] = useState<GroupChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<'active' | 'available' | 'completed'>('active');

  // Create form state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<ChallengeType>('steps');
  const [newTarget, setNewTarget] = useState('10000');
  const [newDays, setNewDays] = useState('7');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) fetchChallenges();
  }, [user, tab]);

  const fetchChallenges = async () => {
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      let query = supabase
        .from('group_challenges')
        .select(`
          id, name, description, type, target_value, start_date, end_date, created_by,
          creator:profiles!created_by(full_name),
          participants:challenge_participants(user_id)
        `)
        .order('created_at', { ascending: false });

      if (tab === 'active') {
        query = query.lte('start_date', now).gte('end_date', now);
      } else if (tab === 'completed') {
        query = query.lt('end_date', now);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mapped: GroupChallenge[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        type: row.type,
        target_value: row.target_value,
        start_date: row.start_date,
        end_date: row.end_date,
        created_by: row.created_by,
        creator_name: row.creator?.full_name ?? 'Unknown',
        participant_count: row.participants?.length ?? 0,
        is_joined: (row.participants || []).some((p: any) => p.user_id === user!.id),
      }));

      setChallenges(mapped);
    } catch {
      setChallenges([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (challengeId: string) => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const { error } = await supabase.from('challenge_participants').insert({
        challenge_id: challengeId,
        user_id: user.id,
        progress: 0,
      });
      if (error) throw error;
      fetchChallenges();
    } catch {
      Alert.alert('Error', 'Could not join challenge');
    }
  };

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    setIsCreating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + parseInt(newDays, 10));

      const { data, error } = await supabase
        .from('group_challenges')
        .insert({
          name: newName.trim(),
          description: newDesc.trim(),
          type: newType,
          target_value: parseInt(newTarget, 10),
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join as creator
      await supabase.from('challenge_participants').insert({
        challenge_id: data.id,
        user_id: user.id,
        progress: 0,
      });

      setShowCreate(false);
      setNewName('');
      setNewDesc('');
      setNewTarget('10000');
      setNewDays('7');
      fetchChallenges();
    } catch {
      Alert.alert('Error', 'Could not create challenge');
    } finally {
      setIsCreating(false);
    }
  };

  const getDaysLeft = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
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
            <Text style={styles.title}>Group Challenges</Text>
            <TouchableOpacity onPress={() => setShowCreate(true)} style={styles.addBtn}>
              <Text style={styles.addText}>＋</Text>
            </TouchableOpacity>
          </View>
        </AnimatedEntry>

        {/* Tab Selector */}
        <AnimatedEntry delay={100}>
          <View style={styles.tabRow}>
            {(['active', 'available', 'completed'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => { setTab(t); Haptics.selectionAsync(); }}
                style={[styles.tabBtn, tab === t && styles.tabActive]}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedEntry>

        {isLoading ? (
          <SkeletonLoader variant="list" />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {challenges.length === 0 ? (
              <AnimatedEntry delay={200}>
                <GlassCard style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>🏆</Text>
                  <Text style={styles.emptyTitle}>No challenges yet</Text>
                  <Text style={styles.emptySubtitle}>
                    {tab === 'active' ? 'Join or create a challenge!' : 'Check back later!'}
                  </Text>
                </GlassCard>
              </AnimatedEntry>
            ) : (
              challenges.map((c, i) => (
                <AnimatedEntry key={c.id} delay={200 + i * 80}>
                  <GlassCard style={styles.challengeCard}>
                    <View style={styles.challengeHeader}>
                      <Text style={styles.challengeEmoji}>
                        {CHALLENGE_TYPES[c.type]?.emoji ?? '🏅'}
                      </Text>
                      <View style={styles.challengeInfo}>
                        <Text style={styles.challengeName}>{c.name}</Text>
                        <Text style={styles.challengeMeta}>
                          by {c.creator_name} · {c.participant_count} participants
                        </Text>
                      </View>
                    </View>
                    {c.description ? (
                      <Text style={styles.challengeDesc}>{c.description}</Text>
                    ) : null}
                    <View style={styles.challengeStats}>
                      <View style={styles.statPill}>
                        <Text style={styles.statPillText}>
                          🎯 {c.target_value.toLocaleString()} {CHALLENGE_TYPES[c.type]?.unit}
                        </Text>
                      </View>
                      <View style={styles.statPill}>
                        <Text style={styles.statPillText}>
                          ⏳ {getDaysLeft(c.end_date)} days left
                        </Text>
                      </View>
                    </View>
                    {!c.is_joined && tab !== 'completed' && (
                      <GradientButton
                        title="Join Challenge"
                        onPress={() => handleJoin(c.id)}
                        variant="primary"
                        icon="🚀"
                      />
                    )}
                    {c.is_joined && (
                      <View style={styles.joinedBadge}>
                        <Text style={styles.joinedText}>✅ Joined</Text>
                      </View>
                    )}
                  </GlassCard>
                </AnimatedEntry>
              ))
            )}
            <View style={{ height: Spacing.xxl }} />
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Create Challenge Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <LinearGradient
              colors={Gradients.cosmic as [string, string, ...string[]]}
              style={styles.modalGradient}
            >
              <Text style={styles.modalTitle}>Create Challenge</Text>

              <Text style={styles.inputLabel}>Challenge Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 10K Steps Week"
                placeholderTextColor={Colors.textMuted}
                value={newName}
                onChangeText={setNewName}
              />

              <Text style={styles.inputLabel}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.inputMulti]}
                placeholder="Describe your challenge..."
                placeholderTextColor={Colors.textMuted}
                value={newDesc}
                onChangeText={setNewDesc}
                multiline
              />

              <Text style={styles.inputLabel}>Type</Text>
              <View style={styles.typeRow}>
                {(Object.keys(CHALLENGE_TYPES) as ChallengeType[]).map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => { setNewType(t); Haptics.selectionAsync(); }}
                    style={[styles.typeBtn, newType === t && styles.typeBtnActive]}
                  >
                    <Text style={styles.typeEmoji}>{CHALLENGE_TYPES[t].emoji}</Text>
                    <Text style={[styles.typeLabel, newType === t && styles.typeLabelActive]}>
                      {CHALLENGE_TYPES[t].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Target</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="10000"
                    placeholderTextColor={Colors.textMuted}
                    value={newTarget}
                    onChangeText={setNewTarget}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Duration (days)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="7"
                    placeholderTextColor={Colors.textMuted}
                    value={newDays}
                    onChangeText={setNewDays}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setShowCreate(false)}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <GradientButton
                  title="Create"
                  onPress={handleCreate}
                  loading={isCreating}
                  disabled={!newName.trim()}
                  variant="primary"
                  icon="🏆"
                />
              </View>
            </LinearGradient>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.violet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { fontSize: FontSizes.xl, color: '#fff' },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: Colors.violet },
  tabText: { fontSize: FontSizes.md, color: Colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  scroll: { paddingHorizontal: Spacing.lg },
  emptyCard: { alignItems: 'center', padding: Spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary },
  emptySubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  challengeCard: { marginBottom: Spacing.md },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  challengeEmoji: { fontSize: 32, marginRight: Spacing.md },
  challengeInfo: { flex: 1 },
  challengeName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  challengeMeta: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  challengeDesc: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  challengeStats: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(124,58,237,0.15)',
  },
  statPillText: { fontSize: FontSizes.sm, color: Colors.lavender },
  joinedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(52,211,153,0.15)',
  },
  joinedText: { fontSize: FontSizes.md, color: Colors.sageLeaf, fontWeight: '600' },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  modalGradient: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  modalTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  typeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeBtnActive: { borderColor: Colors.violet, backgroundColor: 'rgba(124,58,237,0.15)' },
  typeEmoji: { fontSize: 20 },
  typeLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  typeLabelActive: { color: Colors.violet },
  row: { flexDirection: 'row', gap: Spacing.md },
  halfInput: { flex: 1 },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  cancelBtn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  cancelText: { fontSize: FontSizes.lg, color: Colors.textSecondary, fontWeight: '600' },
});
