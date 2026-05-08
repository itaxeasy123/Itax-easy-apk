import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { AccountingHeader } from "../components";
import { Ionicons } from "@expo/vector-icons";
import { accountingService } from "../services/accountingService";

const format = (value: number | undefined) => {
  if (value === undefined || isNaN(value)) return "₹ 0.00";
  return `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

export default function TrialBalanceScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrialBalance() {
      try {
        setLoading(true);
        setError(null);
        // Replace with actual trial balance report endpoint
        const response = await accountingService.getProfitAndLossReport(year, month);
        if (response.success && response.data) {
          setReport(response.data);
        } else {
          setError("Unable to load trial balance report.");
        }
      } catch {
        setError("Unable to load trial balance report.");
      } finally {
        setLoading(false);
      }
    }
    loadTrialBalance();
  }, [month, year]);

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Trial Balance"
        showBackButton
        rightContent={
          <Pressable>
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
          </Pressable>
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

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.thText, { flex: 2 }]}>Particular</Text>
        <Text style={[styles.thText, { flex: 1.5, textAlign: "right" }]}>Debit</Text>
        <Text style={[styles.thText, { flex: 1.5, textAlign: "right" }]}>Credit</Text>
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
            <View style={styles.row}>
              <Text style={styles.particular}>Cash in-hand</Text>
              <Text style={styles.amount}>{format(report?.cashInHandDebit)}</Text>
              <Text style={styles.amount}>{format(report?.cashInHandCredit)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.particular}>Bank A/c</Text>
              <Text style={styles.amount}>{format(report?.bankDebit)}</Text>
              <Text style={styles.amount}>{format(report?.bankCredit)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.particular}>Sales A/c</Text>
              <Text style={styles.amount}>{format(report?.salesDebit)}</Text>
              <Text style={styles.amount}>{format(report?.salesCredit)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.particular}>Purchase A/c</Text>
              <Text style={styles.amount}>{format(report?.purchaseDebit)}</Text>
              <Text style={styles.amount}>{format(report?.purchaseCredit)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.particular}>Debit Note</Text>
              <Text style={styles.amount}>{format(report?.debitNoteDebit)}</Text>
              <Text style={styles.amount}>{format(report?.debitNoteCredit)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.particular}>Credit Note</Text>
              <Text style={styles.amount}>{format(report?.creditNoteDebit)}</Text>
              <Text style={styles.amount}>{format(report?.creditNoteCredit)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.particular}>Capital</Text>
              <Text style={styles.amount}>{format(report?.capitalDebit)}</Text>
              <Text style={styles.amount}>{format(report?.capitalCredit)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.particular}>Assets</Text>
              <Text style={styles.amount}>{format(report?.assetsDebit)}</Text>
              <Text style={styles.amount}>{format(report?.assetsCredit)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.particular}>Liabilities</Text>
              <Text style={styles.amount}>{format(report?.liabilitiesDebit)}</Text>
              <Text style={styles.amount}>{format(report?.liabilitiesCredit)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.particular}>OpeningStock</Text>
              <Text style={styles.amount}>{format(report?.openingStockDebit)}</Text>
              <Text style={styles.amount}>{format(report?.openingStockCredit)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Totals */}
      <View style={styles.footer}>
        <Text style={[styles.footerLabel, { flex: 2 }]}>Total</Text>
        <Text style={[styles.footerValue, { flex: 1.5, textAlign: "right" }]}>{format(report?.totalDebit)}</Text>
        <Text style={[styles.footerValue, { flex: 1.5, textAlign: "right" }]}>{format(report?.totalCredit)}</Text>
      </View>
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
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  thText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
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
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  particular: {
    flex: 2,
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  amount: {
    flex: 1.5,
    fontSize: 12,
    color: "#0F172A",
    fontWeight: "700",
    textAlign: "right",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  footerLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  footerValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
