import React, { useState, useEffect, useRef } from 'react';
import { AuthResponse } from '@/types';
import client from '@/packages/app/api/client';
import {
  ShieldCheck,
  Lock,
  User as UserIcon,
  Loader2,
  Fingerprint,
  AlertTriangle,
} from 'lucide-react';
import {
  Platform,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  useWindowDimensions,
  Animated,
  StyleSheet,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DESIGN TOKENS: NEBULA THEME
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NEBULA = {
  primary: '#4F46E5',
  primaryEnd: '#7C3AED',
  accent: '#2DD4BF',
  bgDeep: '#020617',
  bgCard: 'rgba(30, 41, 59, 0.95)',
  borderGlass: 'rgba(255, 255, 255, 0.15)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  errorBg: 'rgba(239, 68, 68, 0.15)',
  errorBorder: 'rgba(239, 68, 68, 0.3)',
  errorText: '#FCA5A5',
  orbPrimary: 'rgba(79, 70, 229, 0.25)',
  orbViolet: 'rgba(124, 58, 237, 0.2)',
};

const isWeb = Platform.OS === 'web';
const isIOS = Platform.OS === 'ios';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT: NEBULA INPUT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface NebulaInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  icon: React.ReactNode;
  accessibilityLabel: string;
}

const NebulaInput: React.FC<NebulaInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  icon,
  accessibilityLabel,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
        <View style={styles.inputIcon}>{icon}</View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={NEBULA.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={accessibilityLabel}
        />
      </View>
    </View>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT: NEBULA BUTTON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface NebulaButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
}

const NebulaButton: React.FC<NebulaButtonProps> = ({ onPress, isLoading = false, children }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.8}
      accessibilityRole="button"
      style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
    >
      {isLoading ? (
        <Loader2 size={20} color="#fff" className="animate-spin" />
      ) : (
        <Text style={styles.primaryButtonText}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT: BRANDING PANEL (Web Desktop)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const BrandingPanel: React.FC = () => {
  if (!isWeb) return null;

  return (
    <View style={styles.brandingPanel}>
      {/* Background Orbs */}
      <View style={styles.orbContainer}>
        <View style={[styles.orb, styles.orbPrimary]} />
        <View style={[styles.orb, styles.orbViolet]} />
      </View>

      {/* Content */}
      <View style={styles.brandingContent}>
        <View style={styles.brandingIcon}>
          <ShieldCheck size={48} color={NEBULA.accent} />
        </View>
        <Text style={styles.brandingTitle}>
          PROJECT <Text style={{ color: NEBULA.accent }}>SOVEREIGN</Text>
        </Text>
        <Text style={styles.brandingTagline}>
          Enterprise-grade institutional management.{'\n'}
          Secure. Reliable. Offline-first.
        </Text>
        <View style={styles.trustBadgeContainer}>
          <View style={styles.trustBadge}>
            <Text style={styles.trustBadgeText}>256-bit Encryption</Text>
          </View>
          <View style={styles.trustBadge}>
            <Text style={styles.trustBadgeText}>SOC 2 Compliant</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT: LOGIN SCREEN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface Props {
  onLoginSuccess: (data: AuthResponse) => void;
}

export default function LoginScreen({ onLoginSuccess }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [savedSession, setSavedSession] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width >= 1024;

  // Animation (fade-in-up)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(translateAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
  }, []);

  // Biometrics (Mobile only)
  useEffect(() => {
    if (!isWeb) {
      (async () => {
        try {
          const compatible = await LocalAuthentication.hasHardwareAsync();
          const enrolled = await LocalAuthentication.isEnrolledAsync();
          setIsBiometricAvailable(compatible && enrolled);
          const session = await SecureStore.getItemAsync('sovereign_user_session');
          if (session) setSavedSession(session);
        } catch (e) {
          console.log('Biometric check failed:', e);
        }
      })();
    }
  }, []);

  const handleBiometricLogin = async () => {
    if (!savedSession) return;
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Sovereign ERP',
        fallbackLabel: 'Use Passcode',
      });
      if (result.success) {
        setLoading(true);
        const sessionData = JSON.parse(savedSession);
        onLoginSuccess(sessionData);
        setLoading(false);
      }
    } catch (e) {
      console.log('Biometric auth failed:', e);
    }
  };

  const performLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await client.post('/auth/login', {
        email: username,
        password: password,
      });

      const { token, user, school } = response.data;
      const authData = { user, school, token };

      if (isWeb) {
        localStorage.setItem('sovereign_token', token);
        localStorage.setItem('sovereign_user_session', JSON.stringify(authData));
      } else {
        await SecureStore.setItemAsync('sovereign_token', token);
        await SecureStore.setItemAsync('sovereign_user_session', JSON.stringify(authData));
      }

      onLoginSuccess(authData);
    } catch (err: any) {
      console.error('Login Error:', err);
      setError(err.response?.data?.error || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'} style={styles.keyboardAvoid}>
        <View style={styles.container}>
          {/* Left: Branding (Desktop Web only) */}
          {isDesktop && <BrandingPanel />}

          {/* Right: Login Form */}
          <View style={[styles.formPanel, isDesktop && styles.formPanelDesktop]}>
            {/* Mobile Background Orbs */}
            {!isDesktop && (
              <View style={styles.mobileOrbContainer}>
                <View style={[styles.mobileOrb, styles.mobileOrbPrimary]} />
                <View style={[styles.mobileOrb, styles.mobileOrbViolet]} />
              </View>
            )}

            {/* Glass Card */}
            <Animated.View
              style={[
                styles.glassCard,
                { opacity: fadeAnim, transform: [{ translateY: translateAnim }] },
              ]}
            >
              {/* Header */}
              <View style={styles.cardHeader}>
                {!isDesktop && (
                  <View style={styles.mobileShieldIcon}>
                    <ShieldCheck size={28} color={NEBULA.accent} />
                  </View>
                )}
                <Text style={styles.cardTitle}>SECURE ACCESS</Text>
                <Text style={styles.cardSubtitle}>Authorized users only</Text>
              </View>

              {/* Inputs */}
              <NebulaInput
                label="USER IDENTIFIER"
                placeholder="e.g. principal.demo"
                value={username}
                onChangeText={setUsername}
                icon={<UserIcon size={18} color={NEBULA.textSecondary} />}
                accessibilityLabel="User ID input"
              />

              <NebulaInput
                label="PASSWORD"
                placeholder="Enter secure password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                icon={<Lock size={18} color={NEBULA.textSecondary} />}
                accessibilityLabel="Password input"
              />

              {/* Error */}
              {error ? (
                <View style={styles.errorContainer}>
                  <AlertTriangle size={16} color={NEBULA.errorText} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* CTA */}
              <View style={styles.ctaContainer}>
                <NebulaButton onPress={performLogin} isLoading={loading}>
                  AUTHENTICATE
                </NebulaButton>
              </View>

              {/* Biometric (Mobile) */}
              {isBiometricAvailable && savedSession && (
                <View style={styles.biometricSection}>
                  <TouchableOpacity
                    onPress={handleBiometricLogin}
                    activeOpacity={0.7}
                    style={styles.biometricButton}
                  >
                    <Fingerprint size={22} color={NEBULA.accent} />
                    <Text style={styles.biometricText}>Biometric Authentication</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Protected by enterprise-grade security</Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: NEBULA.bgDeep,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
  },

  // Branding Panel
  brandingPanel: {
    width: '50%',
    backgroundColor: NEBULA.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  orbContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  orbPrimary: {
    width: 400,
    height: 400,
    top: '5%',
    left: '10%',
    backgroundColor: NEBULA.orbPrimary,
  },
  orbViolet: {
    width: 320,
    height: 320,
    bottom: '15%',
    right: '5%',
    backgroundColor: NEBULA.orbViolet,
  },
  brandingContent: {
    alignItems: 'center',
    paddingHorizontal: 48,
    maxWidth: 520,
    zIndex: 20,
  },
  brandingIcon: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: NEBULA.borderGlass,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  brandingTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: NEBULA.textPrimary,
    letterSpacing: 1,
    marginBottom: 16,
    textAlign: 'center',
  },
  brandingTagline: {
    fontSize: 17,
    color: NEBULA.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  trustBadgeContainer: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 12,
  },
  trustBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: NEBULA.borderGlass,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  trustBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: NEBULA.textMuted,
  },

  // Form Panel
  formPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: NEBULA.bgDeep,
    position: 'relative',
  },
  formPanelDesktop: {
    width: '50%',
    flex: 0,
  },

  // Mobile Orbs
  mobileOrbContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  mobileOrb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  mobileOrbPrimary: {
    width: 280,
    height: 280,
    top: -50,
    right: -80,
    backgroundColor: NEBULA.orbPrimary,
  },
  mobileOrbViolet: {
    width: 260,
    height: 260,
    bottom: '8%',
    left: -60,
    backgroundColor: NEBULA.orbViolet,
  },

  // Glass Card
  glassCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: NEBULA.borderGlass,
    backgroundColor: NEBULA.bgCard,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },

  // Card Header
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mobileShieldIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: NEBULA.borderGlass,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: NEBULA.textPrimary,
    letterSpacing: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: NEBULA.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },

  // Inputs
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: NEBULA.textSecondary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    minHeight: 52,
  },
  inputWrapperFocused: {
    borderColor: NEBULA.primary,
  },
  inputIcon: {
    marginRight: 12,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: NEBULA.textPrimary,
    paddingVertical: 12,
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: NEBULA.errorBg,
    borderWidth: 1,
    borderColor: NEBULA.errorBorder,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: NEBULA.errorText,
  },

  // Button
  ctaContainer: {
    marginTop: 8,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: NEBULA.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
  },

  // Biometric
  biometricSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: NEBULA.borderGlass,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.2)',
    minHeight: 48,
    gap: 10,
  },
  biometricText: {
    fontSize: 14,
    fontWeight: '600',
    color: NEBULA.accent,
  },

  // Footer
  footer: {
    marginTop: 32,
  },
  footerText: {
    fontSize: 12,
    color: NEBULA.textMuted,
    textAlign: 'center',
  },
});