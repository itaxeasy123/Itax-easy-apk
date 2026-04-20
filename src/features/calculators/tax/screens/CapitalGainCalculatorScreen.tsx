import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculatorStyles } from '../../../../theme';
import { calculateCapitalGain } from '../../../../utils/calculations/capitalGain';
import CalculatorHeader from '../../components/CalculatorHeader';
import CalculatorInputField from '../../components/CalculatorInputField';
import CalculatorSummaryCard from '../../components/CalculatorSummaryCard';
import { capitalGainFieldLabels } from '../data/capitalGainFields';
import { CapitalGainCalculatorInput } from '../types/capitalGain.types';

export default function CapitalGainCalculatorScreen() {
  const router = useRouter();
  const [form, setForm] = useState<CapitalGainCalculatorInput>({
    purchasePrice: '0',
    salePrice: '0',
    taxRate: '0',
  });

  const result = useMemo(() => calculateCapitalGain(form), [form]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={calculatorStyles.screenSafeArea}>
      <CalculatorHeader
        onBackPress={() => router.back()}
        title="Capital Gain Calculator"
      />

      <View style={calculatorStyles.screenContent}>
        <CalculatorInputField
          keyboardType="decimal-pad"
          label={capitalGainFieldLabels.purchasePrice}
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
          label={capitalGainFieldLabels.salePrice}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              salePrice: value.replace(/[^0-9.]/g, ''),
            }))
          }
          placeholder="0"
          value={form.salePrice}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={capitalGainFieldLabels.taxRate}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              taxRate: value.replace(/[^0-9.]/g, ''),
            }))
          }
          placeholder="0"
          value={form.taxRate}
        />

        <CalculatorSummaryCard
          items={[
            {
              label: 'Purchase Price',
              value: `Rs ${result.purchasePrice.toFixed(2)}`,
            },
            {
              label: 'Sale Price',
              value: `Rs ${result.salePrice.toFixed(2)}`,
            },
            {
              label: 'Capital Gains Tax Rate',
              value: `${result.taxRate.toFixed(2)}%`,
            },
            {
              label: 'Total Capital Gains',
              value: `Rs ${result.totalCapitalGain.toFixed(2)}`,
            },
            {
              label: 'Tax Owed',
              value: `Rs ${result.taxOwed.toFixed(2)}`,
            },
          ]}
        />
      </View>
    </SafeAreaView>
  );
}
