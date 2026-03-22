import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../src/theme/colors';

// Tab icon components with emoji and text fallback
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const iconMap: Record<string, string> = {
    home: '🏠',
    breathe: '🌬️',
    yoga: '🧘',
    nutrition: '🍎',
    profile: '👤',
  };

  return (
    <View style={styles.iconContainer}>
      <Text
        style={[
          styles.icon,
          {
            color: focused ? Colors.violet : Colors.textSecondary,
            fontSize: 24,
            opacity: focused ? 1 : 0.7,
          },
        ]}
      >
        {iconMap[name]}
      </Text>
      {focused && <View style={styles.glowIndicator} />}
    </View>
  );
};

// Custom tab bar component with glassmorphism
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom + Spacing.sm }]}>
      <BlurView intensity={80} style={styles.blurContainer}>
        <View style={styles.tabBar}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const tabName = route.name.split('/').pop() || route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
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
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 11, 26, 0.95)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    transition: 'all 200ms ease-out',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  icon: {
    fontWeight: '600',
  },
  glowIndicator: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.violet,
    bottom: -12,
    shadowColor: Colors.violet,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
});
