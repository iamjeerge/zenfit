import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '../theme/colors';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import AnimatedEntry from '../components/AnimatedEntry';
import SectionHeader from '../components/SectionHeader';
import SkeletonLoader, { SkeletonListItem } from '../components/SkeletonLoader';

type LeaderboardTab = 'steps' | 'workouts' | 'streak';

interface FriendProfile {
  id: string;
  full_name: string | null;
  level: number;
  streak_days: number;
}

interface Friendship {
  id: string;
  status: 'pending' | 'accepted' | 'blocked';
  friend: FriendProfile;
  isRequester: boolean;
}

interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  value: number;
  isCurrentUser: boolean;
}

export default function SocialScreen() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  const [tab, setTab] = useState<'friends' | 'leaderboard'>('friends');
  const [leaderboardTab, setLeaderboardTab] = useState<LeaderboardTab>('steps');
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchFriends();
  }, [user]);

  useEffect(() => {
    if (user && tab === 'leaderboard') fetchLeaderboard();
  }, [tab, leaderboardTab, user]);

  const fetchFriends = async () => {
    setIsLoadingFriends(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('friendships')
        .select(`
          id, status,
          requester_id, addressee_id,
          requester:profiles!requester_id(id, full_name, level, streak_days),
          addressee:profiles!addressee_id(id, full_name, level, streak_days)
        `)
        .or(`requester_id.eq.${user!.id},addressee_id.eq.${user!.id}`)
        .neq('status', 'blocked');

      if (err) throw err;
      const mapped: Friendship[] = (data || []).map((row: any) => {
        const isRequester = row.requester_id === user!.id;
        const friend = isRequester ? row.addressee : row.requester;
        return { id: row.id, status: row.status, friend, isRequester };
      });
      setFriends(mapped);
    } catch {
      setError('Failed to load friends.');
    } finally {
      setIsLoadingFriends(false);
    }
  };

  const fetchLeaderboard = async () => {
    setIsLoadingLeaderboard(true);
    setError(null);
    try {
      let data: any[] = [];
      if (leaderboardTab === 'steps') {
        const { data: d, error: err } = await supabase
          .from('daily_steps')
          .select('user_id, steps, profiles(full_name)')
          .gte('date', new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0])
          .order('steps', { ascending: false })
          .limit(20);
        if (err) throw err;
        data = (d || []).map((r: any) => ({
          user_id: r.user_id,
          full_name: r.profiles?.full_name,
          value: r.steps,
        }));
      } else if (leaderboardTab === 'workouts') {
        const { data: d, error: err } = await supabase
          .from('workout_sessions')
          .select('user_id, profiles(full_name)')
          .gte('started_at', new Date(Date.now() - 30 * 86400000).toISOString())
          .limit(100);
        if (err) throw err;
        const counts: Record<string, { full_name: string | null; count: number }> = {};
        (d || []).forEach((r: any) => {
          if (!counts[r.user_id]) counts[r.user_id] = { full_name: r.profiles?.full_name, count: 0 };
          counts[r.user_id].count++;
        });
        data = Object.entries(counts)
          .sort(([, a], [, b]) => b.count - a.count)
          .slice(0, 20)
          .map(([uid, v]) => ({ user_id: uid, full_name: v.full_name, value: v.count }));
      } else {
        const { data: d, error: err } = await supabase
          .from('profiles')
          .select('id, full_name, streak_days')
          .order('streak_days', { ascending: false })
          .limit(20);
        if (err) throw err;
        data = (d || []).map((r: any) => ({ user_id: r.id, full_name: r.full_name, value: r.streak_days }));
      }

      setLeaderboard(data.map((r) => ({ ...r, isCurrentUser: r.user_id === user!.id })));
    } catch {
      setError('Failed to load leaderboard.');
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('id, full_name, level, streak_days')
        .ilike('full_name', `%${searchQuery.trim()}%`)
        .neq('id', user!.id)
        .limit(10);
      if (err) throw err;
      setSearchResults(data || []);
    } catch {
      setError('Search failed. Try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (addresseeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const { error: err } = await supabase.from('friendships').insert({
        requester_id: user!.id,
        addressee_id: addresseeId,
        status: 'pending',
      });
      if (err) throw err;
      Alert.alert('Friend request sent!');
      setSearchResults([]);
      setSearchQuery('');
    } catch {
      Alert.alert('Could not send request. You may already be connected.');
    }
  };

  const respondToRequest = async (friendshipId: string, accept: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (accept) {
        await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
      } else {
        await supabase.from('friendships').delete().eq('id', friendshipId);
      }
      await fetchFriends();
    } catch {
      setError('Action failed. Please try again.');
    }
  };

  const leaderboardLabel = leaderboardTab === 'steps' ? 'Steps (this week)'
    : leaderboardTab === 'workouts' ? 'Sessions (this month)'
    : 'Streak (days)';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.cosmic as unknown as [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Social</Text>
        <Text style={styles.subtitle}>Connect. Compete. Inspire.</Text>
      </View>

      {/* Tab Toggle */}
      <View style={styles.tabToggle}>
        {(['friends', 'leaderboard'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTab(t); }}
          >
            <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
              {t === 'friends' ? '👥 Friends' : '🏆 Leaderboard'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {tab === 'friends' ? (
          <>
            {/* Search */}
            <AnimatedEntry delay={0}>
              <SectionHeader title="Find Friends" emoji="🔍" />
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search by name…"
                  placeholderTextColor={Colors.textMuted}
                  returnKeyType="search"
                  onSubmitEditing={handleSearch}
                />
                <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                  <LinearGradient colors={Gradients.auroraSubtle as unknown as [string, string]} style={styles.searchBtnGradient}>
                    {isSearching ? <ActivityIndicator color={Colors.textPrimary} /> : <Text style={styles.searchBtnText}>Search</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {searchResults.length > 0 && (
                <LinearGradient colors={Gradients.cardSecondary as unknown as [string, string]} style={styles.searchResults}>
                  {searchResults.map((p) => (
                    <View key={p.id} style={styles.searchResultRow}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{(p.full_name?.[0] ?? '?').toUpperCase()}</Text>
                      </View>
                      <View style={styles.personInfo}>
                        <Text style={styles.personName}>{p.full_name ?? 'Unknown'}</Text>
                        <Text style={styles.personMeta}>Level {p.level} · {p.streak_days}🔥 streak</Text>
                      </View>
                      <TouchableOpacity style={styles.addBtn} onPress={() => sendFriendRequest(p.id)}>
                        <Text style={styles.addBtnText}>+ Add</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </LinearGradient>
              )}
            </AnimatedEntry>

            {/* Friend List */}
            <AnimatedEntry delay={100}>
              <SectionHeader title="My Friends" emoji="🤝" />
              {error ? (
                <TouchableOpacity onPress={fetchFriends}>
                  <Text style={styles.errorText}>{error} Tap to retry.</Text>
                </TouchableOpacity>
              ) : isLoadingFriends ? (
                <>
                  <SkeletonListItem style={{ marginBottom: Spacing.sm }} />
                  <SkeletonListItem style={{ marginBottom: Spacing.sm }} />
                  <SkeletonListItem />
                </>
              ) : friends.length === 0 ? (
                <Text style={styles.emptyText}>No friends yet. Search above to connect!</Text>
              ) : (
                friends.map((f) => (
                  <LinearGradient key={f.id} colors={Gradients.cardSecondary as unknown as [string, string]} style={styles.friendCard}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{(f.friend.full_name?.[0] ?? '?').toUpperCase()}</Text>
                    </View>
                    <View style={styles.personInfo}>
                      <Text style={styles.personName}>{f.friend.full_name ?? 'Unknown'}</Text>
                      <Text style={styles.personMeta}>
                        {f.status === 'pending'
                          ? (f.isRequester ? '⏳ Request sent' : '📨 Wants to connect')
                          : `Level ${f.friend.level} · ${f.friend.streak_days}🔥`}
                      </Text>
                    </View>
                    {f.status === 'pending' && !f.isRequester && (
                      <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.acceptBtn} onPress={() => respondToRequest(f.id, true)}>
                          <Text style={styles.acceptBtnText}>✓</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.declineBtn} onPress={() => respondToRequest(f.id, false)}>
                          <Text style={styles.declineBtnText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </LinearGradient>
                ))
              )}
            </AnimatedEntry>
          </>
        ) : (
          <>
            {/* Leaderboard Tabs */}
            <View style={styles.lbTabs}>
              {(['steps', 'workouts', 'streak'] as LeaderboardTab[]).map((lt) => (
                <TouchableOpacity
                  key={lt}
                  style={[styles.lbTab, leaderboardTab === lt && styles.lbTabActive]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLeaderboardTab(lt); }}
                >
                  <Text style={[styles.lbTabText, leaderboardTab === lt && styles.lbTabTextActive]}>
                    {lt === 'steps' ? '👟 Steps' : lt === 'workouts' ? '💪 Workouts' : '🔥 Streak'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.lbSubtitle}>{leaderboardLabel}</Text>

            {error ? (
              <TouchableOpacity onPress={fetchLeaderboard}>
                <Text style={styles.errorText}>{error} Tap to retry.</Text>
              </TouchableOpacity>
            ) : isLoadingLeaderboard ? (
              <ActivityIndicator color={Colors.violet} style={{ marginVertical: Spacing.xl }} />
            ) : leaderboard.length === 0 ? (
              <Text style={styles.emptyText}>No data yet. Start logging to appear here!</Text>
            ) : (
              leaderboard.map((entry, idx) => (
                <LinearGradient
                  key={entry.user_id}
                  colors={entry.isCurrentUser ? Gradients.auroraSubtle as unknown as [string, string] : Gradients.cardSecondary as unknown as [string, string]}
                  style={[styles.lbRow, entry.isCurrentUser && styles.lbRowHighlight]}
                >
                  <Text style={styles.lbRank}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </Text>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(entry.full_name?.[0] ?? '?').toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.lbName, entry.isCurrentUser && { color: Colors.lavender }]}>
                    {entry.isCurrentUser ? 'You' : (entry.full_name ?? 'Unknown')}
                  </Text>
                  <Text style={styles.lbValue}>{entry.value.toLocaleString()}</Text>
                </LinearGradient>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, marginBottom: Spacing.sm },
  title: { fontSize: FontSizes.xxxl, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  tabToggle: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  tabBtnActive: { backgroundColor: Colors.violet },
  tabBtnText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  tabBtnTextActive: { color: Colors.textPrimary },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 120 },
  searchRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  searchBtn: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  searchBtnGradient: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, justifyContent: 'center', alignItems: 'center' },
  searchBtnText: { color: Colors.textPrimary, fontWeight: '700', fontSize: FontSizes.sm },
  searchResults: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.violet,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: Colors.textPrimary, fontWeight: '700', fontSize: FontSizes.md },
  personInfo: { flex: 1 },
  personName: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary },
  personMeta: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  addBtn: {
    backgroundColor: Colors.violet,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  addBtnText: { color: Colors.textPrimary, fontWeight: '700', fontSize: FontSizes.sm },
  actionRow: { flexDirection: 'row', gap: Spacing.xs },
  acceptBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.sageLeaf,
    justifyContent: 'center', alignItems: 'center',
  },
  acceptBtnText: { color: Colors.textPrimary, fontWeight: '700' },
  declineBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.error,
    justifyContent: 'center', alignItems: 'center',
  },
  declineBtnText: { color: Colors.textPrimary, fontWeight: '700' },
  lbTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.sm,
    gap: 4,
  },
  lbTab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: BorderRadius.md },
  lbTabActive: { backgroundColor: Colors.violet },
  lbTabText: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  lbTabTextActive: { color: Colors.textPrimary },
  lbSubtitle: { fontSize: FontSizes.xs, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.md },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  lbRowHighlight: { borderColor: Colors.lavender },
  lbRank: { width: 32, fontSize: FontSizes.md, textAlign: 'center' },
  lbName: { flex: 1, fontSize: FontSizes.md, color: Colors.textPrimary, fontWeight: '500' },
  lbValue: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.lavender },
  errorText: { fontSize: FontSizes.sm, color: Colors.error, textAlign: 'center', marginVertical: Spacing.md },
  emptyText: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', marginVertical: Spacing.md },
});
