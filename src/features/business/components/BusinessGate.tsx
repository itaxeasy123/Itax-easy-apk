import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ReactNode, useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useBusinessStore } from '../../../store/businessStore';

type Props = {
  children: ReactNode;
  // What the wrapped feature needs. 'business' just needs an active business.
  // 'gst'/'inventory' will additionally check Module 4 settings once those exist.
  require?: 'business' | 'gst' | 'inventory';
  featureName?: string;
};

/**
 * Soft-gate for BillShield / GST / Inventory entry points.
 * No (active) business → shows a "Set up your business" prompt instead of the
 * feature. Calculators, tools and profile stay open (they don't use this).
 */
export default function BusinessGate({ children, require = 'business', featureName }: Props) {
  const router = useRouter();
  const load = useBusinessStore((s) => s.load);
  const loaded = useBusinessStore((s) => s.loaded);
  const loading = useBusinessStore((s) => s.loading);
  const hasActiveBusiness = useBusinessStore((s) => s.hasActiveBusiness);
  // subscribe to the list so the gate re-renders after a business is created
  useBusinessStore((s) => s.businesses);

  useEffect(() => {
    load();
  }, [load]);

  if (!loaded && loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#347BE5" />
      </View>
    );
  }

  // Layer 1: needs an active business. (Layer 2 — gst/inventory toggles —
  // arrives with Module 4 business settings.)
  if (!hasActiveBusiness()) {
    const label = featureName ?? (require === 'gst' ? 'GST' : require === 'inventory' ? 'Inventory' : 'Accounting');
    return (
      <View style={styles.center}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="business-outline" size={36} color="#347BE5" />
          </View>
          <Text style={styles.title}>Set up your business</Text>
          <Text style={styles.subtitle}>
            {label} needs a business profile. It only takes a minute, and you can
            edit it anytime from your profile.
          </Text>
          <Pressable style={styles.button} onPress={() => router.push('/business-form')}>
            <Text style={styles.buttonText}>Set up business</Text>
          </Pressable>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.laterText}>Maybe later</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F4F7FC',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    elevation: 3,
    boxShadow: '0px 6px 18px rgba(154, 169, 199, 0.18)',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#1F2940',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#60708A',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#347BE5',
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  laterText: {
    color: '#8E9AAF',
    fontSize: 13,
    marginTop: 14,
  },
});
