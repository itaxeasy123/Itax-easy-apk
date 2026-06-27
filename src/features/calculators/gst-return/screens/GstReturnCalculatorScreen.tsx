import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculatorStyles, calculatorTheme, colors } from '../../../../theme';
import { calculateGstReturn } from '../../../../utils/calculations/gstReturn';
import CalculatorHeader from '../../components/CalculatorHeader';
import CalculatorInputField from '../../components/CalculatorInputField';
import CalculatorSummaryCard from '../../components/CalculatorSummaryCard';
import { gstReturnFieldLabels } from '../data/gstReturnFields';
import { GstReturnCalculatorInput } from '../types/gstReturn.types';

export default function GstReturnCalculatorScreen() {
  const router = useRouter();
  const [form, setForm] = useState<GstReturnCalculatorInput>({
    inputTaxCredit: '0',
    outputRate: '0',
    taxableSales: '0',
  });

  const errors = useMemo(() => {
    const errs: Record<keyof GstReturnCalculatorInput, string> = {
      inputTaxCredit: '',
      outputRate: '',
      taxableSales: '',
    };
    
    if (form.taxableSales && Number(form.taxableSales) <= 0) errs.taxableSales = 'Sales must be > 0';
    if (form.outputRate && (Number(form.outputRate) <= 0 || Number(form.outputRate) > 100)) errs.outputRate = 'Rate must be 0-100';
    if (form.inputTaxCredit && Number(form.inputTaxCredit) < 0) errs.inputTaxCredit = 'ITC cannot be negative';
    
    return errs;
  }, [form]);

  const result = useMemo(() => calculateGstReturn(form), [form]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={calculatorStyles.screenSafeArea}>
      <CalculatorHeader onBackPress={() => router.back()} title="GST Return Calculator" />

      <View style={calculatorStyles.screenContent}>
        <CalculatorInputField
          keyboardType="decimal-pad"
          label={gstReturnFieldLabels.taxableSales}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              taxableSales: value,
            }))
          }
          placeholder="0"
          value={form.taxableSales}
          error={errors.taxableSales}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={gstReturnFieldLabels.outputRate}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              outputRate: value,
            }))
          }
          placeholder="0"
          value={form.outputRate}
          error={errors.outputRate}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={gstReturnFieldLabels.inputTaxCredit}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              inputTaxCredit: value,
            }))
          }
          placeholder="0"
          value={form.inputTaxCredit}
          error={errors.inputTaxCredit}
        />


        <CalculatorSummaryCard
          items={[
            { label: 'Taxable Sales', value: `Rs ${result.taxableSales.toFixed(2)}` },
            { label: 'Output GST Rate', value: `${result.outputRate.toFixed(2)}%` },
            { label: 'Output GST', value: `Rs ${result.outputGst.toFixed(2)}` },
            { label: 'Input Tax Credit', value: `Rs ${result.inputTaxCredit.toFixed(2)}` },
            { label: 'Net Payable', value: `Rs ${result.netPayable.toFixed(2)}` },
            { label: 'Refundable Amount', value: `Rs ${result.refundableAmount.toFixed(2)}` },
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  chartWrap: {
    alignItems: 'center',
    marginTop: 14,
  },
  chartOuter: {
    alignItems: 'center',
    backgroundColor: calculatorTheme.chartTrack,
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 72,
  },
  chartBlueArcTop: {
    backgroundColor: calculatorTheme.chartFill,
    borderTopRightRadius: 36,
    height: 22,
    position: 'absolute',
    right: 0,
    top: 16,
    width: 16,
  },
  chartBlueArcBottom: {
    backgroundColor: calculatorTheme.chartFill,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    bottom: 0,
    height: 34,
    position: 'absolute',
    right: 0,
    width: 34,
  },
  chartInner: {
    backgroundColor: colors.white,
    borderRadius: 19,
    height: 38,
    width: 38,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  legendDot: {
    borderRadius: 4,
    height: 7,
    marginRight: 4,
    width: 7,
  },
  legendDotOutput: {
    backgroundColor: calculatorTheme.chartFill,
  },
  legendDotCredit: {
    backgroundColor: calculatorTheme.chartTrack,
  },
  legendText: {
    color: calculatorTheme.legendText,
    fontSize: 8,
  },
});
