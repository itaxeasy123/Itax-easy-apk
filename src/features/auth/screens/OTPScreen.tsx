import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import AuthScaffold, { PrimaryButton } from '../components/AuthScaffold';
import OTPInput from '../components/OTPInput';
import { authService } from '../../../services/authService';
import { useAuthStore } from '../../../store/authStore';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email?: string;
    mode?: string;
    newPassword?: string;
    password?: string;
  }>();
  const setAuth = useAuthStore((state) => state.setAuth);
  const inputRef = useRef<TextInput>(null);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(180); // ✅ 3 minutes
  const [error, setError] = useState('');

  useEffect(() => {
    if (timer <= 0) {
      return;
    }

    const id = setTimeout(() => setTimer((value) => value - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const subtitle =
    params.mode === 'reset'
      ? 'OTP verification code has been sent to your registered email.'
      : 'Enter OTP. We have sent you OTP received on your email.';

  const handleVerify = async () => {
    try {
      setError('');

      if (params.mode === 'reset') {
        await authService.updatePasswordWithOtp({
          email: params.email ?? '',
          newPassword: params.newPassword ?? '',
          otp,
        });

        router.replace({
          params: { mode: 'reset' },
          pathname: '/otp-success',
        });
        return;
      }

      await authService.verifyOtp({
        email: params.email ?? '',
        otp,
      });

      const loginResult = await authService.login({
        email: params.email ?? '',
        password: params.password ?? '',
      });

      setAuth(loginResult.user, loginResult.token);
      router.replace({
        params: { mode: params.mode ?? 'signup' },
        pathname: '/otp-success',
      });
    } catch (verifyError: any) {
      setError(getApiErrorMessage(verifyError, 'OTP verification failed.'));
    }
  };

  const handleResend = async () => {
    try {
      setError('');
      await authService.resendOtp(params.email ?? '');
      setTimer(180);
    } catch (resendError: any) {
      setError(getApiErrorMessage(resendError, 'Failed to resend OTP.'));
    }
  };

  return (
    <AuthScaffold
      headerTitle="Verification OTP"
      onBackPress={() => router.back()}
    >
      <View style={styles.centerCard}>
        <Text style={styles.cardTitle}>Enter OTP</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
        {params.email ? (
          <Text style={styles.emailText}>{params.email}</Text>
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
          {timer > 0 ? `wait for ${timer} sec` : 'You can resend OTP now'}
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <PrimaryButton label="Verify OTP" onPress={handleVerify} />

        <Pressable onPress={handleResend} style={styles.resendRow}>
          <Text style={styles.resendText}>Did not get OTP code? </Text>
          <Text style={styles.resendLink}>Resend OTP</Text>
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
  errorText: {
    color: '#D64A4A',
    fontSize: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
});

