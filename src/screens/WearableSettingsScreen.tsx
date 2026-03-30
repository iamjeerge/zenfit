/**
 * @file WearableSettingsScreen.tsx
 * @module screens/WearableSettingsScreen
 * @description Manage wearable device connections — connect/disconnect Garmin,
 * Fitbit, Samsung, Oura, Apple Watch, and Android Health Connect.
 * View sync status, configure auto-sync, and manage data permissions.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from '../utils/haptics';
import { Colors, Gradients, Spacing, BorderRadius, FontSizes } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import AnimatedEntry from '../components/AnimatedEntry';
import SectionHeader from '../components/SectionHeader';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import SkeletonLoader from '../components/SkeletonLoader';
import { useRouter } from '../utils/router';

/* ─── types ─── */
interface WearableBrand {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  connectUrl: string | null; // OAuth URL for third-party
  isNative: boolean;         // uses HealthKit/Health Connect
  dataTypes: string[];
}

interface ConnectedDevice {
  id: string;
  brand: string;
  connected_at: string;
  last_synced_at: string | null;
  auto_sync: boolean;
  sync_steps: boolean;
  sync_heart_rate: boolean;
  sync_sleep: boolean;
  sync_calories: boolean;
  sync_hrv: boolean;
}

const WEARABLE_BRANDS: WearableBrand[] = [
  {
    id: 'apple_watch',
    name: 'Apple Watch',
    emoji: '⌚',
    description: 'Sync via Apple HealthKit',
    color: '#333',
    connectUrl: null,
    isNative: true,
    dataTypes: ['Steps', 'Heart Rate', 'Sleep', 'Calories', 'HRV'],
  },
  {
    id: 'health_connect',
    name: 'Health Connect',
    emoji: '🤖',
    description: 'Android Health Connect API',
    color: '#4285F4',
    connectUrl: null,
    isNative: true,
    dataTypes: ['Steps', 'Heart Rate', 'Sleep', 'Calories'],
  },
  {
    id: 'garmin',
    name: 'Garmin',
    emoji: '🏔️',
    description: 'Garmin Connect integration',
    color: '#007DC5',
    connectUrl: 'https://connect.garmin.com',
    isNative: false,
    dataTypes: ['Steps', 'Heart Rate', 'Sleep', 'Calories', 'HRV', 'Body Battery'],
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    emoji: '💙',
    description: 'Fitbit Web API integration',
    color: '#00B0B9',
    connectUrl: 'https://www.fitbit.com',
    isNative: false,
    dataTypes: ['Steps', 'Heart Rate', 'Sleep', 'Calories', 'SpO2'],
  },
  {
    id: 'samsung',
    name: 'Samsung Health',
    emoji: '📱',
    description: 'Samsung Health SDK',
    color: '#1428A0',
    connectUrl: null,
    isNative: false,
    dataTypes: ['Steps', 'Heart Rate', 'Sleep', 'Calories', 'Blood Pressure'],
  },
  {
    id: 'oura',
    name: 'Oura Ring',
    emoji: '💍',
    description: 'Oura Cloud API integration',
    color: '#D4AF37',
    connectUrl: 'https://cloud.ouraring.com',
    isNative: false,
    dataTypes: ['Sleep', 'HRV', 'Readiness', 'Temperature'],
  },
  {
    id: 'whoop',
    name: 'WHOOP',
    emoji: '🔴',
    description: 'WHOOP API integration',
    color: '#FF0000',
    connectUrl: 'https://app.whoop.com',
    isNative: false,
    dataTypes: ['HRV', 'Recovery', 'Strain', 'Sleep'],
  },
];

export default function WearableSettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadDevices();
  }, [user]);

  const loadDevices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('wearable_connections')
        .select('*')
        .eq('user_id', user!.id);

      if (error) throw error;
      setConnectedDevices(data || []);
    } catch {
      setConnectedDevices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (brand: WearableBrand) => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // For third-party brands, open OAuth URL (placeholder)
    if (brand.connectUrl && !brand.isNative) {
      Alert.alert(
        `Connect ${brand.name}`,
        `This will open ${brand.name} to authorize ZenFit to read your health data.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Connect',
            onPress: async () => {
              // In production, this would start an OAuth flow
              // For now, create the connection record
              try {
                const { error } = await supabase.from('wearable_connections').insert({
                  user_id: user.id,
                  brand: brand.id,
                  auto_sync: true,
                  sync_steps: true,
                  sync_heart_rate: true,
                  sync_sleep: true,
                  sync_calories: true,
                  sync_hrv: brand.dataTypes.includes('HRV'),
                });
                if (error) throw error;
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                loadDevices();
              } catch {
                Alert.alert('Error', `Could not connect ${brand.name}.`);
              }
            },
          },
        ],
      );
      return;
    }

    // For native integrations (HealthKit / Health Connect)
    try {
      const { error } = await supabase.from('wearable_connections').insert({
        user_id: user.id,
        brand: brand.id,
        auto_sync: true,
        sync_steps: true,
        sync_heart_rate: true,
        sync_sleep: true,
        sync_calories: true,
        sync_hrv: brand.dataTypes.includes('HRV'),
      });
      if (error) throw error;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      loadDevices();
    } catch {
      Alert.alert('Error', 'Could not connect device.');
    }
  };

  const handleDisconnect = (device: ConnectedDevice) => {
    Alert.alert(
      'Disconnect Device',
      `Remove ${getBrand(device.brand)?.name ?? device.brand} connection? Your synced data will be preserved.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            try {
              const { error } = await supabase
                .from('wearable_connections')
                .delete()
                .eq('id', device.id);
              if (error) throw error;
              loadDevices();
            } catch {
              Alert.alert('Error', 'Could not disconnect.');
            }
          },
        },
      ],
    );
  };

  const handleSync = async (device: ConnectedDevice) => {
    setIsSyncing(device.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Simulate sync — in production, call the actual wearable service
      await new Promise((r) => setTimeout(r, 2000));

      await supabase
        .from('wearable_connections')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', device.id);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      loadDevices();
    } catch {
      Alert.alert('Sync Error', 'Could not sync data. Try again.');
    } finally {
      setIsSyncing(null);
    }
  };

  const toggleSetting = async (deviceId: string, field: string, value: boolean) => {
    Haptics.selectionAsync();
    try {
      await supabase
        .from('wearable_connections')
        .update({ [field]: value })
        .eq('id', deviceId);
      loadDevices();
    } catch {
      // Revert visually handled by reload
    }
  };

  const getBrand = (id: string) => WEARABLE_BRANDS.find((b) => b.id === id);

  const isConnected = (brandId: string) =>
    connectedDevices.some((d) => d.brand === brandId);

  const formatTime = (ts: string | null) => {
    if (!ts) return 'Never';
    const d = new Date(ts);
    const now = new Date();
    const diffMin = Math.round((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffMin < 1440) return `${Math.round(diffMin / 60)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={Gradients.cosmic as [string, string, ...string[]]} style={styles.bg} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <AnimatedEntry delay={0}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Wearables</Text>
            <View style={{ width: 40 }} />
          </View>
        </AnimatedEntry>

        {isLoading ? (
          <SkeletonLoader variant="default" />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Connected Devices */}
            {connectedDevices.length > 0 && (
              <AnimatedEntry delay={100}>
                <SectionHeader title="Connected Devices" emoji="🔗" />
                {connectedDevices.map((device) => {
                  const brand = getBrand(device.brand);
                  return (
                    <GlassCard key={device.id} style={styles.deviceCard}>
                      <View style={styles.deviceHeader}>
                        <View style={styles.deviceInfo}>
                          <Text style={styles.deviceEmoji}>{brand?.emoji ?? '📱'}</Text>
                          <View>
                            <Text style={styles.deviceName}>{brand?.name ?? device.brand}</Text>
                            <Text style={styles.deviceSynced}>
                              Last synced: {formatTime(device.last_synced_at)}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleSync(device)}
                          style={styles.syncBtn}
                          disabled={isSyncing === device.id}
                        >
                          <Text style={styles.syncText}>
                            {isSyncing === device.id ? '⏳' : '🔄'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Data toggles */}
                      <View style={styles.toggleSection}>
                        <View style={styles.toggleRow}>
                          <Text style={styles.toggleLabel}>Auto Sync</Text>
                          <Switch
                            value={device.auto_sync}
                            onValueChange={(v) => toggleSetting(device.id, 'auto_sync', v)}
                            trackColor={{ true: Colors.sageLeaf, false: Colors.border }}
                          />
                        </View>
                        {[
                          { key: 'sync_steps', label: '👟 Steps' },
                          { key: 'sync_heart_rate', label: '❤️ Heart Rate' },
                          { key: 'sync_sleep', label: '😴 Sleep' },
                          { key: 'sync_calories', label: '🔥 Calories' },
                          { key: 'sync_hrv', label: '💓 HRV' },
                        ].map((toggle) => (
                          <View key={toggle.key} style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>{toggle.label}</Text>
                            <Switch
                              value={(device as any)[toggle.key]}
                              onValueChange={(v) => toggleSetting(device.id, toggle.key, v)}
                              trackColor={{ true: Colors.sageLeaf, false: Colors.border }}
                            />
                          </View>
                        ))}
                      </View>

                      <TouchableOpacity
                        onPress={() => handleDisconnect(device)}
                        style={styles.disconnectBtn}
                      >
                        <Text style={styles.disconnectText}>Disconnect</Text>
                      </TouchableOpacity>
                    </GlassCard>
                  );
                })}
              </AnimatedEntry>
            )}

            {/* Available Brands */}
            <AnimatedEntry delay={200}>
              <SectionHeader
                title={connectedDevices.length > 0 ? 'Add More Devices' : 'Connect a Device'}
                emoji="📲"
              />
              {WEARABLE_BRANDS.filter((b) => !isConnected(b.id)).map((brand, index) => (
                <AnimatedEntry key={brand.id} delay={250 + index * 50}>
                  <GlassCard style={styles.brandCard}>
                    <View style={styles.brandLeft}>
                      <View style={[styles.brandIcon, { backgroundColor: brand.color + '30' }]}>
                        <Text style={styles.brandEmoji}>{brand.emoji}</Text>
                      </View>
                      <View style={styles.brandInfo}>
                        <Text style={styles.brandName}>{brand.name}</Text>
                        <Text style={styles.brandDesc}>{brand.description}</Text>
                        <View style={styles.dataTypesRow}>
                          {brand.dataTypes.slice(0, 4).map((dt) => (
                            <View key={dt} style={styles.dataTypeBadge}>
                              <Text style={styles.dataTypeText}>{dt}</Text>
                            </View>
                          ))}
                          {brand.dataTypes.length > 4 && (
                            <Text style={styles.moreTypes}>+{brand.dataTypes.length - 4}</Text>
                          )}
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleConnect(brand)}
                      style={[styles.connectBtn, { backgroundColor: brand.color }]}
                    >
                      <Text style={styles.connectText}>Connect</Text>
                    </TouchableOpacity>
                  </GlassCard>
                </AnimatedEntry>
              ))}
            </AnimatedEntry>

            {/* Info */}
            <AnimatedEntry delay={500}>
              <GlassCard style={styles.infoCard}>
                <Text style={styles.infoEmoji}>🔒</Text>
                <Text style={styles.infoTitle}>Your data is private</Text>
                <Text style={styles.infoText}>
                  Health data stays on your device and in your encrypted Supabase account.
                  You can disconnect any device and revoke access at any time.
                </Text>
              </GlassCard>
            </AnimatedEntry>

            <View style={{ height: Spacing.xxl }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bg: { ...StyleSheet.absoluteFillObject },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  backText: { fontSize: FontSizes.xxl, color: Colors.textPrimary },
  title: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  scroll: { paddingHorizontal: Spacing.lg },

  // Connected device card
  deviceCard: { marginBottom: Spacing.md },
  deviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  deviceInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  deviceEmoji: { fontSize: 32 },
  deviceName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  deviceSynced: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: 2 },
  syncBtn: { padding: Spacing.sm },
  syncText: { fontSize: 24 },

  // Toggles
  toggleSection: { borderTopWidth: 0.5, borderTopColor: Colors.border, paddingTop: Spacing.sm },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  toggleLabel: { fontSize: FontSizes.md, color: Colors.textSecondary },

  disconnectBtn: { marginTop: Spacing.md, alignItems: 'center' },
  disconnectText: { fontSize: FontSizes.md, color: Colors.rosePetal, fontWeight: '600' },

  // Brand card
  brandCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  brandLeft: { flexDirection: 'row', flex: 1, gap: Spacing.sm },
  brandIcon: {
    width: 48, height: 48, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  brandEmoji: { fontSize: 24 },
  brandInfo: { flex: 1 },
  brandName: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary },
  brandDesc: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: 2 },
  dataTypesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: Spacing.xs },
  dataTypeBadge: {
    backgroundColor: Colors.background, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  dataTypeText: { fontSize: 10, color: Colors.textSecondary, fontWeight: '600' },
  moreTypes: { fontSize: 10, color: Colors.textMuted, alignSelf: 'center' },

  connectBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill, marginLeft: Spacing.sm,
  },
  connectText: { fontSize: FontSizes.sm, fontWeight: '700', color: '#fff' },

  // Info
  infoCard: { alignItems: 'center', marginTop: Spacing.md },
  infoEmoji: { fontSize: 32, marginBottom: Spacing.sm },
  infoTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  infoText: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
