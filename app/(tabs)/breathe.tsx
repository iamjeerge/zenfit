import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
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
} from '../../src/theme/colors';
import { GlassCard, GradientButton, AnimatedEntry } from '../../src/components';

type BreathingPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

const INHALE_DURATION = 4000;
const HOLD_DURATION = 7000;
const EXHALE_DURATION = 8000;

const PHASE_SECONDS: Record<BreathingPhase, number> = {
  idle: 0,
  inhale: INHALE_DURATION / 1000,
  hold: HOLD_DURATION / 1000,
  exhale: EXHALE_DURATION / 1000,
};

const PHASE_COLORS: Record<BreathingPhase, string> = {
  idle: Colors.violet,
  inhale: Colors.cosmicBlue,
  hold: Colors.sacredGold,
  exhale: Colors.rosePetal,
};

export default function BreatheScreen() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('idle');
  const [cycles, setCycles] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [scaleAnim] = useState(new Animated.Value(0.3));
  const phaseStartRef = useRef(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let cycleTimer: ReturnType<typeof setInterval>;
    let countdownTimer: ReturnType<typeof setInterval>;

    if (isActive) {
      cycleTimer = setInterval(() => {
        setElapsedTime((t) => t + 1);
      }, 1000);
    }

    if (isActive && phase !== 'idle') {
      // Start countdown for current phase
      const phaseSecs = PHASE_SECONDS[phase];
      setCountdown(phaseSecs);
      phaseStartRef.current = Date.now();

      countdownTimer = setInterval(() => {
        const elapsed = (Date.now() - phaseStartRef.current) / 1000;
        const remaining = Math.max(0, Math.ceil(phaseSecs - elapsed));
        setCountdown(remaining);
      }, 200);
    }

    if (isActive) {
      // Haptic on phase change
      if (phase !== 'idle') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const schedulePhase = (currentPhase: BreathingPhase, duration: number, nextPhase: BreathingPhase) => {
        timer = setTimeout(() => {
          setPhase(nextPhase);
          if (nextPhase === 'inhale' && currentPhase === 'exhale') {
            setCycles((c) => c + 1);
          }
        }, duration);
      };

      if (phase === 'idle') {
        setPhase('inhale');
      } else if (phase === 'inhale') {
        schedulePhase('inhale', INHALE_DURATION, 'hold');
      } else if (phase === 'hold') {
        schedulePhase('hold', HOLD_DURATION, 'exhale');
      } else if (phase === 'exhale') {
        schedulePhase('exhale', EXHALE_DURATION, 'inhale');
      }
    }

    return () => {
      clearTimeout(timer);
      clearInterval(cycleTimer);
      clearInterval(countdownTimer);
    };
  }, [isActive, phase]);

  // Animate circle based on breathing phase
  useEffect(() => {
    if (phase === 'idle') {
      Animated.timing(scaleAnim, {
        toValue: 0.3,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    } else if (phase === 'inhale') {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: INHALE_DURATION,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
    } else if (phase === 'hold') {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: HOLD_DURATION,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    } else if (phase === 'exhale') {
      Animated.timing(scaleAnim, {
        toValue: 0.3,
        duration: EXHALE_DURATION,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }, [phase]);

  const getPhaseLabel = () => {
    switch (phase) {
      case 'inhale':
        return 'Inhale';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Exhale';
      default:
        return 'Ready?';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsActive(false);
    setPhase('idle');
    setCycles(0);
    setElapsedTime(0);
    setCountdown(0);
  };

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsActive(!isActive);
  };

  const phaseColor = PHASE_COLORS[phase];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.lotus as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header */}
          <AnimatedEntry delay={0} duration={600}>
            <View style={styles.header}>
              <Text style={styles.title} accessibilityRole="header">
                4-7-8 Breathing
              </Text>
              <Text style={styles.subtitle}>
                Calm your mind, ease your soul
              </Text>
            </View>
          </AnimatedEntry>

          {/* Main Circle Animation */}
          <AnimatedEntry delay={200} duration={800}>
            <View style={styles.circleContainer}>
              <Animated.View
                style={[
                  styles.breathingCircle,
                  {
                    transform: [{ scale: scaleAnim }],
                    backgroundColor: phaseColor,
                    shadowColor: phaseColor,
                  },
                ]}
              />
              <View style={styles.phaseOverlay}>
                <Text style={styles.phaseText}>{getPhaseLabel()}</Text>
                {phase !== 'idle' && (
                  <Text
                    style={[styles.countdownText, { color: phaseColor }]}
                    accessibilityLabel={`${countdown} seconds remaining`}
                  >
                    {countdown}
                  </Text>
                )}
              </View>
            </View>
          </AnimatedEntry>

          {/* Stats Section */}
          <AnimatedEntry delay={300} duration={600}>
            <View style={styles.statsSection}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>CYCLES</Text>
                <Text style={styles.statValue}>{cycles}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>ELAPSED</Text>
                <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
              </View>
            </View>
          </AnimatedEntry>

          {/* Technique Info */}
          <AnimatedEntry delay={400} duration={600}>
            <GlassCard style={styles.infoCard}>
              <Text style={styles.techniqueTitle}>4-7-8 Technique</Text>
              <View style={styles.techniqueSteps}>
                {[
                  { num: '1', text: 'Inhale for 4 seconds', color: Colors.cosmicBlue },
                  { num: '2', text: 'Hold for 7 seconds', color: Colors.sacredGold },
                  { num: '3', text: 'Exhale for 8 seconds', color: Colors.rosePetal },
                ].map((step) => (
                  <View key={step.num} style={styles.techniqueStep}>
                    <View style={[styles.stepBadge, { backgroundColor: step.color }]}>
                      <Text style={styles.stepNumber}>{step.num}</Text>
                    </View>
                    <Text style={styles.stepText}>{step.text}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.benefitText}>
                Reduces anxiety, improves focus, and enhances sleep quality.
              </Text>
            </GlassCard>
          </AnimatedEntry>

          {/* Control Buttons */}
          <AnimatedEntry delay={500} duration={600}>
            <View style={styles.buttonContainer}>
              <GradientButton
                title={isActive ? 'Pause' : 'Start'}
                onPress={handleToggle}
                variant="primary"
                style={{ flex: 2 }}
                accessibilityLabel={isActive ? 'Pause breathing exercise' : 'Start breathing exercise'}
              />
              <GradientButton
                title="Reset"
                onPress={handleReset}
                variant="secondary"
                style={{ flex: 1 }}
                accessibilityLabel="Reset breathing exercise"
              />
            </View>
          </AnimatedEntry>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
  },
  circleContainer: {
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  breathingCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 130,
    opacity: 0.5,
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 12,
  },
  phaseOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  phaseText: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    letterSpacing: 1,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    marginVertical: Spacing.md,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: Spacing.xs,
    letterSpacing: 2,
    fontWeight: '600',
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  infoCard: {
    width: '100%',
    marginVertical: Spacing.md,
  },
  techniqueTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  techniqueSteps: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  techniqueStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stepText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  benefitText: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    marginBottom: Spacing.md,
  },
});
