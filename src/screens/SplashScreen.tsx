/**
 * @file SplashScreen.tsx
 * @module screens/SplashScreen
 * @description App launch splash screen.
 * Bootstraps auth state via `useAuthStore.initialize()` then navigates to
 * either the Onboarding, Auth, or main Tabs screen.
 */

import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from '../utils/haptics';
import { useRouter } from '../utils/router';
import { useAuthStore } from '../store/authStore';
import { Colors, Gradients, Spacing } from '../theme/colors';

const { width, height } = Dimensions.get('window');

interface Star {
  id: number;
  x: number;
  y: number;
  opacity: Animated.Value;
  duration: number;
}

export default function SplashScreen() {
  const router = useRouter();
  const { session, initialized } = useAuthStore();
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const starsRef = useRef<Star[]>([]);

  // Generate random stars
  useEffect(() => {
    const stars: Star[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      opacity: new Animated.Value(Math.random() * 0.5 + 0.3),
      duration: Math.random() * 2000 + 1500,
    }));
    starsRef.current = stars;

    // Start twinkling animations for each star
    stars.forEach((star) => {
      const twirlAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(star.opacity, {
            toValue: 1,
            duration: star.duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: 0.3,
            duration: star.duration / 2,
            useNativeDriver: true,
          }),
        ])
      );
      twirlAnimation.start();
    });
  }, []);

  // Animate logo entrance
  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoOpacity, logoScale]);

  // Auto-navigate after 2.5 seconds
  useEffect(() => {
    if (!initialized) return;

    const timer = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (session) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [initialized, session, router]);

  return (
    <LinearGradient
      colors={Gradients.cosmic}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Twinkling stars background */}
      <View style={styles.starsContainer}>
        {starsRef.current.map((star) => (
          <Animated.View
            key={star.id}
            style={[
              styles.star,
              {
                left: star.x,
                top: star.y,
                opacity: star.opacity,
              },
            ]}
          />
        ))}
      </View>

      {/* Aurora gradient overlay */}
      <LinearGradient
        colors={[
          'rgba(124, 58, 237, 0.2)',
          'rgba(244, 114, 182, 0.1)',
          'rgba(196, 181, 253, 0.1)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Center content */}
      <View style={styles.content}>
        {/* Lotus flower SVG alternative: animated circle */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          {/* Pulsing lotus petals */}
          <View style={styles.lotusContainer}>
            {/* Central circle */}
            <LinearGradient
              colors={[Colors.sacredGold, Colors.rosePetal]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.lotusCenterPetal}
            />
            {/* Petal ring */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const x = Math.cos(angle) * 35;
              const y = Math.sin(angle) * 35;
              return (
                <View
                  key={`petal-${i}`}
                  style={[
                    styles.lotusPetal,
                    {
                      transform: [{ translateX: x }, { translateY: y }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[Colors.rosePetal, Colors.violetLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.petalGradient}
                  />
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Title text */}
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: logoOpacity,
            },
          ]}
        >
          ZenFit
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          style={[
            styles.subtitle,
            {
              opacity: logoOpacity,
            },
          ]}
        >
          Mind · Body · Soul
        </Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.moonlight,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: Spacing.xl,
  },
  lotusContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lotusCenterPetal: {
    width: 32,
    height: 32,
    borderRadius: 16,
    position: 'absolute',
  },
  lotusPetal: {
    position: 'absolute',
  },
  petalGradient: {
    width: 24,
    height: 36,
    borderRadius: 12,
  },
  title: {
    fontSize: 52,
    fontWeight: '700',
    color: Colors.moonlight,
    letterSpacing: 2,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.lavender,
    letterSpacing: 3,
    fontWeight: '300',
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
