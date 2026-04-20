import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculatorStyles } from '../../../../theme';
import { calculateSimpleInterest } from '../../../../utils/calculations/simpleInterest';
import { formatYears } from '../../../../utils/formatters';
import CalculatorHeader from '../../components/CalculatorHeader';
import CalculatorInputField from '../../components/CalculatorInputField';
import CalculatorSummaryCard from '../../components/CalculatorSummaryCard';
import { simpleInterestFieldLabels } from '../data/simpleInterestFields';
import { SimpleInterestCalculatorInput } from '../types/simpleInterest.types';

export default function SimpleInterestCalculatorScreen() {
  const router = useRouter();
  const [form, setForm] = useState<SimpleInterestCalculatorInput>({
    principal: '0',
    rate: '0',
    time: '0',
  });

  const result = useMemo(() => calculateSimpleInterest(form), [form]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={calculatorStyles.screenSafeArea}>
      <CalculatorHeader
        onBackPress={() => router.back()}
        title="Simple Interest Calculator"
      />

      <View style={calculatorStyles.screenContent}>
        <CalculatorInputField
          keyboardType="decimal-pad"
          label={simpleInterestFieldLabels.principal}
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
          label={simpleInterestFieldLabels.rate}
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
          label={simpleInterestFieldLabels.time}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              time: value.replace(/[^0-9.]/g, ''),
            }))
          }
          placeholder="0"
          value={form.time}
        />

        <CalculatorSummaryCard
          items={[
            { label: 'Principal', value: `Rs ${result.principal.toFixed(2)}` },
            { label: 'Interest', value: `Rs ${result.interest.toFixed(2)}` },
            { label: 'Interest Rate', value: `${result.rate.toFixed(2)}%` },
            { label: 'Tenure', value: `${formatYears(result.time)} Years` },
            { label: 'Final Amount', value: `Rs ${result.finalAmount.toFixed(2)}` },
          ]}
        />
      </View>
    </SafeAreaView>
  );
}
