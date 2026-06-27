import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculatorStyles } from '../../../../theme';
import { calculateSip } from '../../../../utils/calculations/sip';
import { formatYears } from '../../../../utils/formatters';
import CalculatorHeader from '../../components/CalculatorHeader';
import CalculatorInputField from '../../components/CalculatorInputField';
import CalculatorSummaryCard from '../../components/CalculatorSummaryCard';
import { sipFieldLabels } from '../data/sipFields';
import { SipCalculatorInput } from '../types/sip.types';

export default function SipCalculatorScreen() {
  const router = useRouter();
  const [form, setForm] = useState<SipCalculatorInput>({
    annualRate: '0',
    monthlyInvestment: '0',
    timeYears: '0',
  });

  const errors = useMemo(() => {
    const errs: Record<keyof SipCalculatorInput, string> = {
      annualRate: '',
      monthlyInvestment: '',
      timeYears: '',
    };
    
    if (form.monthlyInvestment && Number(form.monthlyInvestment) <= 0) errs.monthlyInvestment = 'Must be > 0';
    if (form.annualRate && (Number(form.annualRate) <= 0 || Number(form.annualRate) > 100)) errs.annualRate = 'Rate must be 0-100';
    if (form.timeYears && Number(form.timeYears) <= 0) errs.timeYears = 'Time must be > 0';
    
    return errs;
  }, [form]);

  const result = useMemo(() => calculateSip(form), [form]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={calculatorStyles.screenSafeArea}>
      <CalculatorHeader onBackPress={() => router.back()} title="SIP Calculator" />

      <ScrollView 
        contentContainerStyle={calculatorStyles.screenContent}
        showsVerticalScrollIndicator={false}
      >
        <CalculatorInputField
          keyboardType="decimal-pad"
          label={sipFieldLabels.monthlyInvestment}
          onChangeText={(value) => {
            const num = Number(value) || 0;
            if (num > 100000000) return; // Max 10 Crores monthly
            setForm((current) => ({ ...current, monthlyInvestment: value }));
          }}
          placeholder="0"
          value={form.monthlyInvestment}
          error={errors.monthlyInvestment}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={sipFieldLabels.annualRate}
          onChangeText={(value) => {
            const num = Number(value) || 0;
            if (num > 50) return; // Max 50%
            setForm((current) => ({ ...current, annualRate: value }));
          }}
          placeholder="0"
          value={form.annualRate}
          infoText="Expected annual return rate (Max 50%)"
          error={errors.annualRate}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={sipFieldLabels.timeYears}
          onChangeText={(value) => {
            const num = Number(value) || 0;
            if (num > 50) return; // Max 50 years
            setForm((current) => ({ ...current, timeYears: value }));
          }}
          placeholder="0"
          value={form.timeYears}
          infoText="Time period in years (Max 50 years)"
          error={errors.timeYears}
        />

        <CalculatorSummaryCard
          items={[
            { label: 'Monthly Investment', value: `Rs ${result.monthlyInvestment.toFixed(2)}` },
            { label: 'Expected Return', value: `${result.annualRate.toFixed(2)}%` },
            { label: 'Time Period', value: `${formatYears(result.timeYears)} Years` },
            { label: 'Total Investment', value: `Rs ${result.totalInvestment.toFixed(2)}` },
            { label: 'Estimated Returns', value: `Rs ${result.estimatedReturns.toFixed(2)}` },
            { label: 'Future Value', value: `Rs ${result.futureValue.toFixed(2)}` },
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
