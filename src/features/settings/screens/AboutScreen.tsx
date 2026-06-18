import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../../shared/components/ScreenContainer';
import SurfaceCard from '../../../shared/components/SurfaceCard';
import { colors, fontSizes, fontWeights, radius, spacing } from '../../../theme';

const focusTags = [
  'GST',
  'ITR',
  'Compliance',
  'Trusted Since 2019',
];

const storyTimeline = [
  {
    year: '2018',
    title: 'The Beginning',
    description:
      'The founder develops an idea, registers the company with the government, obtains the necessary legal documents and licenses, and obtains any necessary approvals or clearances from both state and central government agencies.',
  },
  {
    year: '2019',
    title: 'In 2019',
    description:
      "In December 2019, Itax Easy Private Limited began development of the company's web and app development. We prepared everything needed to develop our company and idea. Our team is dedicated, professional, honest and hardworking, always ensuring work is done on time.",
  },
  {
    year: '2020',
    title: 'In 2020',
    description:
      'In the year 2020, the company started meeting people and took Lic of india as well as star health and started doing business. In the year 2020, the company started meeting people and took Lic of india as well as star health and started doing business.',
  },
  {
    year: '2021',
    title: 'In 2021',
    description:
      'The founder develops an idea, registers the company with the government, obtains the necessary legal documents and licenses, and obtains any necessary approvals or clearances from both state and central government agencies.',
  },
  {
    year: '2022',
    title: 'In 2022',
    description:
      "Itaxeasy Pvt Ltd, a company that provides online tax filing and compliance services, announced a partnership with Yes Bank in 2022. As part of the partnership, Yes Bank will offer Itaxeasy's services to its customers, making it easier for them to file their taxes online. Itaxeasy will benefit by expanding its reach in the market.",
  },
  {
    year: '2023',
    title: 'In 2023',
    description:
      "At Itax Easy Private Limited, we believe everyone deserves access to the financial services they need. We created 'ITAXEASY', a mobile application that makes it easy to manage finances and file taxes in one place-simple, guided, and supported by experts when needed.",
  },
];

export default function AboutScreen() {
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
          <Text style={styles.headerTitle}>About</Text>
          <View style={styles.headerSpacer} />
        </View>

        <SurfaceCard style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Feather color={colors.primary} name="users" size={20} />
          </View>
          {/* <Text style={styles.sectionEyebrow}>About Us</Text> */}
          <Text style={styles.appName}>Know Who We Are</Text>
          <Text style={styles.heroText}>
            We are a company that makes it easy to manage your taxes and other daily needs.
            We started this journey in 2019 with a simple idea: people do not have the knowledge
            or time to manage their own accounts, so we are here to help.
          </Text>
        </SurfaceCard>

        <SurfaceCard style={styles.featureCard}>
          <Text style={styles.featureTitle}>5+ Years of Experience</Text>
          <Text style={styles.featureText}>
            We have made it possible for you to do what you need, when you need it. Our products
            are available online, on your phone, and even in person at our offices.
          </Text>

          <View style={styles.tagWrap}>
            {focusTags.map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </SurfaceCard>

        <Text style={styles.sectionTitle}>Company Story</Text>
        <Text style={styles.sectionSubtitle}>Learn About Our Journey</Text>

        <View style={styles.storyList}>
          {storyTimeline.map((item) => (
            <SurfaceCard key={item.year} style={styles.storyCard}>
              <View style={styles.storyHeader}>
                <View style={styles.yearBadge}>
                  <Text style={styles.yearBadgeText}>{item.year}</Text>
                </View>
                <View style={styles.storyHeaderText}>
                  <Text style={styles.storyTitle}>{item.title}</Text>
                </View>
              </View>
              <Text style={styles.storyText}>{item.description}</Text>
            </SurfaceCard>
          ))}
        </View>

        <Text style={styles.sectionTitle}>What We Offer</Text>
        <SurfaceCard style={styles.sectionCard}>
          <View style={styles.highlightGrid}>
            <InfoRow label="GST" value="Tools and guidance" />
            <InfoRow label="ITR" value="Filing assistance" />
            <InfoRow label="Compliance" value="Business support" />
            <InfoRow label="Trusted Since" value="2019" />
          </View>
        </SurfaceCard>

        <Text style={styles.sectionTitle}>Support</Text>
        <SurfaceCard style={styles.sectionCard}>
          <InfoRow label="Company" value="Itax Easy Private Limited" />
          {/* <InfoRow label="Version" value="1.0.0" /> */}
          <InfoRow label="Contact" value="info@itaxeasy.com" />
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
  sectionEyebrow: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  appName: {
    color: colors.text,
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    marginTop: 4,
  },
  featureCard: {
    marginBottom: spacing.lg,
    padding: 18,
  },
  featureTitle: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  featureText: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    marginTop: 8,
  },
  heroText: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    marginBottom: spacing.sm,
    marginTop: -4,
  },
  sectionCard: {
    padding: 16,
  },
  highlightGrid: {},
  storyList: {
    rowGap: spacing.sm,
  },
  storyCard: {
    padding: 16,
  },
  storyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  yearBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  yearBadgeText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
  },
  storyHeaderText: {
    flex: 1,
  },
  storyTitle: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
  storyText: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    marginTop: 10,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  tagPill: {
    backgroundColor: colors.backgroundMuted,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagText: {
    color: colors.primaryDark,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
  },
  infoValue: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
});
