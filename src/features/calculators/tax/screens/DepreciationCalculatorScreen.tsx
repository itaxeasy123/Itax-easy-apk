import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
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

  const errors = useMemo(() => {
    const errs: Record<keyof DepreciationCalculatorInput, string> = {
      purchasePrice: '',
      scrapValue: '',
      usefulLife: '',
    };
    
    if (form.purchasePrice && Number(form.purchasePrice) <= 0) errs.purchasePrice = 'Must be > 0';
    if (form.scrapValue && Number(form.scrapValue) < 0) errs.scrapValue = 'Cannot be negative';
    if (form.usefulLife && Number(form.usefulLife) <= 0) errs.usefulLife = 'Life must be > 0';
    
    return errs;
  }, [form]);

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

      <ScrollView 
        contentContainerStyle={calculatorStyles.screenContent}
        showsVerticalScrollIndicator={false}
      >
        <CalculatorInputField
          keyboardType="decimal-pad"
          label={depreciationFieldLabels.purchasePrice}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              purchasePrice: value,
            }))
          }
          placeholder="0"
          value={form.purchasePrice}
          error={errors.purchasePrice}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={depreciationFieldLabels.scrapValue}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              scrapValue: value,
            }))
          }
          placeholder="0"
          value={form.scrapValue}
          error={errors.scrapValue}
        />

        <CalculatorInputField
          keyboardType="number-pad"
          label={depreciationFieldLabels.usefulLife}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              usefulLife: value,
            }))
          }
          placeholder="0"
          value={form.usefulLife}
          error={errors.usefulLife}
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
      </ScrollView>
    </SafeAreaView>
  );
}
