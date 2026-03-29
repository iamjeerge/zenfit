/**
 * CelebrationOverlay — Confetti + emoji burst + scale animation
 * Triggered when a user achieves a goal (step target, workout complete, streak milestone).
 *
 * Usage:
 *   const { celebrate } = useCelebration();
 *   celebrate('🔥', 'Streak!', '7-day streak achieved!');
 */
import React, { useCallback, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from '../utils/haptics';
import { Colors, FontSizes, BorderRadius, Shadows } from '../theme/colors';
import LinearGradient from 'react-native-linear-gradient';

const { width: W, height: H } = Dimensions.get('window');
const PARTICLE_COUNT = 28;

interface Particle {
  id: number;
  color: string;
  x: number;
  y: number;
  size: number;
  angle: number;
  emoji?: string;
}

const CONFETTI_COLORS = [
  '#7C3AED',
  '#C4B5FD',
  '#F472B6',
  '#FBBF24',
  '#34D399',
  '#60A5FA',
  '#FB923C',
  '#F8FAFC',
];

const CELEBRATION_EMOJIS = ['⭐', '✨', '💫', '🎉', '🎊'];

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    x: Math.random() * W,
    y: -20,
    size: 8 + Math.random() * 10,
    angle: Math.random() * 360,
    emoji: i % 5 === 0 ? CELEBRATION_EMOJIS[i % CELEBRATION_EMOJIS.length] : undefined,
  }));
}

interface ConfettiPieceProps {
  particle: Particle;
  onDone?: () => void;
}

function ConfettiPiece({ particle }: ConfettiPieceProps) {
  const translateY = useSharedValue(-30);
  const translateX = useSharedValue(particle.x - W / 2);
  const rotate = useSharedValue(particle.angle);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const delay = Math.random() * 300;
    const duration = 1200 + Math.random() * 800;
    const drift = (Math.random() - 0.5) * 160;

    translateY.value = withDelay(
      delay,
      withTiming(H * 0.7, { duration, easing: Easing.out(Easing.quad) }),
    );
    translateX.value = withDelay(delay, withTiming(particle.x - W / 2 + drift, { duration }));
    rotate.value = withDelay(
      delay,
      withTiming(particle.angle + 360 * (Math.random() > 0.5 ? 1 : -1), { duration }),
    );
    opacity.value = withDelay(delay + duration * 0.7, withTiming(0, { duration: duration * 0.3 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    top: H * 0.15,
    left: W / 2,
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={style}>
      {particle.emoji ? (
        <Text style={{ fontSize: particle.size + 4 }}>{particle.emoji}</Text>
      ) : (
        <View
          style={{
            width: particle.size,
            height: particle.size * 0.5,
            backgroundColor: particle.color,
            borderRadius: 2,
          }}
        />
      )}
    </Animated.View>
  );
}

interface CelebrationOverlayProps {
  visible: boolean;
  emoji: string;
  title: string;
  subtitle?: string;
  onHide: () => void;
}

export function CelebrationOverlay({
  visible,
  emoji,
  title,
  subtitle,
  onHide,
}: CelebrationOverlayProps) {
  const scale = useSharedValue(0);
  const emojiScale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const [particles] = useState(generateParticles);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      emojiScale.value = withSequence(
        withSpring(1.4, { damping: 8, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 200 }),
      );

      // Auto-dismiss after 2.8s
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 400 }, (done) => {
          if (done) runOnJS(onHide)();
        });
        scale.value = withTiming(0.8, { duration: 400 });
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const emojiStyle = useAnimatedStyle(() => ({ transform: [{ scale: emojiScale.value }] }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none">
        {/* Confetti */}
        {particles.map((p) => (
          <ConfettiPiece key={p.id} particle={p} />
        ))}

        {/* Central card */}
        <Animated.View style={[styles.cardWrapper, cardStyle]}>
          <LinearGradient
            colors={['rgba(26,23,48,0.97)', 'rgba(45,37,84,0.97)']}
            style={styles.card}
          >
            <Animated.Text style={[styles.celebEmoji, emojiStyle]}>{emoji}</Animated.Text>
            <Text style={styles.celebTitle}>{title}</Text>
            {subtitle && <Text style={styles.celebSubtitle}>{subtitle}</Text>}
            <View style={styles.sparkleRow}>
              {['✨', '⭐', '✨'].map((s, i) => (
                <Text key={i} style={styles.sparkle}>
                  {s}
                </Text>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

interface CelebrationState {
  visible: boolean;
  emoji: string;
  title: string;
  subtitle?: string;
}

export function useCelebration() {
  const [state, setState] = useState<CelebrationState>({
    visible: false,
    emoji: '🎉',
    title: '',
  });

  const celebrate = useCallback((emoji: string, title: string, subtitle?: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setState({ visible: true, emoji, title, subtitle });
  }, []);

  const hide = useCallback(() => {
    setState((s) => ({ ...s, visible: false }));
  }, []);

  const overlay = (
    <CelebrationOverlay
      visible={state.visible}
      emoji={state.emoji}
      title={state.title}
      subtitle={state.subtitle}
      onHide={hide}
    />
  );

  return { celebrate, overlay };
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(13,11,26,0.5)',
  },
  cardWrapper: {
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.3)',
    ...Shadows.glow,
    width: 260,
  },
  card: {
    padding: 32,
    alignItems: 'center',
  },
  celebEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  celebTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  celebSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  sparkleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  sparkle: {
    fontSize: 20,
  },
});
