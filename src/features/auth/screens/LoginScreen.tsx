import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, Image} from 'react-native';

import AuthInput from '../components/AuthInput';
import AuthScaffold, { AuthIllustration, PrimaryButton } from '../components/AuthScaffold';
import { authService } from '../../../services/authService';
import { useAuthStore } from '../../../store/authStore';
import { validateEmail } from '../../../utils/validators/authValidator';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setError('');

      if (!validateEmail(email)) {
        setError('Please enter a valid email address.');
        return;
      }

      if (!password.trim()) {
        setError('Please enter your password.');
        return;
      }

      // 🔥 API CALL
      const res = await authService.login({ email, password });

      console.log("LOGIN RESPONSE:", res);

      // ✅ FIXED RESPONSE HANDLING
      const user =
        res?.data?.user ||
        res?.user ||
        res?.data;

      const token =
        res?.data?.accessToken ||
        res?.data?.token ||
        res?.accessToken ||
        res?.token;

      if (!token) {
        setError('Login failed: token not received');
        return;
      }

      // ✅ SAVE AUTH (IMPORTANT)
      await setAuth(user, token);

      // ✅ SUCCESS
      router.replace('/dashboard');

    } catch (loginError: any) {
      console.log("LOGIN ERROR:", loginError?.response?.data);

      setError(
        getApiErrorMessage(loginError, 'Login failed. Please try again.', {
          401: 'Incorrect password.',
          403: 'Account not verified.',
          404: 'User not found.',
        })
      );
    }
  };

  return (
    <AuthScaffold headerTitle="Login">
      <View style={styles.logoWrap}>
        <Image
          accessibilityLabel="iTaxEasy logo"
          resizeMode="contain"
          source={require('../../../../assets/images/login.jpeg')}
          style={styles.logo}
        />
      </View>
      <View style={styles.hero}>
         <Text style={styles.title}>Let&apos;s get started</Text>
        <Text style={styles.subtitle}>Access your account securely.</Text>
      </View>

      <AuthIllustration />

      <View style={styles.form}>
        <AuthInput
          onChangeText={setEmail}
          placeholder="Email"
          value={email}
        />

        <AuthInput
          onChangeText={setPassword}
          placeholder="Password"
          secureToggle
          value={password}
        />
      </View>

      <View style={styles.optionsRow}>
        <Pressable onPress={() => router.push('/forgot-password')}>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <PrimaryButton label="Login" onPress={handleLogin} />

      <View style={styles.signupRow}>
        <View style={styles.line} />
        <Text style={styles.signupText}>
          Don&apos;t have an account?{' '}
          <Text onPress={() => router.push('/signup')} style={styles.linkText}>
            Sign Up
          </Text>
        </Text>
        <View style={styles.line} />
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
  optionsRow: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
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
  errorText: {
    color: '#D64A4A',
    fontSize: 10,
    marginBottom: 2,
  },
   logoWrap: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 2,
  },
  logo: {
    height: 84,
    width: 84,
  },
});