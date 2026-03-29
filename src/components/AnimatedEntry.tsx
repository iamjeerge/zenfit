/**
 * @file AnimatedEntry.tsx
 * @module components/AnimatedEntry
 * @description Wraps children in a fade-in + slide-up entrance animation powered by
 * react-native-reanimated. Delays can be staggered for list items.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface AnimatedEntryProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
}

export default function AnimatedEntry({
  children,
  delay = 0,
  duration = 500,
  style,
  direction = 'up',
}: AnimatedEntryProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(direction === 'up' ? 20 : direction === 'down' ? -20 : 0);
  const translateX = useSharedValue(direction === 'left' ? 20 : direction === 'right' ? -20 : 0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration, easing: Easing.out(Easing.cubic) }),
    );
    translateX.value = withDelay(
      delay,
      withTiming(0, { duration, easing: Easing.out(Easing.cubic) }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
