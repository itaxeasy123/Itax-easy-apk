import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useITRStore } from "../../../store/itrStore";
import { itrColors, itrRadius, itrShadows, itrSpacing } from "../../../theme/itr";
import { ITRBottomNav, ITRHeader, ITRSaveButton, MonthlyYearlyAmountField, type Frequency } from "../components";

type RowConfig = {
  id: string;
  label: string;
  helper?: string;
  frequency: Frequency;
  value: string;
};

const roundMoney = (value: number) => Math.round(value);

export default function ITRHousePropertyScreen() {
  const { houseProperty, setHouseProperty } = useITRStore();

  const [rows, setRows] = useState<RowConfig[]>([
    {
      id: "gross-rent",
      label: "1. Annual Rent Received / Receivable",
      frequency: "Monthly",
      value: houseProperty.grossRent,
    },
    {
      id: "municipal-taxes",
      label: "2. Municipal Taxes Paid during the year",
      frequency: "Yearly",
      value: houseProperty.municipalTaxes,
    },
    {
      id: "housing-loan-interest",
      label: "3. Interest Paid on Housing Loan",
      frequency: "Yearly",
      value: houseProperty.interestOnLoan,
    },
  ]);

  const updateRowValue = (id: string, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, value: cleanValue } : row)),
    );
  };

  const updateFrequency = (id: string, frequency: Frequency) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, frequency } : row)),
    );
  };

  // Calculations
  const calculations = useMemo(() => {
    const getVal = (id: string) => {
      const row = rows.find((r) => r.id === id);
      const val = parseFloat(row?.value || "0") || 0;
      return Math.round(row?.frequency === "Monthly" ? val * 12 : val);
    };

    const grossRent = getVal("gross-rent");
    const taxes = getVal("municipal-taxes");
    const interest = getVal("housing-loan-interest");

    const nav = Math.round(Math.max(0, grossRent - taxes));
    const standardDeduction = Math.round(nav * 0.3); // 30% flat deduction
    const incomeFromHP = Math.round(nav - standardDeduction - interest);

    return {
      grossRent: roundMoney(grossRent),
      taxes: roundMoney(taxes),
      nav,
      standardDeduction,
      interest: roundMoney(interest),
      incomeFromHP,
    };
  }, [rows]);

  const handleSave = () => {
    setHouseProperty({
      grossRent: rows.find((r) => r.id === "gross-rent")?.value || "",
      municipalTaxes: rows.find((r) => r.id === "municipal-taxes")?.value || "",
      interestOnLoan: rows.find((r) => r.id === "housing-loan-interest")?.value || "",
      nav: calculations.nav,
      standardDeduction: calculations.standardDeduction,
      incomeFromHP: calculations.incomeFromHP,
    });
  };

  return (
    <View style={styles.screen}>
      <ITRHeader title="Income from House Property" titleVariant="plain" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Income from Let-out Property</Text>

        {rows.map((row) => (
          <MonthlyYearlyAmountField
            key={row.id}
            label={row.label}
            helper={row.helper}
            value={row.value}
            frequency={row.frequency}
            onChangeValue={(text) => updateRowValue(row.id, text)}
            onChangeFrequency={(frequency) => updateFrequency(row.id, frequency)}
          />
        ))}

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Net Annual Value (NAV)</Text>
            <Text style={styles.summaryValue}>₹ {calculations.nav.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>30% Standard Deduction</Text>
            <Text style={[styles.summaryValue, { color: "#EF4444" }]}>
              - ₹ {calculations.standardDeduction.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Interest on Housing Loan</Text>
            <Text style={[styles.summaryValue, { color: "#EF4444" }]}>
              - ₹ {calculations.interest.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Income from House Property</Text>
            <Text style={styles.totalValue}>₹ {calculations.incomeFromHP.toLocaleString()}</Text>
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
  sectionTitle: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: itrSpacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
  saveButton: {
    alignItems: "center",
    backgroundColor: itrColors.primary,
    borderRadius: itrRadius.md,
    minHeight: 48,
    justifyContent: "center",
    ...itrShadows.floating,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
