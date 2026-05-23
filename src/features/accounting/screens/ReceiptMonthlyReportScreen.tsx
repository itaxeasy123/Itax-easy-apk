import { useCallback, useMemo, useState } from "react";
import { useRouter , useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AccountingHeader, BottomNav, Card, EmptyState, Loading, SalesReportSwitcher } from "../components";
import { accountingService } from "../services/accountingService";
import { voucherService } from "../services/voucherService";
import { DayBook, VoucherEntry } from "../types/accountingTypes";
import {
  buildMonthlyReceiptSeriesFromDayBook,
  buildMonthlyReceiptSeriesFromVouchers,
  formatCurrency,
} from "../utils/salesReport";


export default function ReceiptMonthlyReportScreen() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dayBook, setDayBook] = useState<DayBook[]>([]);
  const [vouchers, setVouchers] = useState<VoucherEntry[]>([]);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [dayBookResult, voucherResult] = await Promise.all([
        accountingService.getDayBook(),
        voucherService.getAll(),
      ]);

      setDayBook(dayBookResult.data ?? []);
      setVouchers(voucherResult.data ?? []);
    } catch {
      setError("Unable to load receipt monthly report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadReport();
    }, [loadReport])
  );

  const monthlyFromVouchers = useMemo(
    () => buildMonthlyReceiptSeriesFromVouchers(vouchers, year),
    [vouchers, year]
  );
  const monthlyFromDayBook = useMemo(
    () => buildMonthlyReceiptSeriesFromDayBook(dayBook, year),
    [dayBook, year]
  );
  const monthlyReceipts = monthlyFromVouchers.some((item) => item.amount > 0)
    ? monthlyFromVouchers
    : monthlyFromDayBook;
  const totalReceipt = monthlyReceipts.reduce((sum, item) => sum + item.amount, 0);
  const visibleMonths = monthlyReceipts.filter((item) => item.amount > 0);

  return (
    <View style={styles.screen}>
      <AccountingHeader
        title="Receipt"
        subtitle="Monthly receipts overview"
        showBackButton
        rightContent={<Ionicons name="ellipsis-horizontal" size={18} color="#fff" />}
        headerContent={(
          <View style={styles.headerBlock}>
            <Text style={styles.headerAmount}>{formatCurrency(totalReceipt)}</Text>
            <Text style={styles.headerMeta}>Total Receipt</Text>
          </View>
        )}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.switcherWrap}>
          <SalesReportSwitcher
            active="monthly"
            onMonthlyPress={() => router.replace("/accounting/reports-receipt-monthly")}
            onCustomersPress={() => router.push("/accounting/reports-receipt-customers")}
          />
        </View>

        <View style={styles.yearRow}>
          <View style={styles.yearLeft}>
            <Ionicons name="calendar-outline" size={16} color="#2563EB" />
            <Text style={styles.yearText}>
              Financial Year ({String(year - 1).slice(-2)} Apr to {String(year).slice(-2)} Mar)
            </Text>
          </View>
          <Pressable onPress={() => setYear((prev) => prev + 1)}>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
        </View>

        {loading ? <Loading text="Loading receipt data..." /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && !error ? (
          <>
            <Card style={styles.listCard}>
              <View style={styles.listHeaderWrap}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Receipts by Month</Text>
                  <Text style={styles.sectionMeta}>{visibleMonths.length} records</Text>
                </View>
              </View>

              {visibleMonths.length > 0 ? (
                visibleMonths.map((row) => (
                  <View key={row.monthIndex} style={styles.row}>
                    <Text style={styles.rowTitle}>{row.label} {String(year).slice(-2)}</Text>
                    <Text style={styles.rowAmount}>{formatCurrency(row.amount)}</Text>
                  </View>
                ))
              ) : (
                <EmptyState
                  icon="calendar-outline"
                  title="No monthly receipt data yet"
                  description="Create receipt vouchers and the monthly list will populate here."
                />
              )}
            </Card>
          </>
        ) : null}
      </ScrollView>

      <BottomNav activeRoute="/accounting/reports" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F9FF",
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 110,
  },
  switcherWrap: {
    marginBottom: 12,
  },
  yearRow: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  yearLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  yearText: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "600",
    flex: 1,
  },
  changeText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "700",
  },
  headerBlock: {
    alignItems: "center",
    marginTop: 2,
  },
  headerAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#EAFDFC",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  sectionMeta: {
    fontSize: 11,
    color: "#64748B",
  },
  listCard: {
    padding: 0,
    overflow: "hidden",
    marginBottom: 12,
  },
  listHeaderWrap: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#EEF2F7",
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  errorText: {
    color: "#DC2626",
    marginBottom: 12,
  },
});
