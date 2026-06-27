import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculatorStyles } from '../../../../theme';
import { calculateFd } from '../../../../utils/calculations/fd';
import { formatYears } from '../../../../utils/formatters';
import CalculatorHeader from '../../components/CalculatorHeader';
import CalculatorInputField from '../../components/CalculatorInputField';
import CalculatorSummaryCard from '../../components/CalculatorSummaryCard';
import { fdFieldLabels } from '../data/fdFields';
import { FixedDepositCalculatorInput } from '../types/fd.types';

export default function FdCalculatorScreen() {
  const router = useRouter();
  const [form, setForm] = useState<FixedDepositCalculatorInput>({
    principal: '0',
    rate: '0',
    timeYears: '0',
  });

  const errors = useMemo(() => {
    const errs: Record<keyof FixedDepositCalculatorInput, string> = {
      principal: '',
      rate: '',
      timeYears: '',
    };
    
    if (form.principal && Number(form.principal) <= 0) errs.principal = 'Must be > 0';
    if (form.rate && (Number(form.rate) <= 0 || Number(form.rate) > 100)) errs.rate = 'Rate must be 0-100';
    if (form.timeYears && Number(form.timeYears) <= 0) errs.timeYears = 'Time must be > 0';
    
    return errs;
  }, [form]);

  const result = useMemo(() => calculateFd(form), [form]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={calculatorStyles.screenSafeArea}>
      <CalculatorHeader onBackPress={() => router.back()} title="FD Calculator" />

      <ScrollView 
        contentContainerStyle={calculatorStyles.screenContent}
        showsVerticalScrollIndicator={false}
      >
        <CalculatorInputField
          keyboardType="decimal-pad"
          label={fdFieldLabels.principal}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              principal: value,
            }))
          }
          placeholder="0"
          value={form.principal}
          error={errors.principal}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={fdFieldLabels.rate}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              rate: value,
            }))
          }
          placeholder="0"
          value={form.rate}
          error={errors.rate}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={fdFieldLabels.timeYears}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              timeYears: value,
            }))
          }
          placeholder="0"
          value={form.timeYears}
          error={errors.timeYears}
        />

        <CalculatorSummaryCard
          items={[
            { label: 'Principal Amount', value: `Rs ${result.principal.toFixed(2)}` },
            { label: 'Interest Rate', value: `${result.rate.toFixed(2)}%` },
            { label: 'Time Period', value: `${formatYears(result.timeYears)} Years` },
            { label: 'Interest Earned', value: `Rs ${result.interestEarned.toFixed(2)}` },
            { label: 'Maturity Amount', value: `Rs ${result.maturityAmount.toFixed(2)}` },
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
