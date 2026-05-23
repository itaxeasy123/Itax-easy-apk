import { useCallback, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AccountingHeader, BottomNav } from "../components";
import { accountingService } from "../services/accountingService";
import { DayBook, VoucherType } from "../types/accountingTypes";

type DayBookFilter = "all" | VoucherType;

const FILTERS: { key: DayBookFilter; label: string }[] = [
  { key: "all", label: "Show All" },
  { key: "sales", label: "Sales" },
  { key: "purchase", label: "Purchase" },
  { key: "receipt", label: "Receipt" },
  { key: "payment", label: "Payment" },
];

const money = (value: number) =>
  `Rs ${Math.abs(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).format(date);
};

const getTypeLabel = (entry: DayBook) =>
  (entry.voucherType ?? entry.transactionType ?? "journal").toString().toUpperCase();

export default function DaybookScreen() {
  const [entries, setEntries] = useState<DayBook[]>([]);
  const [activeFilter, setActiveFilter] = useState<DayBookFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDaybook = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await accountingService.getDayBook();
      setEntries(result.data ?? []);
    } catch {
      setError("Unable to load day book entries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDaybook();
    }, [loadDaybook])
  );

  const visibleEntries = useMemo(() => {
    const filtered =
      activeFilter === "all"
        ? entries
        : entries.filter((entry) => entry.voucherType === activeFilter);

    return [...filtered].sort(
      (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
    );
  }, [activeFilter, entries]);

  const activeFilterLabel =
    FILTERS.find((filter) => filter.key === activeFilter)?.label ?? "Show All";

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Day Book"
        showBackButton
        rightContent={<Ionicons name="ellipsis-horizontal" size={18} color="#fff" />}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.filterWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTERS.map((filter) => {
              const active = activeFilter === filter.key;
              return (
                <Pressable
                  key={filter.key}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setActiveFilter(filter.key)}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.periodRow}>
          <View style={styles.periodLeft}>
            <Ionicons name="calendar-outline" size={16} color="#2563EB" />
            <Text style={styles.periodText}>
              {activeFilterLabel} - {visibleEntries.length} entries
            </Text>
          </View>
          <Text style={styles.changeText}>Latest vouchers</Text>
        </View>

        {loading ? <Text style={styles.stateText}>Loading day book...</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && !error ? (
          visibleEntries.length > 0 ? (
            <View style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.dateCol]}>Date</Text>
                <Text style={[styles.headerCell, styles.descCol]}>Description / Ledger</Text>
                <Text style={[styles.headerCell, styles.amountCol]}>Amount</Text>
              </View>

              {visibleEntries.map((entry) => {
                const typeLabel = getTypeLabel(entry);
                const ledgerLabel = entry.ledgerName || entry.ledgerId || "Ledger";
                const description = entry.description || entry.narration || ledgerLabel;

                return (
                  <View key={entry.id} style={styles.row}>
                    <Text style={[styles.cell, styles.dateCol]}>
                      {formatDate(entry.transactionDate ?? entry.entryDate ?? new Date().toISOString())}
                    </Text>

                    <View style={styles.descCol}>
                      <Text style={styles.titleText} numberOfLines={1}>
                        {description}
                      </Text>
                      <Text style={styles.metaText} numberOfLines={1}>
                        {typeLabel} - Ledger: {ledgerLabel}
                      </Text>
                    </View>

                    <View style={styles.amountColWrap}>
                      <Text style={[styles.cell, styles.amountCol]}>
                        {money(entry.amount)}
                      </Text>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{entry.transactionType.toUpperCase()}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={28} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No entries found</Text>
              <Text style={styles.emptyText}>
                Create vouchers for sales, purchase, receipt, or payment to populate day book.
              </Text>
            </View>
          )
        ) : null}
      </ScrollView>

      <BottomNav activeRoute="/accounting/reports" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F9FF",
  },
  content: {
    paddingBottom: 24,
  },
  filterWrap: {
    marginTop: 12,
    paddingHorizontal: 12,
  },
  filterRow: {
    paddingHorizontal: 4,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  filterChipActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  filterTextActive: {
    color: "#2563EB",
  },
  periodRow: {
    marginTop: 12,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  periodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  periodText: {
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
  tableCard: {
    marginTop: 12,
    marginHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  headerCell: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2FF",
    alignItems: "flex-start",
  },
  cell: {
    fontSize: 12,
    color: "#1E293B",
  },
  titleText: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "700",
  },
  metaText: {
    marginTop: 4,
    fontSize: 10,
    color: "#64748B",
  },
  dateCol: {
    width: "24%",
    paddingRight: 10,
  },
  descCol: {
    width: "49%",
    paddingRight: 8,
  },
  amountColWrap: {
    width: "27%",
    alignItems: "flex-end",
  },
  amountCol: {
    textAlign: "right",
    fontWeight: "800",
    color: "#111827",
  },
  badge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
  },
  emptyCard: {
    marginTop: 12,
    marginHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 20,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },
  stateText: {
    marginTop: 16,
    marginHorizontal: 16,
    color: "#64748B",
  },
  errorText: {
    marginTop: 16,
    marginHorizontal: 16,
    color: "#DC2626",
  },
});
