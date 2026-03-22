import React, { useState, useEffect } from 'react';
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
import {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '../../src/theme/colors';

type BreathingPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

export default function BreatheScreen() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('idle');
  const [cycles, setCycles] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [scaleAnim] = useState(new Animated.Value(0.3));

  // Breathing cycle: 4 inhale, 7 hold, 8 exhale
  const INHALE_DURATION = 4000;
  const HOLD_DURATION = 7000;
  const EXHALE_DURATION = 8000;
  const CYCLE_DURATION = INHALE_DURATION + HOLD_DURATION + EXHALE_DURATION;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let cycleTimer: NodeJS.Timeout;

    if (isActive) {
      cycleTimer = setInterval(() => {
        setElapsedTime((t) => t + 1);
      }, 1000);
    }

    if (isActive) {
      const schedulePhase = (phase: BreathingPhase, duration: number, nextPhase: BreathingPhase) => {
        timer = setTimeout(() => {
          setPhase(nextPhase);
          if (nextPhase === 'inhale' && phase === 'exhale') {
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
        return 'Ready to breathe?';
    }
  };

  const getPhaseDuration = () => {
    switch (phase) {
      case 'inhale':
        return 4;
      case 'hold':
        return 7;
      case 'exhale':
        return 8;
      default:
        return 0;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('idle');
    setCycles(0);
    setElapsedTime(0);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.lotus}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>4-7-8 Breathing</Text>
            <Text style={styles.subtitle}>
              Calm your mind, ease your soul
            </Text>
          </View>

          {/* Main Circle Animation */}
          <View style={styles.circleContainer}>
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            />

            {/* Phase Label */}
            <View style={styles.phaseOverlay}>
              <Text style={styles.phaseText}>{getPhaseLabel()}</Text>
              {phase !== 'idle' && (
                <Text style={styles.phaseDuration}>{getPhaseDuration()}</Text>
              )}
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Cycles</Text>
              <Text style={styles.statValue}>{cycles}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Elapsed</Text>
              <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
            </View>
          </View>

          {/* Technique Info */}
          <View style={styles.infoCard}>
            <LinearGradient
              colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
              style={styles.infoGradient}
            >
              <Text style={styles.techniqueTitle}>4-7-8 Technique</Text>
              <View style={styles.techniqueStep}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>Inhale for 4 seconds</Text>
              </View>
              <View style={styles.techniqueStep}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepText}>Hold for 7 seconds</Text>
              </View>
              <View style={styles.techniqueStep}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepText}>Exhale for 8 seconds</Text>
              </View>
              <Text style={styles.benefitText}>
                Repeat this cycle to reduce anxiety, improve focus, and enhance sleep quality.
              </Text>
            </LinearGradient>
          </View>

          {/* Control Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => setIsActive(!isActive)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={Gradients.aurora}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {isActive ? 'Pause' : 'Start'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <View style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </View>
            </TouchableOpacity>
          </View>
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
    marginTop: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  circleContainer: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  breathingCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 120,
    backgroundColor: Colors.violet,
    opacity: 0.6,
    shadowColor: Colors.violet,
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 10,
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
    marginBottom: Spacing.sm,
  },
  phaseDuration: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.lavender,
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginVertical: Spacing.lg,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: Colors.glassBorder,
  },
  infoCard: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.subtle,
    marginVertical: Spacing.lg,
  },
  infoGradient: {
    padding: Spacing.lg,
  },
  techniqueTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  techniqueStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.violet,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  button: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    minHeight: 56,
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  primaryButton: {
    flex: 2,
  },
  secondaryButton: {
    flex: 1,
  },
  buttonGradient: {
    paddingVertical: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.glassBackground,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  resetButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
