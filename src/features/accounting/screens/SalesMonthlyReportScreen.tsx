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
import {
  buildMonthlySalesSeriesFromInvoices,
  formatCurrency,
  MONTH_LABELS,
} from "../utils/salesReport";
import { invoiceService } from "../../invoice/services/invoiceService";
import type { Invoice } from "../../invoice/types/invoice.types";
import { accountingTheme } from "../../../theme/accounting";


export default function SalesMonthlyReportScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalSales, setTotalSales] = useState(0);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryResult, invoiceResult] = await Promise.all([
        accountingService.getInvoiceSummary(),
        invoiceService.getInvoices({ page: 1, limit: 1000, type: "sales" }),
      ]);

      setTotalSales(summaryResult.data?.total_sales ?? 0);
      setInvoices(invoiceResult.invoices ?? []);
    } catch {
      setError("Unable to load sales monthly report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadReport();
    }, [loadReport])
  );

  const monthlySales = useMemo(
    () => buildMonthlySalesSeriesFromInvoices(invoices, year),
    [invoices, year]
  );
  const chartWidth = Math.max(width - 44, 280);

  return (
    <View style={styles.screen}>
      <AccountingHeader
        title="Sales"
        subtitle="Monthly sales overview"
        showBackButton
        rightContent={<Ionicons name="ellipsis-horizontal" size={18} color={accountingTheme.colors.card} />}
        headerContent={(
          <View style={styles.headerBlock}>
            <Text style={styles.headerAmount}>{formatCurrency(totalSales)}</Text>
            <Text style={styles.headerMeta}>Total Sales</Text>
          </View>
        )}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.switcherWrap}>
          <SalesReportSwitcher
            active="monthly"
            onMonthlyPress={() => router.replace("/accounting/reports-sales-monthly")}
            onCustomersPress={() => router.navigate("/accounting/reports-sales-customers")}
            thirdLabel="e-Way Bills"
          />
        </View>

        <View style={styles.yearRow}>
          <View style={styles.yearLeft}>
            <Ionicons name="calendar-outline" size={16} color={accountingTheme.colors.primary} />
            <Text style={styles.yearText}>
              Financial Year ({String(year - 1).slice(-2)} Apr to {String(year).slice(-2)} Mar)
            </Text>
          </View>
          <Pressable onPress={() => setYear((prev) => prev + 1)}>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
        </View>

        {loading ? <Loading text="Loading sales data..." /> : null}
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
                  ],
                  legend: ["Sales"],
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

            {monthlySales.every((item) => item.amount === 0) ? (
              <Card style={styles.emptyCard}>
                <EmptyState
                  icon="analytics"
                  title="No monthly sales data yet"
                  description="Create sales vouchers or sales-linked ledgers and the chart will populate here."
                />
              </Card>
            ) : null}
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
    marginTop: accountingTheme.spacing.sm,
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
  headerAmount: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.card,
  },
  headerMeta: {
    marginTop: 2,
    fontSize: 11,
    color: "#EAFDFC",
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
  errorText: {
    color: accountingTheme.colors.error,
    marginBottom: accountingTheme.spacing.md,
  },
  emptyCard: {
    marginBottom: accountingTheme.spacing.md,
  },
});
