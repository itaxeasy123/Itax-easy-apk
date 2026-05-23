import { useCallback, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter , useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AccountingHeader, BottomNav, Card, EmptyState, Loading } from "../components";
import { accountingService } from "../services/accountingService";
import { invoiceService } from "../../invoice/services/invoiceService";
import type { Invoice } from "../../invoice/types/invoice.types";
import { Party } from "../types/accountingTypes";
import { formatCurrency } from "../utils/salesReport";


const formatDate = (value?: string | null) => {
  if (!value) return "NA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "NA";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

const getStatusStyles = (status?: string | null) => {
  if (status === "paid") {
    return { backgroundColor: "#EAF7EE", color: "#16A34A" };
  }
  if (status === "overdue") {
    return { backgroundColor: "#FEECEC", color: "#DC2626" };
  }
  return { backgroundColor: "#EEF2F7", color: "#64748B" };
};

export default function SalesCustomerDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const partyId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [party, setParty] = useState<Party | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalSales, setTotalSales] = useState(0);

  const loadCustomer = useCallback(async () => {
    if (!partyId) {
      setError("Missing customer id.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [partyResult, summaryResult, invoiceResult] = await Promise.all([
        accountingService.getPartyById(partyId),
        accountingService.getInvoiceSummary(),
        invoiceService.getInvoices({ page: 1, limit: 1000, type: "sales" }),
      ]);

      const currentParty = partyResult.data ?? null;
      const salesInvoices = (invoiceResult.invoices ?? [])
        .filter((invoice) => invoice.type === "sales" && invoice.partyId === partyId)
        .sort(
          (a, b) =>
            new Date(b.invoiceDate ?? 0).getTime() -
            new Date(a.invoiceDate ?? 0).getTime()
        );

      setParty(currentParty);
      setInvoices(salesInvoices);
      setTotalSales(
        salesInvoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount || 0), 0) ||
          summaryResult.data?.total_sales ||
          0
      );
    } catch {
      setError("Unable to load customer sales details.");
    } finally {
      setLoading(false);
    }
  }, [partyId]);

  useFocusEffect(
    useCallback(() => {
      void loadCustomer();
    }, [loadCustomer])
  );

  const customerName = party?.partyName ?? "Customer";
  const recordsLabel = `${invoices.length} record${invoices.length === 1 ? "" : "s"}`;

  const invoiceRows = useMemo(
    () =>
      invoices.map((invoice) => {
        const statusStyle = getStatusStyles(invoice.status);
        return {
          id: invoice.id,
          title: invoice.invoiceNumber ? `#${invoice.invoiceNumber}` : `#${invoice.id.slice(0, 6)}`,
          date: formatDate(invoice.invoiceDate),
          amount: formatCurrency(Number(invoice.totalAmount || 0)),
          status: invoice.status,
          statusStyle,
        };
      }),
    [invoices]
  );

  return (
    <View style={styles.screen}>
      <AccountingHeader
        title={customerName}
        subtitle="Sales"
        showBackButton
        rightContent={
          <View style={styles.headerActions}>
            <Ionicons name="search" size={18} color="#fff" />
            <Ionicons name="filter-outline" size={18} color="#fff" />
            <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
          </View>
        }
        headerContent={(
          <View style={styles.headerBlock}>
            <Text style={styles.headerAmount}>{formatCurrency(totalSales)}</Text>
            <Text style={styles.headerMeta}>Total Sales</Text>
          </View>
        )}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.yearRow}>
          <View style={styles.yearLeft}>
            <Ionicons name="calendar-outline" size={16} color="#2563EB" />
            <Text style={styles.yearText}>
              Financial Year ({String(new Date().getFullYear() - 1).slice(-2)} Apr to {String(new Date().getFullYear()).slice(-2)} Mar)
            </Text>
          </View>
          <Pressable onPress={() => router.push("/accounting/reports-sales-customers")}>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
        </View>

        {loading ? <Loading text="Loading customer sales..." /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && !error ? (
          <Card style={styles.listCard}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>{customerName}</Text>
              <Text style={styles.sectionMeta}>{recordsLabel}</Text>
            </View>

            {invoiceRows.length > 0 ? (
              invoiceRows.map((row) => (
                <View key={row.id} style={styles.invoiceRow}>
                  <View style={styles.invoiceLeft}>
                    <View style={styles.invoiceTopLine}>
                      <Text style={styles.invoiceNumber}>{row.title}</Text>
                      <View style={[styles.statusPill, { backgroundColor: row.statusStyle.backgroundColor }]}>
                        <Text style={[styles.statusText, { color: row.statusStyle.color }]}>
                          {row.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.invoiceDate}>{row.date}</Text>
                  </View>

                  <Text style={styles.invoiceAmount}>{row.amount}</Text>
                </View>
              ))
            ) : (
              <EmptyState
                icon="documents-outline"
                title="No sales entries yet"
                description="This customer does not have sales invoices linked yet."
              />
            )}
          </Card>
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
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
  errorText: {
    color: "#DC2626",
    marginBottom: 12,
  },
  listCard: {
    padding: 0,
    overflow: "hidden",
  },
  listHeader: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEF2F7",
  },
  invoiceLeft: {
    flex: 1,
    paddingRight: 10,
  },
  invoiceTopLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  invoiceDate: {
    fontSize: 12,
    color: "#64748B",
  },
  invoiceAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    textAlign: "right",
  },
});
