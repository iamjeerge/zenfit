/**
 * @file colors.ts
 * @module theme/colors
 * @description ZenFit design-system tokens — single source of truth for all colours,
 * typography sizes, and spacing values. Import Colors, FontSizes, or Spacing.
 */

// ─────────────────────────────────────────────
// ZenFit Design System — Colors & Gradients
// The single source of truth for every pixel
// ─────────────────────────────────────────────

export const Colors = {
  // ── Backgrounds ──────────────────────────────
  background: "#0D0B1A",
  backgroundLight: "#151326",
  card: "#1A1730",
  cardHover: "#221F3A",

  // ── Primary Palette ──────────────────────────
  violet: "#7C3AED",
  violetLight: "#A78BFA",
  lavender: "#C4B5FD",
  rosePetal: "#F472B6",
  rosePetalLight: "#FBCFE8",

  // ── Accent Colors ────────────────────────────
  sacredGold: "#FBBF24",
  sageLeaf: "#34D399",
  moonlight: "#F1F5F9",
  cosmicBlue: "#60A5FA",
  sunriseOrange: "#FB923C",

  // ── Text Colors ──────────────────────────────
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  textAccent: "#C4B5FD",

  // ── Status Colors ────────────────────────────
  success: "#34D399",
  warning: "#FBBF24",
  error: "#F87171",
  info: "#60A5FA",

  // ── Heart Rate Zones ─────────────────────────
  heartRest: "#34D399",
  heartFatBurn: "#60A5FA",
  heartCardio: "#FBBF24",
  heartPeak: "#F87171",
  heartExtreme: "#EF4444",

  // ── Glassmorphism ────────────────────────────
  glassBorder: "rgba(196, 181, 253, 0.2)",
  glassBackground: "rgba(26, 23, 48, 0.6)",
  glassBackgroundLight: "rgba(26, 23, 48, 0.4)",

  // ── Overlays ─────────────────────────────────
  overlay: "rgba(13, 11, 26, 0.7)",
  overlayLight: "rgba(13, 11, 26, 0.4)",
};

export const Gradients = {
  // ── Aurora Gradients ─────────────────────────
  aurora: ["#7C3AED", "#C4B5FD", "#F472B6"] as const,
  auroraSubtle: ["#7C3AED", "#A78BFA"] as const,
  cosmic: ["#0D0B1A", "#1A1730", "#2D2554"] as const,
  sunrise: ["#F472B6", "#FBBF24", "#FB923C"] as const,
  ocean: ["#60A5FA", "#7C3AED"] as const,
  forest: ["#34D399", "#059669"] as const,
  lotus: ["#F472B6", "#C4B5FD", "#7C3AED"] as const,

  // ── Card Gradients ───────────────────────────
  cardPrimary: ["rgba(124, 58, 237, 0.3)", "rgba(244, 114, 182, 0.1)"] as const,
  cardSecondary: [
    "rgba(196, 181, 253, 0.1)",
    "rgba(124, 58, 237, 0.05)",
  ] as const,
  cardGold: ["rgba(251, 191, 36, 0.2)", "rgba(251, 191, 36, 0.05)"] as const,

  // ── Tab Bar ──────────────────────────────────
  tabGlow: ["rgba(124, 58, 237, 0.8)", "rgba(124, 58, 237, 0)"] as const,
};

export const Shadows = {
  glow: {
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  subtle: {
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const FontWeights = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
};

export const LineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
};

export const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

// ─── Light Theme ────────────────────────────────────────────────────────────

export const LightColors = {
  background: "#F8F9FF",
  backgroundLight: "#EEF0FA",
  card: "#FFFFFF",
  cardHover: "#F0F2FF",

  violet: "#7C3AED",
  violetLight: "#A78BFA",
  lavender: "#7C3AED",
  rosePetal: "#E8498A",
  rosePetalLight: "#F9A8D4",

  sacredGold: "#D97706",
  sageLeaf: "#059669",
  moonlight: "#1A1730",
  cosmicBlue: "#2563EB",
  sunriseOrange: "#EA580C",

  textPrimary: "#1A1730",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  textAccent: "#7C3AED",

  success: "#059669",
  warning: "#D97706",
  error: "#DC2626",
  info: "#2563EB",

  heartRest: "#059669",
  heartFatBurn: "#2563EB",
  heartCardio: "#D97706",
  heartPeak: "#DC2626",
  heartExtreme: "#991B1B",

  glassBorder: "rgba(124, 58, 237, 0.15)",
  glassBackground: "rgba(255, 255, 255, 0.8)",
  glassBackgroundLight: "rgba(255, 255, 255, 0.5)",

  overlay: "rgba(248, 249, 255, 0.7)",
  overlayLight: "rgba(248, 249, 255, 0.4)",
} satisfies typeof Colors;

export const LightGradients = {
  aurora: ["#7C3AED", "#C4B5FD", "#F472B6"] as const,
  auroraSubtle: ["#7C3AED", "#A78BFA"] as const,
  cosmic: ["#EEF0FA", "#F8F9FF", "#FFFFFF"] as const,
  sunrise: ["#F472B6", "#FBBF24", "#FB923C"] as const,
  ocean: ["#60A5FA", "#7C3AED"] as const,
  forest: ["#34D399", "#059669"] as const,
  lotus: ["#F472B6", "#C4B5FD", "#7C3AED"] as const,
  cardPrimary: [
    "rgba(124, 58, 237, 0.08)",
    "rgba(244, 114, 182, 0.04)",
  ] as const,
  cardSecondary: [
    "rgba(196, 181, 253, 0.1)",
    "rgba(124, 58, 237, 0.03)",
  ] as const,
  cardGold: ["rgba(251, 191, 36, 0.15)", "rgba(251, 191, 36, 0.03)"] as const,
  tabGlow: ["rgba(124, 58, 237, 0.8)", "rgba(124, 58, 237, 0)"] as const,
  card: ["rgba(255, 255, 255, 0.9)", "rgba(238, 240, 250, 0.6)"] as const,
} satisfies Omit<typeof Gradients, "card"> & {
  card: readonly [string, string];
};

export const LightShadows = {
  glow: {
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  card: {
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  subtle: {
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
} satisfies typeof Shadows;
