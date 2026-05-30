import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useITRStore } from "../../../store/itrStore";
import { ITRBottomNav, ITRHeader, ITRSaveButton } from "../components";
import { itrColors, itrRadius, itrSpacing, itrShadows } from "../../../theme/itr";

type Tab = "Exemptions" | "Deduction";

type FieldConfig = {
  id: string;
  label: string;
  suffix: string;
  value: string;
};

type DeductionCard = {
  id: string;
  code: string;
  title: string;
  value: string;
};

type ITRExemptionsDeductionsScreenProps = {
  initialTab?: Tab;
};

const TABS: Tab[] = ["Exemptions", "Deduction"];

const EXEMPTION_FIELDS: FieldConfig[] = [
  { id: "salary", label: "Income from Salary", suffix: "₹", value: "" },
  { id: "interest", label: "Income from Interest", suffix: "%", value: "" },
  { id: "rental", label: "Rental Income Received", suffix: "Y", value: "" },
  { id: "digital", label: "Income from Digital Assets", suffix: "Y", value: "" },
  { id: "allowance", label: "Exempt Allowance", suffix: "Y", value: "" },
  { id: "home-loan", label: "Interest on Home Loan - Self Occupied", suffix: "Y", value: "" },
  { id: "other-income", label: "Other Income", suffix: "Y", value: "" },
];

const DEDUCTION_CARDS: DeductionCard[] = [
  {
    id: "80c",
    code: "80C",
    title: "Life Insurance, PPP, EPL, ELSS, NPS",
    value: "",
  },
  {
    id: "80dd",
    code: "80DD",
    title: "Permanent physical disability",
    value: "",
  },
  {
    id: "80ddb",
    code: "80DDB",
    title: "Medical Treatment Expenses",
    value: "",
  },
  {
    id: "80ee",
    code: "80EE",
    title: "Home Loan Should be taken in Fin. year 2024-2025",
    value: "",
  },
  {
    id: "80ccd1b",
    code: "80CCD(1B)",
    title: "National Pension scheme-add benefit",
    value: "",
  },
];

function TabButton({
  label,
  active,
  onPress,
}: {
  label: Tab;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}
    >
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

const roundMoney = (value: number) => Math.round(value);

export default function ITRExemptionsDeductionsScreen({
  initialTab = "Exemptions",
}: ITRExemptionsDeductionsScreenProps) {
  const { deductions, setDeductions, form16 } = useITRStore();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [exemptionFields, setExemptionFields] = useState(EXEMPTION_FIELDS);
  
  const getDeductionValue = (manualVal: string | number, form16Val?: number | string) => {
    if (manualVal) return String(manualVal);
    if (form16Val) return String(form16Val);
    return "";
  };

  // Initialize with store values if available
  const [deductionCards, setDeductionCards] = useState(
    DEDUCTION_CARDS.map(card => {
      if (card.id === "80c") return { ...card, value: getDeductionValue(deductions.section80C, form16?.section80C) };
      if (card.id === "80dd") return { ...card, value: getDeductionValue(deductions.section80DD, form16?.section80DD) };
      if (card.id === "80ddb") return { ...card, value: getDeductionValue(deductions.section80DDB, form16?.section80DDB) };
      if (card.id === "80ee") return { ...card, value: getDeductionValue(deductions.section80EE, form16?.section80EE) };
      if (card.id === "80ccd1b") return { ...card, value: getDeductionValue(deductions.section80CCD1B, form16?.section80CCD1B) };
      return card;
    })
  );

  const updateExemptionValue = (id: string, value: string) => {
    setExemptionFields((current) =>
      current.map((field) => (field.id === id ? { ...field, value } : field)),
    );
  };

  const updateDeductionValue = (id: string, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    setDeductionCards((current) =>
      current.map((card) => (card.id === id ? { ...card, value: cleanValue } : card)),
    );
  };

  const handleSave = () => {
    const totalDeductions = roundMoney(deductionCards.reduce((acc, card) => acc + (parseFloat(card.value) || 0), 0));
    const totalExemptions = roundMoney(exemptionFields.reduce((acc, field) => acc + (parseFloat(field.value) || 0), 0));
    
    setDeductions({
      section80C: deductionCards.find(c => c.id === "80c")?.value || "",
      section80CCD1B: deductionCards.find(c => c.id === "80ccd1b")?.value || "",
      totalDeductions,
      totalExemptions,
    });
  };

  return (
    <View style={styles.screen}>
      <ITRHeader title="Exemptions & Deductions" titleVariant="plain" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <TabButton
              key={tab}
              label={tab}
              active={activeTab === tab}
              onPress={() => setActiveTab(tab)}
            />
          ))}
        </View>

        {activeTab === "Exemptions"
          ? exemptionFields.map((field) => (
            <View key={field.id} style={styles.exemptionFieldBlock}>
              <Text style={styles.exemptionLabel}>{field.label}</Text>
              <View style={styles.exemptionInputRow}>
                <TextInput
                  value={field.value}
                  keyboardType="numeric"
                  onChangeText={(text) => updateExemptionValue(field.id, text)}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  style={styles.exemptionInput}
                />
                <View style={styles.suffixBox}>
                  <Text style={styles.suffixText}>{field.suffix}</Text>
                </View>
              </View>
            </View>
          ))
          : deductionCards.map((card) => (
            <View key={card.id} style={styles.deductionCard}>
              <View style={styles.deductionTop}>
                <View style={styles.deductionTextWrap}>
                  <Text style={styles.deductionCode}>{card.code}</Text>
                  <Text style={styles.deductionTitle}>{card.title}</Text>
                </View>
                <IoniconsChevron />
              </View>
              <View style={styles.deductionAmountRow}>
                <TextInput
                  value={card.value}
                  keyboardType="numeric"
                  onChangeText={(text) => updateDeductionValue(card.id, text)}
                  placeholder="0.0"
                  placeholderTextColor="#9CA3AF"
                  style={styles.deductionInput}
                />
              </View>
            </View>
          ))}

        <ITRSaveButton onPress={handleSave} />
      </ScrollView>

      <ITRBottomNav activeRoute="/itr" />
    </View>
  );
}

function IoniconsChevron() {
  return <Text style={styles.chevronText}>⌄</Text>;
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
  tabRow: {
    flexDirection: "row",
    gap: itrSpacing.md,
    marginBottom: itrSpacing.lg,
  },
  tabButton: {
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    borderColor: "#98B4E6",
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    minHeight: 42,
    justifyContent: "center",
    ...itrShadows.card,
  },
  tabButtonActive: {
    backgroundColor: "#EAF1FF",
    borderColor: itrColors.primary,
  },
  tabButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "700",
  },
  tabButtonTextActive: {
    color: itrColors.primary,
  },
  exemptionFieldBlock: {
    marginBottom: itrSpacing.md + 2,
  },
  exemptionLabel: {
    color: "#2B313B",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  exemptionInputRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  exemptionInput: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    borderTopLeftRadius: 4,
    borderColor: "#CDD6E4",
    borderRightWidth: 0,
    borderRadius: 4,
    borderWidth: 1,
    color: "#111827",
    flex: 1,
    fontSize: 14,
    height: 44,
    paddingHorizontal: 10,
    paddingVertical: 0,
    ...itrShadows.card,
  },
  suffixBox: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomRightRadius: 4,
    borderLeftWidth: 1,
    borderColor: "#CDD6E4",
    borderTopRightRadius: 4,
    borderWidth: 1,
    justifyContent: "center",
    minWidth: 38,
  },
  suffixText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  deductionCard: {
    backgroundColor: "#fff",
    borderColor: "#7FA7FF",
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: itrSpacing.md,
    overflow: "hidden",
    ...itrShadows.card,
  },
  deductionTop: {
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: itrSpacing.md,
    paddingVertical: itrSpacing.md,
  },
  deductionTextWrap: {
    flex: 1,
    paddingRight: itrSpacing.md,
  },
  deductionCode: {
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  deductionTitle: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  chevronText: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 18,
  },
  deductionAmountRow: {
    backgroundColor: "#fff",
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: itrSpacing.md,
  },
  deductionInput: {
    color: "#111827",
    fontSize: 14,
    height: 40,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: itrColors.primary,
    borderRadius: itrRadius.md,
    minHeight: 48,
    justifyContent: "center",
    marginTop: itrSpacing.lg,
    ...itrShadows.floating,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
