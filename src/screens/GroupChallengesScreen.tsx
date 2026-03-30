/**
 * @file GroupChallengesScreen.tsx
 * @module screens/GroupChallengesScreen
 * @description Group challenges screen — create and join community challenges
 * with friends. Track progress, compete, and earn XP together.
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
  Modal,
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
import GradientButton from '../components/GradientButton';

type ChallengeType = 'steps' | 'workouts' | 'meditation' | 'streak' | 'water';
type ChallengeStatus = 'active' | 'upcoming' | 'completed';

interface GroupChallenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  target_value: number;
  start_date: string;
  end_date: string;
  status: ChallengeStatus;
  created_by: string;
  max_participants: number;
  xp_reward: number;
  participant_count: number;
  is_joined: boolean;
  my_progress: number;
  creator_name: string | null;
}

const CHALLENGE_TYPES: { type: ChallengeType; emoji: string; label: string; unit: string }[] = [
  { type: 'steps', emoji: '👟', label: 'Steps', unit: 'steps' },
  { type: 'workouts', emoji: '💪', label: 'Workouts', unit: 'sessions' },
  { type: 'meditation', emoji: '🧘', label: 'Meditation', unit: 'minutes' },
  { type: 'streak', emoji: '🔥', label: 'Streak', unit: 'days' },
  { type: 'water', emoji: '💧', label: 'Water', unit: 'glasses' },
];

export default function GroupChallengesScreen() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const router = useRouter();

  const [challenges, setChallenges] = useState<GroupChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'my' | 'active'>('active');
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<ChallengeType>('steps');
  const [newTarget, setNewTarget] = useState('');
  const [newDuration, setNewDuration] = useState('7');
  const [newMaxParticipants, setNewMaxParticipants] = useState('20');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) fetchChallenges();
  }, [user, filter]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('group_challenges')
        .select(`
          *,
          creator:profiles!created_by(full_name),
          participants:challenge_participants(user_id, progress)
        `)
        .order('start_date', { ascending: false });

      if (filter === 'active') {
        query = query.eq('status', 'active');
      } else if (filter === 'my') {
        query = query.contains('participant_ids', [user!.id]);
      }

      const { data, error } = await query.limit(30);
      if (error) throw error;

      const mapped: GroupChallenge[] = (data || []).map((c: any) => {
        const parts = c.participants || [];
        const myPart = parts.find((p: any) => p.user_id === user!.id);
        return {
          id: c.id,
          title: c.title,
          description: c.description,
          type: c.type,
          target_value: c.target_value,
          start_date: c.start_date,
          end_date: c.end_date,
          status: c.status,
          created_by: c.created_by,
          max_participants: c.max_participants,
          xp_reward: c.xp_reward,
          participant_count: parts.length,
          is_joined: !!myPart,
          my_progress: myPart?.progress ?? 0,
          creator_name: c.creator?.full_name ?? null,
        };
      });
      setChallenges(mapped);
    } catch {
      Alert.alert('Error', 'Failed to load challenges.');
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const { error } = await supabase.from('challenge_participants').insert({
        challenge_id: challengeId,
        user_id: user!.id,
        progress: 0,
      });
      if (error) throw error;
      await fetchChallenges();
    } catch {
      Alert.alert('Error', 'Could not join challenge.');
    }
  };

  const createChallenge = async () => {
    if (!newTitle.trim() || !newTarget.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setCreating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(newDuration, 10));

      const { data, error } = await supabase
        .from('group_challenges')
        .insert({
          title: newTitle.trim(),
          description: newDescription.trim(),
          type: newType,
          target_value: parseInt(newTarget, 10),
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          created_by: user!.id,
          max_participants: parseInt(newMaxParticipants, 10),
          xp_reward: Math.floor(parseInt(newTarget, 10) / 10) * 5,
          status: 'active',
        })
        .select()
        .single();
      if (error) throw error;

      // Auto-join as creator
      await supabase.from('challenge_participants').insert({
        challenge_id: data.id,
        user_id: user!.id,
        progress: 0,
      });

      setShowCreate(false);
      resetForm();
      await fetchChallenges();
    } catch {
      Alert.alert('Error', 'Could not create challenge.');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewType('steps');
    setNewTarget('');
    setNewDuration('7');
    setNewMaxParticipants('20');
  };

  const getTypeInfo = (type: ChallengeType) =>
    CHALLENGE_TYPES.find((t) => t.type === type) ?? CHALLENGE_TYPES[0];

  const getDaysRemaining = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
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
          <Text style={styles.title}>Group Challenges</Text>
          <Text style={styles.subtitle}>Compete. Grow. Earn XP.</Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowCreate(true);
          }}
        >
          <LinearGradient
            colors={Gradients.auroraSubtle as unknown as [string, string]}
            style={styles.createBtnGradient}
          >
            <Text style={styles.createBtnText}>+ New</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {(['active', 'my', 'all'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFilter(f);
            }}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'active' ? '🔥 Active' : f === 'my' ? '📌 Joined' : '🌐 All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color={Colors.violet} style={{ marginVertical: Spacing.xl }} />
        ) : challenges.length === 0 ? (
          <AnimatedEntry>
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🏔️</Text>
              <Text style={styles.emptyTitle}>No challenges yet</Text>
              <Text style={styles.emptySubtitle}>Create one to rally your friends!</Text>
            </GlassCard>
          </AnimatedEntry>
        ) : (
          challenges.map((c, idx) => {
            const typeInfo = getTypeInfo(c.type);
            const daysLeft = getDaysRemaining(c.end_date);
            const progress = c.target_value > 0 ? Math.min(c.my_progress / c.target_value, 1) : 0;

            return (
              <AnimatedEntry key={c.id} delay={idx * 80}>
                <GlassCard style={styles.challengeCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.challengeEmoji}>{typeInfo.emoji}</Text>
                    <View style={styles.cardHeaderInfo}>
                      <Text style={styles.challengeTitle}>{c.title}</Text>
                      <Text style={styles.challengeCreator}>
                        by {c.creator_name ?? 'Unknown'} · {c.participant_count}/{c.max_participants} joined
                      </Text>
                    </View>
                    <View style={styles.xpBadge}>
                      <Text style={styles.xpText}>+{c.xp_reward} XP</Text>
                    </View>
                  </View>

                  {c.description ? (
                    <Text style={styles.challengeDesc}>{c.description}</Text>
                  ) : null}

                  <View style={styles.targetRow}>
                    <Text style={styles.targetLabel}>
                      Target: {c.target_value.toLocaleString()} {typeInfo.unit}
                    </Text>
                    <Text style={styles.daysLeft}>
                      {daysLeft > 0 ? `${daysLeft}d left` : 'Ended'}
                    </Text>
                  </View>

                  {c.is_joined && (
                    <View style={styles.progressSection}>
                      <View style={styles.progressTrack}>
                        <View
                          style={[styles.progressBar, { width: `${progress * 100}%` }]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {c.my_progress.toLocaleString()} / {c.target_value.toLocaleString()}
                      </Text>
                    </View>
                  )}

                  {!c.is_joined && c.status === 'active' && c.participant_count < c.max_participants && (
                    <TouchableOpacity
                      style={styles.joinBtn}
                      onPress={() => joinChallenge(c.id)}
                    >
                      <LinearGradient
                        colors={Gradients.aurora as unknown as [string, string, ...string[]]}
                        style={styles.joinBtnGradient}
                      >
                        <Text style={styles.joinBtnText}>Join Challenge</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </GlassCard>
              </AnimatedEntry>
            );
          })
        )}
      </ScrollView>

      {/* Create Challenge Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={Gradients.cosmic as unknown as [string, string, ...string[]]}
              style={styles.modalGradient}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>🏆 New Challenge</Text>

                <Text style={styles.inputLabel}>Challenge Title *</Text>
                <TextInput
                  style={styles.input}
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="e.g. 10K Steps Sprint"
                  placeholderTextColor={Colors.textMuted}
                  maxLength={60}
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={newDescription}
                  onChangeText={setNewDescription}
                  placeholder="Describe your challenge..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  maxLength={200}
                />

                <Text style={styles.inputLabel}>Type</Text>
                <View style={styles.typeRow}>
                  {CHALLENGE_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t.type}
                      style={[styles.typeChip, newType === t.type && styles.typeChipActive]}
                      onPress={() => setNewType(t.type)}
                    >
                      <Text style={styles.typeChipText}>
                        {t.emoji} {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>
                  Target ({getTypeInfo(newType).unit}) *
                </Text>
                <TextInput
                  style={styles.input}
                  value={newTarget}
                  onChangeText={setNewTarget}
                  placeholder="e.g. 70000"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                />

                <View style={styles.rowInputs}>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Duration (days)</Text>
                    <TextInput
                      style={styles.input}
                      value={newDuration}
                      onChangeText={setNewDuration}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Max Participants</Text>
                    <TextInput
                      style={styles.input}
                      value={newMaxParticipants}
                      onChangeText={setNewMaxParticipants}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => {
                      setShowCreate(false);
                      resetForm();
                    }}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <GradientButton
                    title={creating ? 'Creating...' : 'Create Challenge'}
                    onPress={createChallenge}
                    loading={creating}
                    disabled={creating}
                    style={styles.submitBtn}
                  />
                </View>
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>
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
  createBtn: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  createBtnGradient: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  createBtnText: { color: Colors.textPrimary, fontWeight: '700', fontSize: FontSizes.sm },
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: 4,
    gap: 4,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  filterBtnActive: { backgroundColor: Colors.violet },
  filterText: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: Colors.textPrimary },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 120 },
  challengeCard: { marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  challengeEmoji: { fontSize: 28 },
  cardHeaderInfo: { flex: 1 },
  challengeTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  challengeCreator: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  xpBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  xpText: { color: Colors.sacredGold, fontWeight: '700', fontSize: FontSizes.xs },
  challengeDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  targetLabel: { fontSize: FontSizes.sm, color: Colors.lavender, fontWeight: '600' },
  daysLeft: { fontSize: FontSizes.xs, color: Colors.textMuted },
  progressSection: { marginTop: Spacing.xs },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.sageLeaf,
    borderRadius: 3,
  },
  progressText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  joinBtn: { borderRadius: BorderRadius.md, overflow: 'hidden', marginTop: Spacing.sm },
  joinBtnGradient: { paddingVertical: Spacing.sm, alignItems: 'center' },
  joinBtnText: { color: Colors.textPrimary, fontWeight: '700', fontSize: FontSizes.md },
  emptyCard: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.sm },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  emptySubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '85%',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  modalGradient: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  modalTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  typeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  typeChipActive: { backgroundColor: Colors.violet, borderColor: Colors.violet },
  typeChipText: { color: Colors.textPrimary, fontSize: FontSizes.sm },
  rowInputs: { flexDirection: 'row', gap: Spacing.sm },
  halfInput: { flex: 1 },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  cancelBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
  cancelText: { color: Colors.textSecondary, fontSize: FontSizes.md },
  submitBtn: { flex: 1 },
});
