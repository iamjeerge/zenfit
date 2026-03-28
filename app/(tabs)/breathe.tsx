import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
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

type BreathingPhase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'exhale2';

interface Technique {
  id: string;
  name: string;
  emoji: string;
  description: string;
  benefit: string;
  gradient: readonly [string, string, ...string[]];
  inhale: number; // ms
  hold: number;   // ms (0 = skip)
  exhale: number; // ms
  hold2: number;  // ms (post-exhale hold, for box)
  steps: { text: string; color: string }[];
}

const TECHNIQUES: Technique[] = [
  {
    id: '478',
    name: '4-7-8',
    emoji: '🫁',
    description: 'Dr. Weil\'s classic relaxation breath',
    benefit: 'Reduces anxiety, lowers heart rate, and promotes deep sleep.',
    gradient: Gradients.lotus,
    inhale: 4000,
    hold: 7000,
    exhale: 8000,
    hold2: 0,
    steps: [
      { text: 'Inhale 4s', color: Colors.cosmicBlue },
      { text: 'Hold 7s', color: Colors.sacredGold },
      { text: 'Exhale 8s', color: Colors.rosePetal },
    ],
  },
  {
    id: 'box',
    name: 'Box Breathing',
    emoji: '⬜',
    description: 'Used by Navy SEALs for stress control',
    benefit: 'Sharpens focus, reduces cortisol, and calms the nervous system.',
    gradient: ['#1e3a5f', '#60A5FA', '#7C3AED'] as const,
    inhale: 4000,
    hold: 4000,
    exhale: 4000,
    hold2: 4000,
    steps: [
      { text: 'Inhale 4s', color: Colors.cosmicBlue },
      { text: 'Hold 4s', color: Colors.sacredGold },
      { text: 'Exhale 4s', color: Colors.rosePetal },
      { text: 'Hold 4s', color: Colors.sageLeaf },
    ],
  },
  {
    id: 'wimhof',
    name: 'Wim Hof',
    emoji: '❄️',
    description: 'Iceman\'s energizing power breath',
    benefit: 'Boosts energy, strengthens immune response, and increases vitality.',
    gradient: ['#0f2944', '#164e63', '#0891b2'] as const,
    inhale: 2000,
    hold: 0,
    exhale: 2000,
    hold2: 0,
    steps: [
      { text: 'Inhale 2s (deep)', color: Colors.cosmicBlue },
      { text: 'Exhale 2s (passive)', color: Colors.violet },
      { text: '30 reps per round', color: Colors.sageLeaf },
    ],
  },
  {
    id: 'coherence',
    name: 'Coherence',
    emoji: '💜',
    description: 'Heart rate variability optimisation',
    benefit: 'Improves emotional balance, lowers blood pressure, enhances HRV.',
    gradient: ['#2d1b69', '#7C3AED', '#C4B5FD'] as const,
    inhale: 5000,
    hold: 0,
    exhale: 5000,
    hold2: 0,
    steps: [
      { text: 'Inhale 5s', color: Colors.violet },
      { text: 'Exhale 5s', color: Colors.rosePetal },
      { text: '6 breaths/minute', color: Colors.sageLeaf },
    ],
  },
];

const PHASE_COLORS: Record<BreathingPhase, string> = {
  idle: Colors.violet,
  inhale: Colors.cosmicBlue,
  hold: Colors.sacredGold,
  exhale: Colors.rosePetal,
  exhale2: Colors.sageLeaf,
};

export default function BreatheScreen() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('idle');
  const [cycles, setCycles] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [scaleAnim] = useState(new Animated.Value(0.3));
  const phaseStartRef = useRef(0);
  const [selectedTech, setSelectedTech] = useState<Technique>(TECHNIQUES[0]);

  const tech = selectedTech;

  const getPhaseSeconds = (p: BreathingPhase): number => {
    switch (p) {
      case 'inhale': return tech.inhale / 1000;
      case 'hold': return tech.hold / 1000;
      case 'exhale': return tech.exhale / 1000;
      case 'exhale2': return tech.hold2 / 1000;
      default: return 0;
    }
  };

  const getNextPhase = (p: BreathingPhase): BreathingPhase => {
    if (p === 'inhale') return tech.hold > 0 ? 'hold' : 'exhale';
    if (p === 'hold') return 'exhale';
    if (p === 'exhale') return tech.hold2 > 0 ? 'exhale2' : 'inhale';
    if (p === 'exhale2') return 'inhale';
    return 'inhale';
  };

  const getPhaseDuration = (p: BreathingPhase): number => {
    switch (p) {
      case 'inhale': return tech.inhale;
      case 'hold': return tech.hold;
      case 'exhale': return tech.exhale;
      case 'exhale2': return tech.hold2;
      default: return 0;
    }
  };

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
      const phaseSecs = getPhaseSeconds(phase);
      setCountdown(phaseSecs);
      phaseStartRef.current = Date.now();

      countdownTimer = setInterval(() => {
        const elapsed = (Date.now() - phaseStartRef.current) / 1000;
        const remaining = Math.max(0, Math.ceil(phaseSecs - elapsed));
        setCountdown(remaining);
      }, 200);
    }

    if (isActive) {
      if (phase !== 'idle') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const schedulePhase = (currentPhase: BreathingPhase, duration: number, nextPhase: BreathingPhase) => {
        timer = setTimeout(() => {
          setPhase(nextPhase);
          if (nextPhase === 'inhale' && (currentPhase === 'exhale' || currentPhase === 'exhale2')) {
            setCycles((c) => c + 1);
          }
        }, duration);
      };

      if (phase === 'idle') {
        setPhase('inhale');
      } else {
        const next = getNextPhase(phase);
        const dur = getPhaseDuration(phase);
        if (dur > 0) schedulePhase(phase, dur, next);
        else setPhase(next); // skip zero-duration phases
      }
    }

    return () => {
      clearTimeout(timer);
      clearInterval(cycleTimer);
      clearInterval(countdownTimer);
    };
  }, [isActive, phase, selectedTech]);

  // Animate circle based on breathing phase
  useEffect(() => {
    const dur = getPhaseDuration(phase);
    if (phase === 'idle') {
      Animated.timing(scaleAnim, { toValue: 0.3, duration: 500, easing: Easing.ease, useNativeDriver: false }).start();
    } else if (phase === 'inhale') {
      Animated.timing(scaleAnim, { toValue: 1, duration: tech.inhale, easing: Easing.inOut(Easing.ease), useNativeDriver: false }).start();
    } else if (phase === 'hold' || phase === 'exhale2') {
      Animated.timing(scaleAnim, { toValue: 1, duration: dur, easing: Easing.ease, useNativeDriver: false }).start();
    } else if (phase === 'exhale') {
      Animated.timing(scaleAnim, { toValue: 0.3, duration: tech.exhale, easing: Easing.inOut(Easing.ease), useNativeDriver: false }).start();
    }
  }, [phase]);

  const getPhaseLabel = () => {
    switch (phase) {
      case 'inhale': return 'Inhale';
      case 'hold': return 'Hold';
      case 'exhale': return 'Exhale';
      case 'exhale2': return 'Hold';
      default: return 'Ready?';
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

  const handleSelectTech = (t: Technique) => {
    if (isActive) handleReset();
    setSelectedTech(t);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsActive(!isActive);
  };

  const phaseColor = PHASE_COLORS[phase];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={tech.gradient as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Technique Picker */}
          {!isActive && (
            <AnimatedEntry delay={0} duration={400}>
              <Text style={styles.sectionLabel}>CHOOSE TECHNIQUE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.techScroll}>
                {TECHNIQUES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.techCard,
                      selectedTech.id === t.id && styles.techCardActive,
                    ]}
                    onPress={() => handleSelectTech(t)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: selectedTech.id === t.id }}
                  >
                    <Text style={styles.techEmoji}>{t.emoji}</Text>
                    <Text style={styles.techName}>{t.name}</Text>
                    <Text style={styles.techDesc} numberOfLines={2}>{t.description}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </AnimatedEntry>
          )}

          {/* Header */}
          <AnimatedEntry delay={0} duration={600}>
            <View style={styles.header}>
              <Text style={styles.title} accessibilityRole="header">
                {tech.emoji} {tech.name}
              </Text>
              <Text style={styles.subtitle}>{tech.description}</Text>
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
              <Text style={styles.techniqueTitle}>{tech.name} Technique</Text>
              <View style={styles.techniqueSteps}>
                {tech.steps.map((step, i) => (
                  <View key={i} style={styles.techniqueStep}>
                    <View style={[styles.stepBadge, { backgroundColor: step.color }]}>
                      <Text style={styles.stepNumber}>{i + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step.text}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.benefitText}>{tech.benefit}</Text>
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
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    gap: 0,
  },
  sectionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  techScroll: { marginBottom: Spacing.lg },
  techCard: {
    width: 130,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginRight: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  techCardActive: {
    backgroundColor: 'rgba(124,58,237,0.35)',
    borderColor: Colors.violet,
  },
  techEmoji: { fontSize: 24, marginBottom: 4 },
  techName: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  techDesc: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
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
