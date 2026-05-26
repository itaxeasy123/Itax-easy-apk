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
        rightContent={<Ionicons name="ellipsis-horizontal" size={18} color="#fff" />}
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
            <Ionicons name="calendar-outline" size={16} color="#2563EB" />
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
                      color: () => "#2563EB",
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
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 0,
                  color: () => "#2563EB",
                  labelColor: () => "#64748B",
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#2563EB",
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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
  fyBadge: {
    minWidth: 74,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
  },
  fyLabel: {
    fontSize: 10,
    color: "#EAFDFC",
    fontWeight: "700",
  },
  fyValue: {
    marginTop: 2,
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "800",
  },
  chartCard: {
    marginBottom: 12,
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
  chart: {
    marginLeft: -10,
    borderRadius: 16,
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
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },
  customerRowPressed: {
    backgroundColor: "#F8FBFF",
  },
  customerName: {
    flex: 1,
    paddingRight: 12,
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  customerAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  errorText: {
    color: "#DC2626",
    marginBottom: 12,
  },
});
