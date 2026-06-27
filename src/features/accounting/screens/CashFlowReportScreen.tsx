import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { AccountingHeader, BottomNav, FiscalYearBar, Loading } from "../components";
import { billshieldUiService, FiscalYearInfo } from "../services/billshieldUiService";
import { accountingTheme } from "../../../theme/accounting";

const format = (value: number) =>
  `Rs ${Math.abs(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

interface CashFlowData {
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
}

export default function CashFlowReportScreen() {
  const [report, setReport] = useState<CashFlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (fy: FiscalYearInfo) => {
    setLoading(true);
    setError(null);
    try {
      const response = await billshieldUiService.getCashFlow(fy.startDate, fy.endDate);
      if (response.success && response.data) {
        setReport(response.data);
      } else {
        setError(response.message ?? "Unable to load cash flow report.");
      }
    } catch {
      setError("Unable to load cash flow report.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      <AccountingHeader title="Cash Flow" showBackButton />
      <FiscalYearBar onChange={load} />
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? <Loading text="Loading cash flow..." style={styles.loadingWrap} /> : null}
        {!loading && error ? <Text style={styles.errorText}>{error}</Text> : null}

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
  loadingWrap: { marginTop: accountingTheme.spacing.xxl },
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
