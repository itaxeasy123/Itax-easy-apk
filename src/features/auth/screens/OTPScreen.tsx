import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import AuthScaffold, { PrimaryButton } from '../components/AuthScaffold';
import OTPInput from '../components/OTPInput';
import { authService } from '../../../services/authService';
import { useAuthStore } from '../../../store/authStore';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { notify } from '../../../utils/notify';

// Seconds the user must wait between OTP sends before "Resend" re-enables.
const RESEND_COOLDOWN = 60;

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email?: string;
    mode?: string;
    newPassword?: string;
    otpKey?: string;
    password?: string;
  }>();
  const setAuth = useAuthStore((state) => state.setAuth);
  const inputRef = useRef<TextInput>(null);
  const [otp, setOtp] = useState('');
  const [otpKey, setOtpKey] = useState<string | undefined>(params.otpKey);
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

  const subtitle =
    params.mode === 'reset'
      ? 'OTP verification code has been sent to your registered email.'
      : 'Enter OTP. We have sent you OTP received on your email.';

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    try {
      setLoading(true);
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

      const verifyResult = await authService.verifyOtp({
        email: params.email ?? '',
        otp,
        otpKey,
      });

      // Login-origin: the account was unverified at login. Now that it's
      // verified, log the user straight in and continue into the app.
      if (params.mode === 'login') {
        const user = verifyResult?.data?.user ?? verifyResult?.user;
        let token = verifyResult?.data?.token ?? verifyResult?.token;

        // Fallback: if verify didn't return a session, log in explicitly.
        if (!token) {
          const loginResult = await authService.login({
            email: params.email ?? '',
            password: params.password ?? '',
          });
          const loginUser = loginResult?.data?.user ?? loginResult?.user;
          token =
            loginResult?.data?.accessToken ??
            loginResult?.data?.token ??
            loginResult?.accessToken ??
            loginResult?.token;
          if (token) {
            await setAuth(loginUser, token);
          }
        } else {
          await setAuth(user, token);
        }

        router.replace('/dashboard');
        return;
      }

      // Signup-origin: email verified. Send the user to the login page to
      // sign in with their email and password.
      router.replace({
        params: { email: params.email ?? '', verified: '1' },
        pathname: '/login',
      });
    } catch (verifyError: any) {
      setError(
        getApiErrorMessage(verifyError, 'OTP verification failed. Please try again.', {
          400: 'Invalid or expired OTP. Please check the code or resend a new one.',
          404: 'Account not found. Please sign up again.',
          410: 'This OTP has expired. Please resend a new one.',
          500: 'Something went wrong. Please try again later.',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // Enforce the 30s cooldown — ignore taps until it elapses.
    if (cooldown > 0 || resending) {
      return;
    }

    try {
      setResending(true);
      setError('');
      const result = await authService.resendOtp(params.email ?? '');

      // resendotp returns the new otp_key (top-level), use it for verify.
      const newKey = result?.otp_key ?? result?.data?.otp_key;
      if (newKey != null) {
        setOtpKey(String(newKey));
      }

      setOtp('');
      setCooldown(RESEND_COOLDOWN);
      notify(result?.message || 'OTP sent successfully');
    } catch (resendError: any) {
      setError(
        getApiErrorMessage(resendError, 'Failed to resend OTP. Please try again.', {
          401: 'No account found with this email.',
          404: 'No account found with this email.',
          429: 'Too many requests. Please wait a moment and try again.',
          500: 'Something went wrong. Please try again later.',
        })
      );
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

