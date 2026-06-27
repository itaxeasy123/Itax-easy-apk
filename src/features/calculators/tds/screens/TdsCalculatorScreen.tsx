import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculatorStyles } from '../../../../theme';
import { calculateTds } from '../../../../utils/calculations/tds';
import { formatCurrency } from '../../../../utils/formatters';
import CalculatorHeader from '../../components/CalculatorHeader';
import CalculatorInputField from '../../components/CalculatorInputField';
import CalculatorSummaryCard from '../../components/CalculatorSummaryCard';
import TdsSelectField from '../components/TdsSelectField';
import {
  getTdsSectionRuleByKey,
  getTdsVariantOptions,
  tdsSectionRules,
} from '../data/tdsRules';
import { TdsCalculatorInput } from '../types/tds.types';

const panOptions = ['Yes', 'No'] as const;

export default function TdsCalculatorScreen() {
  const router = useRouter();
  const [form, setForm] = useState<TdsCalculatorInput>({
    panAvailable: 'Yes',
    paymentAmount: '0',
    sectionKey: tdsSectionRules[0].key,
    variantLabel: 'Default',
  });

  const sectionRule = useMemo(
    () => getTdsSectionRuleByKey(form.sectionKey) ?? tdsSectionRules[0],
    [form.sectionKey]
  );

  const variantOptions = useMemo(
    () => getTdsVariantOptions(form.sectionKey),
    [form.sectionKey]
  );

  useEffect(() => {
    if (!variantOptions.length) {
      if (form.variantLabel !== 'Default') {
        setForm((current) => ({ ...current, variantLabel: 'Default' }));
      }
      return;
    }

    if (!variantOptions.includes(form.variantLabel)) {
      setForm((current) => ({ ...current, variantLabel: variantOptions[0] }));
    }
  }, [form.variantLabel, variantOptions]);

  const errors = useMemo(() => {
    const errs: Record<keyof TdsCalculatorInput, string> = {
      panAvailable: '',
      paymentAmount: '',
      sectionKey: '',
      variantLabel: '',
    };
    
    if (form.paymentAmount && Number(form.paymentAmount) <= 0) errs.paymentAmount = 'Amount must be > 0';
    
    return errs;
  }, [form]);

  const result = useMemo(() => calculateTds(form), [form]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={calculatorStyles.screenSafeArea}>
      <CalculatorHeader onBackPress={() => router.back()} title="TDS Calculator" />

      <ScrollView
        contentContainerStyle={[calculatorStyles.screenContent, styles.content]}
        showsVerticalScrollIndicator={false}
      >
        <CalculatorInputField
          keyboardType="decimal-pad"
          label="Payment Amount: (Rs)"
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              paymentAmount: value,
            }))
          }
          placeholder="0"
          value={form.paymentAmount}
          error={errors.paymentAmount}
        />

        <TdsSelectField
          label="Nature of Payment / Section"
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              sectionKey: tdsSectionRules.find((rule) => rule.label === value)?.key ?? current.sectionKey,
              variantLabel: 'Default',
            }))
          }
          options={tdsSectionRules.map((rule) => rule.label)}
          value={sectionRule.label}
        />

        {variantOptions.length > 0 ? (
          <TdsSelectField
            label="Sub-type"
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                variantLabel: value,
              }))
            }
            options={variantOptions}
            value={form.variantLabel}
          />
        ) : null}

        <TdsSelectField
          label="PAN Available"
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              panAvailable: value as 'Yes' | 'No',
            }))
          }
          options={[...panOptions]}
          value={form.panAvailable}
        />

        <CalculatorSummaryCard
          items={[
            { label: 'Section', value: result.sectionLabel },
            { label: 'Section Rate', value: `${result.sectionRate.toFixed(2)}%` },
            { label: 'Threshold', value: result.thresholdLabel },
            { label: 'Taxable Amount', value: `Rs ${formatCurrency(result.taxableAmount)}` },
            { label: 'TDS Amount', value: `Rs ${formatCurrency(result.tdsAmount)}` },
            { label: 'Effective Rate', value: `${result.effectiveRate.toFixed(2)}%` },
            { label: 'Net Payable', value: `Rs ${formatCurrency(result.netPayable)}` },
          ]}
        />

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Calculator Note</Text>
          <Text style={styles.noteText}>{result.note}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E6EBF2',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  noteTitle: {
    color: '#22344A',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  noteText: {
    color: '#5A677A',
    fontSize: 11,
    lineHeight: 16,
  },
});
