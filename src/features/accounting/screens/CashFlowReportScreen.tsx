import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AccountingHeader, BottomNav } from "../components";
import { accountingService } from "../services/accountingService";
import { CashFlowReport } from "../types/accountingTypes";
import { accountingTheme } from "../../../theme/accounting";

const format = (value: number) =>
  `Rs ${Math.abs(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function CashFlowReportScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState<CashFlowReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCashFlow() {
      try {
        setLoading(true);
        setError(null);
        const response = await accountingService.getCashFlowReport(year, month);
        if (response.success && response.data) {
          setReport(response.data);
        } else {
          setError("Unable to load cash flow report.");
        }
      } catch {
        setError("Unable to load cash flow report.");
      } finally {
        setLoading(false);
      }
    }
    loadCashFlow();
  }, [month, year]);

  const moveMonth = (delta: number) => {
    const nextMonth = month + delta;
    if (nextMonth < 1) {
      setMonth(12);
      setYear((prev) => prev - 1);
      return;
    }
    if (nextMonth > 12) {
      setMonth(1);
      setYear((prev) => prev + 1);
      return;
    }
    setMonth(nextMonth);
  };

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Cash Flow"
        showBackButton
        rightContent={<Ionicons name="ellipsis-horizontal" size={18} color={accountingTheme.colors.card} />}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.periodBar}>
          <Pressable style={styles.iconBtn} onPress={() => moveMonth(-1)}>
            <Ionicons name="chevron-back" size={16} color={accountingTheme.colors.primary} />
          </Pressable>
          <Text style={styles.periodText}>{`${month.toString().padStart(2, "0")}/${year}`}</Text>
          <Pressable style={styles.iconBtn} onPress={() => moveMonth(1)}>
            <Ionicons name="chevron-forward" size={16} color={accountingTheme.colors.primary} />
          </Pressable>
        </View>

        {loading ? <Text style={styles.stateText}>Loading cash flow...</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && !error ? (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Operating Cash Flow</Text>
              <Text style={styles.value}>{format(report?.operatingCashFlow ?? 0)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Investing Cash Flow</Text>
              <Text style={styles.value}>{format(report?.investingCashFlow ?? 0)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Financing Cash Flow</Text>
              <Text style={styles.value}>{format(report?.financingCashFlow ?? 0)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Net Cash Flow</Text>
              <Text
                style={[
                  styles.totalValue,
                  (report?.netCashFlow ?? 0) >= 0 ? styles.positive : styles.negative,
                ]}
              >
                {format(report?.netCashFlow ?? 0)}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
      <BottomNav activeRoute="/accounting/reports" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: accountingTheme.colors.background },
  content: { padding: accountingTheme.spacing.lg, paddingBottom: accountingTheme.spacing.xxl },
  periodBar: {
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.lg,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: accountingTheme.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: accountingTheme.radius.xl,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  periodText: { fontSize: accountingTheme.fontSizes.lg, fontWeight: accountingTheme.fontWeights.bold, color: accountingTheme.colors.text },
  stateText: { marginTop: accountingTheme.spacing.md, color: accountingTheme.colors.textSecondary },
  errorText: { marginTop: accountingTheme.spacing.md, color: accountingTheme.colors.error },
  card: {
    marginTop: accountingTheme.spacing.md,
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.lg,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    padding: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: accountingTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.borderLight,
  },
  label: { fontSize: accountingTheme.fontSizes.md, color: "#475569" },
  value: { fontSize: accountingTheme.fontSizes.md, fontWeight: accountingTheme.fontWeights.bold, color: accountingTheme.colors.text },
  totalRow: {
    marginTop: accountingTheme.spacing.sm,
    paddingTop: accountingTheme.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 15, fontWeight: accountingTheme.fontWeights.bold, color: accountingTheme.colors.text },
  totalValue: { fontSize: 15, fontWeight: accountingTheme.fontWeights.extraBold },
  positive: { color: "#059669" },
  negative: { color: accountingTheme.colors.error },
});
