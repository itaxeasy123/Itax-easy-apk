import { useCallback, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AccountingHeader, BottomNav, Card, EmptyState, Loading } from "../components";
import { voucherService } from "../services/voucherService";
import type { VoucherEntry } from "../types/accountingTypes";
import {
  buildReceiptEntriesForCustomer,
  formatCurrency,
} from "../utils/salesReport";
import { useFocusEffect } from "expo-router";

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

export default function ReceiptCustomerDetailScreen() {
  const params = useLocalSearchParams<{ id?: string; name?: string }>();
  const router = useRouter();
  const customerKey = Array.isArray(params.id) ? params.id[0] : params.id;
  const customerName = (
    Array.isArray(params.name) ? params.name[0] : params.name
  )?.trim() || decodeURIComponent(customerKey ?? "").replace(/\+/g, " ").trim();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<VoucherEntry[]>([]);

  const loadCustomer = useCallback(async () => {
    if (!customerKey) {
      setError("Missing customer id.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await voucherService.getAll();
      setVouchers(result.data ?? []);
    } catch {
      setError("Unable to load receipt details.");
    } finally {
      setLoading(false);
    }
  }, [customerKey]);

  useFocusEffect(
    useCallback(() => {
      void loadCustomer();
    }, [loadCustomer])
  );

  const receiptRows = useMemo(
    () => buildReceiptEntriesForCustomer(vouchers, customerName),
    [vouchers, customerName]
  );
  const totalReceipt = receiptRows.reduce((sum, row) => sum + row.amount, 0);
  const recordsLabel = `${receiptRows.length} record${receiptRows.length === 1 ? "" : "s"}`;

  return (
    <View style={styles.screen}>
      <AccountingHeader
        title={customerName || "Receipt"}
        subtitle="Customer-wise receipt"
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
            <Text style={styles.headerAmount}>{formatCurrency(totalReceipt)}</Text>
            <Text style={styles.headerMeta}>Total Receipt</Text>
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
          <Pressable onPress={() => router.push("/accounting/reports-receipt-customers")}>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
        </View>

        {loading ? <Loading text="Loading receipt details..." /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && !error ? (
          <Card style={styles.listCard}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>{customerName}</Text>
              <Text style={styles.sectionMeta}>{recordsLabel}</Text>
            </View>

            {receiptRows.length > 0 ? (
              receiptRows.map((row) => (
                <View key={row.id} style={styles.row}>
                  <View style={styles.rowLeft}>
                    <View style={styles.rowTopLine}>
                      <Text style={styles.receiptNumber}>{row.receiptNumber}</Text>
                      <View style={styles.statusPill}>
                        <Text style={styles.statusText}>Unpaid</Text>
                      </View>
                    </View>
                    <Text style={styles.rowDate}>{formatDate(row.receiptDate)}</Text>
                  </View>

                  <Text style={styles.rowAmount}>{formatCurrency(row.amount)}</Text>
                </View>
              ))
            ) : (
              <EmptyState
                icon="cash-outline"
                title="No receipt entries yet"
                description="Create receipt vouchers for this customer and the details will appear here."
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
    marginTop: 8,
    paddingBottom: 2,
  },
  headerAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  headerMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#EAFDFC",
    fontWeight: "600",
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
    borderRadius: 18,
  },
  listHeader: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#EEF2F7",
  },
  rowLeft: {
    flex: 1,
    paddingRight: 10,
  },
  rowTopLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  receiptNumber: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#EEF2F7",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
  },
  rowDate: {
    fontSize: 12,
    color: "#64748B",
  },
  rowAmount: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    textAlign: "right",
  },
});
