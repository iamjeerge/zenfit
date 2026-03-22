import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../src/theme/colors';

const TAB_ICONS: Record<string, { emoji: string; label: string }> = {
  index: { emoji: '🏠', label: 'Home' },
  breathe: { emoji: '🌬️', label: 'Breathe' },
  yoga: { emoji: '🧘', label: 'Yoga' },
  nutrition: { emoji: '🍎', label: 'Nutrition' },
  profile: { emoji: '👤', label: 'Profile' },
};

const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const tab = TAB_ICONS[name] ?? { emoji: '•', label: name };

  return (
    <View style={styles.iconContainer}>
      <Text
        style={[
          styles.icon,
          {
            opacity: focused ? 1 : 0.5,
            fontSize: focused ? 26 : 22,
          },
        ]}
      >
        {tab.emoji}
      </Text>
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? Colors.lavender : Colors.textMuted },
        ]}
      >
        {tab.label}
      </Text>
      {focused && <View style={styles.glowIndicator} />}
    </View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom + Spacing.xs }]}>
      <BlurView intensity={90} style={styles.blurContainer}>
        <View style={styles.tabBar}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;
            const tabName = route.name === 'index' ? 'index' : route.name.split('/').pop() || route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <TouchableOpacity
                key={index}
                onPress={onPress}
                style={[
                  styles.tabButton,
                  isFocused && styles.tabButtonActive,
                ]}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityState={{ selected: isFocused }}
                accessibilityLabel={TAB_ICONS[tabName]?.label ?? tabName}
              >
                <TabIcon name={tabName} focused={isFocused} />
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="breathe"
        options={{
          title: 'Breathe',
        }}
      />
      <Tabs.Screen
        name="yoga"
        options={{
          title: 'Yoga',
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0,
  },
  blurContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 11, 26, 0.92)',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
    minHeight: 52,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    gap: 2,
  },
  icon: {
    fontWeight: '600',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  glowIndicator: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.violet,
    bottom: -6,
    shadowColor: Colors.violet,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 5,
  },
});
