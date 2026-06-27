import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { validateEmail } from '../../../utils/validators/authValidator';
import AuthInput from '../components/AuthInput';
import AuthScaffold, { PrimaryButton, SignupIllustration } from '../components/AuthScaffold';
import {
  isFirebaseAvailable,
  isValidIndianMobile,
  sendOtp,
  toE164India,
} from '../services/firebasePhone';

export default function SignupScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    gender: '' as '' | 'female' | 'male' | 'other',
    mobileNumber: '',
  });
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  const updateField =
    (field: keyof typeof form) =>
      (value: string) =>
        setForm((current) => ({ ...current, [field]: value }));

  const handleSignup = async () => {
    try {
      setError('');

      if (form.fullName.trim().length < 3) {
        setError('Please enter your full name (at least 3 characters).');
        return;
      }

      // Email is optional (SRS Module 1) — only validate when provided.
      if (form.email.trim() && !validateEmail(form.email)) {
        setError('Please enter a valid email address.');
        return;
      }

      if (!isValidIndianMobile(form.mobileNumber)) {
        setError('Please enter a valid 10 digit mobile number.');
        return;
      }

      if (!isTermsAccepted) {
        setError('Please agree to the Terms & Conditions.');
        return;
      }

      if (!isFirebaseAvailable()) {
        setError('Phone verification is unavailable in this build. Please update the app.');
        return;
      }

      setLoading(true);
      const phoneE164 = toE164India(form.mobileNumber);
      await sendOtp(phoneE164);

      router.navigate({
        params: {
          mode: 'signup',
          phone: phoneE164,
          phoneDisplay: form.mobileNumber.replace(/\D/g, '').slice(-10),
          fullName: form.fullName.trim(),
          email: form.email.trim(),
        },
        pathname: '/otp',
      });
    } catch (signupError: any) {
      console.log('SEND OTP ERROR:', signupError);
      const code = signupError?.code as string | undefined;
      if (code === 'auth/invalid-phone-number') {
        setError('Please enter a valid mobile number.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a while and try again.');
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(signupError?.message || 'Could not send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold headerTitle="Signup" onBackPress={() => router.back()}>
      <View style={styles.logoWrap}>
        <Image
          accessibilityLabel="iTaxEasy logo"
          resizeMode="contain"
          source={require('../../../../assets/images/icon2.png')}
          style={styles.logo}
        />
      </View>
      <View style={styles.hero}>
        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.subtitle}>Join iTaxEasy and manage your tax journey easy.</Text>
      </View>

      <SignupIllustration />

      <View style={styles.form}>
        <AuthInput
          onChangeText={updateField('fullName')}
          placeholder="Full Name"
          value={form.fullName}
        />
        <AuthInput
          keyboardType="email-address"
          onChangeText={updateField('email')}
          placeholder="Email (optional)"
          value={form.email}
        />

        <View style={styles.genderSelectorWrap}>
          <Pressable
            onPress={() => setIsGenderOpen((value) => !value)}
            style={styles.genderSelect}
          >
            <Text
              style={[
                styles.genderSelectText,
                !form.gender && styles.genderPlaceholder,
              ]}
            >
              {form.gender
                ? form.gender[0].toUpperCase() + form.gender.slice(1)
                : 'Select Gender (optional)'}
            </Text>
            <Text style={styles.genderCaret}>{isGenderOpen ? '⌃' : '⌄'}</Text>
          </Pressable>

          {isGenderOpen ? (
            <View style={styles.genderMenu}>
              {(['male', 'female', 'other'] as const).map((gender, index) => (
                <Pressable
                  key={gender}
                  onPress={() => {
                    updateField('gender')(gender);
                    setIsGenderOpen(false);
                  }}
                  style={[
                    styles.genderMenuItem,
                    index < 2 && styles.genderMenuItemBorder,
                    form.gender === gender && styles.genderMenuItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.genderMenuItemText,
                      form.gender === gender && styles.genderMenuItemTextActive,
                    ]}
                  >
                    {gender[0].toUpperCase() + gender.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <AuthInput
          keyboardType="phone-pad"
          onChangeText={updateField('mobileNumber')}
          placeholder="Mobile Number"
          value={form.mobileNumber}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.termsRow}>
        <Pressable onPress={() => setIsTermsAccepted(!isTermsAccepted)} style={styles.checkbox}>
          <MaterialCommunityIcons
            name={isTermsAccepted ? "checkbox-marked" : "checkbox-blank-outline"}
            size={20}
            color={isTermsAccepted ? "#347BE5" : "#60708A"}
          />
        </Pressable>
        <Text style={styles.termsText}>
          By signing up, you agree to our{' '}
          <Text
            style={styles.termsLink}
            onPress={() => Linking.openURL('https://itaxeasy.com/tc')}
          >
            Terms & Conditions
          </Text>
          .
        </Text>
      </View>

      <PrimaryButton label="Send OTP" loading={loading} onPress={handleSignup} />

      <Text style={styles.bottomText}>
        Have an account?{' '}
        <Text onPress={() => router.replace('/login')} style={styles.linkText}>
          Login
        </Text>
      </Text>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#347BE5',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: -8,
    textAlign: 'center',
  },
  hero: {
    marginBottom: 8,
    marginTop: 4,
  },
  subtitle: {
    color: '#60708A',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
    textAlign: 'center',

  },
  form: {
    gap: 10,
  },
  genderSelectorWrap: {
    backgroundColor: '#FFFFFF',
    borderColor: '#B8C4D8',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  genderSelect: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 38,
    paddingHorizontal: 12,
  },
  genderSelectText: {
    color: '#20304B',
    fontSize: 12,
    fontWeight: '500',
  },
  genderPlaceholder: {
    color: '#9AA5BD',
  },
  genderCaret: {
    color: '#51627F',
    fontSize: 12,
    fontWeight: '700',
  },
  genderMenu: {
    borderTopColor: '#D5DDE8',
    borderTopWidth: 1,
  },
  genderMenuItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  genderMenuItemBorder: {
    borderBottomColor: '#D5DDE8',
    borderBottomWidth: 1,
  },
  genderMenuItemActive: {
    backgroundColor: '#EAF2FF',
  },
  genderMenuItemText: {
    color: '#51627F',
    fontSize: 12,
    fontWeight: '500',
  },
  genderMenuItemTextActive: {
    color: '#347BE5',
  },
  bottomText: {
    color: '#4B556B',
    fontSize: 10,
    marginTop: 10,
    textAlign: 'center',
  },
  linkText: {
    color: '#347BE5',
    fontWeight: '500',
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
    height: 60,
    width: 60,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    marginTop: 4,
    paddingHorizontal: 10,
  },
  checkbox: {
    marginRight: 8,
  },
  termsText: {
    color: '#60708A',
    fontSize: 10,
    lineHeight: 14,
  },
  termsLink: {
    color: '#347BE5',
  },
});
