import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import AuthScaffold, { PrimaryButton } from '../components/AuthScaffold';
import OTPInput from '../components/OTPInput';
import { confirmOtp, sendOtp } from '../services/firebasePhone';
import { apkAuthService } from '../../../services/apkAuthService';
import { useAuthStore } from '../../../store/authStore';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { notify } from '../../../utils/notify';

// Seconds the user must wait between OTP sends before "Resend" re-enables.
const RESEND_COOLDOWN = 60;

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string; // 'signup' | 'login'
    phone?: string; // E.164, used for Firebase resend
    phoneDisplay?: string; // last 10 digits, shown to the user
    fullName?: string;
    email?: string;
  }>();
  const setSession = useAuthStore((state) => state.setSession);
  const inputRef = useRef<TextInput>(null);
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const id = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 1) Confirm the SMS code with Firebase (on-device) → Firebase ID token
      const idToken = await confirmOtp(otp);

      // 2) Exchange it at our backend (registers on first contact, else logs in)
      const result = await apkAuthService.firebaseAuth({
        idToken,
        fullName: params.mode === 'signup' ? params.fullName : undefined,
        email: params.mode === 'signup' ? params.email || undefined : undefined,
      });

      // 3) Persist session and enter the app
      await setSession(result.user as any, result.accessToken, result.refreshToken);
      router.replace('/dashboard');
    } catch (verifyError: any) {
      const code = verifyError?.code as string | undefined;
      if (code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please check the code and try again.');
      } else if (code === 'auth/code-expired' || code === 'auth/session-expired') {
        setError('This OTP has expired. Please resend a new one.');
      } else if (verifyError?.response) {
        setError(
          getApiErrorMessage(verifyError, 'Verification failed. Please try again.', {
            400: 'Could not verify. Please request a new OTP.',
            401: 'Verification token rejected. Please request a new OTP.',
            409: 'This account already exists. Please try logging in.',
            500: 'Something went wrong. Please try again later.',
          })
        );
      } else {
        setError(verifyError?.message || 'OTP verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) {
      return;
    }

    try {
      setResending(true);
      setError('');
      if (!params.phone) {
        setError('Missing phone number. Please go back and try again.');
        return;
      }
      await sendOtp(params.phone);
      setOtp('');
      setCooldown(RESEND_COOLDOWN);
      notify('OTP sent successfully');
    } catch (resendError: any) {
      const code = resendError?.code as string | undefined;
      if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a while and try again.');
      } else {
        setError(resendError?.message || 'Failed to resend OTP. Please try again.');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthScaffold
      headerTitle="Verification OTP"
      onBackPress={() => router.back()}
    >
      <View style={styles.centerCard}>
        <Text style={styles.cardTitle}>Enter OTP</Text>
        <Text style={styles.cardSubtitle}>
          Enter the 6-digit code we sent via SMS to your mobile number.
        </Text>
        {params.phoneDisplay ? (
          <Text style={styles.emailText}>+91 {params.phoneDisplay}</Text>
        ) : null}

        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={styles.otpArea}
        >
          <OTPInput length={6} value={otp} />
          <TextInput
            autoFocus
            ref={inputRef}
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={(value) => setOtp(value.replace(/[^0-9]/g, ''))}
            style={styles.overlayInput}
            value={otp}
          />
        </Pressable>

        <Text style={styles.timerText}>
          {cooldown > 0
            ? `You can resend OTP in ${cooldown} sec`
            : 'You can resend OTP now'}
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <PrimaryButton
          label="Verify OTP"
          loading={loading}
          onPress={handleVerify}
        />

        <Pressable
          disabled={cooldown > 0 || resending}
          onPress={handleResend}
          style={styles.resendRow}
        >
          <Text style={styles.resendText}>Did not get OTP code? </Text>
          <Text
            style={[
              styles.resendLink,
              (cooldown > 0 || resending) && styles.resendLinkDisabled,
            ]}
          >
            {resending
              ? 'Sending...'
              : cooldown > 0
                ? `Resend OTP (${cooldown}s)`
                : 'Resend OTP'}
          </Text>
        </Pressable>
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  centerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 3,
    boxShadow: '0px 6px 18px rgba(154, 169, 199, 0.12)',
    marginHorizontal: 8,
    marginTop: 80,
    padding: 18,
  },
  cardTitle: {
    color: '#1F2940',
    fontSize: 14,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: '#8E9AAF',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 4,
  },
  emailText: {
    color: '#347BE5',
    fontSize: 10,
    marginTop: 4,
  },
  otpArea: {
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 16,
    minHeight: 28,
    minWidth: 186,
    position: 'relative',
  },
  overlayInput: {
    ...StyleSheet.absoluteFillObject,
    color: 'transparent',
    cursor: 'text',
    opacity: 0.02,
    position: 'absolute',
    textAlign: 'center',
  },
  timerText: {
    color: '#8E9AAF',
    fontSize: 9,
    marginBottom: 18,
    textAlign: 'center',
  },
  resendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  resendText: {
    color: '#8E9AAF',
    fontSize: 9,
  },
  resendLink: {
    color: '#347BE5',
    fontSize: 9,
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: '#9AA5BD',
  },
  errorText: {
    color: '#D64A4A',
    fontSize: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
});
