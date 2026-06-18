import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculatorStyles } from '../../../../theme';
import { calculateCapitalGain } from '../../../../utils/calculations/capitalGain';
import CalculatorHeader from '../../components/CalculatorHeader';
import CalculatorInputField from '../../components/CalculatorInputField';
import CalculatorSelectField from '../../components/CalculatorSelectField';
import CalculatorSummaryCard from '../../components/CalculatorSummaryCard';
import { capitalGainFieldLabels } from '../data/capitalGainFields';
import { CapitalGainCalculatorInput } from '../types/capitalGain.types';

export default function CapitalGainCalculatorScreen() {
  const router = useRouter();
  const [form, setForm] = useState<CapitalGainCalculatorInput>({
    purchasePrice: '0',
    salePrice: '0',
    assetType: 'equity',
    holdingPeriod: 'short',
  });

  const errors = useMemo(() => {
    const errs: Record<keyof CapitalGainCalculatorInput, string> = {
      purchasePrice: '',
      salePrice: '',
      assetType: '',
      holdingPeriod: '',
    };
    
    if (form.purchasePrice && Number(form.purchasePrice) <= 0) errs.purchasePrice = 'Must be > 0';
    if (form.salePrice && Number(form.salePrice) <= 0) errs.salePrice = 'Must be > 0';
    
    return errs;
  }, [form]);

  const result = useMemo(() => calculateCapitalGain(form), [form]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={calculatorStyles.screenSafeArea}>
      <CalculatorHeader
        onBackPress={() => router.back()}
        title="Capital Gain Calculator"
      />

      <ScrollView 
        contentContainerStyle={calculatorStyles.screenContent}
        showsVerticalScrollIndicator={false}
      >
        <CalculatorInputField
          keyboardType="decimal-pad"
          label={capitalGainFieldLabels.purchasePrice}
          onChangeText={(value) => {
            const num = Number(value) || 0;
            if (num > 1000000000) return;
            setForm((current) => ({ ...current, purchasePrice: value }));
          }}
          placeholder="0"
          value={form.purchasePrice}
          error={errors.purchasePrice}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={capitalGainFieldLabels.salePrice}
          onChangeText={(value) => {
            const num = Number(value) || 0;
            if (num > 1000000000) return;
            setForm((current) => ({ ...current, salePrice: value }));
          }}
          placeholder="0"
          value={form.salePrice}
          error={errors.salePrice}
        />

        <CalculatorSelectField
          label="Asset Type"
          value={form.assetType === 'equity' ? 'Equity (Shares/MF)' : 'Property/Gold'}
          onPress={() =>
            setForm((current) => ({
              ...current,
              assetType: current.assetType === 'equity' ? 'property' : 'equity',
            }))
          }
        />

        <CalculatorSelectField
          label="Holding Period"
          value={form.holdingPeriod === 'short' ? 'Short Term' : 'Long Term'}
          onPress={() =>
            setForm((current) => ({
              ...current,
              holdingPeriod: current.holdingPeriod === 'short' ? 'long' : 'short',
            }))
          }
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
      </ScrollView>
    </SafeAreaView>
  );
}
