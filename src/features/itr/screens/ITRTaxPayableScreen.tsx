import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useITRStore } from "../../../store/itrStore";
import { calculateIncomeTax } from "../../taxCalculator/services/taxCalculator.service";
import { ITRBottomNav, ITRHeader, ITRSaveButton } from "../components";
import { itrColors, itrRadius, itrSpacing, itrShadows } from "../../../theme/itr";

export default function ITRTaxPayableScreen() {
  const { 
    salary, houseProperty, otherSources, 
    businessProfession, capitalGains, deductions, 
    taxesPaid, interests, setInterests, regime
  } = useITRStore();

  const updateInterestValue = (key: string, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    const updatedData = { [key]: cleanValue };
    
    const current = { ...interests, ...updatedData };
    const total =
      (parseFloat(current.section234A) || 0) + 
      (parseFloat(current.section234B) || 0) + 
      (parseFloat(current.section234C) || 0) + 
      (parseFloat(current.section234F) || 0);
    
    setInterests({ ...updatedData, totalInterests: total });
  };

  const taxResult = useMemo(() => {
    return calculateIncomeTax({
      salary: salary.netSalary + houseProperty.incomeFromHP + businessProfession.totalIncome + capitalGains.totalGains,
      otherIncome: otherSources.totalOtherIncome,
      deductions: deductions.totalDeductions,
      exemptions: deductions.totalExemptions,
      regime: regime,
      advanceTax: taxesPaid.advanceTax,
      tdsSalary: taxesPaid.tdsSalary,
      tdsNonSalary: taxesPaid.tdsNonSalary,
      tdsOther: taxesPaid.tdsOther,
    });
  }, [salary, houseProperty, otherSources, businessProfession, capitalGains, deductions, taxesPaid, regime]);

  const finalAmount = useMemo(() => {
    const net = taxResult.netPayable + interests.totalInterests;
    return {
        payable: net > 0 ? net : 0,
        refund: taxResult.refund > 0 && net <= 0 ? taxResult.refund : 0
    };
  }, [taxResult, interests]);

  const INTEREST_FIELDS = [
    { id: "section234A", label: "234A : Delay in Filing Return", value: interests.section234A },
    { id: "section234B", label: "234B : Delay in Advance Tax", value: interests.section234B },
    { id: "section234C", label: "234C : Interest on Tax", value: interests.section234C },
    { id: "section234F", label: "234F : Penalty for Late Filing", value: interests.section234F },
  ];

  return (
    <View style={styles.screen}>
      <ITRHeader title="Tax Payable" titleVariant="plain" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Selected Regime: {regime.toUpperCase()}</Text>
        </View>

        <Text style={styles.sectionTitle}>Interests & Penalties</Text>
        {INTEREST_FIELDS.map((field) => (
          <View key={field.id} style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <TextInput
              value={field.value}
              keyboardType="numeric"
              onChangeText={(text) => updateInterestValue(field.id, text)}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
          </View>
        ))}

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Taxable Income</Text>
            <Text style={styles.summaryValue}>₹ {taxResult.taxableIncome.toLocaleString()}</Text>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>
                {finalAmount.refund > 0 ? "Estimated Refund" : "Final Amount Payable"}
            </Text>
            <Text style={[styles.totalValue, finalAmount.refund > 0 && { color: '#059669' }]}>
                ₹ {(finalAmount.payable || finalAmount.refund).toLocaleString()}
            </Text>
          </View>
        </View>

        <ITRSaveButton onPress={() => {}} />
      </ScrollView>

      <ITRBottomNav activeRoute="/itr" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: itrColors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 112 },
  infoBox: { backgroundColor: "#F1F5F9", padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: "#E2E8F0" },
  infoText: { fontSize: 13, color: "#475569", fontWeight: "700", textAlign: "center" },
  sectionTitle: { color: "#475569", fontSize: 14, fontWeight: "700", marginBottom: 16, textTransform: "uppercase" },
  fieldBlock: { marginBottom: 14 },
  fieldLabel: { color: "#475569", fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: { backgroundColor: "#fff", borderColor: "#CDD6E4", borderRadius: 8, borderWidth: 1, color: "#1E293B", fontSize: 14, height: 44, paddingHorizontal: 12, ...itrShadows.card },
  summaryCard: { backgroundColor: "#F8FAFC", borderColor: "#E2E8F0", borderRadius: itrRadius.md, borderWidth: 1, marginTop: 10, marginBottom: 20, padding: 16, ...itrShadows.card },
  summaryItem: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: "#64748B", fontWeight: "600" },
  summaryValue: { fontSize: 13, color: "#1E293B", fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { color: "#1E293B", fontSize: 15, fontWeight: "800" },
  totalValue: { color: itrColors.primary, fontSize: 18, fontWeight: "900" },
});
