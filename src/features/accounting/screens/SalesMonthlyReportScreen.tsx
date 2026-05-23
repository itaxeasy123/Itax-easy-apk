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
        rightContent={<Ionicons name="ellipsis-horizontal" size={18} color="#fff" />}
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
            onCustomersPress={() => router.push("/accounting/reports-sales-customers")}
            thirdLabel="e-Way Bills"
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
                      color: () => "#2563EB",
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
    marginTop: 12,
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
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#EAFDFC",
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
  errorText: {
    color: "#DC2626",
    marginBottom: 12,
  },
  emptyCard: {
    marginBottom: 12,
  },
});
