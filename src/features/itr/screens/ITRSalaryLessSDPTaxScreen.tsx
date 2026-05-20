import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ITRBottomNav, ITRHeader, ITRSaveButton, MonthlyYearlyAmountField, type Frequency } from "../components";
import { itrColors, itrRadius, itrSpacing, itrShadows } from "../../../theme/itr";
import { useITRStore } from "../../../store/itrStore";

type FieldConfig = {
  id: string;
  label: string;
  value: string;
  frequency: Frequency;
};

const STANDARD_DEDUCTION = 75000; // Updated for AY 2026-27 New Regime

export default function ITRSalaryLessSDPTaxScreen() {
  const { salary, setSalary } = useITRStore();
  
  const [fields, setFields] = useState<FieldConfig[]>([
    { id: "basic-da", label: "Basic + DA (Dearness Allowance)", value: salary.basicDA, frequency: "Monthly" },
    { id: "hra", label: "HRA (House Rent Allowance)", value: salary.hra, frequency: "Monthly" },
    { id: "bonus", label: "Bonus Commission", value: salary.bonus, frequency: "Monthly" },
    { id: "other-allowance", label: "Other Allowance", value: salary.otherAllowance, frequency: "Monthly" },
    { id: "p-tax", label: "Professional Tax (P-Tax)", value: salary.pTax, frequency: "Yearly" },
  ]);

  const updateFieldValue = (id: string, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    setFields((current) =>
      current.map((field) => (field.id === id ? { ...field, value: cleanValue } : field)),
    );
  };

  const updateFrequency = (id: string, frequency: Frequency) => {
    setFields((current) =>
      current.map((field) => (field.id === id ? { ...field, frequency } : field)),
    );
  };

  // Calculations
  const calculations = useMemo(() => {
    let grossTotal = 0;
    let pTax = 0;

    fields.forEach((field) => {
      const amount = parseFloat(field.value) || 0;
      const yearlyAmount = field.frequency === "Monthly" ? amount * 12 : amount;

      if (field.id === "p-tax") {
        pTax = yearlyAmount;
      } else {
        grossTotal += yearlyAmount;
      }
    });

    const netSalary = Math.max(0, grossTotal - STANDARD_DEDUCTION - pTax);

    return {
      grossTotal,
      standardDeduction: STANDARD_DEDUCTION,
      pTax,
      netSalary,
    };
  }, [fields]);

  const handleSave = () => {
    setSalary({
      basicDA: fields.find(f => f.id === "basic-da")?.value || "",
      hra: fields.find(f => f.id === "hra")?.value || "",
      bonus: fields.find(f => f.id === "bonus")?.value || "",
      otherAllowance: fields.find(f => f.id === "other-allowance")?.value || "",
      pTax: fields.find(f => f.id === "p-tax")?.value || "",
      grossTotal: calculations.grossTotal,
      netSalary: calculations.netSalary,
    });
  };

  return (
    <View style={styles.screen}>
      <ITRHeader title="Salary Less SD & P Tax" titleVariant="plain" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {fields.map((field) => (
          <MonthlyYearlyAmountField
            key={field.id}
            label={field.label}
            value={field.value}
            frequency={field.frequency}
            onChangeValue={(text) => updateFieldValue(field.id, text)}
            onChangeFrequency={(frequency) => updateFrequency(field.id, frequency)}
          />
        ))}

        {/* Summary Section */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Gross Salary (Yearly)</Text>
            <Text style={styles.summaryValue}>₹ {calculations.grossTotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Standard Deduction</Text>
            <Text style={[styles.summaryValue, { color: "#EF4444" }]}>
              - ₹ {calculations.standardDeduction.toLocaleString()}
            </Text>
          </View>
          {calculations.pTax > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Professional Tax</Text>
              <Text style={[styles.summaryValue, { color: "#EF4444" }]}>
                - ₹ {calculations.pTax.toLocaleString()}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Income Chargeable under Salaries</Text>
            <Text style={styles.totalValue}>₹ {calculations.netSalary.toLocaleString()}</Text>
          </View>
        </View>

        <ITRSaveButton onPress={handleSave} />
      </ScrollView>

      <ITRBottomNav activeRoute="/itr" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: itrColors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: itrSpacing.md + 4,
    paddingTop: itrSpacing.lg,
    paddingBottom: 112,
  },
  summaryCard: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderRadius: itrRadius.md,
    borderWidth: 1,
    marginTop: itrSpacing.md,
    marginBottom: itrSpacing.lg,
    padding: itrSpacing.md,
    ...itrShadows.card,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },
  summaryValue: {
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "700",
  },
  totalRow: {
    borderTopColor: "#CBD5E1",
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  totalValue: {
    color: itrColors.primary,
    fontSize: 16,
    fontWeight: "800",
  },
});
