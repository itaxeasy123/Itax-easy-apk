import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculatorStyles } from '../../../../theme';
import { calculateDepreciation } from '../../../../utils/calculations/depreciation';
import CalculatorHeader from '../../components/CalculatorHeader';
import CalculatorInputField from '../../components/CalculatorInputField';
import CalculatorSummaryCard from '../../components/CalculatorSummaryCard';
import { depreciationFieldLabels } from '../data/depreciationFields';
import { DepreciationCalculatorInput } from '../types/depreciation.types';

export default function DepreciationCalculatorScreen() {
  const router = useRouter();
  const [form, setForm] = useState<DepreciationCalculatorInput>({
    purchasePrice: '0',
    scrapValue: '0',
    usefulLife: '0',
  });

  const result = useMemo(() => calculateDepreciation(form), [form]);

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={calculatorStyles.screenSafeArea}
    >
      <CalculatorHeader
        onBackPress={() => router.back()}
        title="Depreciation Calculator"
      />

      <View style={calculatorStyles.screenContent}>
        <CalculatorInputField
          keyboardType="decimal-pad"
          label={depreciationFieldLabels.purchasePrice}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              purchasePrice: value.replace(/[^0-9.]/g, ''),
            }))
          }
          placeholder="0"
          value={form.purchasePrice}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={depreciationFieldLabels.scrapValue}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              scrapValue: value.replace(/[^0-9.]/g, ''),
            }))
          }
          placeholder="0"
          value={form.scrapValue}
        />

        <CalculatorInputField
          keyboardType="number-pad"
          label={depreciationFieldLabels.usefulLife}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              usefulLife: value.replace(/[^0-9]/g, ''),
            }))
          }
          placeholder="0"
          value={form.usefulLife}
        />

        <CalculatorSummaryCard
          items={[
            {
              label: 'Depreciable Amount',
              value: `Rs ${result.depreciableAmount.toFixed(2)}`,
            },
            {
              label: 'Annual Depreciation',
              value: `Rs ${result.annualDepreciation.toFixed(2)}`,
            },
            {
              label: 'Monthly Depreciation',
              value: `Rs ${result.monthlyDepreciation.toFixed(2)}`,
            },
            {
              label: 'Remaining Value',
              value: `Rs ${result.remainingValue.toFixed(2)}`,
            },
          ]}
        />
      </View>
    </SafeAreaView>
  );
}
