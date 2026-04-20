import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculatorStyles, calculatorTheme } from '../../../theme';
import CalculatorHeader from '../../calculators/components/CalculatorHeader';
import TaxForm from '../components/TaxForm';
import TaxSummary from '../components/TaxSummary';
import { useTaxCalculator } from '../hooks/useTaxCalculator';

export default function AdvanceTaxScreen() {
  const router = useRouter();
  const { result, loading, calculate, exportPDF, reset } = useTaxCalculator();

  const handleSubmit = async (formData: any) => {
    try {
      await calculate(formData);
    } catch {
      Alert.alert('Error', 'Calculation failed');
    }
  };

  const handleExport = async () => {
    try {
      const file = await exportPDF();
      if (file) {
        Alert.alert('Success', 'PDF Generated');
      }
    } catch {
      Alert.alert('Error', 'PDF failed');
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={calculatorStyles.screenSafeArea}>
      <CalculatorHeader onBackPress={() => router.back()} title="Advance Tax Calculator" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TaxForm onSubmit={handleSubmit} />

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={calculatorTheme.headerGradientStart} />
            <Text style={styles.loadingText}>Calculating tax...</Text>
          </View>
        ) : null}

        {result && !loading ? (
          <View style={styles.resultWrap}>
            <View style={styles.summaryCard}>
              <TaxSummary result={result} />
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={handleExport} style={styles.exportButton}>
                <Text style={styles.exportButtonText}>Export PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  loadingWrap: {
    alignItems: 'center',
    marginTop: 28,
  },
  loadingText: {
    color: '#64748b',
    marginTop: 10,
  },
  resultWrap: {
    marginTop: 14,
  },
  summaryCard: {
    backgroundColor: calculatorTheme.fieldBackground,
    borderColor: calculatorTheme.summaryBorder,
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  exportButton: {
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: 12,
    flex: 1,
    padding: 14,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  resetButton: {
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 12,
    flex: 1,
    padding: 14,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
