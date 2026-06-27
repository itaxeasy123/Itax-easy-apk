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
    tdsSalary: 0,
    tdsNonSalary: 0,
    tdsOther: 0,
    exemptions: 0,
  });

  const errors = useMemo(() => {
    const errs: Record<keyof TaxInput, string> = {
      advanceTax: '',
      deductions: '',
      regime: '',
      salary: '',
      otherIncome: '',
      tdsSalary: '',
      tdsNonSalary: '',
      tdsOther: '',
      exemptions: '',
    };
    
    if (form.salary <= 0) errs.salary = 'Must be > 0';
    
    return errs;
  }, [form]);

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
          onChangeText={(value) => {
            const num = Number(value) || 0;
            if (num > 1000000000) return; // Max 100 Cr limit
            setForm((current) => ({ ...current, salary: num }));
          }}
          infoText="Gross Salary including all allowances"
          error={errors.salary}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label="Other Income"
          placeholder="0"
          value={String(form.otherIncome)}
          onChangeText={(value) => {
            const num = Number(value) || 0;
            if (num > 1000000000) return;
            setForm((current) => ({ ...current, otherIncome: num }));
          }}
          infoText="Interest, rental income, capital gains, etc."
          error={errors.otherIncome}
        />

        {/* <Text style={[calculatorStyles.fieldLabel, { marginTop: 14 }]}>Deductions</Text> */}

        <CalculatorInputField
          keyboardType="decimal-pad"
          label="Total Deductions"
          placeholder="0"
          value={form.regime === 'new' ? '0' : String(form.deductions)}
          editable={form.regime === 'old'}
          onChangeText={(value) => {
            const num = Number(value) || 0;
            if (num > 1000000000) return;
            setForm((current) => ({ ...current, deductions: num }));
          }}
          infoText={form.regime === 'new' ? "Deductions (except standard deduction) are mostly not allowed in New Regime" : "E.g. 80C, 80D, HRA"}
          error={errors.deductions}
        />

        {/* <Text style={[calculatorStyles.fieldLabel, { marginTop: 14 }]}>Tax Paid</Text> */}

        <CalculatorInputField
          keyboardType="decimal-pad"
          label="TDS"
          placeholder="0"
          value={String(form.tdsSalary)}
          onChangeText={(value) => {
            const num = Number(value) || 0;
            if (num > 1000000000) return;
            setForm((current) => ({ ...current, tdsSalary: num }));
          }}
          infoText="Tax already deducted at source by employer/bank"
          error={errors.tdsSalary}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label="Advance Tax"
          placeholder="0"
          value={String(form.advanceTax)}
          onChangeText={(value) => {
            const num = Number(value) || 0;
            if (num > 1000000000) return;
            setForm((current) => ({ ...current, advanceTax: num }));
          }}
          infoText="Tax paid directly by you in advance"
          error={errors.advanceTax}
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
