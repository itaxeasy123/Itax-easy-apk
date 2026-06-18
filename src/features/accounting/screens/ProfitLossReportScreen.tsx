import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Modal } from "react-native";
import { AccountingHeader, FiscalYearBar } from "../components";
import { Ionicons } from "@expo/vector-icons";
import { billshieldUiService, FiscalYearInfo } from "../services/billshieldUiService";
import { accountingTheme } from "../../../theme/accounting";
import { exportCsv, exportExcel, exportPdf, buildPdfHtml } from "../utils/exportFile";

const format = (value: number | undefined) => {
  if (value === undefined || isNaN(value)) return "₹ 0.00";
  return `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

export default function ProfitLossReportScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState<any>(null); // Use any to allow flexible mapping
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const [range, setRange] = useState<{ from?: string; to?: string }>({});

  const loadProfitLoss = useCallback(async (from?: string, to?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await billshieldUiService.getProfitAndLoss(from, to);
      if (response.success && response.data) {
        setReport(response.data);
      } else {
        setError(response.message ?? "Unable to load profit and loss report.");
      }
    } catch {
      setError("Unable to load profit and loss report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfitLoss(range.from, range.to);
  }, [loadProfitLoss, range, month, year]);

  const handleFyChange = (fy: FiscalYearInfo) => {
    setRange({ from: fy.startDate, to: fy.endDate });
  };

  // ---- export (3-dot menu) ----
  const exportRows = (): (string | number)[][] => [
    ["Particular", "Amount"],
    ["Sales Accounts", report?.salesAccounts ?? 0],
    ["Purchase Accounts", report?.purchaseAccounts ?? 0],
    ["Gross Profit", report?.grossProfit ?? 0],
    ["Other Income", report?.otherIncome ?? 0],
    ["Other Expenses", report?.otherExpenses ?? 0],
    ["Net Profit", report?.netProfit ?? 0],
  ];
  const handleExport = async (format: "PDF" | "CSV" | "Excel") => {
    setShowActionModal(false);
    const data = exportRows();
    if (format === "CSV") await exportCsv("profit-loss", data);
    else if (format === "Excel") await exportExcel("profit-loss", "Profit & Loss", data);
    else await exportPdf("profit-loss", buildPdfHtml("Profit & Loss", "Exported from iTaxEasy", data));
  };

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Profit & Loss"
        showBackButton
        rightContent={
          <Pressable onPress={() => setShowActionModal(true)}>
            <Ionicons name="ellipsis-vertical" size={20} color={accountingTheme.colors.card} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Financial Year Bar — real fiscal years, selectable */}
        <FiscalYearBar onChange={handleFyChange} />

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={accountingTheme.colors.primary} />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.tableCard}>
            <View style={styles.row}>
              <Text style={styles.label}>Sales Accounts</Text>
              <Text style={styles.value}>{format(report?.salesAccounts)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Purchase Accounts</Text>
              <Text style={styles.value}>{format(report?.purchaseAccounts)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Debit Note</Text>
              <Text style={styles.value}>{format(report?.debitNote)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Credit Note</Text>
              <Text style={styles.value}>{format(report?.creditNote)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Opening Stocks</Text>
              <Text style={styles.value}>{format(report?.openingStocks)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Closing Stocks</Text>
              <Text style={styles.value}>{format(report?.closingStocks)}</Text>
            </View>

            <View style={styles.highlightRow}>
              <Text style={styles.highlightLabel}>Gross Profit</Text>
              <Text style={styles.highlightValue}>{format(report?.grossProfit)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Other Income</Text>
              <Text style={styles.value}>{format(report?.otherIncome)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Other Expenses</Text>
              <Text style={styles.value}>{format(report?.otherExpenses)}</Text>
            </View>

            <View style={styles.highlightRow}>
              <Text style={styles.highlightLabel}>Net Profit</Text>
              <Text style={styles.highlightValue}>{format(report?.netProfit || report?.profit)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Bottom Sheet */}
      <Modal
        visible={showActionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowActionModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>

            <View style={styles.sheetOptions}>
              <Pressable style={styles.optionRow} onPress={() => handleExport("PDF")}>
                <Ionicons name="document-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Download (PDF)</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={() => handleExport("Excel")}>
                <Ionicons name="document-text-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Download (Excel)</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={() => handleExport("CSV")}>
                <Ionicons name="grid-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Download (CSV)</Text>
              </Pressable>
            </View>
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
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.borderMedium,
    marginBottom: 6,
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
    marginTop: accountingTheme.spacing.xs,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: accountingTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.borderLight,
  },
  label: {
    fontSize: accountingTheme.fontSizes.md,
    color: "#475569",
    fontWeight: accountingTheme.fontWeights.medium,
  },
  value: {
    fontSize: accountingTheme.fontSizes.md,
    color: accountingTheme.colors.text,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  highlightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: accountingTheme.spacing.md,
    backgroundColor: accountingTheme.colors.primary,
  },
  highlightLabel: {
    fontSize: accountingTheme.fontSizes.md,
    color: accountingTheme.colors.card,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  highlightValue: {
    fontSize: accountingTheme.fontSizes.md,
    color: accountingTheme.colors.card,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalDismiss: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: accountingTheme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  sheetHandleWrap: {
    alignItems: "center",
    paddingVertical: accountingTheme.spacing.md,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: accountingTheme.colors.borderMedium,
    borderRadius: 2,
  },
  sheetOptions: {
    marginTop: accountingTheme.spacing.sm,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: accountingTheme.spacing.lg,
    paddingHorizontal: accountingTheme.spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: "#E5EAF3",
  },
  optionIcon: {
    marginRight: accountingTheme.spacing.md,
  },
  optionText: {
    fontSize: accountingTheme.fontSizes.lg,
    color: "#475569",
    fontWeight: accountingTheme.fontWeights.medium,
  },
});
