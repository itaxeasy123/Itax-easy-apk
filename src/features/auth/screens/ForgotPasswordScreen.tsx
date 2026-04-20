import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AuthInput from '../components/AuthInput';
import AuthScaffold, { PrimaryButton } from '../components/AuthScaffold';
import { authService } from '../../../services/authService';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { validateEmail, validatePassword } from '../../../utils/validators/authValidator';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur?.();
  }, []);

  const handleForgotPassword = async () => {
    try {
      setError('');

      if (!validateEmail(email)) {
        setError('Please enter a valid email address.');
        return;
      }

      if (!validatePassword(newPassword)) {
        setError('New password must be at least 6 characters long.');
        return;
      }

      await authService.forgotPassword(email);
      router.push({
        params: { email, mode: 'reset', newPassword },
        pathname: '/otp',
      });
    } catch (forgotPasswordError: any) {
      setError(
        getApiErrorMessage(forgotPasswordError, 'Failed to send reset OTP.', {
          404: 'No account found with this email. Please sign up first.',
        })
      );
    }
  };

  return (
    <AuthScaffold
      headerTitle="Forgot Password"
      onBackPress={() => router.back()}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Add the right details here so you can set your password securely.
        </Text>

        <View style={styles.form}>
          <AuthInput
            onChangeText={setEmail}
            placeholder="Email"
            value={email}
          />
          <AuthInput
            onChangeText={setNewPassword}
            placeholder="New Password"
            secureToggle
            value={newPassword}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <PrimaryButton label="Reset Password" onPress={handleForgotPassword} />
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 3,
    boxShadow: '0px 6px 18px rgba(154, 169, 199, 0.12)',
    marginHorizontal: 8,
    marginTop: 86,
    padding: 18,
  },
  title: {
    color: '#1F2940',
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    color: '#8E9AAF',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 4,
  },
  form: {
    gap: 10,
    marginBottom: 18,
    marginTop: 14,
  },
  errorText: {
    color: '#D64A4A',
    fontSize: 10,
    marginBottom: 2,
  },
});
