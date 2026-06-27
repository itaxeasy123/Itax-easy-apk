import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { apkBusinessService, BusinessInput } from '../../../services/apkBusinessService';
import { useBusinessStore } from '../../../store/businessStore';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { notify } from '../../../utils/notify';

type FormState = {
  name: string;
  tradeName: string;
  pan: string;
  gstin: string;
  stateCode: string;
  country: string;
  currency: string;
};

const EMPTY: FormState = {
  name: '',
  tradeName: '',
  pan: '',
  gstin: '',
  stateCode: '',
  country: 'India',
  currency: 'INR',
};

export default function BusinessFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const editingId = params.id ? Number(params.id) : null;

  const loadBusinesses = useBusinessStore((s) => s.load);
  const setActive = useBusinessStore((s) => s.setActive);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingId == null) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const b = await apkBusinessService.get(editingId);
        if (cancelled) return;
        setForm({
          name: b.name ?? '',
          tradeName: b.tradeName ?? '',
          pan: b.pan ?? '',
          gstin: b.gstin ?? '',
          stateCode: b.stateCode ?? '',
          country: b.country ?? 'India',
          currency: b.currency ?? 'INR',
        });
      } catch (e) {
        if (!cancelled) setError(getApiErrorMessage(e, 'Could not load this business.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editingId]);

  const update = (field: keyof FormState) => (value: string) =>
    setForm((cur) => ({ ...cur, [field]: value }));

  const submit = async (status: 'draft' | 'active') => {
    setError('');
    if (!form.name.trim()) {
      setError('Business name is required.');
      return;
    }
    if (status === 'active') {
      if (!form.pan.trim() || !form.stateCode.trim()) {
        setError('PAN and State are required to activate the business.');
        return;
      }
    }

    const payload: BusinessInput = {
      name: form.name.trim(),
      tradeName: form.tradeName.trim() || undefined,
      pan: form.pan.trim() || undefined,
      gstin: form.gstin.trim() || undefined,
      stateCode: form.stateCode.trim() || undefined,
      country: form.country.trim() || 'India',
      currency: form.currency.trim() || 'INR',
      status,
    };

    try {
      setSaving(true);
      const saved = editingId
        ? await apkBusinessService.update(editingId, payload)
        : await apkBusinessService.create(payload);

      await loadBusinesses(true);
      await setActive(saved.id);
      notify(status === 'active' ? 'Business saved.' : 'Draft saved.');
      router.back();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Could not save the business. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#347BE5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather color="#24406D" name="arrow-left" size={18} />
        </Pressable>
        <Text style={styles.headerTitle}>{editingId ? 'Edit Business' : 'Set up Business'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Field label="Business Name *" value={form.name} onChangeText={update('name')} placeholder="e.g. Sharma Traders" />
        <Field label="Trade Name" value={form.tradeName} onChangeText={update('tradeName')} placeholder="Optional" />
        <Field label="PAN" value={form.pan} onChangeText={update('pan')} placeholder="ABCDE1234F" autoCapitalize="characters" />
        <Field label="GSTIN" value={form.gstin} onChangeText={update('gstin')} placeholder="Optional" autoCapitalize="characters" />
        <Field label="State" value={form.stateCode} onChangeText={update('stateCode')} placeholder="e.g. Uttar Pradesh" />
        <View style={styles.row}>
          <View style={styles.half}>
            <Field label="Country" value={form.country} onChangeText={update('country')} />
          </View>
          <View style={styles.half}>
            <Field label="Currency" value={form.currency} onChangeText={update('currency')} autoCapitalize="characters" />
          </View>
        </View>

        <Text style={styles.note}>PAN and State are required to activate. You can also save a draft and finish later.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={[styles.primaryBtn, saving && styles.btnDisabled]} disabled={saving} onPress={() => submit('active')}>
          <Text style={styles.primaryBtnText}>{saving ? 'Saving…' : 'Save & Activate'}</Text>
        </Pressable>
        <Pressable style={[styles.secondaryBtn, saving && styles.btnDisabled]} disabled={saving} onPress={() => submit('draft')}>
          <Text style={styles.secondaryBtnText}>Save Draft</Text>
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
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F7FC' },
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
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  note: { color: '#8E9AAF', fontSize: 11, lineHeight: 16, marginBottom: 14 },
  error: { color: '#D64A4A', fontSize: 12, marginBottom: 12 },
  primaryBtn: { backgroundColor: '#347BE5', borderRadius: 12, paddingVertical: 14 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  secondaryBtn: { borderRadius: 12, paddingVertical: 14, marginTop: 10, borderWidth: 1, borderColor: '#B8C4D8' },
  secondaryBtnText: { color: '#347BE5', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  btnDisabled: { opacity: 0.6 },
});
