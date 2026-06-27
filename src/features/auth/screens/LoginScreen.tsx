import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AuthInput from '../components/AuthInput';
import AuthScaffold, { AuthIllustration, PrimaryButton } from '../components/AuthScaffold';
import {
  isFirebaseAvailable,
  isValidIndianMobile,
  sendOtp,
  toE164India,
} from '../services/firebasePhone';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string; verified?: string }>();

  const [mobile, setMobile] = useState(params.phone ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    try {
      setError('');

      if (!isValidIndianMobile(mobile)) {
        setError('Please enter a valid 10 digit mobile number.');
        return;
      }

      if (!isFirebaseAvailable()) {
        setError('Phone verification is unavailable in this build. Please update the app.');
        return;
      }

      setLoading(true);
      const phoneE164 = toE164India(mobile);
      await sendOtp(phoneE164);

      router.navigate({
        params: { mode: 'login', phone: phoneE164, phoneDisplay: mobile.replace(/\D/g, '').slice(-10) },
        pathname: '/otp',
      });
    } catch (sendError: any) {
      console.log('SEND OTP ERROR:', sendError);
      const code = sendError?.code as string | undefined;
      if (code === 'auth/invalid-phone-number') {
        setError('Please enter a valid mobile number.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a while and try again.');
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(sendError?.message || 'Could not send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold headerTitle="Login">
      <View style={styles.logoWrap}>
        <Image
          accessibilityLabel="iTaxEasy logo"
          resizeMode="contain"
          source={require('../../../../assets/images/icon2.png')}
          style={styles.logo}
        />
      </View>
      <View style={styles.hero}>
        <Text style={styles.title}>Let&apos;s get started</Text>
        <Text style={styles.subtitle}>Sign in securely with your mobile number.</Text>
      </View>

      <AuthIllustration />

      {params.verified ? (
        <Text style={styles.successText}>
          Account verified successfully. Please log in to continue.
        </Text>
      ) : null}

      <View style={styles.form}>
        <AuthInput
          keyboardType="phone-pad"
          onChangeText={setMobile}
          placeholder="Mobile Number"
          value={mobile}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <PrimaryButton label="Send OTP" loading={loading} onPress={handleSendOtp} />

      <View style={styles.signupRow}>
        <View style={styles.line} />
        <Text style={styles.signupText}>
          Don&apos;t have an account?{' '}
          <Text onPress={() => router.navigate('/signup')} style={styles.linkText}>
            Sign Up
          </Text>
        </Text>
        <View style={styles.line} />
      </View>

      <View style={styles.privacyRow}>
        <MaterialCommunityIcons name="shield-check-outline" size={14} color="#60708A" />
        <Text style={styles.privacyText}>
          We&apos;ll send a one-time code to verify your number
        </Text>
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#347BE5',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  hero: { marginBottom: 8 },
  subtitle: {
    color: '#60708A',
    fontSize: 11,
    textAlign: 'center',
  },
  form: { gap: 12 },
  linkText: {
    color: '#347BE5',
    fontSize: 10,
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5EAF3',
  },
  signupText: {
    fontSize: 10,
    marginHorizontal: 5,
  },
  privacyRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 6,
  },
  privacyText: {
    fontSize: 11,
    color: '#60708A',
  },
  errorText: {
    color: '#D64A4A',
    fontSize: 10,
    marginBottom: 2,
  },
  successText: {
    color: '#1E9E5A',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 2,
  },
  logo: {
    height: 60,
    width: 60,
  },
});
