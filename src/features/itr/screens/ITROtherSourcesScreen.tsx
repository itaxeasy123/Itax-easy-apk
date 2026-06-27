import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useITRStore } from "../../../store/itrStore";
import { ITRBottomNav, ITRHeader, ITRSaveButton, MonthlyYearlyAmountField, type Frequency } from "../components";
import { itrColors, itrRadius, itrSpacing, itrShadows } from "../../../theme/itr";

type FieldConfig = {
  id: string;
  label: string;
  value: string;
  frequency: Frequency;
};

const roundMoney = (value: number) => Math.round(value);

export default function ITROtherSourcesScreen() {
  const { otherSources, setOtherSources, form16 } = useITRStore();

  const initField = (manualVal: string, form16Val?: number | string, defaultFreq: Frequency = "Yearly"): { value: string, frequency: Frequency } => {
    if (manualVal) return { value: manualVal, frequency: defaultFreq };
    if (form16Val) return { value: String(form16Val), frequency: "Yearly" };
    return { value: "", frequency: defaultFreq };
  };

  const [fields, setFields] = useState<FieldConfig[]>([
    {
      id: "saving-bank",
      label: "Interest from Savings Bank Account",
      ...initField(otherSources.savingBankInterest, undefined, "Yearly"),
    },
    {
      id: "fd-interest",
      label: "Interest from Fixed Deposits / Post Office",
      ...initField(otherSources.fixedDepositInterest, undefined, "Yearly"),
    },
    {
      id: "dividend",
      label: "Dividend Income",
      ...initField(otherSources.dividendIncome, undefined, "Yearly"),
    },
    {
      id: "any-other",
      label: "Any Other Income",
      ...initField(otherSources.anyOtherIncome, form16?.otherIncome, "Yearly"),
    },
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
    let totalOtherIncome = 0;

    fields.forEach((field) => {
      const amount = parseFloat(field.value) || 0;
      const yearlyAmount = Math.round(field.frequency === "Monthly" ? amount * 12 : amount);
      totalOtherIncome += yearlyAmount;
    });

    return {
      totalOtherIncome: roundMoney(totalOtherIncome),
    };
  }, [fields]);

  const handleSave = () => {
    setOtherSources({
      savingBankInterest: fields.find((f) => f.id === "saving-bank")?.value || "",
      fixedDepositInterest: fields.find((f) => f.id === "fd-interest")?.value || "",
      dividendIncome: fields.find((f) => f.id === "dividend")?.value || "",
      anyOtherIncome: fields.find((f) => f.id === "any-other")?.value || "",
      totalOtherIncome: calculations.totalOtherIncome,
    });
    Alert.alert("Success", "Other Sources details saved successfully!");
  };

  return (
    <View style={styles.screen}>
      <ITRHeader title="Other Sources" titleVariant="plain" />

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

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Income from Other Sources</Text>
            <Text style={styles.totalValue}>₹ {calculations.totalOtherIncome.toLocaleString()}</Text>
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
  },
  totalRow: {
    paddingVertical: 4,
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
