import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculatorStyles } from '../../../../theme';
import { calculateGst } from '../../../../utils/calculations/gst';
import CalculatorHeader from '../../components/CalculatorHeader';
import CalculatorInputField from '../../components/CalculatorInputField';
import CalculatorSelectField from '../../components/CalculatorSelectField';
import CalculatorSummaryCard from '../../components/CalculatorSummaryCard';
import {
  GstCalculatorInput,
  GstMode,
  GstRateOption,
} from '../types/gst.types';

const GST_MODES: { label: string; value: GstMode }[] = [
  { label: 'Exclusive GST', value: 'exclusive' },
  { label: 'Inclusive GST', value: 'inclusive' },
];

const GST_RATES: GstRateOption[] = [3, 5, 12, 18, 28];

function cycleValue<T>(items: T[], current: T) {
  const index = items.indexOf(current);
  return items[(index + 1) % items.length];
}

export default function GstCalculatorScreen() {
  const router = useRouter();
  const [form, setForm] = useState<GstCalculatorInput>({
    amount: '0',
    mode: 'inclusive',
    rate: 5,
  });

  const errors = useMemo(() => {
    const errs: Record<keyof GstCalculatorInput, string> = {
      amount: '',
      mode: '',
      rate: '',
    };
    
    if (form.amount && Number(form.amount) <= 0) errs.amount = 'Amount must be > 0';
    
    return errs;
  }, [form]);

  const result = useMemo(() => calculateGst(form), [form]);
  const selectedMode = GST_MODES.find((item) => item.value === form.mode);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={calculatorStyles.screenSafeArea}>
      <CalculatorHeader onBackPress={() => router.back()} title="GST Calculator" />

      <View style={calculatorStyles.screenContent}>
        <CalculatorSelectField
          label="GST Type:"
          onPress={() =>
            setForm((current) => ({
              ...current,
              mode: cycleValue(
                GST_MODES.map((item) => item.value),
                current.mode
              ),
            }))
          }
          value={selectedMode?.label ?? ''}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label="Amount: (Rs)"
          onChangeText={(value) => {
            const num = Number(value) || 0;
            if (num > 1000000000) return;
            setForm((current) => ({ ...current, amount: value }));
          }}
          placeholder="0"
          value={form.amount}
          error={errors.amount}
        />

        <CalculatorSelectField
          label="GST Rate:"
          onPress={() =>
            setForm((current) => ({
              ...current,
              rate: cycleValue(GST_RATES, current.rate),
            }))
          }
          value={`${form.rate}%`}
        />

        <CalculatorSummaryCard
          items={[
            { label: 'Actual Amount', value: `Rs ${result.baseAmount.toFixed(2)}` },
            { label: 'GST Amount', value: `Rs ${result.gstAmount.toFixed(2)}` },
            { label: 'Post GST Amount', value: `Rs ${result.totalAmount.toFixed(2)}` },
          ]}
        />
      </View>
    </SafeAreaView>
  );
}
