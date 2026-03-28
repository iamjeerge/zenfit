/**
 * @file ChallengeRoomsScreen.tsx
 * @module screens/ChallengeRoomsScreen
 * @description Challenge rooms screen — join or create group fitness challenges
 * with leaderboards and real-time progress tracking.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from '../utils/haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  FontSizes,
} from '../theme/colors';
import AnimatedEntry from '../components/AnimatedEntry';
import SectionHeader from '../components/SectionHeader';
import AnimatedEmptyState from '../components/AnimatedEmptyState';
import { useCelebration } from '../components/CelebrationOverlay';

const STORAGE_KEY = 'zenfit:challenges';

interface Challenge {
  id: string;
  name: string;
  emoji: string;
  durationDays: number; // 7 | 30 | 90
  startDate: string; // ISO
  completedDays: string[]; // ISO date strings
  participants: number; // simulated
  description: string;
}

const PRESET_CHALLENGES: Omit<Challenge, 'id' | 'startDate' | 'completedDays' | 'participants'>[] = [
  {
    name: '7-Day Step Surge',
    emoji: '👟',
    durationDays: 7,
    description: 'Hit 10,000 steps every day for a week.',
  },
  {
    name: '21-Day Mindfulness',
    emoji: '🧘',
    durationDays: 21,
    description: '5 minutes of meditation daily for 21 days.',
  },
  {
    name: '30-Day Hydration',
    emoji: '💧',
    durationDays: 30,
    description: 'Drink 2 litres of water every day for a month.',
  },
  {
    name: '30-Day Strength',
    emoji: '💪',
    durationDays: 30,
    description: 'Complete a workout 5 days per week for 30 days.',
  },
  {
    name: '90-Day Transformation',
    emoji: '🏆',
    durationDays: 90,
    description: 'Sleep 7h, hydrate 2L, and walk 8k steps daily for 90 days.',
  },
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function daysElapsed(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function endDate(startDate: string, durationDays: number): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + durationDays);
  return d.toISOString().slice(0, 10);
}

export default function ChallengeRoomsScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'browse'>('browse');
  const { celebrate, overlay } = useCelebration();

  React.useEffect(() => { loadChallenges(); }, []);

  const loadChallenges = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setChallenges(JSON.parse(raw));
    } catch {}
    setIsLoaded(true);
  };

  const save = async (updated: Challenge[]) => {
    setChallenges(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const joinChallenge = async (preset: typeof PRESET_CHALLENGES[0]) => {
    const alreadyJoined = challenges.some((c) => c.name === preset.name);
    if (alreadyJoined) {
      Alert.alert('Already Joined', "You're already in this challenge!");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newChallenge: Challenge = {
      ...preset,
      id: `${Date.now()}`,
      startDate: todayKey(),
      completedDays: [],
      participants: Math.floor(Math.random() * 800 + 100),
    };
    await save([...challenges, newChallenge]);
    setActiveTab('active');
    celebrate('🚀 Challenge Joined!', `Started ${preset.name}`);
  };

  const logDay = async (id: string) => {
    const today = todayKey();
    const updated = challenges.map((c) => {
      if (c.id !== id) return c;
      if (c.completedDays.includes(today)) return c; // already logged
      const completedDays = [...c.completedDays, today];
      return { ...c, completedDays };
    });
    await save(updated);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const ch = updated.find((c) => c.id === id);
    if (ch && ch.completedDays.length >= ch.durationDays) {
      celebrate('🏆 Challenge Complete!', `You finished ${ch.name}!`);
    }
  };

  const leaveChallenge = (id: string) => {
    Alert.alert('Leave Challenge?', 'Your progress will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => save(challenges.filter((c) => c.id !== id)),
      },
    ]);
  };

  const activeChallenges = challenges.filter(
    (c) => daysElapsed(c.startDate) < c.durationDays
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={Gradients.cosmic} style={StyleSheet.absoluteFill} />
      {overlay}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <AnimatedEntry delay={0}>
          <View style={styles.header}>
            <Text style={styles.title}>🏆 Challenge Rooms</Text>
            <Text style={styles.subtitle}>Commit to a challenge, transform your life</Text>
          </View>
        </AnimatedEntry>

        {/* Tab switcher */}
        <AnimatedEntry delay={80}>
          <View style={styles.tabRow}>
            {(['browse', 'active'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => { setActiveTab(tab); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              >
                {activeTab === tab ? (
                  <LinearGradient colors={Gradients.auroraSubtle} style={styles.tabActiveGradient}>
                    <Text style={[styles.tabText, styles.tabTextActive]}>
                      {tab === 'browse' ? '🔍 Browse' : `⚡ Active (${activeChallenges.length})`}
                    </Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.tabText}>
                    {tab === 'browse' ? '🔍 Browse' : `⚡ Active (${activeChallenges.length})`}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedEntry>

        {/* Browse tab */}
        {activeTab === 'browse' && (
          <>
            <SectionHeader title="Available Challenges" style={styles.sectionHeader} />
            {PRESET_CHALLENGES.map((preset, idx) => {
              const isJoined = challenges.some((c) => c.name === preset.name);
              const durationLabel = preset.durationDays === 7 ? '7 days' :
                preset.durationDays === 21 ? '21 days' :
                preset.durationDays === 30 ? '30 days' : '90 days';
              const fakeParticipants = [124, 892, 1234, 567, 2341][idx] ?? 300;
              return (
                <AnimatedEntry key={preset.name} delay={idx * 60}>
                  <LinearGradient colors={Gradients.cardSecondary} style={styles.challengeCard}>
                    <View style={styles.challengeTop}>
                      <Text style={styles.challengeEmoji}>{preset.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.challengeName}>{preset.name}</Text>
                        <Text style={styles.challengeDesc}>{preset.description}</Text>
                      </View>
                    </View>
                    <View style={styles.challengeMeta}>
                      <View style={styles.metaChip}>
                        <Text style={styles.metaText}>⏱️ {durationLabel}</Text>
                      </View>
                      <View style={styles.metaChip}>
                        <Text style={styles.metaText}>👥 {fakeParticipants.toLocaleString()}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.joinBtn, isJoined && styles.joinBtnDone]}
                      onPress={() => !isJoined && joinChallenge(preset)}
                      disabled={isJoined}
                    >
                      {isJoined ? (
                        <Text style={styles.joinBtnText}>✓ Joined</Text>
                      ) : (
                        <LinearGradient colors={Gradients.aurora} style={styles.joinBtnGradient}>
                          <Text style={styles.joinBtnText}>Join Challenge</Text>
                        </LinearGradient>
                      )}
                    </TouchableOpacity>
                  </LinearGradient>
                </AnimatedEntry>
              );
            })}
          </>
        )}

        {/* Active tab */}
        {activeTab === 'active' && (
          <>
            <SectionHeader title="Your Active Challenges" style={styles.sectionHeader} />
            {activeChallenges.length === 0 ? (
              <AnimatedEmptyState
                emoji="🚀"
                title="No active challenges"
                subtitle='Browse and join a challenge to see it here!'
              />
            ) : (
              activeChallenges.map((ch, idx) => {
                const daysIn = daysElapsed(ch.startDate) + 1;
                const progress = Math.min(ch.completedDays.length / ch.durationDays, 1);
                const isLoggedToday = ch.completedDays.includes(todayKey());
                const end = endDate(ch.startDate, ch.durationDays);
                return (
                  <AnimatedEntry key={ch.id} delay={idx * 60}>
                    <LinearGradient colors={Gradients.cardPrimary} style={styles.activeCard}>
                      <View style={styles.activeTop}>
                        <Text style={styles.challengeEmoji}>{ch.emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.challengeName}>{ch.name}</Text>
                          <Text style={styles.activeMeta}>
                            Day {Math.min(daysIn, ch.durationDays)}/{ch.durationDays} · ends {formatDate(end)}
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => leaveChallenge(ch.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Text style={styles.leaveBtn}>✕</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Progress bar */}
                      <View style={styles.progressBarBg}>
                        <LinearGradient
                          colors={Gradients.aurora}
                          style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` }]}
                        />
                      </View>
                      <Text style={styles.progressLabel}>
                        {ch.completedDays.length}/{ch.durationDays} days · {Math.round(progress * 100)}% complete
                      </Text>

                      {/* Leaderboard sim */}
                      <View style={styles.leaderboard}>
                        <Text style={styles.leaderboardLabel}>🏅 Top Participants</Text>
                        {[
                          { rank: 1, name: 'Alex M.', days: ch.durationDays - 1 },
                          { rank: 2, name: 'Jordan K.', days: ch.durationDays - 3 },
                          { rank: 3, name: 'You', days: ch.completedDays.length, self: true },
                        ]
                          .sort((a, b) => b.days - a.days)
                          .map((p, i) => (
                            <View key={p.rank} style={[styles.leaderboardRow, p.self && styles.leaderboardSelf]}>
                              <Text style={styles.lbRank}>#{i + 1}</Text>
                              <Text style={[styles.lbName, p.self && { color: Colors.violet, fontWeight: '800' }]}>{p.name}</Text>
                              <Text style={styles.lbDays}>{p.days}d</Text>
                            </View>
                          ))
                        }
                      </View>

                      <TouchableOpacity
                        style={[styles.logDayBtn, isLoggedToday && styles.logDayBtnDone]}
                        onPress={() => !isLoggedToday && logDay(ch.id)}
                        disabled={isLoggedToday}
                      >
                        {isLoggedToday ? (
                          <Text style={styles.logDayText}>✅ Logged Today</Text>
                        ) : (
                          <LinearGradient colors={[Colors.sageLeaf, '#059669']} style={styles.logDayGradient}>
                            <Text style={styles.logDayText}>✓ Log Today's Progress</Text>
                          </LinearGradient>
                        )}
                      </TouchableOpacity>
                    </LinearGradient>
                  </AnimatedEntry>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },

  header: { paddingTop: Spacing.lg, marginBottom: Spacing.md },
  title: { fontSize: FontSizes.xxxl, fontWeight: '900', color: Colors.textPrimary },
  subtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4 },

  tabRow: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: 4, marginBottom: Spacing.md },
  tab: { flex: 1, borderRadius: BorderRadius.md, overflow: 'hidden' },
  tabActive: {},
  tabActiveGradient: { paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: BorderRadius.md },
  tabText: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.textSecondary, textAlign: 'center', paddingVertical: Spacing.sm },
  tabTextActive: { color: Colors.textPrimary },

  sectionHeader: { marginBottom: Spacing.sm },

  challengeCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  challengeTop: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  challengeEmoji: { fontSize: 32 },
  challengeName: { fontSize: FontSizes.md, fontWeight: '800', color: Colors.textPrimary },
  challengeDesc: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
  challengeMeta: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.sm },
  metaChip: {
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderRadius: BorderRadius.sm,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  metaText: { fontSize: FontSizes.xs, color: Colors.violet, fontWeight: '600' },
  joinBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  joinBtnDone: { backgroundColor: Colors.glassBorder },
  joinBtnGradient: { padding: Spacing.sm, alignItems: 'center' },
  joinBtnText: { color: Colors.textPrimary, fontWeight: '800', fontSize: FontSizes.sm },

  activeCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  activeTop: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, alignItems: 'flex-start' },
  activeMeta: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  leaveBtn: { color: Colors.textMuted, fontSize: 18 },

  progressBarBg: {
    height: 6,
    backgroundColor: Colors.glassBorder,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: { height: '100%', borderRadius: 3, minWidth: 4 },
  progressLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: Spacing.sm },

  leaderboard: {
    backgroundColor: 'rgba(124,58,237,0.08)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  leaderboardLabel: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.xs },
  leaderboardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3, gap: Spacing.xs },
  leaderboardSelf: { backgroundColor: 'rgba(124,58,237,0.12)', borderRadius: BorderRadius.sm, paddingHorizontal: 4 },
  lbRank: { fontSize: FontSizes.xs, color: Colors.textMuted, width: 24 },
  lbName: { flex: 1, fontSize: FontSizes.xs, color: Colors.textPrimary },
  lbDays: { fontSize: FontSizes.xs, color: Colors.textSecondary },

  logDayBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  logDayBtnDone: { backgroundColor: 'rgba(52,211,153,0.15)' },
  logDayGradient: { padding: Spacing.sm, alignItems: 'center' },
  logDayText: { color: Colors.textPrimary, fontWeight: '800', fontSize: FontSizes.sm, textAlign: 'center', padding: Spacing.xs },
});
