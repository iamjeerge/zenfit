import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Gradients, Spacing, BorderRadius, FontSizes } from '../src/theme/colors';
import { GradientButton } from '../src/components';

const { width } = Dimensions.get('window');

type OnboardingPage = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
};

const pages: OnboardingPage[] = [
  {
    id: 1,
    title: 'Find Your Inner Peace',
    subtitle: 'Meditation & Mindfulness',
    description: 'Guided meditation sessions and breathwork exercises to calm your mind and reduce stress. Perfect for beginners and advanced practitioners.',
    icon: '🧘',
  },
  {
    id: 2,
    title: 'Transform Your Body',
    subtitle: 'Yoga & Fitness Tracking',
    description: 'Personalized yoga flows and workout plans. Track your progress with real-time form correction and comprehensive fitness metrics.',
    icon: '🤸',
  },
  {
    id: 3,
    title: 'Nourish Your Soul',
    subtitle: 'AI Nutrition & Wellness',
    description: 'Smart meal planning powered by AI. Get personalized nutrition recommendations based on your goals and lifestyle.',
    icon: '🥗',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(contentOffsetX / width);
    setCurrentPage(pageIndex);
    scrollX.setValue(contentOffsetX);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentPage < pages.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentPage + 1) * width,
        animated: true,
      });
    }
  };

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.replace('/auth');
  };

  const handleSkip = () => {
    router.replace('/auth');
  };

  return (
    <LinearGradient
      colors={Gradients.cosmic}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Skip button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>

      {/* Scrollable pages */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        onScroll={handleScroll}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        style={styles.scrollContainer}
      >
        {pages.map((page) => (
          <View key={page.id} style={styles.page}>
            <LinearGradient
              colors={[
                'rgba(124, 58, 237, 0.2)',
                'rgba(244, 114, 182, 0.1)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.pageContent}>
              {/* Icon */}
              <Text style={styles.icon}>{page.icon}</Text>

              {/* Title */}
              <Text style={styles.title}>{page.title}</Text>

              {/* Subtitle */}
              <Text style={styles.subtitle}>{page.subtitle}</Text>

              {/* Description */}
              <Text style={styles.description}>{page.description}</Text>

              {/* Decorative elements */}
              <View style={styles.decorationContainer}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <View
                    key={`decoration-${i}`}
                    style={[
                      styles.decorationCircle,
                      { opacity: 0.3 + i * 0.2 },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dot indicators */}
      <View style={styles.dotsContainer}>
        {pages.map((_, index) => {
          const isActive = index === currentPage;
          return (
            <Animated.View
              key={`dot-${index}`}
              style={[
                styles.dot,
                {
                  backgroundColor: isActive
                    ? Colors.lavender
                    : Colors.textMuted,
                  width: isActive ? 28 : 8,
                  opacity: isActive ? 1 : 0.6,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        <GradientButton
          title={currentPage === pages.length - 1 ? 'Get Started' : 'Next'}
          onPress={
            currentPage === pages.length - 1
              ? handleGetStarted
              : handleNext
          }
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  skipButton: {
    position: 'absolute',
    top: Spacing.xl,
    right: Spacing.lg,
    zIndex: 10,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  skipButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  page: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  pageContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.moonlight,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.lavender,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontWeight: '600',
  },
  description: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width - Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  decorationContainer: {
    flexDirection: 'row',
    marginTop: Spacing.xxl,
    gap: Spacing.md,
  },
  decorationCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.violetLight,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  nextButtonOutline: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
  },
  nextButtonText: {
    color: Colors.moonlight,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
