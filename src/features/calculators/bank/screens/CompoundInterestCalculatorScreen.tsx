import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculatorStyles } from '../../../../theme';
import { calculateCompoundInterest } from '../../../../utils/calculations/compoundInterest';
import { formatYears } from '../../../../utils/formatters';
import CalculatorHeader from '../../components/CalculatorHeader';
import CalculatorInputField from '../../components/CalculatorInputField';
import CalculatorSummaryCard from '../../components/CalculatorSummaryCard';
import { compoundInterestFieldLabels } from '../data/compoundInterestFields';
import { CompoundInterestCalculatorInput } from '../types/compoundInterest.types';

export default function CompoundInterestCalculatorScreen() {
  const router = useRouter();
  const [form, setForm] = useState<CompoundInterestCalculatorInput>({
    frequency: '0',
    principal: '0',
    rate: '0',
    time: '0',
  });

  const result = useMemo(() => calculateCompoundInterest(form), [form]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={calculatorStyles.screenSafeArea}>
      <CalculatorHeader
        onBackPress={() => router.back()}
        title="Compound Interest Calculator"
      />

      <View style={calculatorStyles.screenContent}>
        <CalculatorInputField
          keyboardType="decimal-pad"
          label={compoundInterestFieldLabels.principal}
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
          label={compoundInterestFieldLabels.rate}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              rate: value.replace(/[^0-9.]/g, ''),
            }))
          }
          placeholder="0"
          value={form.rate}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={compoundInterestFieldLabels.time}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              time: value.replace(/[^0-9.]/g, ''),
            }))
          }
          placeholder="0"
          value={form.time}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={compoundInterestFieldLabels.frequency}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              frequency: value.replace(/[^0-9.]/g, ''),
            }))
          }
          placeholder="0"
          value={form.frequency}
        />

        <CalculatorSummaryCard
          items={[
            { label: 'Principal', value: `Rs ${result.principal.toFixed(2)}` },
            { label: 'Interest', value: `Rs ${result.interest.toFixed(2)}` },
            { label: 'Frequency', value: `${result.frequency.toFixed(2)} / year` },
            { label: 'Tenure', value: `${formatYears(result.time)} Years` },
            { label: 'Total Interest', value: `Rs ${result.interest.toFixed(2)}` },
            { label: 'Final Amount', value: `Rs ${result.finalAmount.toFixed(2)}` },
          ]}
        />
      </View>
    </SafeAreaView>
  );
}
