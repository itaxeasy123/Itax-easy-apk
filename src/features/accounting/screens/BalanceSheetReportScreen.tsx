import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Modal, TextInput } from "react-native";
import { AccountingHeader } from "../components";
import { Ionicons } from "@expo/vector-icons";
import { accountingService } from "../services/accountingService";

const format = (value: number | undefined) => {
  if (value === undefined || isNaN(value)) return "₹ 0.00";
  return `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

export default function BalanceSheetReportScreen() {
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
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
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
          <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
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
            <ActivityIndicator size="large" color="#3B82F6" />
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
                    <Ionicons name="information-circle-outline" size={14} color="#94A3B8" />
                  </View>
                  <Text style={styles.value}>{format(report?.currentAssets)}</Text>
                </View>
                <View style={styles.row}>
                  <View style={styles.labelWrap}>
                    <Text style={styles.label}>Fixed Assets</Text>
                    <Ionicons name="information-circle-outline" size={14} color="#94A3B8" />
                  </View>
                  <Text style={styles.value}>{format(report?.fixedAssets)}</Text>
                </View>
                <View style={styles.row}>
                  <View style={styles.labelWrap}>
                    <Text style={styles.label}>Investments</Text>
                    <Ionicons name="information-circle-outline" size={14} color="#94A3B8" />
                  </View>
                  <Text style={styles.value}>{format(report?.investments)}</Text>
                </View>
                <View style={styles.row}>
                  <View style={styles.labelWrap}>
                    <Text style={styles.label}>Loan Advances</Text>
                    <Ionicons name="information-circle-outline" size={14} color="#94A3B8" />
                  </View>
                  <Text style={styles.value}>{format(report?.loanAdvances)}</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.row}>
                  <View style={styles.labelWrap}>
                    <Text style={styles.label}>Capital</Text>
                    <Ionicons name="information-circle-outline" size={14} color="#94A3B8" />
                  </View>
                  <Text style={styles.value}>{format(report?.capital)}</Text>
                </View>
                <View style={styles.row}>
                  <View style={styles.labelWrap}>
                    <Text style={styles.label}>Current Liability</Text>
                    <Ionicons name="information-circle-outline" size={14} color="#94A3B8" />
                  </View>
                  <Text style={styles.value}>{format(report?.currentLiability)}</Text>
                </View>
                <View style={styles.row}>
                  <View style={styles.labelWrap}>
                    <Text style={styles.label}>Loan</Text>
                    <Ionicons name="information-circle-outline" size={14} color="#94A3B8" />
                  </View>
                  <Text style={styles.value}>{format(report?.loan)}</Text>
                </View>
                <View style={styles.row}>
                  <View style={styles.labelWrap}>
                    <Text style={styles.label}>Net Income</Text>
                    <Ionicons name="information-circle-outline" size={14} color="#94A3B8" />
                  </View>
                  <Text style={styles.value}>{format(report?.netIncome)}</Text>
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => setShowEntryModal(true)}>
        <Ionicons name="add" size={20} color="#FFFFFF" />
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
                  <Ionicons name="chevron-down" size={16} color="#64748B" />
                </Pressable>
              </View>

              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="Select Date"
                  value={entryDate}
                  onChangeText={setEntryDate}
                  placeholderTextColor="#94A3B8"
                />
                <Ionicons name="calendar-outline" size={16} color="#94A3B8" style={styles.inputIcon} />
              </View>

              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="Amount"
                  value={entryAmount}
                  onChangeText={setEntryAmount}
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
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
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginTop: 16,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  tabBtnActive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#3B82F6",
  },
  content: {
    paddingBottom: 100,
  },
  periodBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  periodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  periodText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  periodSubText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#64748B",
  },
  changeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3B82F6",
  },
  loaderWrap: {
    padding: 40,
    alignItems: "center",
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    marginTop: 24,
  },
  tableCard: {
    backgroundColor: "#FFFFFF",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  labelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 72,
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    gap: 6,
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  footerLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  footerValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
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
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  sheetHandleWrap: {
    alignItems: "center",
    paddingVertical: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 20,
  },
  inputGroup: {
    position: "relative",
    marginBottom: 16,
  },
  inputLabelOverlay: {
    position: "absolute",
    top: -8,
    left: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
    fontSize: 10,
    color: "#64748B",
    zIndex: 1,
  },
  dropdownInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 44,
  },
  dropdownValue: {
    fontSize: 14,
    color: "#0F172A",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 44,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },
  inputIcon: {
    marginLeft: 8,
  },
  saveBtn: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  categoryList: {
    marginTop: -8,
  },
  categoryItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  categoryItemActive: {
    backgroundColor: "#F1F5F9",
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  categoryItemText: {
    fontSize: 14,
    color: "#475569",
  },
  categoryItemTextActive: {
    color: "#0F172A",
    fontWeight: "600",
  },
});
