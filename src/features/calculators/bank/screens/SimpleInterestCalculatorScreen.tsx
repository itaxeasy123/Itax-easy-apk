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

  const errors = useMemo(() => {
    const errs: Record<keyof SimpleInterestCalculatorInput, string> = {
      principal: '',
      rate: '',
      time: '',
    };
    
    if (form.principal && Number(form.principal) <= 0) errs.principal = 'Principal must be > 0';
    if (form.rate && (Number(form.rate) <= 0 || Number(form.rate) > 100)) errs.rate = 'Rate must be 0-100';
    if (form.time && Number(form.time) <= 0) errs.time = 'Time must be > 0';
    
    return errs;
  }, [form]);

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
              principal: value,
            }))
          }
          placeholder="0"
          value={form.principal}
          error={errors.principal}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={simpleInterestFieldLabels.rate}
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
          label={simpleInterestFieldLabels.time}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              time: value,
            }))
          }
          placeholder="0"
          value={form.time}
          error={errors.time}
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
