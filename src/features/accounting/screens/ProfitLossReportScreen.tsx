import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Modal } from "react-native";
import { AccountingHeader } from "../components";
import { Ionicons } from "@expo/vector-icons";
import { accountingService } from "../services/accountingService";
import { ProfitAndLossReport } from "../types/accountingTypes";

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

  useEffect(() => {
    async function loadProfitLoss() {
      try {
        setLoading(true);
        setError(null);
        const response = await accountingService.getProfitAndLossReport(year, month);
        if (response.success && response.data) {
          setReport(response.data);
        } else {
          setError("Unable to load profit and loss report.");
        }
      } catch {
        setError("Unable to load profit and loss report.");
      } finally {
        setLoading(false);
      }
    }
    loadProfitLoss();
  }, [month, year]);

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Profit & Loss"
        showBackButton
        rightContent={
          <Pressable onPress={() => setShowActionModal(true)}>
            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

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

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#3B82F6" />
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
              <Pressable style={styles.optionRow} onPress={() => setShowActionModal(false)}>
                <Ionicons name="document-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Download (PDF)</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={() => setShowActionModal(false)}>
                <Ionicons name="document-text-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Download (Excel)</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={() => setShowActionModal(false)}>
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
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    marginBottom: 8,
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
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
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
  highlightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#3B82F6",
  },
  highlightLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  highlightValue: {
    fontSize: 14,
    color: "#FFFFFF",
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
    paddingBottom: 30,
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
  sheetOptions: {
    marginTop: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5EAF3",
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
});
