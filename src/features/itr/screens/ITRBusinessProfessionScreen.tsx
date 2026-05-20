import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useITRStore } from "../../../store/itrStore";
import { ITRBottomNav, ITRHeader, ITRSaveButton, MonthlyYearlyAmountField, type Frequency } from "../components";
import { itrColors, itrRadius, itrSpacing, itrShadows } from "../../../theme/itr";

const roundMoney = (value: number) => Math.round(value);

export default function ITRBusinessProfessionScreen() {
  const { businessProfession, setBusinessProfession } = useITRStore();

  const [turnover, setTurnover] = useState(businessProfession.businessTurnover);
  const [profitRate, setProfitRate] = useState(businessProfession.businessProfitRate); // 6 or 8
  const [receipts, setReceipts] = useState(businessProfession.professionReceipts);

  // Calculations
  const calculations = useMemo(() => {
    const t = parseFloat(turnover || "0") || 0;
    const r = parseFloat(receipts || "0") || 0;

    const bProfit = Math.round((t * profitRate) / 100);
    const pProfit = Math.round(r * 0.5); // 50% for 44ADA

    return {
      bProfit,
      pProfit,
      totalIncome: Math.round(bProfit + pProfit),
    };
  }, [turnover, profitRate, receipts]);

  const handleSave = () => {
    setBusinessProfession({
      businessTurnover: turnover,
      businessProfitRate: profitRate,
      professionReceipts: receipts,
      totalBusinessProfit: calculations.bProfit,
      totalProfessionProfit: calculations.pProfit,
      totalIncome: calculations.totalIncome,
    });
  };

  return (
    <View style={styles.screen}>
      <ITRHeader title="Business & Profession" titleVariant="plain" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Business Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business (Section 44AD)</Text>
          <MonthlyYearlyAmountField
            label="Total Turnover / Gross Receipts"
            value={turnover}
            frequency="Yearly"
            onChangeValue={(text) => setTurnover(text.replace(/[^0-9]/g, ""))}
            onChangeFrequency={() => {}} // Fixed as yearly
          />
          
          <Text style={styles.inputLabel}>Profit Margin Rate</Text>
          <View style={styles.rateRow}>
            {[6, 8].map((rate) => (
              <Pressable
                key={rate}
                onPress={() => setProfitRate(rate)}
                style={[styles.rateButton, profitRate === rate && styles.rateButtonActive]}
              >
                <Text style={[styles.rateButtonText, profitRate === rate && styles.rateButtonTextActive]}>
                  {rate}% {rate === 6 ? "(Digital)" : "(Cash)"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Profession Section */}
        <View style={[styles.section, { marginTop: itrSpacing.lg }]}>
          <Text style={styles.sectionTitle}>Profession (Section 44ADA)</Text>
          <MonthlyYearlyAmountField
            label="Gross Receipts from Profession"
            value={receipts}
            frequency="Yearly"
            onChangeValue={(text) => setReceipts(text.replace(/[^0-9]/g, ""))}
            onChangeFrequency={() => {}} // Fixed as yearly
          />
          <Text style={styles.helperText}>* Professionals like Doctors, CA, Engineers, etc. (Profit assumed at 50%)</Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Deemed Business Profit</Text>
            <Text style={styles.summaryValue}>₹ {calculations.bProfit.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Deemed Profession Profit</Text>
            <Text style={styles.summaryValue}>₹ {calculations.pProfit.toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Income from B & P</Text>
            <Text style={styles.totalValue}>₹ {calculations.totalIncome.toLocaleString()}</Text>
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
  section: {
    marginBottom: itrSpacing.md,
  },
  sectionTitle: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: itrSpacing.md,
    textTransform: "uppercase",
  },
  inputLabel: {
    color: "#2B313B",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  rateRow: {
    flexDirection: "row",
    gap: 12,
  },
  rateButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  rateButtonActive: {
    backgroundColor: "#E7F0FF",
    borderColor: itrColors.primary,
  },
  rateButtonText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },
  rateButtonTextActive: {
    color: itrColors.primary,
  },
  helperText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: -8,
    fontStyle: "italic",
  },
  summaryCard: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderRadius: itrRadius.md,
    borderWidth: 1,
    marginTop: itrSpacing.lg,
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
