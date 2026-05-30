import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AccountingHeader } from "../components";
import { Ionicons } from "@expo/vector-icons";
import { accountingService } from "../services/accountingService";
import { accountingTheme } from "../../../theme/accounting";

const format = (value: number | undefined) => {
  if (value === undefined || isNaN(value)) return "₹ 0.00";
  return `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

export default function TrialBalanceScreen() {
    const insets = useSafeAreaInsets();
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
            <Ionicons name="ellipsis-horizontal" size={20} color={accountingTheme.colors.card} />
          </Pressable>
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
      <View style={{ backgroundColor: accountingTheme.colors.card, height: Math.max(insets.bottom, 0) }} />
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
    flex: 2,
    fontSize: accountingTheme.fontSizes.sm,
    color: "#475569",
    fontWeight: accountingTheme.fontWeights.medium,
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
