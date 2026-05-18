import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useITRStore } from "../../../store/itrStore";
import { ITRBottomNav, ITRHeader, ITRSaveButton } from "../components";
import { itrColors, itrRadius, itrSpacing, itrShadows } from "../../../theme/itr";

type FieldConfig = {
  id: string;
  label: string;
  value: string;
};

export default function ITRCapitalGainsScreen() {
  const { capitalGains, setCapitalGains } = useITRStore();

  const [fields, setFields] = useState<FieldConfig[]>([
    {
      id: "stcg15",
      label: "Short Term Capital Gain - Taxable @ 15%",
      value: capitalGains.stcg15,
    },
    {
      id: "stcgSlab",
      label: "Short Term Capital Gain - Taxable at No",
      value: capitalGains.stcgSlab,
    },
    {
      id: "ltcg10",
      label: "Long Term Capital Gain - Taxable @ 10%",
      value: capitalGains.ltcg10,
    },
    {
      id: "ltcg20",
      label: "Long Term Capital Gain - Taxable @ 20%",
      value: capitalGains.ltcg20,
    },
  ]);

  const updateFieldValue = (id: string, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    setFields((current) =>
      current.map((field) => (field.id === id ? { ...field, value: cleanValue } : field)),
    );
  };

  // Calculations
  const calculations = useMemo(() => {
    const total = fields.reduce((acc, field) => {
      return acc + (parseFloat(field.value) || 0);
    }, 0);
    return { total };
  }, [fields]);

  const handleSave = () => {
    setCapitalGains({
      stcg15: fields.find((f) => f.id === "stcg15")?.value || "",
      stcgSlab: fields.find((f) => f.id === "stcgSlab")?.value || "",
      ltcg10: fields.find((f) => f.id === "ltcg10")?.value || "",
      ltcg20: fields.find((f) => f.id === "ltcg20")?.value || "",
      totalGains: calculations.total,
    });
    Alert.alert("Success", "Capital Gains details saved successfully!");
  };

  return (
    <View style={styles.screen}>
      <ITRHeader title="Capital Gains" titleVariant="plain" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {fields.map((field) => (
          <View key={field.id} style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <TextInput
              value={field.value}
              keyboardType="numeric"
              onChangeText={(text) => updateFieldValue(field.id, text)}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
          </View>
        ))}

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Capital Gains</Text>
            <Text style={styles.totalValue}>₹ {calculations.total.toLocaleString()}</Text>
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
  fieldBlock: {
    marginBottom: itrSpacing.md,
  },
  fieldLabel: {
    color: "#2B313B",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#CDD6E4",
    borderRadius: 8,
    borderWidth: 1,
    color: "#111827",
    fontSize: 14,
    height: 44,
    paddingHorizontal: 12,
    ...itrShadows.card,
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
