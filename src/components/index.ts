/**
 * @file index.ts
 * @module components/index
 * @description Barrel export for all shared UI components.
 * Import from this file to avoid deep relative import paths throughout the app.
 */

export { default as GlassCard } from './GlassCard';
export { default as GradientButton } from './GradientButton';
export { default as StatCard } from './StatCard';
export { default as SectionHeader } from './SectionHeader';
export { default as AnimatedEntry } from './AnimatedEntry';
export { default as AnimatedEmptyState } from './AnimatedEmptyState';
export { default as BottomSheet, useBottomSheet } from './BottomSheet';
export type { BottomSheetHandle } from './BottomSheet';
export {
  default as SkeletonLoader,
  Skeleton,
  SkeletonCard,
  SkeletonStatRow,
  SkeletonListItem,
} from './SkeletonLoader';
export { CelebrationOverlay, useCelebration } from './CelebrationOverlay';
export { LineChart, BarChart, DonutChart } from './InteractiveChart';
