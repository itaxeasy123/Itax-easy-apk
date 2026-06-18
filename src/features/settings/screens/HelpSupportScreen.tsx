import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../../shared/components/ScreenContainer';
import SurfaceCard from '../../../shared/components/SurfaceCard';
import { colors, fontSizes, fontWeights, radius, spacing } from '../../../theme';

const faqItems = [
  {
    title: 'How do I use calculators?',
    description: 'Open any calculator from the dashboard, enter values, and tap Calculate.',
  },
  {
    title: 'I forgot my password',
    description: 'Use the Forgot Password option on the login screen to reset your account.',
  },
  {
    title: 'Where can I raise a support request?',
    description: 'Tap Report a Problem and share the issue details with the support team.',
  },
];

export default function HelpSupportScreen() {
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
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather color={colors.primaryDark} name="arrow-left" size={18} />
          </Pressable>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.headerSpacer} />
        </View>

        <SurfaceCard style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Feather color={colors.primary} name="life-buoy" size={20} />
          </View>
          <Text style={styles.heroTitle}>Need a hand?</Text>
          <Text style={styles.heroText}>
            Find quick answers, report an issue, or reach out when something feels off.
          </Text>
        </SurfaceCard>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.stackGap}>
          {faqItems.map((item) => (
            <SurfaceCard key={item.title} style={styles.infoCard}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemText}>{item.description}</Text>
            </SurfaceCard>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <SurfaceCard style={styles.actionCard}>
          <Pressable style={styles.actionRow}>
            <Feather color={colors.primary} name="mail" size={18} />
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Contact Support</Text>
              <Text style={styles.actionSubtitle}>info@itaxeasy.com</Text>
            </View>
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.actionRow}>
            <Feather color={colors.primary} name="alert-circle" size={18} />
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Report a Problem</Text>
              <Text style={styles.actionSubtitle}>Tell us what went wrong in the app.</Text>
            </View>
          </Pressable>
        </SurfaceCard>
      </ScrollView>
    </ScreenContainer>
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
  sectionTitle: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.sm,
  },
  stackGap: {
    rowGap: spacing.sm,
  },
  infoCard: {
    padding: 16,
  },
  itemTitle: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  itemText: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    marginTop: 6,
  },
  actionCard: {
    marginTop: spacing.sm,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  actionSubtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    marginTop: 2,
  },
  divider: {
    backgroundColor: colors.borderSoft,
    height: 1,
  },
});
