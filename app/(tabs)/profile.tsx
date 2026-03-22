import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '../../src/theme/colors';

interface MenuItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);

  const getInitial = () => {
    if (profile?.full_name) {
      return profile.full_name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth');
  };

  const menuItems: MenuItem[] = [
    {
      id: 'reminders',
      icon: '🔔',
      title: 'Reminders',
      subtitle: 'Manage notifications',
      onPress: () => {},
    },
    {
      id: 'subscription',
      icon: '⭐',
      title: 'Subscription',
      subtitle: profile?.subscription_status === 'premium' ? 'Premium Active' : 'Free Plan',
      onPress: () => {},
    },
    {
      id: 'beauty',
      icon: '💄',
      title: 'Beauty Tips',
      subtitle: 'Daily beauty advice',
      onPress: () => {},
    },
    {
      id: 'progress',
      icon: '📊',
      title: 'Progress',
      subtitle: 'View your achievements',
      onPress: () => {},
    },
    {
      id: 'achievements',
      icon: '🏆',
      title: 'Achievements',
      subtitle: `${Math.floor((profile?.xp || 0) / 100)} badges earned`,
      onPress: () => {},
    },
    {
      id: 'workout',
      icon: '🏋️',
      title: 'Workout Tracker',
      subtitle: 'Log exercises & track progress',
      onPress: () => {},
    },
    {
      id: 'sleep',
      icon: '🌙',
      title: 'Sleep Tracker',
      subtitle: 'Monitor your rest & recovery',
      onPress: () => {},
    },
    {
      id: 'mood',
      icon: '😊',
      title: 'Mood Journal',
      subtitle: 'Daily emotional check-in',
      onPress: () => {},
    },
    {
      id: 'settings',
      icon: '⚙️',
      title: 'Settings',
      subtitle: 'Customize your experience',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Aurora Gradient */}
        <LinearGradient
          colors={Gradients.aurora}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.profileHeader}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>{getInitial()}</Text>
              </View>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {profile?.full_name || 'Welcome to ZenFit'}
              </Text>
              <Text style={styles.userEmail}>
                {profile?.subscription_status === 'premium'
                  ? '✨ Premium Member'
                  : '📱 Free Member'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
              style={styles.statGradient}
            >
              <Text style={styles.statLabel}>Level</Text>
              <Text style={styles.statValue}>{profile?.level || 1}</Text>
              <View style={styles.levelBar}>
                <View
                  style={[
                    styles.levelProgress,
                    {
                      width: `${((profile?.xp || 0) % 1000) / 10}%`,
                      backgroundColor: Colors.violet,
                    },
                  ]}
                />
              </View>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
              style={styles.statGradient}
            >
              <Text style={styles.statLabel}>XP</Text>
              <Text style={styles.statValue}>{profile?.xp || 0}</Text>
              <Text style={styles.xpSubtext}>XP earned</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
              style={styles.statGradient}
            >
              <Text style={styles.statLabel}>🔥 Streak</Text>
              <Text style={styles.statValue}>{profile?.streak_days || 0}</Text>
              <Text style={styles.streakSubtext}>days</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuList}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
                  style={styles.menuItemGradient}
                >
                  <View style={styles.menuItemContent}>
                    <View style={styles.menuItemLeft}>
                      <Text style={styles.menuItemIcon}>{item.icon}</Text>
                      <View style={styles.menuItemText}>
                        <Text style={styles.menuItemTitle}>{item.title}</Text>
                        {item.subtitle && (
                          <Text style={styles.menuItemSubtitle}>
                            {item.subtitle}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <LinearGradient
              colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
              style={styles.aboutGradient}
            >
              <Text style={styles.aboutTitle}>ZenFit v1.0</Text>
              <Text style={styles.aboutText}>
                Your personal wellness companion for yoga, meditation, and
                holistic health.
              </Text>
              <View style={styles.aboutLinks}>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.aboutLink}>Privacy Policy</Text>
                </TouchableOpacity>
                <Text style={styles.aboutDot}>•</Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.aboutLink}>Terms of Service</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(248, 113, 113, 0.3)', 'rgba(248, 113, 113, 0.1)']}
            style={styles.signOutGradient}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer spacing */}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  headerGradient: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.violet,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.violet,
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  avatarInitial: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.subtle,
  },
  statGradient: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  levelBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  levelProgress: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  xpSubtext: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  streakSubtext: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  menuSection: {
    marginBottom: Spacing.xl,
  },
  menuList: {
    gap: Spacing.md,
  },
  menuItem: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.subtle,
  },
  menuItemGradient: {
    padding: Spacing.md,
  },
  menuItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuItemIcon: {
    fontSize: 28,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  menuItemSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  chevron: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    fontWeight: '300',
  },
  aboutSection: {
    marginBottom: Spacing.xl,
  },
  aboutCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.subtle,
  },
  aboutGradient: {
    padding: Spacing.lg,
  },
  aboutTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  aboutText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  aboutLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  aboutLink: {
    fontSize: FontSizes.xs,
    color: Colors.violet,
    fontWeight: '600',
  },
  aboutDot: {
    color: Colors.textSecondary,
  },
  signOutButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    ...Shadows.subtle,
  },
  signOutGradient: {
    paddingVertical: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.error,
  },
});
