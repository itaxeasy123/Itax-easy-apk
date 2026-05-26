import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import AuthScaffold, { PrimaryButton } from '../components/AuthScaffold';
import AuthInput from '../components/AuthInput';
import OTPInput from '../components/OTPInput';
import { authService } from '../../../services/authService';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { validateEmail } from '../../../utils/validators/authValidator';

// ─── Password Strength ────────────────────────────────────────────────────────
type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

function getStrength(password: string): {
  level: StrengthLevel;
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { level: 'weak', score: 0, label: '', color: '#E5EAF3' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 'weak', score: 1, label: 'Weak', color: '#D64A4A' };
  if (score === 2) return { level: 'fair', score: 2, label: 'Fair', color: '#E8820C' };
  if (score === 3) return { level: 'good', score: 3, label: 'Good', color: '#3DA65C' };
  return { level: 'strong', score: 4, label: 'Strong', color: '#1E8A5F' };
}

function PasswordStrengthBar({ password }: { password: string }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <View style={strengthStyles.wrapper}>
      <View style={strengthStyles.bars}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              strengthStyles.bar,
              { backgroundColor: i <= score ? color : '#E5EAF3' },
            ]}
          />
        ))}
      </View>
      <Text style={[strengthStyles.label, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Step Indicator ──────────────────────────────────────────────────────────
const STEPS = ['Email', 'OTP', 'Password'];

function StepIndicator({ current }: { current: number }) {
  return (
    <View style={stepStyles.row}>
      {STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <View key={label} style={stepStyles.item}>
            <View
              style={[
                stepStyles.circle,
                done && stepStyles.circleDone,
                active && stepStyles.circleActive,
              ]}
            >
              {done ? (
                <Feather color="#FFFFFF" name="check" size={12} />
              ) : (
                <Text
                  style={[
                    stepStyles.circleNum,
                    active && stepStyles.circleNumActive,
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              style={[
                stepStyles.label,
                active && stepStyles.labelActive,
                done && stepStyles.labelDone,
              ]}
            >
              {label}
            </Text>
            {index < STEPS.length - 1 && (
              <View
                style={[stepStyles.line, done && stepStyles.lineDone]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ForgotPasswordScreen() {
  const router = useRouter();

  // Step: 0 = Email, 1 = OTP, 2 = New Password
  const [step, setStep] = useState(0);

  // Step 1 – Email
  const [email, setEmail] = useState('');

  // Step 2 – OTP
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(180);
  const otpInputRef = useRef<TextInput>(null);

  // Step 3 – Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Shared
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Slide animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  // OTP countdown
  useEffect(() => {
    if (step !== 1 || timer <= 0) return;
    const id = setTimeout(() => setTimer((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [step, timer]);

  // Animate card when step changes
  const animateIn = () => {
    slideAnim.setValue(30);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  };

  const goToStep = (next: number) => {
    setError('');
    setStep(next);
    animateIn();
  };

  // ── Step 1 Handler ──────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await authService.forgotPassword(email);
      setTimer(180);
      goToStep(1);
    } catch (err: any) {
      setError(
        getApiErrorMessage(err, 'Failed to send OTP.', {
          404: 'No account found with this email. Please sign up first.',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 Handler ──────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      // verifyOtp ki zarurat nahi hai, password submit karte time automatically verify ho jayega
      goToStep(2);
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Invalid OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setError('');
      await authService.resendOtp(email);
      setTimer(180);
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Failed to resend OTP.'));
    }
  };

  // ── Step 3 Handler ──────────────────────────────────────────────────────────
  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const { level } = getStrength(newPassword);
    if (level === 'weak') {
      setError('Password is too weak. Add uppercase, numbers or symbols.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await authService.updatePasswordWithOtp({ email, newPassword, otp });
      router.replace({ pathname: '/otp-success', params: { mode: 'reset' } });
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Failed to reset password.'));
    } finally {
      setLoading(false);
    }
  };

  // ── Titles ───────────────────────────────────────────────────────────────────
  const titles = [
    { title: 'Forgot Password?', subtitle: 'Enter your registered email address to receive a 6-digit OTP.' },
    { title: 'Verify OTP', subtitle: `We sent a 6-digit code to ${email || 'your email'}.` },
    { title: 'Set New Password', subtitle: 'Create a strong new password for your account.' },
  ];

  return (
    <AuthScaffold headerTitle="Reset Password" onBackPress={() => router.back()}>
      <StepIndicator current={step} />

      <Animated.View
        style={[
          styles.card,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.cardTitle}>{titles[step].title}</Text>
        <Text style={styles.cardSubtitle}>{titles[step].subtitle}</Text>

        {/* ── STEP 0: Email ── */}
        {step === 0 && (
          <View style={styles.form}>
            <AuthInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={(v) => { setEmail(v); setError(''); }}
              placeholder="Enter your registered email address"
              value={email}
            />
          </View>
        )}

        {/* ── STEP 1: OTP ── */}
        {step === 1 && (
          <View style={styles.form}>
            <Pressable
              onPress={() => otpInputRef.current?.focus()}
              style={styles.otpArea}
            >
              <OTPInput length={6} value={otp} />
              <TextInput
                autoFocus
                ref={otpInputRef}
                keyboardType="number-pad"
                maxLength={6}
                onChangeText={(v) => { setOtp(v.replace(/[^0-9]/g, '')); setError(''); }}
                style={styles.overlayInput}
                value={otp}
              />
            </Pressable>

            <Text style={styles.timerText}>
              {timer > 0 ? `Resend OTP in ${timer}s` : 'You can resend OTP now'}
            </Text>

            {timer <= 0 && (
              <Pressable onPress={handleResendOtp} style={styles.resendRow}>
                <Text style={styles.resendText}>Didn&apos;t receive OTP? </Text>
                <Text style={styles.resendLink}>Resend</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* ── STEP 2: New Password ── */}
        {step === 2 && (
          <View style={styles.form}>
            <AuthInput
              onChangeText={(v) => { setNewPassword(v); setError(''); }}
              placeholder="New Password"
              secureToggle
              value={newPassword}
            />
            <PasswordStrengthBar password={newPassword} />

            <AuthInput
              onChangeText={(v) => { setConfirmPassword(v); setError(''); }}
              placeholder="Confirm New Password"
              secureToggle
              value={confirmPassword}
            />

            {/* Match indicator */}
            {confirmPassword.length > 0 && (
              <View style={styles.matchRow}>
                <Feather
                  name={newPassword === confirmPassword ? 'check-circle' : 'x-circle'}
                  size={13}
                  color={newPassword === confirmPassword ? '#3DA65C' : '#D64A4A'}
                />
                <Text
                  style={[
                    styles.matchText,
                    { color: newPassword === confirmPassword ? '#3DA65C' : '#D64A4A' },
                  ]}
                >
                  {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </Text>
              </View>
            )}

            {/* Password hints */}
            <View style={styles.hintsBox}>
              {[
                { ok: newPassword.length >= 6, text: 'At least 6 characters' },
                { ok: /[A-Z]/.test(newPassword), text: 'One uppercase letter' },
                { ok: /[0-9]/.test(newPassword), text: 'One number' },
                { ok: /[^A-Za-z0-9]/.test(newPassword), text: 'One special character' },
              ].map(({ ok, text }) => (
                <View key={text} style={styles.hintRow}>
                  <Feather
                    name={ok ? 'check' : 'circle'}
                    size={11}
                    color={ok ? '#3DA65C' : '#B8C4D8'}
                  />
                  <Text style={[styles.hintText, ok && styles.hintTextOk]}>{text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <PrimaryButton
          label={
            step === 0
              ? 'Send OTP'
              : step === 1
                ? 'Verify OTP'
                : 'Reset Password'
          }
          loading={loading}
          onPress={
            step === 0
              ? handleSendOtp
              : step === 1
                ? handleVerifyOtp
                : handleResetPassword
          }
        />

        {/* Back link for step 1 */}
        {step > 0 && (
          <Pressable onPress={() => goToStep(step - 1)} style={styles.backLinkRow}>
            <Feather name="arrow-left" size={12} color="#347BE5" />
            <Text style={styles.backLinkText}>
              {step === 1 ? 'Change email' : 'Change OTP'}
            </Text>
          </Pressable>
        )}
      </Animated.View>
    </AuthScaffold>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 3,
    // @ts-ignore web shadow
    boxShadow: '0px 6px 18px rgba(154, 169, 199, 0.12)',
    marginHorizontal: 4,
    marginTop: 16,
    padding: 18,
  },
  cardTitle: {
    color: '#1F2940',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#8E9AAF',
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 4,
  },
  form: {
    gap: 10,
    marginTop: 16,
    marginBottom: 12,
  },
  // OTP
  otpArea: {
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 8,
    minHeight: 28,
    minWidth: 196,
    position: 'relative',
  },
  overlayInput: {
    ...StyleSheet.absoluteFillObject,
    color: 'transparent',
    // @ts-ignore web
    cursor: 'text',
    opacity: 0.02,
    position: 'absolute',
    textAlign: 'center',
  },
  timerText: {
    color: '#8E9AAF',
    fontSize: 10,
    textAlign: 'center',
  },
  resendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resendText: { color: '#8E9AAF', fontSize: 10 },
  resendLink: { color: '#347BE5', fontSize: 10, fontWeight: '600' },
  // Match
  matchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginTop: -4,
  },
  matchText: { fontSize: 10 },
  // Hints box
  hintsBox: {
    backgroundColor: '#F7F9FF',
    borderRadius: 8,
    gap: 6,
    padding: 10,
  },
  hintRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  hintText: {
    color: '#B8C4D8',
    fontSize: 10,
  },
  hintTextOk: {
    color: '#3DA65C',
  },
  // Error
  errorText: {
    color: '#D64A4A',
    fontSize: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  // Back link
  backLinkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    marginTop: 12,
  },
  backLinkText: {
    color: '#347BE5',
    fontSize: 10,
    fontWeight: '600',
  },
});

// ─── Step Indicator Styles ────────────────────────────────────────────────────
const stepStyles = StyleSheet.create({
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  circle: {
    alignItems: 'center',
    backgroundColor: '#E5EAF3',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
    zIndex: 1,
  },
  circleDone: {
    backgroundColor: '#3DA65C',
  },
  circleActive: {
    backgroundColor: '#347BE5',
  },
  circleNum: {
    color: '#8E9AAF',
    fontSize: 12,
    fontWeight: '700',
  },
  circleNumActive: {
    color: '#FFFFFF',
  },
  label: {
    color: '#8E9AAF',
    fontSize: 9,
    marginTop: 5,
    textAlign: 'center',
  },
  labelActive: {
    color: '#347BE5',
    fontWeight: '700',
  },
  labelDone: {
    color: '#3DA65C',
    fontWeight: '600',
  },
  line: {
    backgroundColor: '#E5EAF3',
    height: 2,
    position: 'absolute',
    top: 13,
    left: '50%',
    right: '-50%',
    zIndex: 0,
  },
  lineDone: {
    backgroundColor: '#3DA65C',
  },
});

// ─── Password Strength Styles ─────────────────────────────────────────────────
const strengthStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: -4,
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  bar: {
    borderRadius: 3,
    flex: 1,
    height: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    width: 42,
    textAlign: 'right',
  },
});
