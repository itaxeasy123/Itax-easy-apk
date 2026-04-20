import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculatorStyles } from '../../../../theme';
import { calculateEmi } from '../../../../utils/calculations/emi';
import { formatYears } from '../../../../utils/formatters';
import CalculatorHeader from '../../components/CalculatorHeader';
import CalculatorInputField from '../../components/CalculatorInputField';
import CalculatorSummaryCard from '../../components/CalculatorSummaryCard';
import { emiFieldLabels } from '../data/emiFields';
import { EmiCalculatorInput } from '../types/emi.types';

export default function EmiCalculatorScreen() {
  const router = useRouter();
  const [form, setForm] = useState<EmiCalculatorInput>({
    annualRate: '0',
    principal: '0',
    tenureYears: '0',
  });

  const result = useMemo(() => calculateEmi(form), [form]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={calculatorStyles.screenSafeArea}>
      <CalculatorHeader onBackPress={() => router.back()} title="EMI Calculator" />

      <View style={calculatorStyles.screenContent}>
        <CalculatorInputField
          keyboardType="decimal-pad"
          label={emiFieldLabels.principal}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              principal: value.replace(/[^0-9.]/g, ''),
            }))
          }
          placeholder="0"
          value={form.principal}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={emiFieldLabels.annualRate}
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
          label={emiFieldLabels.tenureYears}
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
            { label: 'Loan Amount', value: `Rs ${result.principal.toFixed(2)}` },
            { label: 'Interest Rate', value: `${result.rate.toFixed(2)}%` },
            { label: 'Tenure', value: `${formatYears(result.tenureYears)} Years` },
            { label: 'Monthly EMI', value: `Rs ${result.emi.toFixed(2)}` },
            { label: 'Total Interest', value: `Rs ${result.totalInterest.toFixed(2)}` },
            { label: 'Total Payment', value: `Rs ${result.totalPayment.toFixed(2)}` },
          ]}
        />
      </View>
    </SafeAreaView>
  );
}
