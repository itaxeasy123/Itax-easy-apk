import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculatorStyles, calculatorTheme, colors } from '../../../../theme';
import { calculateHra } from '../../../../utils/calculations/hra';
import CalculatorHeader from '../../components/CalculatorHeader';
import CalculatorInputField from '../../components/CalculatorInputField';
import CalculatorSummaryCard from '../../components/CalculatorSummaryCard';
import { hraFieldLabels } from '../data/hraFields';
import { HraCalculatorInput } from '../types/hra.types';

export default function HraCalculatorScreen() {
  const router = useRouter();
  const [form, setForm] = useState<HraCalculatorInput>({
    basicSalary: '0',
    dearnessAllowance: '0',
    hraReceived: '0',
    isMetroCity: false,
    otherAllowances: '0',
    rentPaid: '0',
  });

  const errors = useMemo(() => {
    const errs: Record<keyof HraCalculatorInput, string> = {
      basicSalary: '',
      dearnessAllowance: '',
      hraReceived: '',
      isMetroCity: '',
      otherAllowances: '',
      rentPaid: '',
    };
    
    if (form.basicSalary && Number(form.basicSalary) <= 0) errs.basicSalary = 'Basic salary must be > 0';
    if (form.hraReceived && Number(form.hraReceived) <= 0) errs.hraReceived = 'HRA must be > 0';
    if (form.rentPaid && Number(form.rentPaid) <= 0) errs.rentPaid = 'Rent must be > 0';
    
    return errs;
  }, [form]);

  const result = useMemo(() => calculateHra(form), [form]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={calculatorStyles.screenSafeArea}>
      <CalculatorHeader onBackPress={() => router.back()} title="HRA Calculator" />

      <ScrollView 
        contentContainerStyle={calculatorStyles.screenContent}
        showsVerticalScrollIndicator={false}
      >
        <CalculatorInputField
          keyboardType="decimal-pad"
          label={hraFieldLabels.basicSalary}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              basicSalary: value,
            }))
          }
          placeholder="0"
          value={form.basicSalary}
          error={errors.basicSalary}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={hraFieldLabels.hraReceived}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              hraReceived: value,
            }))
          }
          placeholder="0"
          value={form.hraReceived}
          error={errors.hraReceived}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={hraFieldLabels.rentPaid}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              rentPaid: value,
            }))
          }
          placeholder="0"
          value={form.rentPaid}
          error={errors.rentPaid}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={hraFieldLabels.dearnessAllowance}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              dearnessAllowance: value,
            }))
          }
          placeholder="0"
          value={form.dearnessAllowance}
          error={errors.dearnessAllowance}
        />

        <CalculatorInputField
          keyboardType="decimal-pad"
          label={hraFieldLabels.otherAllowances}
          onChangeText={(value) =>
            setForm((current) => ({
              ...current,
              otherAllowances: value,
            }))
          }
          placeholder="0"
          value={form.otherAllowances}
          error={errors.otherAllowances}
        />

        <Pressable
          onPress={() =>
            setForm((current) => ({
              ...current,
              isMetroCity: !current.isMetroCity,
            }))
          }
          style={[
            styles.metroToggle,
            form.isMetroCity && styles.metroToggleActive,
          ]}
        >
          <View
            style={[
              styles.metroCheckbox,
              form.isMetroCity && styles.metroCheckboxActive,
            ]}
          >
            {form.isMetroCity ? (
              <Ionicons color={colors.white} name="checkmark" size={14} />
            ) : null}
          </View>
          <Text style={styles.metroLabel}>Living in Metro City</Text>
        </Pressable>

        <CalculatorSummaryCard
          items={[
            { label: 'Basic Salary', value: `Rs ${result.basicSalary.toFixed(2)}` },
            { label: 'HRA Received', value: `Rs ${result.hraReceived.toFixed(2)}` },
            { label: 'Rent Paid', value: `Rs ${result.rentPaid.toFixed(2)}` },
            {
              label: 'Dearness Allowance',
              value: `Rs ${result.dearnessAllowance.toFixed(2)}`,
            },
            { label: 'Metro City', value: result.isMetroCity ? 'Yes' : 'No' },
            { label: 'HRA Exemption', value: `Rs ${result.hraExemption.toFixed(2)}` },
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  metroToggle: {
    alignItems: 'center',
    backgroundColor: '#F6FAFF',
    borderColor: calculatorTheme.fieldBorder,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 12,
    minHeight: 52,
    paddingHorizontal: 12,
  },
  metroToggleActive: {
    backgroundColor: '#EAF2FF',
  },
  metroCheckbox: {
    alignItems: 'center',
    borderColor: '#AEBACC',
    borderRadius: 4,
    borderWidth: 1,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  metroCheckboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  metroLabel: {
    color: '#455468',
    fontSize: 13,
    marginLeft: 8,
  },
});
