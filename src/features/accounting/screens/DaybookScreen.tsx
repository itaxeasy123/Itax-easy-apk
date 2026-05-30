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
import { accountingTheme } from "../../../theme/accounting";

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
        rightContent={<Ionicons name="ellipsis-horizontal" size={18} color={accountingTheme.colors.card} />}
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
            <Ionicons name="calendar-outline" size={16} color={accountingTheme.colors.primary} />
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
              <Ionicons name="document-text-outline" size={28} color={accountingTheme.colors.textMuted} />
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
    backgroundColor: accountingTheme.colors.background,
  },
  content: {
    paddingBottom: accountingTheme.spacing.xxl,
  },
  filterWrap: {
    marginTop: accountingTheme.spacing.md,
    paddingHorizontal: accountingTheme.spacing.md,
  },
  filterRow: {
    paddingHorizontal: accountingTheme.spacing.xs,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: 10,
    borderRadius: accountingTheme.radius.full,
    borderWidth: 1,
    borderColor: accountingTheme.colors.borderMedium,
    backgroundColor: accountingTheme.colors.card,
  },
  filterChipActive: {
    borderColor: accountingTheme.colors.primary,
    backgroundColor: "#EFF6FF",
  },
  filterText: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: accountingTheme.colors.textSecondary,
  },
  filterTextActive: {
    color: accountingTheme.colors.primary,
  },
  periodRow: {
    marginTop: accountingTheme.spacing.md,
    marginHorizontal: accountingTheme.spacing.md,
    paddingHorizontal: accountingTheme.spacing.md,
    paddingVertical: 10,
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.lg,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  periodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.sm,
    flex: 1,
  },
  periodText: {
    fontSize: accountingTheme.fontSizes.sm,
    color: "#334155",
    fontWeight: accountingTheme.fontWeights.semiBold,
    flex: 1,
  },
  changeText: {
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.primary,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  tableCard: {
    marginTop: accountingTheme.spacing.md,
    marginHorizontal: accountingTheme.spacing.md,
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.xl,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: accountingTheme.colors.primary,
    paddingVertical: accountingTheme.spacing.md,
    paddingHorizontal: accountingTheme.spacing.md,
  },
  headerCell: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.extraBold,
  },
  row: {
    flexDirection: "row",
    paddingVertical: accountingTheme.spacing.md,
    paddingHorizontal: accountingTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2FF",
    alignItems: "flex-start",
  },
  cell: {
    fontSize: accountingTheme.fontSizes.sm,
    color: "#1E293B",
  },
  titleText: {
    fontSize: accountingTheme.fontSizes.md,
    color: accountingTheme.colors.text,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  metaText: {
    marginTop: accountingTheme.spacing.xs,
    fontSize: accountingTheme.fontSizes.xs,
    color: accountingTheme.colors.textSecondary,
  },
  dateCol: {
    width: "24%",
    paddingRight: 10,
  },
  descCol: {
    width: "49%",
    paddingRight: accountingTheme.spacing.sm,
  },
  amountColWrap: {
    width: "27%",
    alignItems: "flex-end",
  },
  amountCol: {
    textAlign: "right",
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: "#111827",
  },
  badge: {
    marginTop: 6,
    paddingHorizontal: accountingTheme.spacing.sm,
    paddingVertical: 3,
    borderRadius: accountingTheme.radius.full,
    backgroundColor: accountingTheme.colors.borderLight,
  },
  badgeText: {
    fontSize: accountingTheme.fontSizes.xs,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#475569",
  },
  emptyCard: {
    marginTop: accountingTheme.spacing.md,
    marginHorizontal: accountingTheme.spacing.md,
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.xl,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    padding: accountingTheme.spacing.xl,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  emptyText: {
    marginTop: 6,
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  stateText: {
    marginTop: accountingTheme.spacing.lg,
    marginHorizontal: accountingTheme.spacing.lg,
    color: accountingTheme.colors.textSecondary,
  },
  errorText: {
    marginTop: accountingTheme.spacing.lg,
    marginHorizontal: accountingTheme.spacing.lg,
    color: accountingTheme.colors.error,
  },
});
