/**
 * @file BarcodeScannerScreen.tsx
 * @module screens/BarcodeScannerScreen
 * @description Barcode scanner screen — uses the device camera to scan food
 * product barcodes and look up nutritional information for meal logging.
 */

import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// expo-camera removed – camera scanning disabled pending react-native-vision-camera migration
// Stub types to keep the component structure intact
type PermissionStatus = { granted: boolean; canAskAgain: boolean };
const useCameraPermissions = (): [PermissionStatus | null, () => Promise<void>] => [
  { granted: false, canAskAgain: true },
  async () => {},
];
const CameraView = ({ style, ...props }: any) => (
  <View style={[style, { backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' }]}>
    <Text style={{ color: '#ffffff', fontSize: 16, textAlign: 'center', padding: 20 }}>
      📷 Camera unavailable{"\n"}(Barcode scanning coming soon)
    </Text>
  </View>
);
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from '../utils/haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '../theme/colors';
import { AnimatedEntry, GlassCard, GradientButton } from '../components';

interface NutrientInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

interface ProductResult {
  barcode: string;
  name: string;
  brand: string;
  servingSize: string;
  nutrients: NutrientInfo;
  imageUrl?: string;
}

const STORAGE_KEY_PREFIX = 'zenfit:nutrition_log:';

function getTodayKey(): string {
  return STORAGE_KEY_PREFIX + new Date().toISOString().split('T')[0];
}

export default function BarcodeScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductResult | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [loggedToday, setLoggedToday] = useState<string[]>([]);
  const scanCooldown = useRef(false);

  async function fetchProduct(barcode: string): Promise<void> {
    setLoading(true);
    setProduct(null);
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const json = await res.json();
      if (json.status !== 1 || !json.product) {
        Alert.alert('Not Found', 'No product found for this barcode. Try another or enter details manually.');
        setScanned(false);
        return;
      }
      const p = json.product;
      const n = p.nutriments || {};
      setProduct({
        barcode,
        name: p.product_name || p.abbreviated_product_name || 'Unknown Product',
        brand: p.brands || '',
        servingSize: p.serving_size || '100g',
        nutrients: {
          calories: Math.round(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0),
          protein: Math.round((n.proteins_100g ?? 0) * 10) / 10,
          carbs: Math.round((n.carbohydrates_100g ?? 0) * 10) / 10,
          fat: Math.round((n.fat_100g ?? 0) * 10) / 10,
          fiber: n.fiber_100g ? Math.round(n.fiber_100g * 10) / 10 : undefined,
          sugar: n.sugars_100g ? Math.round(n.sugars_100g * 10) / 10 : undefined,
          sodium: n.sodium_100g ? Math.round(n.sodium_100g * 1000) / 10 : undefined,
        },
      });
    } catch {
      Alert.alert('Error', 'Failed to fetch product info. Check your connection.');
      setScanned(false);
    } finally {
      setLoading(false);
    }
  }

  function handleBarcodeScanned({ data }: { data: string }) {
    if (scanCooldown.current || scanned) return;
    scanCooldown.current = true;
    setTimeout(() => { scanCooldown.current = false; }, 2000);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScanned(true);
    fetchProduct(data);
  }

  async function handleAddToLog() {
    if (!product) return;
    try {
      const key = getTodayKey();
      const existing = await AsyncStorage.getItem(key);
      const log = existing ? JSON.parse(existing) : [];
      log.push({
        id: Date.now().toString(),
        name: product.name,
        brand: product.brand,
        barcode: product.barcode,
        calories: product.nutrients.calories,
        protein: product.nutrients.protein,
        carbs: product.nutrients.carbs,
        fat: product.nutrients.fat,
        addedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem(key, JSON.stringify(log));
      setLoggedToday(prev => [...prev, product.barcode]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Added!', `${product.name} added to today's nutrition log.`);
    } catch {
      Alert.alert('Error', 'Failed to save to log.');
    }
  }

  function handleScanAgain() {
    setScanned(false);
    setProduct(null);
  }

  function handleManualLookup() {
    const code = manualCode.trim();
    if (!code) return;
    Keyboard.dismiss();
    setShowManual(false);
    setScanned(true);
    fetchProduct(code);
  }

  // Permission not yet determined
  if (!permission) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={Colors.violet} size="large" />
      </SafeAreaView>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centered}>
        <View style={styles.permissionContent}>
          <Text style={styles.permissionEmoji}>📷</Text>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionSubtitle}>
            ZenFit needs camera access to scan food barcodes and track your nutrition automatically.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <LinearGradient colors={Gradients.aurora} style={styles.gradientBtn}>
              <Text style={styles.permissionButtonText}>Allow Camera Access</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.manualFallbackBtn}
            onPress={() => setShowManual(true)}
          >
            <Text style={styles.manualFallbackText}>Enter barcode manually instead</Text>
          </TouchableOpacity>
          {showManual && (
            <View style={styles.manualContainer}>
              <TextInput
                style={styles.manualInput}
                value={manualCode}
                onChangeText={setManualCode}
                placeholder="Enter barcode number"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="numeric"
                returnKeyType="search"
                onSubmitEditing={handleManualLookup}
              />
              <TouchableOpacity style={styles.manualLookupBtn} onPress={handleManualLookup}>
                <LinearGradient colors={Gradients.auroraSubtle} style={styles.gradientBtn}>
                  <Text style={styles.manualLookupText}>Look Up</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Camera or results view */}
      {!scanned && !loading ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: [
                'ean13', 'ean8', 'upc_a', 'upc_e',
                'code128', 'code39', 'qr',
              ],
            }}
          />
          {/* Overlay */}
          <View style={styles.overlay}>
            <View style={styles.overlayTop} />
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              {/* Viewfinder */}
              <View style={styles.viewfinder}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
                <View style={styles.scanLine} />
              </View>
              <View style={styles.overlaySide} />
            </View>
            <View style={styles.overlayBottom}>
              <Text style={styles.scanHint}>Align barcode within the frame</Text>
              <TouchableOpacity
                style={styles.manualBtn}
                onPress={() => setShowManual(v => !v)}
              >
                <Text style={styles.manualBtnText}>⌨️  Enter Manually</Text>
              </TouchableOpacity>
              {showManual && (
                <AnimatedEntry delay={0} duration={300}>
                  <View style={styles.manualContainer}>
                    <TextInput
                      style={styles.manualInput}
                      value={manualCode}
                      onChangeText={setManualCode}
                      placeholder="Enter barcode number"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      keyboardType="numeric"
                      returnKeyType="search"
                      onSubmitEditing={handleManualLookup}
                      autoFocus
                    />
                    <TouchableOpacity style={styles.manualLookupBtn} onPress={handleManualLookup}>
                      <LinearGradient colors={Gradients.aurora} style={styles.gradientBtn}>
                        <Text style={styles.manualLookupText}>Look Up →</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </AnimatedEntry>
              )}
            </View>
          </View>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.resultsScroll}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <AnimatedEntry delay={0} duration={400}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={Colors.violet} size="large" />
                <Text style={styles.loadingText}>Looking up product…</Text>
              </View>
            </AnimatedEntry>
          ) : product ? (
            <AnimatedEntry delay={0} duration={500}>
              {/* Product Header */}
              <LinearGradient
                colors={Gradients.aurora as unknown as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.productHeader}
              >
                <Text style={styles.productEmoji}>🍎</Text>
                <View style={styles.productHeaderText}>
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                  {product.brand ? (
                    <Text style={styles.productBrand}>{product.brand}</Text>
                  ) : null}
                  <Text style={styles.productServing}>per {product.servingSize}</Text>
                </View>
              </LinearGradient>

              {/* Calories Banner */}
              <GlassCard style={styles.caloriesBanner}>
                <Text style={styles.caloriesValue}>{product.nutrients.calories}</Text>
                <Text style={styles.caloriesLabel}>kcal per 100g</Text>
              </GlassCard>

              {/* Macros Grid */}
              <View style={styles.macrosGrid}>
                <MacroCard label="Protein" value={product.nutrients.protein} unit="g" color={Colors.rosePetal} icon="🥩" />
                <MacroCard label="Carbs" value={product.nutrients.carbs} unit="g" color={Colors.sacredGold} icon="🍞" />
                <MacroCard label="Fat" value={product.nutrients.fat} unit="g" color={Colors.cosmicBlue} icon="🥑" />
              </View>

              {/* Extra nutrients */}
              {(product.nutrients.fiber !== undefined ||
                product.nutrients.sugar !== undefined ||
                product.nutrients.sodium !== undefined) && (
                <GlassCard style={styles.extrasCard}>
                  <Text style={styles.extrasTitle}>Additional Info</Text>
                  <View style={styles.extrasList}>
                    {product.nutrients.fiber !== undefined && (
                      <ExtraRow label="Fiber" value={`${product.nutrients.fiber}g`} />
                    )}
                    {product.nutrients.sugar !== undefined && (
                      <ExtraRow label="Sugars" value={`${product.nutrients.sugar}g`} />
                    )}
                    {product.nutrients.sodium !== undefined && (
                      <ExtraRow label="Sodium" value={`${product.nutrients.sodium}mg`} />
                    )}
                  </View>
                </GlassCard>
              )}

              {/* Barcode */}
              <GlassCard style={styles.barcodeCard}>
                <Text style={styles.barcodeLabel}>Barcode</Text>
                <Text style={styles.barcodeValue}>{product.barcode}</Text>
              </GlassCard>

              {/* Actions */}
              <View style={styles.actions}>
                {loggedToday.includes(product.barcode) ? (
                  <View style={styles.alreadyLogged}>
                    <Text style={styles.alreadyLoggedText}>✅ Added to today's log</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.addButton} onPress={handleAddToLog} activeOpacity={0.85}>
                    <LinearGradient
                      colors={Gradients.aurora as unknown as [string, string, ...string[]]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientBtn}
                    >
                      <Text style={styles.addButtonText}>Add to Nutrition Log</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.scanAgainButton} onPress={handleScanAgain}>
                  <Text style={styles.scanAgainText}>📷  Scan Another</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 40 }} />
            </AnimatedEntry>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function MacroCard({ label, value, unit, color, icon }: {
  label: string; value: number; unit: string; color: string; icon: string;
}) {
  return (
    <View style={styles.macroCard}>
      <LinearGradient
        colors={[Colors.glassBackgroundLight, Colors.glassBackground]}
        style={styles.macroCardGradient}
      >
        <Text style={styles.macroIcon}>{icon}</Text>
        <Text style={[styles.macroValue, { color }]}>{value}<Text style={styles.macroUnit}>{unit}</Text></Text>
        <Text style={styles.macroLabel}>{label}</Text>
      </LinearGradient>
    </View>
  );
}

function ExtraRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.extraRow}>
      <Text style={styles.extraLabel}>{label}</Text>
      <Text style={styles.extraValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },

  // Camera
  cameraContainer: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'column' },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  overlayMiddle: { flexDirection: 'row', height: 260 },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },

  viewfinder: {
    width: 260,
    height: 260,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: Colors.violet,
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: Colors.violet,
    opacity: 0.7,
  },

  scanHint: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  manualBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  manualBtnText: { color: '#fff', fontSize: FontSizes.sm, fontWeight: '600' },

  // Manual entry
  manualContainer: {
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  manualInput: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: '#fff',
    fontSize: FontSizes.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  manualLookupBtn: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  manualLookupText: { textAlign: 'center', color: '#fff', fontWeight: '700', fontSize: FontSizes.md, paddingVertical: Spacing.sm },

  // Permission
  permissionContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  permissionEmoji: { fontSize: 64, marginBottom: Spacing.lg },
  permissionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  permissionSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  permissionButton: { width: '100%', borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: Spacing.md },
  permissionButtonText: { textAlign: 'center', color: '#fff', fontWeight: '700', fontSize: FontSizes.md, paddingVertical: Spacing.md },
  manualFallbackBtn: { marginTop: Spacing.sm },
  manualFallbackText: { color: Colors.violet, fontSize: FontSizes.sm },

  gradientBtn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
  },

  // Results
  resultsScroll: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    gap: Spacing.md,
  },
  loadingText: { color: Colors.textSecondary, fontSize: FontSizes.md },

  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    ...Shadows.card,
  },
  productEmoji: { fontSize: 48 },
  productHeaderText: { flex: 1 },
  productName: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  productBrand: { fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
  productServing: { fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.6)' },

  caloriesBanner: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
  },
  caloriesValue: {
    fontSize: 52,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  caloriesLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },

  macrosGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  macroCard: { flex: 1, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  macroCardGradient: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  macroIcon: { fontSize: 24, marginBottom: 4 },
  macroValue: { fontSize: FontSizes.lg, fontWeight: '700' },
  macroUnit: { fontSize: FontSizes.xs, fontWeight: '400' },
  macroLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },

  extrasCard: { marginBottom: Spacing.md, padding: Spacing.md },
  extrasTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm },
  extrasList: { gap: 6 },
  extraRow: { flexDirection: 'row', justifyContent: 'space-between' },
  extraLabel: { color: Colors.textSecondary, fontSize: FontSizes.sm },
  extraValue: { color: Colors.textPrimary, fontSize: FontSizes.sm, fontWeight: '600' },

  barcodeCard: { marginBottom: Spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  barcodeLabel: { color: Colors.textSecondary, fontSize: FontSizes.sm },
  barcodeValue: { color: Colors.textPrimary, fontSize: FontSizes.sm, fontWeight: '600', fontVariant: ['tabular-nums'] },

  actions: { gap: Spacing.sm },
  addButton: { borderRadius: BorderRadius.xl, overflow: 'hidden' },
  addButtonText: { textAlign: 'center', color: '#fff', fontWeight: '700', fontSize: FontSizes.md, paddingVertical: Spacing.md },
  alreadyLogged: {
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    alignItems: 'center',
  },
  alreadyLoggedText: { color: '#10B981', fontWeight: '700', fontSize: FontSizes.md },
  scanAgainButton: {
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.glassBackground,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  scanAgainText: { color: Colors.textPrimary, fontWeight: '600', fontSize: FontSizes.md },
});
