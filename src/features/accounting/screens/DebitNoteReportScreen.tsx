import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AccountingHeader, BottomNav, SalesReportSwitcher, EmptyState, Loading } from "../components";
import { accountingTheme } from "../../../theme/accounting";
import { voucherService } from "../services/voucherService";
import type { VoucherEntry } from "../types/accountingTypes";

type Tab = "monthly" | "customers" | "item";

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const formatCurrency = (value: number) =>
  `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const voucherAmount = (v: VoucherEntry) => v.totalDebit || v.totalCredit || 0;

export default function DebitNoteReportScreen() {
  const currentYear = new Date().getFullYear();
  const [activeTab, setActiveTab] = useState<Tab>("monthly");
  const [year, setYear] = useState(currentYear);
  const [debitNotes, setDebitNotes] = useState<VoucherEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await voucherService.getAllFromServer();
        const notes = (res.data ?? []).filter(
          (v) => v.voucherType === "debitNote" && (v.status === "POSTED" || v.status === "REVERSED")
        );
        if (!cancelled) setDebitNotes(notes);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load debit notes");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const yearNotes = useMemo(
    () =>
      debitNotes.filter((v) => {
        const d = new Date(v.entryDate);
        return !Number.isNaN(d.getTime()) && d.getFullYear() === year;
      }),
    [debitNotes, year]
  );

  const grandTotal = useMemo(
    () => yearNotes.reduce((sum, v) => sum + voucherAmount(v), 0),
    [yearNotes]
  );

  const monthlyTotals = useMemo(() => {
    const totals = new Array(12).fill(0) as number[];
    for (const v of yearNotes) {
      const m = new Date(v.entryDate).getMonth();
      totals[m] += voucherAmount(v);
    }
    return totals;
  }, [yearNotes]);

  const customerTotals = useMemo(() => {
    const map = new Map<string, { name: string; amount: number; count: number }>();
    for (const v of yearNotes) {
      const name =
        v.partyName ??
        v.lines?.find((l) => l.side === "credit")?.ledgerName ??
        "Unknown";
      const entry = map.get(name) ?? { name, amount: 0, count: 0 };
      entry.amount += voucherAmount(v);
      entry.count += 1;
      map.set(name, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [yearNotes]);

  const renderList = () => {
    if (loading) {
      return <Loading text="Loading debit notes..." style={styles.loadingWrap} />;
    }
    if (error) {
      return (
        <EmptyState
          icon="alert-circle-outline"
          title="Couldn't load debit notes"
          description={error}
        />
      );
    }

    if (activeTab === "monthly") {
      if (yearNotes.length === 0) {
        return (
          <EmptyState
            icon="calendar-outline"
            title="No debit notes"
            description={`No posted debit notes found for ${year}.`}
          />
        );
      }
      return (
        <>
          {MONTH_LABELS.map((label, index) => (
            <View key={label} style={[styles.row, index === 0 && styles.firstRow]}>
              <Text style={styles.rowTitle}>{label}</Text>
              <Text style={styles.rowAmount}>{formatCurrency(monthlyTotals[index])}</Text>
            </View>
          ))}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalTitle}>Grand Total</Text>
            <Text style={styles.totalAmount}>{formatCurrency(grandTotal)}</Text>
          </View>
        </>
      );
    }

    if (activeTab === "customers") {
      if (customerTotals.length === 0) {
        return (
          <EmptyState
            icon="people-outline"
            title="No debit notes"
            description={`No posted debit notes found for ${year}.`}
          />
        );
      }
      return customerTotals.map((item, index) => (
        <View key={item.name} style={[styles.row, index === 0 && styles.firstRow]}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowTitle}>{item.name}</Text>
            <Text style={styles.rowSub}>
              {item.count} {item.count === 1 ? "debit note" : "debit notes"}
            </Text>
          </View>
          <Text style={styles.rowAmount}>{formatCurrency(item.amount)}</Text>
        </View>
      ));
    }

    // Item tab — debit notes are not tracked per item
    return (
      <EmptyState
        icon="cube-outline"
        title="Not tracked per item"
        description="Debit notes are recorded against ledgers, not items. Use the Customers tab."
      />
    );
  };

  return (
    <View style={styles.screen}>
      <AccountingHeader
        title="Debit Note"
        showBackButton
        headerContent={
          <View style={styles.headerBlock}>
            <Text style={styles.headerAmount}>{formatCurrency(grandTotal)}</Text>
            <Text style={styles.headerMeta}>Total Debit Notes ({year})</Text>
          </View>
        }
      />

      <View style={styles.mainContainer}>
        <View style={styles.topWhiteSection}>
          <View style={styles.switcherWrap}>
            <SalesReportSwitcher
              active={activeTab as any}
              onMonthlyPress={() => setActiveTab("monthly")}
              onCustomersPress={() => setActiveTab("customers")}
              thirdLabel="Item Wise"
              onThirdPress={() => setActiveTab("item")}
            />
          </View>

          <View style={styles.yearRow}>
            <View style={styles.yearLeft}>
              <Ionicons name="calendar-outline" size={16} color={accountingTheme.colors.primary} />
              <Text style={styles.yearText}>
                Year {year} <Text style={styles.yearTextLight}>(1 Jan to 31 Dec)</Text>
              </Text>
            </View>
            <Pressable onPress={() => setYear((y) => (y === currentYear ? currentYear - 1 : currentYear))}>
              <Text style={styles.changeText}>
                {year === currentYear ? `Show ${currentYear - 1}` : `Show ${currentYear}`}
              </Text>
            </Pressable>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          <View style={styles.listContainer}>
            {renderList()}
          </View>
        </ScrollView>
      </View>

      <BottomNav activeRoute="/accounting" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6", // Gray background at the very bottom/behind
  },
  headerBlock: {
    alignItems: "center",
    marginTop: accountingTheme.spacing.xs,
    marginBottom: accountingTheme.spacing.md,
  },
  headerAmount: {
    fontSize: accountingTheme.fontSizes.xxxl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.card,
  },
  headerMeta: {
    marginTop: 2,
    fontSize: 11,
    color: "#EAFDFC",
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  mainContainer: {
    flex: 1,
    marginTop: -8, // Slight overlap with header
  },
  topWhiteSection: {
    backgroundColor: accountingTheme.colors.card,
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: accountingTheme.spacing.lg,
  },
  switcherWrap: {
    marginBottom: accountingTheme.spacing.md,
  },
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: accountingTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.surfaceLight,
  },
  yearLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.xs,
    flex: 1,
  },
  yearText: {
    fontSize: 11,
    color: "#334155",
    fontWeight: accountingTheme.fontWeights.bold,
  },
  yearTextLight: {
    fontWeight: accountingTheme.fontWeights.regular,
    color: accountingTheme.colors.textSecondary,
  },
  changeText: {
    fontSize: 11,
    color: accountingTheme.colors.primary,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  listContent: {
    paddingBottom: 110,
  },
  listContainer: {
    backgroundColor: accountingTheme.colors.card,
  },
  loadingWrap: {
    paddingVertical: 40,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: accountingTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: accountingTheme.colors.surfaceLight,
  },
  firstRow: {
    borderTopWidth: 0,
  },
  rowLeft: {
    flex: 1,
    paddingRight: accountingTheme.spacing.md,
  },
  rowTitle: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.medium,
    color: "#334155",
  },
  rowSub: {
    marginTop: 2,
    fontSize: 11,
    color: accountingTheme.colors.textMuted,
  },
  rowAmount: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  totalRow: {
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: accountingTheme.colors.borderMedium,
  },
  totalTitle: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.text,
  },
  totalAmount: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.primary,
  },
});
