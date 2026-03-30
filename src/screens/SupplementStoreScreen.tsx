/**
 * @file SupplementStoreScreen.tsx
 * @module screens/SupplementStoreScreen
 * @description AI-curated supplement store — personalized supplement recommendations
 * based on user goals, browseable catalog, and shopping cart.
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
import AnimatedEntry from '../components/AnimatedEntry';
import SectionHeader from '../components/SectionHeader';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import SkeletonLoader from '../components/SkeletonLoader';
import { useRouter } from '../utils/router';

type SupplementCategory = 'protein' | 'vitamins' | 'pre_workout' | 'recovery' | 'wellness' | 'weight_mgmt';

interface Supplement {
  id: string;
  name: string;
  description: string;
  category: SupplementCategory;
  price_cents: number;
  currency: string;
  image_url: string | null;
  rating: number;
  total_reviews: number;
  benefits: string[];
  is_ai_recommended: boolean;
  ai_reasoning: string | null;
}

interface CartItem {
  supplement: Supplement;
  quantity: number;
}

const CATEGORIES: Record<SupplementCategory, { emoji: string; label: string }> = {
  protein: { emoji: '💪', label: 'Protein' },
  vitamins: { emoji: '💊', label: 'Vitamins' },
  pre_workout: { emoji: '⚡', label: 'Pre-Workout' },
  recovery: { emoji: '🧊', label: 'Recovery' },
  wellness: { emoji: '🌿', label: 'Wellness' },
  weight_mgmt: { emoji: '⚖️', label: 'Weight' },
};

export default function SupplementStoreScreen() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const router = useRouter();

  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<Supplement[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [filterCategory, setFilterCategory] = useState<SupplementCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetchSupplements();
  }, [filterCategory]);

  useEffect(() => {
    if (user && profile) fetchAiRecommendations();
  }, [user, profile]);

  const fetchSupplements = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('supplements')
        .select('*')
        .order('rating', { ascending: false });

      if (filterCategory) {
        query = query.eq('category', filterCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      let items: Supplement[] = (data || []).map((row: any) => ({
        ...row,
        benefits: row.benefits ?? [],
        is_ai_recommended: false,
        ai_reasoning: null,
      }));

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        items = items.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.description?.toLowerCase().includes(q),
        );
      }

      setSupplements(items);
    } catch {
      setSupplements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAiRecommendations = async () => {
    if (!user || !profile) return;
    setIsLoadingAi(true);
    try {
      const { data, error } = await supabase
        .from('supplement_recommendations')
        .select(`
          id, ai_reasoning,
          supplement:supplements(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const recs: Supplement[] = (data || [])
        .filter((r: any) => r.supplement)
        .map((r: any) => ({
          ...r.supplement,
          benefits: r.supplement.benefits ?? [],
          is_ai_recommended: true,
          ai_reasoning: r.ai_reasoning,
        }));

      setAiRecommendations(recs);
    } catch {
      setAiRecommendations([]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const addToCart = useCallback((supplement: Supplement) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart((prev) => {
      const existing = prev.find((item) => item.supplement.id === supplement.id);
      if (existing) {
        return prev.map((item) =>
          item.supplement.id === supplement.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { supplement, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((supplementId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart((prev) => prev.filter((item) => item.supplement.id !== supplementId));
  }, []);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.supplement.price_cents * item.quantity,
    0,
  );

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  };

  const handleCheckout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Order Placed!',
      `Total: ${formatPrice(cartTotal)}\nYour supplements will be shipped soon.`,
    );
    setCart([]);
    setShowCart(false);
  };

  const renderSupplementCard = (item: Supplement, index: number) => (
    <AnimatedEntry key={item.id} delay={200 + index * 60}>
      <GlassCard style={styles.productCard}>
        <View style={styles.productHeader}>
          <View style={styles.productIcon}>
            <Text style={styles.productIconText}>
              {CATEGORIES[item.category]?.emoji ?? '💊'}
            </Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productRating}>
              {renderStars(item.rating)} ({item.total_reviews})
            </Text>
          </View>
          <Text style={styles.productPrice}>{formatPrice(item.price_cents)}</Text>
        </View>

        <Text style={styles.productDesc} numberOfLines={2}>
          {item.description}
        </Text>

        {item.benefits.length > 0 && (
          <View style={styles.benefitsRow}>
            {item.benefits.slice(0, 3).map((b, i) => (
              <View key={i} style={styles.benefitPill}>
                <Text style={styles.benefitText}>✓ {b}</Text>
              </View>
            ))}
          </View>
        )}

        {item.is_ai_recommended && item.ai_reasoning && (
          <View style={styles.aiReasonBox}>
            <Text style={styles.aiReasonLabel}>🤖 AI Recommendation</Text>
            <Text style={styles.aiReasonText}>{item.ai_reasoning}</Text>
          </View>
        )}

        <GradientButton
          title="Add to Cart"
          onPress={() => addToCart(item)}
          variant="secondary"
          icon="🛒"
        />
      </GlassCard>
    </AnimatedEntry>
  );

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
            <Text style={styles.title}>Supplement Store</Text>
            <TouchableOpacity onPress={() => setShowCart(true)} style={styles.cartBtn}>
              <Text style={styles.cartEmoji}>🛒</Text>
              {cart.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cart.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </AnimatedEntry>

        {/* Search */}
        <AnimatedEntry delay={50}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search supplements..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => fetchSupplements()}
              returnKeyType="search"
            />
          </View>
        </AnimatedEntry>

        {/* Category Filter */}
        <AnimatedEntry delay={100}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <TouchableOpacity
              onPress={() => { setFilterCategory(null); Haptics.selectionAsync(); }}
              style={[styles.filterBtn, !filterCategory && styles.filterActive]}
            >
              <Text style={[styles.filterText, !filterCategory && styles.filterTextActive]}>All</Text>
            </TouchableOpacity>
            {(Object.keys(CATEGORIES) as SupplementCategory[]).map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => { setFilterCategory(cat); Haptics.selectionAsync(); }}
                style={[styles.filterBtn, filterCategory === cat && styles.filterActive]}
              >
                <Text style={styles.filterEmoji}>{CATEGORIES[cat].emoji}</Text>
                <Text style={[styles.filterText, filterCategory === cat && styles.filterTextActive]}>
                  {CATEGORIES[cat].label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </AnimatedEntry>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* AI Recommendations */}
          {aiRecommendations.length > 0 && (
            <>
              <SectionHeader title="Recommended for You" emoji="🤖" />
              {aiRecommendations.map((item, i) => renderSupplementCard(item, i))}
            </>
          )}

          {/* All Products */}
          <SectionHeader title="All Supplements" emoji="💊" />
          {isLoading ? (
            <SkeletonLoader variant="list" />
          ) : supplements.length === 0 ? (
            <AnimatedEntry delay={200}>
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyTitle}>No supplements found</Text>
                <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
              </GlassCard>
            </AnimatedEntry>
          ) : (
            supplements.map((item, i) => renderSupplementCard(item, i + aiRecommendations.length))
          )}

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>

      {/* Cart Overlay */}
      {showCart && (
        <View style={styles.cartOverlay}>
          <SafeAreaView style={styles.cartSafe}>
            <LinearGradient
              colors={Gradients.cosmic as [string, string, ...string[]]}
              style={styles.cartContent}
            >
              <View style={styles.cartHeader}>
                <Text style={styles.cartTitle}>Your Cart</Text>
                <TouchableOpacity onPress={() => setShowCart(false)}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              {cart.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>🛒</Text>
                  <Text style={styles.emptyTitle}>Cart is empty</Text>
                </View>
              ) : (
                <ScrollView style={styles.cartList}>
                  {cart.map((item) => (
                    <View key={item.supplement.id} style={styles.cartItem}>
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName}>{item.supplement.name}</Text>
                        <Text style={styles.cartItemPrice}>
                          {formatPrice(item.supplement.price_cents)} × {item.quantity}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => removeFromCart(item.supplement.id)}>
                        <Text style={styles.removeText}>🗑</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              {cart.length > 0 && (
                <View style={styles.cartFooter}>
                  <Text style={styles.totalText}>Total: {formatPrice(cartTotal)}</Text>
                  <GradientButton
                    title="Checkout"
                    onPress={handleCheckout}
                    variant="primary"
                    icon="💳"
                  />
                </View>
              )}
            </LinearGradient>
          </SafeAreaView>
        </View>
      )}
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
  cartBtn: { position: 'relative', padding: Spacing.xs },
  cartEmoji: { fontSize: 24 },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.rosePetal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
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
  productCard: { marginBottom: Spacing.md },
  productHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  productIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(124,58,237,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  productIconText: { fontSize: 22 },
  productInfo: { flex: 1 },
  productName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  productRating: { fontSize: FontSizes.sm, color: Colors.sacredGold, marginTop: 2 },
  productPrice: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.sageLeaf },
  productDesc: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  benefitsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  benefitPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(52,211,153,0.12)',
  },
  benefitText: { fontSize: FontSizes.xs, color: Colors.sageLeaf },
  aiReasonBox: {
    backgroundColor: 'rgba(124,58,237,0.08)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.violet,
  },
  aiReasonLabel: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.violet, marginBottom: 4 },
  aiReasonText: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 18 },
  // Cart overlay
  cartOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  cartSafe: { flex: 1, justifyContent: 'flex-end' },
  cartContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '70%',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  cartTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  closeText: { fontSize: FontSizes.xl, color: Colors.textSecondary },
  cartList: { marginBottom: Spacing.md },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary },
  cartItemPrice: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  removeText: { fontSize: 20, padding: Spacing.xs },
  cartFooter: { gap: Spacing.md },
  totalText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
