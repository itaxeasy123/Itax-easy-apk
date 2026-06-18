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
import { accountingTheme } from "../../../theme/accounting";
import {
  buildMonthlyReceiptSeriesFromDayBook,
  buildMonthlyReceiptSeriesFromVouchers,
  buildReceiptCustomerRows,
  formatCurrency,
  getCurrentFinancialYearLabel,
} from "../utils/salesReport";


export default function ReceiptCustomersReportScreen() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
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
      setError("Unable to load receipt customer report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadReport();
    }, [loadReport])
  );

  const customerRows = useMemo(() => buildReceiptCustomerRows(vouchers), [vouchers]);
  const monthlyFromVouchers = useMemo(
    () => buildMonthlyReceiptSeriesFromVouchers(vouchers, currentYear),
    [vouchers, currentYear]
  );
  const monthlyFromDayBook = useMemo(
    () => buildMonthlyReceiptSeriesFromDayBook(dayBook, currentYear),
    [dayBook, currentYear]
  );
  const monthlyReceipts = monthlyFromVouchers.some((item) => item.amount > 0)
    ? monthlyFromVouchers
    : monthlyFromDayBook;
  const totalReceipt = monthlyReceipts.reduce((sum, item) => sum + item.amount, 0);
  const financialYear = getCurrentFinancialYearLabel();

  return (
    <View style={styles.screen}>
      <AccountingHeader
        title="Receipt"
        subtitle="Customer-wise receipts"
        showBackButton
        rightContent={<Ionicons name="ellipsis-horizontal" size={18} color={accountingTheme.colors.card} />}
        headerContent={(
          <View style={styles.headerRow}>
            <View style={styles.headerBlock}>
              <Text style={styles.headerAmount}>{formatCurrency(totalReceipt)}</Text>
              <Text style={styles.headerMeta}>Total Receipt</Text>
            </View>
            <View style={styles.fyBadge}>
              <Text style={styles.fyLabel}>FY</Text>
              <Text style={styles.fyValue}>{financialYear}</Text>
            </View>
          </View>
        )}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.switcherWrap}>
          <SalesReportSwitcher
            active="customers"
            onMonthlyPress={() => router.navigate("/accounting/reports-receipt-monthly")}
            onCustomersPress={() => router.replace("/accounting/reports-receipt-customers")}
          />
        </View>

        <View style={styles.yearRow}>
          <View style={styles.yearLeft}>
            <Ionicons name="calendar-outline" size={16} color={accountingTheme.colors.primary} />
            <Text style={styles.yearText}>
              Financial Year ({String(currentYear - 1).slice(-2)} Apr to {String(currentYear).slice(-2)} Mar)
            </Text>
          </View>
          <Pressable onPress={() => router.navigate("/accounting/reports-receipt-monthly")}>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
        </View>

        {loading ? <Loading text="Loading receipt customer report..." /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && !error ? (
          <>
            <Card style={styles.listCard}>
              <View style={styles.listHeaderWrap}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Receipt by Customer</Text>
                  <Text style={styles.sectionMeta}>{customerRows.length} records</Text>
                </View>
              </View>

              {customerRows.length > 0 ? (
                customerRows.map((row) => (
                  <Pressable
                      key={row.id}
                      onPress={() =>
                        router.navigate({
                          pathname: "/accounting/reports-receipt-customers/[id]",
                          params: { id: row.id, name: row.customerName },
                        })
                      }
                    style={({ pressed }) => [styles.customerRow, pressed && styles.customerRowPressed]}
                  >
                    <Text style={styles.customerName} numberOfLines={1}>
                      {row.customerName}
                    </Text>
                    <Text style={styles.customerAmount}>{formatCurrency(row.amount)}</Text>
                  </Pressable>
                ))
              ) : (
                <EmptyState
                  icon="people"
                  title="No receipt data yet"
                  description="Create receipt vouchers and the customer list will populate here."
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
    backgroundColor: accountingTheme.colors.background,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: accountingTheme.spacing.md,
    paddingBottom: 110,
  },
  switcherWrap: {
    marginBottom: accountingTheme.spacing.md,
  },
  yearRow: {
    marginBottom: accountingTheme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontWeight: accountingTheme.fontWeights.semiBold,
    flex: 1,
  },
  changeText: {
    fontSize: 11,
    color: accountingTheme.colors.primary,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  headerBlock: {
    alignItems: "center",
    marginTop: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: accountingTheme.spacing.md,
  },
  headerAmount: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.card,
  },
  headerMeta: {
    marginTop: 2,
    fontSize: 11,
    color: "#EAFDFC",
  },
  fyBadge: {
    minWidth: 64,
    paddingHorizontal: 10,
    paddingVertical: accountingTheme.spacing.sm,
    borderRadius: accountingTheme.radius.xl,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
  },
  fyLabel: {
    fontSize: 9,
    color: "#EAFDFC",
    fontWeight: accountingTheme.fontWeights.bold,
  },
  fyValue: {
    marginTop: 2,
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.card,
    fontWeight: accountingTheme.fontWeights.extraBold,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  sectionMeta: {
    fontSize: accountingTheme.fontSizes.xs,
    color: accountingTheme.colors.textSecondary,
  },
  listCard: {
    padding: 0,
    overflow: "hidden",
    marginBottom: accountingTheme.spacing.md,
  },
  listHeaderWrap: {
    paddingHorizontal: 14,
    paddingTop: accountingTheme.spacing.md,
    paddingBottom: accountingTheme.spacing.sm,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: accountingTheme.colors.surfaceLight,
  },
  customerRowPressed: {
    backgroundColor: "#F8FBFF",
  },
  customerName: {
    flex: 1,
    paddingRight: accountingTheme.spacing.md,
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.medium,
    color: "#1F2937",
  },
  customerAmount: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#111827",
  },
  errorText: {
    color: accountingTheme.colors.error,
    marginBottom: accountingTheme.spacing.md,
  },
});
