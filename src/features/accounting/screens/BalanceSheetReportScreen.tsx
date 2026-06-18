import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Modal, TextInput, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AccountingHeader, DateField, FiscalYearBar, isValidIsoDate } from "../components";
import { FiscalYearInfo } from "../services/billshieldUiService";
import { Ionicons } from "@expo/vector-icons";
import { billshieldUiService } from "../services/billshieldUiService";
import { accountingTheme } from "../../../theme/accounting";
import { exportCsv, exportExcel, exportPdf, buildPdfHtml } from "../utils/exportFile";

const format = (value: number | undefined) => {
  if (value === undefined || isNaN(value)) return "₹ 0.00";
  return `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

export default function BalanceSheetReportScreen() {
    const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"assets" | "liabilities">("assets");
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [entryCategory, setEntryCategory] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [entryAmount, setEntryAmount] = useState("");

  const assetCategories = ["Current Assets", "Fixed Assets", "Investments", "Loans Advance"];
  const liabilityCategories = ["Current Liabilities", "Capital", "Loan"];

  // Set default category when modal opens
  useEffect(() => {
    if (showEntryModal && !entryCategory) {
      setEntryCategory(tab === "assets" ? "Fixed Assets" : "Capital");
    }
  }, [showEntryModal, tab]);

  const [asOf, setAsOf] = useState<string | undefined>(undefined);

  const loadBalanceSheet = useCallback(async (asOfDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await billshieldUiService.getBalanceSheet(asOfDate);
      if (response.success) {
        setReport(response.data);
      } else {
        setError(response.message ?? "Unable to load balance sheet report.");
      }
    } catch {
      setError("Unable to load balance sheet report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBalanceSheet(asOf);
  }, [loadBalanceSheet, asOf, month, year]);

  const handleFyChange = (fy: FiscalYearInfo) => {
    setAsOf(fy.endDate);
  };

  // ---- export menu (3-dot) ----
  const [showExport, setShowExport] = useState(false);
  const exportRows = (): (string | number)[][] => [
    ["Side", "Group", "Amount"],
    ...(report?.assets ?? []).map((r: any) => ["Asset", r.group, r.amount]),
    ...(report?.liabilities ?? []).map((r: any) => ["Liability", r.group, r.amount]),
    ["", "TOTAL ASSETS", report?.totals?.assets ?? 0],
    ["", "TOTAL LIABILITIES", report?.totals?.liabilities ?? 0],
  ];
  const handleExport = async (format: "PDF" | "CSV" | "Excel") => {
    setShowExport(false);
    const data = exportRows();
    if (format === "CSV") await exportCsv("balance-sheet", data);
    else if (format === "Excel") await exportExcel("balance-sheet", "Balance Sheet", data);
    else await exportPdf("balance-sheet", buildPdfHtml("Balance Sheet", "Exported from iTaxEasy", data));
  };

  const [savingEntry, setSavingEntry] = useState(false);

  const handleSaveEntry = async () => {
    const amount = Number(entryAmount);
    if (!entryCategory) {
      Alert.alert("Missing category", "Please choose a category.");
      return;
    }
    if (!entryDate || !isValidIsoDate(entryDate)) {
      Alert.alert("Invalid date", "Please pick a date from the calendar.");
      return;
    }
    if (!amount || amount <= 0 || Number.isNaN(amount)) {
      Alert.alert("Invalid amount", "Please enter an amount greater than zero.");
      return;
    }
    setSavingEntry(true);
    const result = await billshieldUiService.addBalanceSheetEntry({
      category: entryCategory,
      side: tab,
      date: entryDate,
      amount,
    });
    setSavingEntry(false);
    if (result.success) {
      setShowEntryModal(false);
      setEntryAmount("");
      setEntryDate("");
      Alert.alert(
        "Entry posted",
        `Booked as journal voucher ${result.data?.voucherNo ?? ""} — the other side sits in Suspense A/c until you classify it.`
      );
      void loadBalanceSheet();
    } else {
      Alert.alert("Could not save", result.message ?? "Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Balance Sheet"
        showBackButton
        rightContent={
          <Pressable onPress={() => setShowExport(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} color={accountingTheme.colors.card} />
          </Pressable>
        }
        headerContent={
          <View style={styles.tabsContainer}>
            <Pressable
              style={[styles.tabBtn, tab === "assets" && styles.tabBtnActive]}
              onPress={() => setTab("assets")}
            >
              <Text style={[styles.tabText, tab === "assets" && styles.tabTextActive]}>Assets</Text>
            </Pressable>
            <Pressable
              style={[styles.tabBtn, tab === "liabilities" && styles.tabBtnActive]}
              onPress={() => setTab("liabilities")}
            >
              <Text style={[styles.tabText, tab === "liabilities" && styles.tabTextActive]}>Liabilities</Text>
            </Pressable>
          </View>
        }
      />

      {/* Financial Year Bar — real fiscal years, selectable */}
      <FiscalYearBar onChange={handleFyChange} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={accountingTheme.colors.primary} />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.tableCard}>
            {(tab === "assets" ? report?.assets ?? [] : report?.liabilities ?? []).map(
              (row: { group: string; amount: number }) => (
                <View key={row.group} style={styles.row}>
                  <View style={styles.labelWrap}>
                    <Text style={styles.label}>{row.group}</Text>
                    <Ionicons name="information-circle-outline" size={14} color={accountingTheme.colors.textMuted} />
                  </View>
                  <Text style={styles.value}>{format(row.amount)}</Text>
                </View>
              )
            )}
            {(tab === "assets" ? report?.assets : report?.liabilities)?.length === 0 ? (
              <Text style={styles.errorText}>Nothing here yet — post a voucher first.</Text>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable style={[styles.fab, { bottom: 86 + Math.max(insets.bottom, 0) }]} onPress={() => setShowEntryModal(true)}>
        <Ionicons name="add" size={18} color={accountingTheme.colors.card} />
        <Text style={styles.fabText}>Add New Entry</Text>
      </Pressable>

      {/* Footer Totals */}
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>
          {tab === "assets" ? "Total Assets" : "Total Liabilities"}
        </Text>
        <Text style={styles.footerValue}>
          {format(tab === "assets" ? report?.totals?.assets : report?.totals?.liabilities)}
        </Text>
      </View>
      <View style={{ backgroundColor: accountingTheme.colors.card, height: Math.max(insets.bottom, 0) }} />

      {/* Export menu (3-dot) */}
      <Modal visible={showExport} transparent animationType="slide" onRequestClose={() => setShowExport(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowExport(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>
            <View style={styles.sheetContent}>
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
        </View>
      </Modal>

      {/* Add Entry Bottom Sheet Modal */}
      <Modal
        visible={showEntryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEntryModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowEntryModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>

            <View style={styles.sheetContent}>
              <Text style={styles.sheetTitle}>
                {tab === "assets" ? "Add Assets" : "Add Liabilities"}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabelOverlay}>Category</Text>
                <Pressable
                  style={styles.dropdownInput}
                  onPress={() => setShowCategoryModal(true)}
                >
                  <Text style={styles.dropdownValue}>{entryCategory}</Text>
                  <Ionicons name="chevron-down" size={16} color={accountingTheme.colors.textSecondary} />
                </Pressable>
              </View>

              <DateField value={entryDate} onChange={setEntryDate} placeholder="Select date" style={{ marginBottom: 16 }} />

              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="Amount"
                  value={entryAmount}
                  onChangeText={setEntryAmount}
                  keyboardType="numeric"
                  placeholderTextColor={accountingTheme.colors.textMuted}
                />
              </View>

              <Pressable
                style={[styles.saveBtn, savingEntry && { opacity: 0.6 }]}
                onPress={handleSaveEntry}
                disabled={savingEntry}
              >
                <Text style={styles.saveBtnText}>{savingEntry ? "Posting..." : "Save"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Selection Bottom Sheet Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowCategoryModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>

            <View style={styles.sheetContent}>
              <Text style={styles.sheetTitle}>Category</Text>

              <View style={styles.categoryList}>
                {(tab === "assets" ? assetCategories : liabilityCategories).map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryItem,
                      entryCategory === cat && styles.categoryItemActive,
                    ]}
                    onPress={() => {
                      setEntryCategory(cat);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryItemText,
                        entryCategory === cat && styles.categoryItemTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
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
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: accountingTheme.colors.card,
    borderRadius: 24,
    marginTop: accountingTheme.spacing.lg,
    padding: accountingTheme.spacing.xs,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  tabBtnActive: {
    backgroundColor: accountingTheme.colors.card,
    borderWidth: 1,
    borderColor: accountingTheme.colors.primary,
  },
  tabText: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: accountingTheme.colors.textSecondary,
  },
  tabTextActive: {
    color: accountingTheme.colors.primary,
  },
  content: {
    paddingBottom: 100,
  },
  periodBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: accountingTheme.colors.card,
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: accountingTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.borderMedium,
  },
  periodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.sm,
  },
  periodText: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#1E293B",
  },
  periodSubText: {
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.regular,
    color: accountingTheme.colors.textSecondary,
  },
  changeText: {
    fontSize: accountingTheme.fontSizes.md,
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
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: accountingTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.borderLight,
  },
  labelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  fab: {
    position: "absolute",
    right: 16,
    bottom: 86,
    backgroundColor: accountingTheme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: accountingTheme.spacing.xl,
    paddingVertical: 14,
    borderRadius: accountingTheme.radius.full,
    elevation: 4,
    shadowColor: accountingTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    gap: accountingTheme.spacing.sm,
  },
  fabText: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: accountingTheme.colors.primary,
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: accountingTheme.spacing.lg,
  },
  footerLabel: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  footerValue: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.lg,
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
    paddingBottom: accountingTheme.spacing.xxl,
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
  sheetContent: {
    paddingHorizontal: accountingTheme.spacing.xxl,
    paddingBottom: accountingTheme.spacing.lg,
  },
  sheetTitle: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#1E293B",
    marginBottom: accountingTheme.spacing.xl,
  },
  inputGroup: {
    position: "relative",
    marginBottom: accountingTheme.spacing.lg,
  },
  inputLabelOverlay: {
    position: "absolute",
    top: -8,
    left: 12,
    backgroundColor: accountingTheme.colors.card,
    paddingHorizontal: accountingTheme.spacing.xs,
    fontSize: accountingTheme.fontSizes.xs,
    color: accountingTheme.colors.textSecondary,
    zIndex: 1,
  },
  dropdownInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: accountingTheme.spacing.lg,
    height: 44,
  },
  dropdownValue: {
    fontSize: accountingTheme.fontSizes.lg,
    color: accountingTheme.colors.text,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: accountingTheme.spacing.lg,
    height: 44,
    marginBottom: accountingTheme.spacing.lg,
  },
  input: {
    flex: 1,
    fontSize: accountingTheme.fontSizes.lg,
    color: accountingTheme.colors.text,
  },
  inputIcon: {
    marginLeft: accountingTheme.spacing.sm,
  },
  saveBtn: {
    backgroundColor: accountingTheme.colors.primary,
    borderRadius: 8,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: accountingTheme.spacing.sm,
  },
  saveBtnText: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  categoryList: {
    marginTop: -8,
  },
  categoryItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.borderLight,
  },
  categoryItemActive: {
    backgroundColor: accountingTheme.colors.borderLight,
    marginHorizontal: -24,
    paddingHorizontal: accountingTheme.spacing.xxl,
  },
  categoryItemText: {
    fontSize: accountingTheme.fontSizes.lg,
    color: "#475569",
  },
  categoryItemTextActive: {
    color: accountingTheme.colors.text,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  exportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  exportText: {
    fontSize: accountingTheme.fontSizes.lg,
    color: "#111827",
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
});
