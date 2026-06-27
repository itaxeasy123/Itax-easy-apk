import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { apkAuthService } from '../../../services/apkAuthService';
import { useAuthStore } from '../../../store/authStore';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { notify } from '../../../utils/notify';

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [timeZone, setTimeZone] = useState(user?.timeZone ?? 'Asia/Kolkata');
  const [language, setLanguage] = useState(user?.language ?? 'en');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setError('');
    if (fullName.trim().length < 3) {
      setError('Full name must be at least 3 characters.');
      return;
    }
    try {
      setSaving(true);
      const updated = await apkAuthService.updateProfile({
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        timeZone: timeZone.trim() || undefined,
        language: language.trim() || undefined,
      });
      // Refresh the cached user (keep the existing token).
      await setAuth(updated as any, token as string);
      notify('Profile updated.');
      router.back();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Could not update profile. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather color="#24406D" name="arrow-left" size={18} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Field label="Full Name *" value={fullName} onChangeText={setFullName} placeholder="Your name" />
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="Optional" keyboardType="email-address" autoCapitalize="none" />

        <View style={styles.readonlyWrap}>
          <Text style={styles.fieldLabel}>Mobile</Text>
          <Text style={styles.readonlyValue}>{user?.phone || 'Not added'}</Text>
          <Text style={styles.readonlyHint}>Mobile number can&apos;t be changed here.</Text>
        </View>

        <Field label="Time Zone" value={timeZone} onChangeText={setTimeZone} placeholder="Asia/Kolkata" />
        <Field label="Language" value={language} onChangeText={setLanguage} placeholder="en" autoCapitalize="none" />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={[styles.primaryBtn, saving && styles.btnDisabled]} disabled={saving} onPress={save}>
          <Text style={styles.primaryBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  ...inputProps
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor="#9AA5BD" {...inputProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FC', paddingTop: 12 },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5EAF3',
    borderRadius: 10,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: { color: '#24406D', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 48 },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { color: '#51627F', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#B8C4D8',
    borderRadius: 10,
    borderWidth: 1,
    color: '#20304B',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  readonlyWrap: { marginBottom: 14 },
  readonlyValue: {
    backgroundColor: '#EDF1F7',
    borderRadius: 10,
    color: '#51627F',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  readonlyHint: { color: '#9AA5BD', fontSize: 10, marginTop: 4 },
  error: { color: '#D64A4A', fontSize: 12, marginBottom: 12 },
  primaryBtn: { backgroundColor: '#347BE5', borderRadius: 12, paddingVertical: 14, marginTop: 6 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  btnDisabled: { opacity: 0.6 },
});
