import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculatorStyles } from '../../../theme';
import CalculatorHeader from '../../calculators/components/CalculatorHeader';
import CalculatorInputField from '../../calculators/components/CalculatorInputField';
import CalculatorSelectField from '../../calculators/components/CalculatorSelectField';
import CalculatorSummaryCard from '../../calculators/components/CalculatorSummaryCard';
import { calculateIncomeTax } from '../services/taxCalculator.service';
import { TaxInput } from '../models/taxCalculator.types';

const formatINR = (value: number) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

export default function TaxCalculatorScreen() {
  const router = useRouter();
  const [form, setForm] = useState<TaxInput>({
    advanceTax: 0,
    deductions: 0,
    regime: 'new',
    salary: 0,
    otherIncome: 0,
    tds: 0,
  });

  const result = useMemo(() => calculateIncomeTax(form), [form]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={calculatorStyles.screenSafeArea}>
      <CalculatorHeader onBackPress={() => router.back()} title="Tax Calculator" />

      <ScrollView
        contentContainerStyle={calculatorStyles.screenContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={calculatorStyles.fieldLabel}>Income Details</Text>

        <CalculatorInputField
          keyboardType="decimal-pad"
          label="Salary"
          placeholder="0"
          value={String(form.salary)}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              salary: Number(value.replace(/[^0-9.]/g, '')) || 0,
            }))
          }
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label="Other Income"
          placeholder="0"
          value={String(form.otherIncome)}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              otherIncome: Number(value.replace(/[^0-9.]/g, '')) || 0,
            }))
          }
        />

        {/* <Text style={[calculatorStyles.fieldLabel, { marginTop: 14 }]}>Deductions</Text> */}

        <CalculatorInputField
          keyboardType="decimal-pad"
          label="Total Deductions"
          placeholder="0"
          value={String(form.deductions)}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              deductions: Number(value.replace(/[^0-9.]/g, '')) || 0,
            }))
          }
        />

        {/* <Text style={[calculatorStyles.fieldLabel, { marginTop: 14 }]}>Tax Paid</Text> */}

        <CalculatorInputField
          keyboardType="decimal-pad"
          label="TDS"
          placeholder="0"
          value={String(form.tds)}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              tds: Number(value.replace(/[^0-9.]/g, '')) || 0,
            }))
          }
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label="Advance Tax"
          placeholder="0"
          value={String(form.advanceTax)}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              advanceTax: Number(value.replace(/[^0-9.]/g, '')) || 0,
            }))
          }
        />

        <CalculatorSelectField
          label="Tax Regime"
          value={form.regime === 'new' ? 'New Regime' : 'Old Regime'}
          onPress={() =>
            setForm((current) => ({
              ...current,
              regime: current.regime === 'new' ? 'old' : 'new',
            }))
          }
        />

        <CalculatorSummaryCard
          items={[
            { label: 'Gross Income', value: formatINR(result.grossIncome) },
            { label: 'Taxable Income', value: formatINR(result.taxableIncome) },
            { label: 'Tax', value: formatINR(result.tax) },
            { label: 'Rebate', value: formatINR(result.rebate) },
            { label: 'Surcharge', value: formatINR(result.surcharge) },
            { label: 'Cess (4%)', value: formatINR(result.cess) },
            { label: 'Total Tax', value: formatINR(result.totalTax) },
            { label: 'Paid', value: formatINR(result.totalPaid) },
            { label: 'Net Payable', value: formatINR(result.netPayable) },
            { label: 'Refund', value: formatINR(result.refund) },
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
