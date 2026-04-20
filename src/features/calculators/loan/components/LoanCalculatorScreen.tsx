import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculatorStyles } from '../../../../theme';
import { calculateLoan } from '../../../../utils/calculations/loan';
import { formatYears } from '../../../../utils/formatters';
import CalculatorHeader from '../../components/CalculatorHeader';
import CalculatorInputField from '../../components/CalculatorInputField';
import CalculatorSummaryCard from '../../components/CalculatorSummaryCard';
import {
  LoanCalculatorInput,
  LoanCalculatorScreenConfig,
} from '../types/loan.types';

type LoanCalculatorScreenProps = LoanCalculatorScreenConfig;

export default function LoanCalculatorScreen({
  amountLabel,
  rateLabel,
  tenureLabel,
  title,
}: LoanCalculatorScreenProps) {
  const router = useRouter();
  const [form, setForm] = useState<LoanCalculatorInput>({
    annualRate: '0',
    loanAmount: '0',
    tenureYears: '0',
  });

  const result = useMemo(() => calculateLoan(form), [form]);

  const rateFieldLabel = rateLabel;
  const amountFieldLabel = amountLabel;
  const tenureFieldLabel = tenureLabel;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={calculatorStyles.screenSafeArea}>
      <CalculatorHeader onBackPress={() => router.back()} title={title} />

      <View style={calculatorStyles.screenContent}>
        <CalculatorInputField
          keyboardType="decimal-pad"
          label={amountFieldLabel}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              loanAmount: value.replace(/[^0-9.]/g, ''),
            }))
          }
          placeholder="0"
          value={form.loanAmount}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={rateFieldLabel}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              annualRate: value.replace(/[^0-9.]/g, ''),
            }))
          }
          placeholder="0"
          value={form.annualRate}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={tenureFieldLabel}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              tenureYears: value.replace(/[^0-9.]/g, ''),
            }))
          }
          placeholder="0"
          value={form.tenureYears}
        />

        <CalculatorSummaryCard
          items={[
            { label: 'Loan Amount', value: `Rs ${result.loanAmount.toFixed(2)}` },
            { label: 'Interest Rate', value: `${result.annualRate.toFixed(2)}%` },
            { label: 'Tenure', value: `${formatYears(result.tenureYears)} Years` },
            { label: 'Monthly EMI', value: `Rs ${result.monthlyEmi.toFixed(2)}` },
            { label: 'Total Interest', value: `Rs ${result.totalInterest.toFixed(2)}` },
            { label: 'Total Payment', value: `Rs ${result.totalPayment.toFixed(2)}` },
          ]}
        />
      </View>
    </SafeAreaView>
  );
}
