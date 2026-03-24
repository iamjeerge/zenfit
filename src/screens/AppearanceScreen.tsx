import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Gradients, Spacing, BorderRadius, FontSizes } from '../theme/colors';
import { useTheme, ThemeMode } from '../theme/ThemeContext';

const OPTIONS: { mode: ThemeMode; emoji: string; label: string; description: string }[] = [
  { mode: 'dark',   emoji: '🌙', label: 'Dark',   description: 'Easy on the eyes at night' },
  { mode: 'light',  emoji: '☀️', label: 'Light',  description: 'Clean and bright look' },
  { mode: 'system', emoji: '📱', label: 'System', description: 'Follow device setting' },
];

export default function AppearanceScreen() {
  const router = useRouter();
  const { mode, setMode, isDark } = useTheme();

  const bg = isDark ? Colors.background : '#F8F9FF';
  const colors = isDark ? Colors : { ...Colors, textPrimary: '#1A1730', textSecondary: '#64748B', card: '#FFFFFF', glassBorder: 'rgba(124,58,237,0.15)' };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      <LinearGradient
        colors={(isDark ? Gradients.cosmic : ['#EEF0FA', '#F8F9FF', '#FFFFFF']) as unknown as [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.textSecondary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Appearance</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Choose your preferred theme</Text>
      </View>

      <View style={styles.options}>
        {OPTIONS.map((opt) => {
          const isActive = mode === opt.mode;
          return (
            <TouchableOpacity
              key={opt.mode}
              style={[
                styles.optionCard,
                { backgroundColor: colors.card, borderColor: isActive ? Colors.violet : colors.glassBorder },
                isActive && styles.optionCardActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMode(opt.mode);
              }}
            >
              <Text style={styles.optionEmoji}>{opt.emoji}</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>{opt.label}</Text>
                <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>{opt.description}</Text>
              </View>
              {isActive && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  backBtn: { marginBottom: Spacing.md },
  backText: { fontSize: FontSizes.md },
  title: { fontSize: FontSizes.xxxl, fontWeight: '700', marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSizes.md },
  options: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    borderRadius: BorderRadius.xl, borderWidth: 2,
  },
  optionCardActive: { borderColor: Colors.violet },
  optionEmoji: { fontSize: 32, marginRight: Spacing.md },
  optionText: { flex: 1 },
  optionLabel: { fontSize: FontSizes.lg, fontWeight: '700', marginBottom: 2 },
  optionDesc: { fontSize: FontSizes.sm },
  checkmark: { fontSize: FontSizes.lg, color: Colors.violet, fontWeight: '700' },
});
