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

function cycleValue<T>(items: T[], current: T) {
  const index = items.indexOf(current);
  return items[(index + 1) % items.length];
}

export default function GstCalculatorScreen() {
  const router = useRouter();
  const [form, setForm] = useState<GstCalculatorInput>({
    amount: '3000',
    mode: 'inclusive',
    rate: 5,
  });

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
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              amount: value.replace(/[^0-9.]/g, ''),
            }))
          }
          placeholder="0"
          value={form.amount}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label="GST Rate: (%)"
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              rate: Number(value.replace(/[^0-9.]/g, '') || 0) as GstRateOption,
            }))
          }
          placeholder="5"
          value={form.rate ? String(form.rate) : ''}
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
