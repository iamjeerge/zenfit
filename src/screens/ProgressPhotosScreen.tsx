/**
 * @file ProgressPhotosScreen.tsx
 * @module screens/ProgressPhotosScreen
 * @description Progress photos screen — a before/after photo timeline
 * to visually track body composition changes.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
// expo-image-picker removed – image picking disabled pending react-native-image-picker migration
const ImagePicker = {
  requestMediaLibraryPermissionsAsync: async () => ({ status: 'denied' as const }),
  requestCameraPermissionsAsync: async () => ({ status: 'denied' as const }),
  launchImageLibraryAsync: async (_: any) => ({
    canceled: true as boolean,
    assets: [] as Array<{ uri: string }>,
  }),
  launchCameraAsync: async (_: any) => ({
    canceled: true as boolean,
    assets: [] as Array<{ uri: string }>,
  }),
  MediaTypeOptions: { Images: 'Images' as const },
};
import * as Haptics from '../utils/haptics';
import { Colors, Gradients, Spacing, BorderRadius, FontSizes, Shadows } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import AnimatedEntry from '../components/AnimatedEntry';
import SectionHeader from '../components/SectionHeader';

const { width } = Dimensions.get('window');
const THUMB_SIZE = (width - Spacing.lg * 2 - Spacing.sm * 2) / 3;

type PhotoCategory = 'front' | 'side' | 'back' | 'other';

interface ProgressPhoto {
  id: string;
  photo_url: string;
  category: PhotoCategory;
  weight_kg: number | null;
  taken_at: string;
}

const CATEGORIES: { value: PhotoCategory; label: string; emoji: string }[] = [
  { value: 'front', label: 'Front', emoji: '⬆️' },
  { value: 'side', label: 'Side', emoji: '➡️' },
  { value: 'back', label: 'Back', emoji: '⬇️' },
  { value: 'other', label: 'Other', emoji: '📸' },
];

export default function ProgressPhotosScreen() {
  const user = useAuthStore((s) => s.user);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [pendingUri, setPendingUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchPhotos();
  }, [user]);

  const fetchPhotos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user!.id)
        .order('taken_at', { ascending: false });

      if (err) throw err;
      setPhotos((data || []) as ProgressPhoto[]);
    } catch {
      setError('Failed to load photos.');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if ((perm.status as string) !== 'granted') {
      Alert.alert('Permission Required', 'Allow photo access to upload progress photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.6,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPendingUri(uri);
      setCategoryPickerVisible(true);
    }
  };

  const takePhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if ((perm.status as string) !== 'granted') {
      Alert.alert('Permission Required', 'Allow camera access to take progress photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.6,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPendingUri(uri);
      setCategoryPickerVisible(true);
    }
  };

  const uploadPhoto = async (category: PhotoCategory) => {
    if (!pendingUri || !user) return;
    setCategoryPickerVisible(false);
    setIsUploading(true);
    try {
      // Fetch the image data
      const response = await fetch(pendingUri);
      const blob = await response.blob();
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `${user.id}/${dateStr}-${category}-${Date.now()}.jpg`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false });

      if (uploadError) throw uploadError;

      // Get a signed URL (1 hour)
      const { data: urlData } = await supabase.storage
        .from('progress-photos')
        .createSignedUrl(fileName, 3600);

      const photoUrl = urlData?.signedUrl ?? '';

      // Save metadata to DB
      const { error: insertError } = await supabase.from('progress_photos').insert({
        user_id: user.id,
        photo_url: photoUrl,
        category,
        taken_at: dateStr,
      });

      if (insertError) throw insertError;
      setPendingUri(null);
      await fetchPhotos();
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Group photos by month
  const grouped = photos.reduce<Record<string, ProgressPhoto[]>>((acc, p) => {
    const month = new Date(p.taken_at).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    if (!acc[month]) acc[month] = [];
    acc[month].push(p);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.cosmic as unknown as [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Progress Photos</Text>
        <Text style={styles.subtitle}>Document your transformation</Text>
      </View>

      {/* Upload Buttons */}
      <AnimatedEntry delay={0}>
        <View style={styles.uploadRow}>
          <TouchableOpacity style={styles.uploadBtn} onPress={takePhoto} disabled={isUploading}>
            <LinearGradient
              colors={Gradients.auroraSubtle as unknown as [string, string]}
              style={styles.uploadGradient}
            >
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={styles.uploadText}>Take Photo</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickImage} disabled={isUploading}>
            <LinearGradient
              colors={Gradients.ocean as unknown as [string, string]}
              style={styles.uploadGradient}
            >
              <Text style={styles.uploadIcon}>🖼️</Text>
              <Text style={styles.uploadText}>From Gallery</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </AnimatedEntry>

      {isUploading && (
        <View style={styles.uploadingBanner}>
          <ActivityIndicator color={Colors.lavender} size="small" />
          <Text style={styles.uploadingText}>Uploading photo…</Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {error ? (
          <TouchableOpacity onPress={fetchPhotos}>
            <Text style={styles.errorText}>{error} Tap to retry.</Text>
          </TouchableOpacity>
        ) : isLoading ? (
          <ActivityIndicator color={Colors.violet} style={{ marginVertical: Spacing.xl }} />
        ) : photos.length === 0 ? (
          <Text style={styles.emptyText}>No progress photos yet. Take your first one!</Text>
        ) : (
          Object.entries(grouped).map(([month, monthPhotos]) => (
            <AnimatedEntry key={month} delay={0}>
              <SectionHeader title={month} emoji="📅" />
              <View style={styles.grid}>
                {monthPhotos.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.thumb}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedPhoto(p);
                    }}
                  >
                    <Image source={{ uri: p.photo_url }} style={styles.thumbImage} />
                    <View style={styles.thumbBadge}>
                      <Text style={styles.thumbBadgeText}>
                        {CATEGORIES.find((c) => c.value === p.category)?.emoji ?? '📸'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </AnimatedEntry>
          ))
        )}
      </ScrollView>

      {/* Category Picker Modal */}
      <Modal
        visible={categoryPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#1A1730', '#2D2554']}
            style={[styles.modalContent, { borderColor: Colors.glassBorder }]}
          >
            <Text style={styles.modalTitle}>Select Category</Text>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={styles.categoryRow}
                onPress={() => uploadPhoto(cat.value)}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setCategoryPickerVisible(false);
                setPendingUri(null);
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

      {/* Full-Screen Viewer Modal */}
      {selectedPhoto && (
        <Modal visible animationType="fade" onRequestClose={() => setSelectedPhoto(null)}>
          <View style={styles.viewerOverlay}>
            <TouchableOpacity style={styles.viewerClose} onPress={() => setSelectedPhoto(null)}>
              <Text style={styles.viewerCloseText}>✕</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: selectedPhoto.photo_url }}
              style={styles.viewerImage}
              resizeMode="contain"
            />
            <Text style={styles.viewerMeta}>
              {CATEGORIES.find((c) => c.value === selectedPhoto.category)?.label} ·{' '}
              {selectedPhoto.taken_at}
            </Text>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, marginBottom: Spacing.md },
  title: { fontSize: FontSizes.xxxl, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  uploadRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  uploadBtn: { flex: 1, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  uploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  uploadIcon: { fontSize: 20 },
  uploadText: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary },
  uploadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  uploadingText: { fontSize: FontSizes.sm, color: Colors.lavender },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 120 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbImage: { width: '100%', height: '100%' },
  thumbBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 4,
  },
  thumbBadgeText: { fontSize: 12 },
  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.error,
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: Spacing.xl,
  },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  categoryEmoji: { fontSize: 24 },
  categoryLabel: { fontSize: FontSizes.md, color: Colors.textPrimary, fontWeight: '500' },
  cancelBtn: { marginTop: Spacing.lg, alignItems: 'center' },
  cancelText: { fontSize: FontSizes.md, color: Colors.textSecondary },
  viewerOverlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerClose: {
    position: 'absolute',
    top: 60,
    right: Spacing.lg,
    zIndex: 10,
    padding: Spacing.md,
  },
  viewerCloseText: { fontSize: 24, color: Colors.textPrimary, fontWeight: '300' },
  viewerImage: { width: '100%', height: '80%' },
  viewerMeta: { color: Colors.textSecondary, fontSize: FontSizes.sm, marginTop: Spacing.md },
});
