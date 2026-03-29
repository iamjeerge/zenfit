/**
 * BottomSheet — A lightweight, spring-animated bottom sheet component
 * built with react-native-reanimated. No additional packages required.
 *
 * Usage:
 *   const sheet = useBottomSheet();
 *
 *   <BottomSheet ref={sheet.ref} snapHeight={400}>
 *     <Text>Your content</Text>
 *   </BottomSheet>
 *   <Button title="Open" onPress={sheet.open} />
 */
import React, { useCallback, useImperativeHandle, forwardRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  Modal,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing } from '../theme/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetHandle {
  open: () => void;
  close: () => void;
}

interface BottomSheetProps {
  children: React.ReactNode;
  /** Height of the sheet in points. Defaults to 400. */
  snapHeight?: number;
  /** Called when the sheet is dismissed */
  onClose?: () => void;
  /** Whether to allow closing by tapping the backdrop */
  dismissable?: boolean;
  /** Whether content inside is scrollable */
  scrollable?: boolean;
}

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
};

// Hook for a convenient open/close API
export function useBottomSheet() {
  const ref = React.useRef<BottomSheetHandle>(null);
  const open = useCallback(() => ref.current?.open(), []);
  const close = useCallback(() => ref.current?.close(), []);
  return { ref, open, close };
}

const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>(function BottomSheet(
  { children, snapHeight = 400, onClose, dismissable = true, scrollable = false },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const translateY = useSharedValue(snapHeight);
  const backdropOpacity = useSharedValue(0);

  const show = useCallback(() => {
    setVisible(true);
    translateY.value = snapHeight;
    backdropOpacity.value = 0;
    // Slight delay to let Modal render before animating
    setTimeout(() => {
      translateY.value = withSpring(0, SPRING_CONFIG);
      backdropOpacity.value = withTiming(1, { duration: 250 });
    }, 16);
  }, [snapHeight]);

  const hide = useCallback(() => {
    translateY.value = withSpring(snapHeight, SPRING_CONFIG);
    backdropOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(setVisible)(false);
      if (onClose) runOnJS(onClose)();
    });
  }, [snapHeight, onClose]);

  useImperativeHandle(ref, () => ({
    open: show,
    close: hide,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const ContentWrapper = scrollable ? ScrollView : View;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={hide}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={dismissable ? hide : undefined} accessible={false}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </TouchableWithoutFeedback>

        {/* Sheet panel */}
        <Animated.View
          style={[
            styles.sheet,
            { height: snapHeight + 40 }, // +40 for overscroll
            sheetStyle,
          ]}
        >
          {/* Drag pill */}
          <View style={styles.dragPillWrapper} accessibilityRole="none">
            <View style={styles.dragPill} />
          </View>

          <ContentWrapper
            style={styles.content}
            {...(scrollable
              ? {
                  showsVerticalScrollIndicator: false,
                  keyboardShouldPersistTaps: 'handled' as const,
                }
              : {})}
          >
            {children}
          </ContentWrapper>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

export default BottomSheet;

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: '#1A1730',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  dragPillWrapper: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  dragPill: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.glassBorder,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
});
