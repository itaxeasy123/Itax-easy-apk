import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import CalculatorHeader from '../../calculators/components/CalculatorHeader';
import CalculatorSummaryCard from '../../calculators/components/CalculatorSummaryCard';
import { calculatorStyles } from '../../../theme';

type PdfToolLayoutProps = {
  children: ReactNode;
  message?: string;
  messageTone?: 'error' | 'success';
  summaryItems?: { label: string; value: string }[];
  title: string;
};

export default function PdfToolLayout({
  children,
  message,
  messageTone = 'error',
  summaryItems,
  title,
}: PdfToolLayoutProps) {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top', 'bottom']} style={calculatorStyles.screenSafeArea}>
      <CalculatorHeader onBackPress={() => router.back()} title={title} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroWrap}>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>
            Upload, process, and export PDF files from one clean workflow.
          </Text>
        </View>

        <View style={styles.body}>{children}</View>

        {message ? (
          <Text
            style={[
              styles.message,
              messageTone === 'success' ? styles.messageSuccess : styles.messageError,
            ]}
          >
            {message}
          </Text>
        ) : null}

        {summaryItems?.length ? <CalculatorSummaryCard items={summaryItems} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
    paddingHorizontal: 12,
  },
  heroWrap: {
    alignItems: 'center',
    marginTop: 12,
  },
  heroTitle: {
    color: '#22344A',
    fontSize: 18,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: '#60708A',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
    textAlign: 'center',
  },
  body: {
    marginTop: 14,
  },
  message: {
    fontSize: 11,
    marginTop: 10,
    textAlign: 'center',
  },
  messageError: {
    color: '#B91C1C',
  },
  messageSuccess: {
    color: '#15803D',
  },
});
