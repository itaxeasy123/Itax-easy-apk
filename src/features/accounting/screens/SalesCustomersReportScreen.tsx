import { useCallback, useMemo, useState } from "react";
import { useRouter , useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { AccountingHeader, BottomNav, Card, EmptyState, Loading, SalesReportSwitcher } from "../components";
import { accountingService } from "../services/accountingService";
import { invoiceService } from "../../invoice/services/invoiceService";
import type { Invoice } from "../../invoice/types/invoice.types";
import { DayBook, Ledger, Party } from "../types/accountingTypes";
import { accountingTheme } from "../../../theme/accounting";
import {
  buildCustomerSalesRows,
  buildCustomerSalesRowsFromInvoices,
  buildMonthlyReceiptSeriesFromDayBook,
  buildMonthlySalesSeries,
  buildMonthlySalesSeriesFromInvoices,
  formatCurrency,
  getCurrentFinancialYearLabel,
  MONTH_LABELS,
} from "../utils/salesReport";


export default function SalesCustomersReportScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const currentYear = new Date().getFullYear();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parties, setParties] = useState<Party[]>([]);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dayBook, setDayBook] = useState<DayBook[]>([]);
  const [totalSales, setTotalSales] = useState(0);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [partyResult, ledgerResult, summaryResult, invoiceResult, dayBookResult] = await Promise.all([
        accountingService.getParties(),
        accountingService.getLedgers(),
        accountingService.getInvoiceSummary(),
        invoiceService.getInvoices({ page: 1, limit: 1000, type: "sales" }),
        accountingService.getDayBook(),
      ]);

      setParties(partyResult.data ?? []);
      setLedgers(ledgerResult.data ?? []);
      setInvoices(invoiceResult.invoices ?? []);
      setDayBook(dayBookResult.data ?? []);
      setTotalSales(summaryResult.data?.total_sales ?? 0);
    } catch {
      setError("Unable to load sales customer report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadReport();
    }, [loadReport])
  );

  const invoiceMonthlySeries = useMemo(
    () => buildMonthlySalesSeriesFromInvoices(invoices, currentYear),
    [invoices, currentYear]
  );
  const ledgerMonthlySeries = useMemo(
    () => buildMonthlySalesSeries(ledgers, currentYear),
    [ledgers, currentYear]
  );
  const monthlySales = invoiceMonthlySeries.some((item) => item.amount > 0)
    ? invoiceMonthlySeries
    : ledgerMonthlySeries;
  const receiptSeries = useMemo(
    () => buildMonthlyReceiptSeriesFromDayBook(dayBook, currentYear),
    [dayBook, currentYear]
  );
  const invoiceCustomerRows = useMemo(
    () => buildCustomerSalesRowsFromInvoices(parties, invoices),
    [parties, invoices]
  );
  const ledgerCustomerRows = useMemo(
    () => buildCustomerSalesRows(parties, ledgers),
    [parties, ledgers]
  );
  const customerRows = invoiceCustomerRows.length > 0 ? invoiceCustomerRows : ledgerCustomerRows;
  const chartWidth = Math.max(width - 44, 280);
  const financialYear = getCurrentFinancialYearLabel();

  return (
    <View style={styles.screen}>
      <AccountingHeader
        title="Sales"
        subtitle="Customer-wise sales"
        showBackButton
        rightContent={<Ionicons name="ellipsis-horizontal" size={18} color={accountingTheme.colors.card} />}
        headerContent={(
          <View style={styles.headerRow}>
            <View style={styles.headerBlock}>
              <Text style={styles.headerAmount}>{formatCurrency(totalSales)}</Text>
              <Text style={styles.headerMeta}>Total Sales</Text>
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
            onMonthlyPress={() => router.navigate("/accounting/reports-sales-monthly")}
            onCustomersPress={() => router.replace("/accounting/reports-sales-customers")}
            thirdLabel="e-Way Bills"
            onThirdPress={() => router.navigate("/accounting/reports")}
          />
        </View>

        <View style={styles.yearRow}>
          <View style={styles.yearLeft}>
            <Ionicons name="calendar-outline" size={16} color={accountingTheme.colors.primary} />
            <Text style={styles.yearText}>
              Financial Year ({String(currentYear - 1).slice(-2)} Apr to {String(currentYear).slice(-2)} Mar)
            </Text>
          </View>
          <Pressable onPress={() => router.navigate("/accounting/reports")}>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
        </View>

        {loading ? <Loading text="Loading customer report..." /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && !error ? (
          <>
            <Card style={styles.chartCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Monthly Trend</Text>
                <Text style={styles.sectionMeta}>Current year</Text>
              </View>
              <LineChart
                data={{
                  labels: MONTH_LABELS,
                  datasets: [
                    {
                      data: monthlySales.map((item) => item.amount),
                      color: () => accountingTheme.colors.primary,
                      strokeWidth: 3,
                    },
                    {
                      data: receiptSeries.map((item) => item.amount),
                      color: () => "#A9C1F7",
                      strokeWidth: 2,
                    },
                  ],
                  legend: ["Sales", "Receipt"],
                }}
                width={chartWidth}
                height={220}
                yAxisLabel=""
                fromZero
                chartConfig={{
                  backgroundColor: accountingTheme.colors.card,
                  backgroundGradientFrom: accountingTheme.colors.card,
                  backgroundGradientTo: accountingTheme.colors.card,
                  decimalPlaces: 0,
                  color: () => accountingTheme.colors.primary,
                  labelColor: () => accountingTheme.colors.textSecondary,
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: accountingTheme.colors.primary,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </Card>

            <Card style={styles.listCard}>
              <View style={styles.listHeaderWrap}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Sales by Customer</Text>
                  <Text style={styles.sectionMeta}>{customerRows.length} records</Text>
                </View>
              </View>

              {customerRows.length > 0 ? (
                customerRows.map((row) => {
                  const canOpenParty = parties.some((party) => party.id === row.id);

                  return (
                    <Pressable
                      key={row.id}
                      onPress={canOpenParty ? () => router.navigate(`/accounting/reports-sales-customers/${row.id}`) : undefined}
                      disabled={!canOpenParty}
                      style={({ pressed }) => [styles.customerRow, pressed && styles.customerRowPressed]}
                    >
                      <Text style={styles.customerName} numberOfLines={1}>
                        {row.partyName}
                      </Text>
                      <Text style={styles.customerAmount}>{formatCurrency(row.amount)}</Text>
                    </Pressable>
                  );
                })
              ) : (
                <EmptyState
                  icon="people"
                  title="No customer sales data yet"
                  description="Create sales invoices or sales-linked ledgers to see customer sales here."
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
    marginTop: 2,
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
  chartCard: {
    marginBottom: accountingTheme.spacing.md,
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
  chart: {
    marginLeft: -10,
    borderRadius: accountingTheme.radius.xxl,
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
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.surfaceLight,
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
