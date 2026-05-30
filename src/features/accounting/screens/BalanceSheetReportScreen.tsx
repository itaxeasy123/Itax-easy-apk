import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Modal, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AccountingHeader } from "../components";
import { Ionicons } from "@expo/vector-icons";
import { accountingService } from "../services/accountingService";
import { accountingTheme } from "../../../theme/accounting";

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

  useEffect(() => {
    async function loadBalanceSheet() {
      try {
        setLoading(true);
        setError(null);
        // Replace with actual balance sheet report endpoint
        const response = await accountingService.getProfitAndLossReport(year, month);
        if (response.success && response.data) {
          setReport(response.data);
        } else {
          setError("Unable to load balance sheet report.");
        }
      } catch {
        setError("Unable to load balance sheet report.");
      } finally {
        setLoading(false);
      }
    }
    loadBalanceSheet();
  }, [month, year]);

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Balance Sheet"
        showBackButton
        rightContent={
          <Pressable>
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

      {/* Financial Year Bar */}
      <View style={styles.periodBar}>
        <View style={styles.periodLeft}>
          <Ionicons name="calendar-outline" size={16} color={accountingTheme.colors.primary} />
          <Text style={styles.periodText}>
            Financial Year <Text style={styles.periodSubText}>(1 Apr 24 to 31 Mar 25)</Text>
          </Text>
        </View>
        <Pressable>
          <Text style={styles.changeText}>Change</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={accountingTheme.colors.primary} />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.tableCard}>
            {tab === "assets" ? (
              <>
                <View style={styles.row}>
                  <View style={styles.labelWrap}>
                    <Text style={styles.label}>Current Assets</Text>
                    <Ionicons name="information-circle-outline" size={14} color={accountingTheme.colors.textMuted} />
                  </View>
                  <Text style={styles.value}>{format(report?.currentAssets)}</Text>
                </View>
                <View style={styles.row}>
                  <View style={styles.labelWrap}>
                    <Text style={styles.label}>Fixed Assets</Text>
                    <Ionicons name="information-circle-outline" size={14} color={accountingTheme.colors.textMuted} />
                  </View>
                  <Text style={styles.value}>{format(report?.fixedAssets)}</Text>
                </View>
                <View style={styles.row}>
                  <View style={styles.labelWrap}>
                    <Text style={styles.label}>Investments</Text>
                    <Ionicons name="information-circle-outline" size={14} color={accountingTheme.colors.textMuted} />
                  </View>
                  <Text style={styles.value}>{format(report?.investments)}</Text>
                </View>
                <View style={styles.row}>
                  <View style={styles.labelWrap}>
                    <Text style={styles.label}>Loan Advances</Text>
                    <Ionicons name="information-circle-outline" size={14} color={accountingTheme.colors.textMuted} />
                  </View>
                  <Text style={styles.value}>{format(report?.loanAdvances)}</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.row}>
                  <View style={styles.labelWrap}>
                    <Text style={styles.label}>Capital</Text>
                    <Ionicons name="information-circle-outline" size={14} color={accountingTheme.colors.textMuted} />
                  </View>
                  <Text style={styles.value}>{format(report?.capital)}</Text>
                </View>
                <View style={styles.row}>
                  <View style={styles.labelWrap}>
                    <Text style={styles.label}>Current Liability</Text>
                    <Ionicons name="information-circle-outline" size={14} color={accountingTheme.colors.textMuted} />
                  </View>
                  <Text style={styles.value}>{format(report?.currentLiability)}</Text>
                </View>
                <View style={styles.row}>
                  <View style={styles.labelWrap}>
                    <Text style={styles.label}>Loan</Text>
                    <Ionicons name="information-circle-outline" size={14} color={accountingTheme.colors.textMuted} />
                  </View>
                  <Text style={styles.value}>{format(report?.loan)}</Text>
                </View>
                <View style={styles.row}>
                  <View style={styles.labelWrap}>
                    <Text style={styles.label}>Net Income</Text>
                    <Ionicons name="information-circle-outline" size={14} color={accountingTheme.colors.textMuted} />
                  </View>
                  <Text style={styles.value}>{format(report?.netIncome)}</Text>
                </View>
              </>
            )}
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
          {format(tab === "assets" ? report?.totalAssets : report?.totalLiabilities)}
        </Text>
      </View>
      <View style={{ backgroundColor: accountingTheme.colors.card, height: Math.max(insets.bottom, 0) }} />

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

              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="Select Date"
                  value={entryDate}
                  onChangeText={setEntryDate}
                  placeholderTextColor={accountingTheme.colors.textMuted}
                />
                <Ionicons name="calendar-outline" size={16} color={accountingTheme.colors.textMuted} style={styles.inputIcon} />
              </View>

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
                style={styles.saveBtn}
                onPress={() => setShowEntryModal(false)}
              >
                <Text style={styles.saveBtnText}>Save</Text>
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
});
