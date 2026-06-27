import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculatorStyles } from '../../../../theme';
import { calculateTax } from '../../../../utils/calculations/tax';
import CalculatorHeader from '../../components/CalculatorHeader';
import CalculatorInputField from '../../components/CalculatorInputField';
import CalculatorSummaryCard from '../../components/CalculatorSummaryCard';
import { taxFieldLabels } from '../data/taxFields';
import { TaxCalculatorInput } from '../types/tax.types';

export default function TaxCalculatorScreen() {
  const router = useRouter();

  const [form, setForm] = useState<TaxCalculatorInput>({
    income: '0',
    deductions: '0',
    taxpayerType: 'individual',
  });

  const errors = useMemo(() => {
    const errs: Record<keyof TaxCalculatorInput, string> = {
      income: '',
      deductions: '',
      taxpayerType: '',
    };
    
    if (form.income && Number(form.income) < 0) errs.income = 'Income cannot be negative';
    if (form.deductions && Number(form.deductions) < 0) errs.deductions = 'Deductions cannot be negative';
    
    return errs;
  }, [form]);

  const result = useMemo(() => calculateTax(form), [form]);

  return (
    <SafeAreaView style={calculatorStyles.screenSafeArea}>
      <CalculatorHeader
        onBackPress={() => router.back()}
        title="Tax Calculator"
      />

      <ScrollView 
        contentContainerStyle={calculatorStyles.screenContent} 
        showsVerticalScrollIndicator={false}
      >

        {/* Income */}
        <CalculatorInputField
          keyboardType="decimal-pad"
          label={taxFieldLabels.income}
          value={form.income}
          placeholder="0"
          onChangeText={(value) =>
            setForm((prev) => ({
              ...prev,
              income: value,
            }))
          }
          error={errors.income}
        />

        {/* Deductions */}
        <CalculatorInputField
          keyboardType="decimal-pad"
          label={taxFieldLabels.deductions}
          value={form.deductions}
          placeholder="0"
          onChangeText={(value) =>
            setForm((prev) => ({
              ...prev,
              deductions: value,
            }))
          }
          error={errors.deductions}
        />

        {/* Result */}
        <CalculatorSummaryCard
          items={[
            {
              label: 'Total Income',
              value: `Rs ${result.income.toFixed(2)}`,
            },
            {
              label: 'Deductions',
              value: `Rs ${result.deductions.toFixed(2)}`,
            },
            {
              label: 'Taxable Income',
              value: `Rs ${result.taxableIncome.toFixed(2)}`,
            },
            {
              label: 'Tax',
              value: `Rs ${result.tax.toFixed(2)}`,
            },
            {
              label: 'Cess (4%)',
              value: `Rs ${result.cess.toFixed(2)}`,
            },
            {
              label: 'Total Tax Payable',
              value: `Rs ${result.totalTax.toFixed(2)}`,
            },
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}