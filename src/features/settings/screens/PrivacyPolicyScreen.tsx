import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../../shared/components/ScreenContainer';
import SurfaceCard from '../../../shared/components/SurfaceCard';
import { colors, fontSizes, fontWeights, radius, spacing } from '../../../theme';

const policySections = [
  {
    title: 'Information we collect',
    items: ['Name, email address, phone number', 'Login and account verification data', 'Calculator inputs when needed for app features'],
  },
  {
    title: 'How we use information',
    items: ['Create and manage your account', 'Provide calculator and tax tools', 'Improve support and app reliability'],
  },
  {
    title: 'Data sharing',
    items: ['We do not sell personal data', 'We may share data with trusted service providers only when required for app operation'],
  },
  {
    title: 'Your choices',
    items: ['Update your profile details', 'Request account deletion', 'Contact us for privacy questions'],
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur?.();
    document.body?.focus?.();
  }, []);

  return (
    <ScreenContainer fullWidth style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <PressableBack onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.headerSpacer} />
        </View>

        <SurfaceCard style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Feather color={colors.primary} name="shield" size={20} />
          </View>
          <Text style={styles.heroTitle}>Your privacy matters</Text>
          <Text style={styles.heroText}>
            This page explains what we collect, why we collect it, and how you can manage your data.
          </Text>
        </SurfaceCard>

        <View style={styles.stackGap}>
          {policySections.map((section) => (
            <SurfaceCard key={section.title} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.bulletList}>
                {section.items.map((item) => (
                  <View key={item} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            </SurfaceCard>
          ))}
        </View>

        <SurfaceCard style={styles.footerCard}>
          <Text style={styles.footerText}>
            Effective date and final legal wording should be reviewed before publishing the app.
          </Text>
        </SurfaceCard>
      </ScrollView>
    </ScreenContainer>
  );
}

function PressableBack({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.backButton}>
      <Feather color={colors.primaryDark} name="arrow-left" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    color: colors.primaryDark,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
  },
  headerSpacer: {
    width: 40,
  },
  heroCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: 20,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    marginBottom: 12,
    width: 44,
  },
  heroTitle: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  heroText: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  stackGap: {
    rowGap: spacing.sm,
  },
  sectionCard: {
    padding: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    marginBottom: 12,
  },
  bulletList: {
    rowGap: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bulletDot: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    height: 8,
    marginTop: 6,
    width: 8,
  },
  bulletText: {
    color: colors.textMuted,
    flex: 1,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  footerCard: {
    marginTop: spacing.md,
    padding: 16,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});
