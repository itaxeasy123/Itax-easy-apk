import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { AccountingHeader, FiscalYearBar } from "../components";
import { Ionicons } from "@expo/vector-icons";
import { billshieldUiService, FiscalYearInfo } from "../services/billshieldUiService";
import { accountingTheme } from "../../../theme/accounting";
import { exportCsv, exportExcel, exportPdf, buildPdfHtml } from "../utils/exportFile";

const format = (value: number | undefined) => {
  if (value === undefined || isNaN(value)) return "₹ 0.00";
  return `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

type TbRow = { ledgerId: string; ledgerName: string; groupName: string; debit: number; credit: number };

export default function TrialBalanceScreen() {
    const insets = useSafeAreaInsets();
  const [rows, setRows] = useState<TbRow[]>([]);
  const [totals, setTotals] = useState({ debit: 0, credit: 0 });
  const [asOf, setAsOf] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrialBalance = useCallback(async (asOfDate?: string) => {
    setLoading(true);
    setError(null);
    const response = await billshieldUiService.getTrialBalance(asOfDate);
    if (response.success) {
      setRows(response.data.ledgers);
      setTotals(response.data.totals);
    } else {
      setError(response.message ?? "Unable to load trial balance report.");
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadTrialBalance(asOf);
    }, [loadTrialBalance, asOf])
  );

  const handleFyChange = (fy: FiscalYearInfo) => {
    setAsOf(fy.endDate);
  };

  // ---- export menu (3-dot) ----
  const [showExport, setShowExport] = useState(false);
  const exportRows = (): (string | number)[][] => [
    ["Ledger", "Group", "Debit", "Credit"],
    ...rows.map((r) => [r.ledgerName, r.groupName, r.debit, r.credit]),
    ["TOTAL", "", totals.debit, totals.credit],
  ];
  const handleExport = async (format: "PDF" | "CSV" | "Excel") => {
    setShowExport(false);
    const data = exportRows();
    if (format === "CSV") await exportCsv("trial-balance", data);
    else if (format === "Excel") await exportExcel("trial-balance", "Trial Balance", data);
    else await exportPdf("trial-balance", buildPdfHtml("Trial Balance", "Exported from iTaxEasy", data));
  };

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Trial Balance"
        showBackButton
        rightContent={
          <Pressable onPress={() => setShowExport(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} color={accountingTheme.colors.card} />
          </Pressable>
        }
      />

      {/* Financial Year Bar — real fiscal years, selectable */}
      <FiscalYearBar onChange={handleFyChange} />

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.thText, { flex: 2 }]}>Particular</Text>
        <Text style={[styles.thText, { flex: 1.5, textAlign: "right" }]}>Debit</Text>
        <Text style={[styles.thText, { flex: 1.5, textAlign: "right" }]}>Credit</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={accountingTheme.colors.primary} />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : rows.length === 0 ? (
          <Text style={styles.errorText}>No ledger balances yet — post a voucher first.</Text>
        ) : (
          <View style={styles.tableCard}>
            {rows.map((row) => (
              <View key={row.ledgerId} style={styles.row}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.particular}>{row.ledgerName}</Text>
                  <Text style={styles.groupName}>{row.groupName}</Text>
                </View>
                <Text style={styles.amount}>{row.debit > 0 ? format(row.debit) : ""}</Text>
                <Text style={styles.amount}>{row.credit > 0 ? format(row.credit) : ""}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer Totals */}
      <View style={styles.footer}>
        <Text style={[styles.footerLabel, { flex: 2 }]}>Total</Text>
        <Text style={[styles.footerValue, { flex: 1.5, textAlign: "right" }]}>{format(totals.debit)}</Text>
        <Text style={[styles.footerValue, { flex: 1.5, textAlign: "right" }]}>{format(totals.credit)}</Text>
      </View>
      <View style={{ backgroundColor: accountingTheme.colors.card, height: Math.max(insets.bottom, 0) }} />

      {/* Export menu */}
      <Modal visible={showExport} transparent animationType="slide" onRequestClose={() => setShowExport(false)}>
        <View style={styles.exportBackdrop}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowExport(false)} />
          <View style={styles.exportSheet}>
            {(["PDF", "Excel", "CSV"] as const).map((fmt) => (
              <Pressable key={fmt} style={styles.exportRow} onPress={() => handleExport(fmt)}>
                <Ionicons
                  name={fmt === "PDF" ? "document-outline" : fmt === "Excel" ? "document-text-outline" : "grid-outline"}
                  size={18}
                  color="#475569"
                />
                <Text style={styles.exportText}>Download ({fmt})</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingBottom: 40,
  },
  periodBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: accountingTheme.colors.card,
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: 10,
  },
  periodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.sm,
  },
  periodText: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#1E293B",
  },
  periodSubText: {
    fontSize: 11,
    fontWeight: accountingTheme.fontWeights.regular,
    color: accountingTheme.colors.textSecondary,
  },
  changeText: {
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: accountingTheme.colors.primary,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: accountingTheme.colors.primary,
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: accountingTheme.spacing.md,
  },
  thText: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  loaderWrap: {
    padding: 40,
    alignItems: "center",
  },
  errorText: {
    color: accountingTheme.colors.error,
    textAlign: "center",
    marginTop: accountingTheme.spacing.xxl,
  },
  tableCard: {
    backgroundColor: accountingTheme.colors.card,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: accountingTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.borderLight,
  },
  particular: {
    fontSize: accountingTheme.fontSizes.sm,
    color: "#475569",
    fontWeight: accountingTheme.fontWeights.medium,
  },
  groupName: {
    fontSize: 10,
    color: accountingTheme.colors.textMuted,
    marginTop: 1,
  },
  exportBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  exportSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 12,
    paddingBottom: 32,
  },
  exportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  exportText: {
    fontSize: accountingTheme.fontSizes.lg,
    color: "#111827",
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  amount: {
    flex: 1.5,
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.text,
    fontWeight: accountingTheme.fontWeights.bold,
    textAlign: "right",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: accountingTheme.colors.primary,
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: accountingTheme.spacing.lg,
  },
  footerLabel: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  footerValue: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.bold,
  },
});
