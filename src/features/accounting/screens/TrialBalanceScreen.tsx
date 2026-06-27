import React, { useCallback, useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { AccountingHeader, FiscalYearBar } from "../components";
import { Ionicons } from "@expo/vector-icons";
import { billshieldUiService, FiscalYearInfo } from "../services/billshieldUiService";
import { accountingTheme } from "../../../theme/accounting";
import { exportCsv, exportExcel, exportPdf, buildPdfHtml } from "../utils/exportFile";

const format = (value: number | undefined) => {
  if (value === undefined || isNaN(value) || value === 0) return "";
  return `₹ ${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

type TbRow = { ledgerId: string; ledgerName: string; groupName: string; groupPath: string; debit: number; credit: number };

const ACCOUNTING_GROUP_ORDER = [
  "capital-account",
  "reserves-surplus",
  "loans-liability",
  "current-liabilities",
  "fixed-assets",
  "investments",
  "current-assets",
  "suspense-account",
  "sales-accounts",
  "purchase-accounts",
  "direct-income",
  "direct-expenses",
  "indirect-income",
  "indirect-expenses",
];

export default function TrialBalanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [rows, setRows] = useState<TbRow[]>([]);
  const [totals, setTotals] = useState({ debit: 0, credit: 0 });
  const [asOf, setAsOf] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

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

  const handleLedgerPress = (ledgerId: string, ledgerName: string) => {
    router.navigate({
      pathname: "/accounting/reports-bank-cash/[id]",
      params: { id: ledgerId, name: ledgerName },
    });
  };

  // Sort flat ledgers according to standard accounting nature structure
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const topA = a.groupPath ? a.groupPath.split("/")[0] : "";
      const topB = b.groupPath ? b.groupPath.split("/")[0] : "";

      const indexA = ACCOUNTING_GROUP_ORDER.indexOf(topA);
      const indexB = ACCOUNTING_GROUP_ORDER.indexOf(topB);

      if (indexA !== -1 && indexB !== -1) {
        if (indexA !== indexB) return indexA - indexB;
      } else if (indexA !== -1) {
        return -1;
      } else if (indexB !== -1) {
        return 1;
      }

      // If in same group, sort by subgroup path, then alphabetically by ledger name
      const pathA = a.groupPath || "";
      const pathB = b.groupPath || "";
      if (pathA !== pathB) {
        return pathA.localeCompare(pathB);
      }
      return a.ledgerName.localeCompare(b.ledgerName);
    });
  }, [rows]);

  const flattenedExportRows = useMemo(() => {
    const result: (string | number)[][] = [["Particular", "Group/Type", "Debit", "Credit"]];
    sortedRows.forEach((l) => {
      result.push([l.ledgerName, l.groupName, l.debit || "", l.credit || ""]);
    });
    result.push(["TOTAL", "", totals.debit, totals.credit]);
    return result;
  }, [sortedRows, totals]);

  const handleExport = async (format: "PDF" | "CSV" | "Excel") => {
    setShowExport(false);
    const data = flattenedExportRows;
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

      {/* Financial Year Bar */}
      <FiscalYearBar onChange={handleFyChange} />

      {/* Summary Count Bar */}
      <View style={styles.activeCountBar}>
        <Text style={styles.activeCountText}>
          {loading ? "Loading..." : `${sortedRows.length} Active Ledger Accounts`}
        </Text>
        <Ionicons name="funnel-outline" size={14} color="#64748B" />
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.thText, { flex: 2.2 }]}>Particulars / Ledger Name</Text>
        <Text style={[styles.thText, { flex: 1.4, textAlign: "right" }]}>Debit (Dr)</Text>
        <Text style={[styles.thText, { flex: 1.4, textAlign: "right" }]}>Credit (Cr)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={accountingTheme.colors.primary} />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : sortedRows.length === 0 ? (
          <Text style={styles.errorText}>No ledger balances yet — post a voucher first.</Text>
        ) : (
          <View style={styles.tableCard}>
            {sortedRows.map((l) => (
              <Pressable
                key={l.ledgerId}
                onPress={() => handleLedgerPress(l.ledgerId, l.ledgerName)}
                style={styles.ledgerRow}
              >
                <View style={styles.ledgerLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="document-text-outline" size={16} color="#3B82F6" />
                  </View>
                  <View style={styles.ledgerInfo}>
                    <Text style={styles.ledgerNameText} numberOfLines={1}>{l.ledgerName}</Text>
                    <Text style={styles.ledgerGroupText} numberOfLines={1}>{l.groupName}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={12} color="#94A3B8" style={styles.drillIcon} />
                </View>
                <Text style={[styles.amountText, styles.ledgerAmount, { flex: 1.4 }]}>
                  {l.debit > 0 ? format(l.debit) : "—"}
                </Text>
                <Text style={[styles.amountText, styles.ledgerAmount, { flex: 1.4 }]}>
                  {l.credit > 0 ? format(l.credit) : "—"}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer Totals */}
      <View style={styles.footer}>
        <Text style={[styles.footerLabel, { flex: 2.2 }]}>Grand Total</Text>
        <Text style={[styles.footerValue, { flex: 1.4, textAlign: "right" }]}>{format(totals.debit)}</Text>
        <Text style={[styles.footerValue, { flex: 1.4, textAlign: "right" }]}>{format(totals.credit)}</Text>
      </View>
      <View style={{ backgroundColor: accountingTheme.colors.card, height: Math.max(insets.bottom, 0) }} />

      {/* Export menu */}
      <Modal visible={showExport} transparent animationType="slide" onRequestClose={() => setShowExport(false)}>
        <View style={styles.exportBackdrop}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowExport(false)} />
          <View style={styles.exportSheet}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>
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
  activeCountBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  activeCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: accountingTheme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thText: {
    color: accountingTheme.colors.card,
    fontSize: 13,
    fontWeight: "700",
  },
  loaderWrap: {
    padding: 40,
    alignItems: "center",
  },
  errorText: {
    color: accountingTheme.colors.error,
    textAlign: "center",
    marginTop: accountingTheme.spacing.xxl,
    fontWeight: "500",
  },
  tableCard: {
    backgroundColor: "#FFFFFF",
  },
  ledgerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  ledgerLeft: {
    flex: 2.2,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  ledgerInfo: {
    flex: 1,
    marginRight: 4,
  },
  ledgerNameText: {
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "600",
  },
  ledgerGroupText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  drillIcon: {
    marginLeft: 4,
  },
  amountText: {
    fontSize: 13,
    textAlign: "right",
  },
  ledgerAmount: {
    fontWeight: "600",
    color: "#334155",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: accountingTheme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  footerLabel: {
    color: accountingTheme.colors.card,
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  footerValue: {
    color: accountingTheme.colors.card,
    fontSize: 13,
    fontWeight: "800",
  },
  exportBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  exportSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 12,
    paddingBottom: 32,
  },
  sheetHandleWrap: {
    alignItems: "center",
    paddingVertical: 8,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#CBD5E1",
    borderRadius: 2,
  },
  exportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  exportText: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "600",
  },
});
