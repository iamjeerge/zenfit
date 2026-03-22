import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { Colors, Gradients, Spacing, BorderRadius } from '../src/theme/colors';

type AuthMode = 'signin' | 'signup';

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signInWithEmail, signUpWithEmail, session } = useAuthStore();

  // Navigate to main app when authenticated
  useState(() => {
    if (session) {
      router.replace('/(tabs)');
    }
  }, [session, router]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Sign in failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setError('');

    if (!email.trim() || !password.trim() || !fullName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email, password, fullName);
      router.replace('/(tabs)');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Sign up failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isSignIn = mode === 'signin';

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={Gradients.cosmic}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Aurora gradient overlay */}
        <LinearGradient
          colors={[
            'rgba(124, 58, 237, 0.2)',
            'rgba(244, 114, 182, 0.1)',
            'rgba(196, 181, 253, 0.1)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Content container */}
        <View style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.appTitle}>ZenFit</Text>
            <Text style={styles.headerSubtitle}>
              {isSignIn ? 'Welcome Back' : 'Begin Your Journey'}
            </Text>
          </View>

          {/* Mode toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                isSignIn && styles.toggleButtonActive,
              ]}
              onPress={() => {
                setMode('signin');
                setError('');
              }}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  isSignIn && styles.toggleButtonTextActive,
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                !isSignIn && styles.toggleButtonActive,
              ]}
              onPress={() => {
                setMode('signup');
                setError('');
              }}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  !isSignIn && styles.toggleButtonTextActive,
                ]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form container */}
          <View style={styles.formContainer}>
            {/* Full Name field (Sign Up only) */}
            {!isSignIn && (
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={Colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!loading}
                  maxLength={100}
                />
              </View>
            )}

            {/* Email field */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
                maxLength={100}
              />
            </View>

            {/* Password field */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                editable={!loading}
                maxLength={100}
              />
            </View>

            {/* Error message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* CTA Button */}
            <TouchableOpacity
              style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
              onPress={isSignIn ? handleSignIn : handleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={Gradients.aurora}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.moonlight}
                  />
                ) : (
                  <Text style={styles.ctaButtonText}>
                    Start Your Journey
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer text */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              {isSignIn
                ? "Don't have an account? "
                : 'Already have an account? '}
              <Text
                style={styles.footerLink}
                onPress={() => {
                  setMode(isSignIn ? 'signup' : 'signin');
                  setError('');
                }}
              >
                {isSignIn ? 'Sign Up' : 'Sign In'}
              </Text>
            </Text>
          </View>

          {/* Wellness message */}
          <View style={styles.wellnessContainer}>
            <Text style={styles.wellnessText}>
              Unlock personalized yoga, meditation, and nutrition plans.
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  appTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.moonlight,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.glassBackground,
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  toggleButtonActive: {
    backgroundColor: Colors.glassBackgroundLight,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  toggleButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  toggleButtonTextActive: {
    color: Colors.lavender,
  },
  formContainer: {
    gap: Spacing.md,
  },
  inputWrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassBackground,
  },
  input: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '400',
  },
  errorContainer: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '500',
  },
  ctaButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.lg,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaButtonGradient: {
    paddingVertical: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
  },
  ctaButtonText: {
    color: Colors.moonlight,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footerContainer: {
    alignItems: 'center',
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  footerLink: {
    color: Colors.lavender,
    fontWeight: '600',
  },
  wellnessContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.glassBackground,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  wellnessText: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
