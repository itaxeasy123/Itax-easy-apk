import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AccountingHeader, Loading } from "../components";
import { accountingTheme } from "../../../theme/accounting";
import { accountingService } from "../services/accountingService";
import { exportPdf, buildPdfHtml } from "../utils/exportFile";

const format = (value: number) =>
  `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const DAY_MS = 86400000;

const formatDate = (iso: string | null) => {
  if (!iso) return "No activity yet";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "No activity yet";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

type InactiveCustomer = {
  id: string;
  name: string;
  initial: string;
  phone?: string;
  receivables: number;
  lastActivity: string | null;
  daysInactive: number | null;
};

export default function InactiveCustomersReportScreen() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<InactiveCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState("All");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [partiesRes, ledgersRes, dayBookRes] = await Promise.all([
          accountingService.getParties(),
          accountingService.getLedgers(),
          accountingService.getDayBook(),
        ]);

        const parties = (partiesRes.data ?? []).filter((p) => p.type === "customer");
        const ledgers = ledgersRes.data ?? [];
        const dayBook = dayBookRes.data ?? [];

        // Last transaction date per ledgerId
        const lastByLedger = new Map<string, number>();
        for (const row of dayBook) {
          const t = new Date(row.transactionDate).getTime();
          if (Number.isNaN(t)) continue;
          const prev = lastByLedger.get(row.ledgerId);
          if (prev === undefined || t > prev) lastByLedger.set(row.ledgerId, t);
        }

        const now = Date.now();
        const result: InactiveCustomer[] = parties.map((party) => {
          const partyLedgers = ledgers.filter((l) => l.partyId === party.id);
          const receivables = partyLedgers.reduce((sum, l) => sum + (l.balance || 0), 0);
          let last: number | null = null;
          for (const l of partyLedgers) {
            const t = lastByLedger.get(l.id);
            if (t !== undefined && (last === null || t > last)) last = t;
          }
          return {
            id: party.id,
            name: party.partyName,
            initial: (party.partyName || "?").trim().charAt(0).toUpperCase() || "?",
            phone: party.phone,
            receivables,
            lastActivity: last !== null ? new Date(last).toISOString() : null,
            daysInactive: last !== null ? Math.floor((now - last) / DAY_MS) : null,
          };
        });

        if (!cancelled) setCustomers(result);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load inactive customers");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const inactiveCustomers = useMemo(() => {
    const threshold = sortBy === "All" ? 0 : parseInt(sortBy, 10) || 0;
    return customers
      .filter((c) => {
        if (search.trim() && !c.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
        if (threshold === 0) return true;
        // Never-active customers always count as inactive
        return c.daysInactive === null || c.daysInactive >= threshold;
      })
      .sort((a, b) => (b.daysInactive ?? Infinity) - (a.daysInactive ?? Infinity) || a.name.localeCompare(b.name));
  }, [customers, search, sortBy]);

  const totalReceivables = inactiveCustomers.reduce((sum, item) => sum + item.receivables, 0);

  const handleExportPdf = () => {
    const rows: (string | number)[][] = [
      ["Customer", "Phone", "Last Activity", "Days Inactive"],
      ...inactiveCustomers.map((c) => [
        c.name,
        c.phone ?? "-",
        formatDate(c.lastActivity),
        c.daysInactive === null ? "No activity yet" : c.daysInactive,
      ]),
    ];
    exportPdf(
      "inactive-customers",
      buildPdfHtml("Inactive Customers", `Filter: ${sortBy} • Generated ${formatDate(new Date().toISOString())}`, rows)
    );
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Inactive Customers"
        showBackButton
        rightContent={
          <Pressable style={styles.pdfBtn} onPress={handleExportPdf}>
            <Ionicons name="document-text" size={16} color={accountingTheme.colors.error} />
          </Pressable>
        }
        headerContent={
          <View style={styles.statsRow}>
            <View style={styles.statsCol}>
              <Text style={styles.statsValue}>{format(totalReceivables)}</Text>
              <Text style={styles.statsLabel}>Receivables</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statsCol}>
              <Text style={styles.statsValue}>{inactiveCustomers.length}</Text>
              <Text style={styles.statsLabel}>Inactive Customers</Text>
            </View>
          </View>
        }
      />

      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={accountingTheme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={accountingTheme.colors.textMuted}
          />
        </View>
        <Pressable style={styles.filterBtn} onPress={() => setShowSortModal(true)}>
          <Ionicons name="filter" size={20} color={accountingTheme.colors.textSecondary} />
        </Pressable>
      </View>

      {loading ? (
        <Loading fullScreen text="Loading customers..." />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {inactiveCustomers.map((customer) => (
            <View key={customer.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{customer.initial}</Text>
                </View>
                <Text style={styles.name}>{customer.name}</Text>
                {!!customer.phone && (
                  <Pressable style={styles.callBtn} onPress={() => handleCall(customer.phone!)}>
                    <Ionicons name="call-outline" size={14} color="#3B82F6" />
                    <Text style={styles.callText}>Call</Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.cardBottom}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Receivables</Text>
                  <Text style={styles.infoValue}>{format(customer.receivables)}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Last Activity</Text>
                  <Text style={styles.infoValue}>{formatDate(customer.lastActivity)}</Text>
                </View>
                <View style={[styles.infoCol, { alignItems: "flex-end" }]}>
                  <Text style={styles.infoLabel}>Inactive Since</Text>
                  <Text style={styles.dangerValue}>
                    {customer.daysInactive === null ? "No activity yet" : `${customer.daysInactive} Days`}
                  </Text>
                </View>
              </View>
            </View>
          ))}
          {inactiveCustomers.length === 0 && (
            <Text style={styles.emptyText}>No inactive customers found</Text>
          )}
        </ScrollView>
      )}

      {/* Sort By Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowSortModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Sort by</Text>
              <Pressable onPress={() => setSortBy("All")}>
                <Text style={styles.resetText}>Reset</Text>
              </Pressable>
            </View>

            <View style={styles.sheetOptions}>
              {["All", "30 days", "60 days", "120 days", "180 days", "365 & above days"].map((option) => (
                <Pressable
                  key={option}
                  style={[styles.sortOptionRow, sortBy === option && styles.sortOptionRowActive]}
                  onPress={() => {
                    setSortBy(option);
                    setShowSortModal(false);
                  }}
                >
                  <Text style={[styles.sortOptionText, sortBy === option && styles.sortOptionTextActive]}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  pdfBtn: {
    width: 28,
    height: 28,
    borderRadius: accountingTheme.radius.sm,
    backgroundColor: accountingTheme.colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: accountingTheme.spacing.xxl,
    alignItems: "center",
  },
  statsCol: {
    flex: 1,
    alignItems: "center",
  },
  statsValue: {
    fontSize: accountingTheme.fontSizes.xxl,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.card,
  },
  statsLabel: {
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.borderMedium,
    marginTop: accountingTheme.spacing.xs,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  searchSection: {
    flexDirection: "row",
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: accountingTheme.spacing.md,
    backgroundColor: accountingTheme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.borderLight,
    gap: accountingTheme.spacing.md,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: accountingTheme.colors.card,
    borderWidth: 1,
    borderColor: accountingTheme.colors.borderMedium,
    borderRadius: 8,
    paddingHorizontal: accountingTheme.spacing.md,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: accountingTheme.spacing.sm,
    fontSize: accountingTheme.fontSizes.lg,
    color: accountingTheme.colors.text,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: accountingTheme.colors.borderMedium,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: accountingTheme.colors.card,
  },
  listContainer: {
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: accountingTheme.spacing.md,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.lg,
    padding: accountingTheme.spacing.lg,
    marginBottom: accountingTheme.spacing.md,
    borderWidth: 1,
    borderColor: accountingTheme.colors.borderMedium,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: accountingTheme.spacing.lg,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: accountingTheme.radius.xxl,
    backgroundColor: accountingTheme.colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: accountingTheme.spacing.md,
  },
  avatarText: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.textSecondary,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#1E293B",
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.xs,
    paddingHorizontal: accountingTheme.spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: accountingTheme.radius.xxl,
  },
  callText: {
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#3B82F6",
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: accountingTheme.colors.textMuted,
    marginBottom: accountingTheme.spacing.xs,
  },
  infoValue: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#334155",
  },
  dangerValue: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.error,
  },
  emptyText: {
    textAlign: "center",
    marginTop: accountingTheme.spacing.xxl,
    color: accountingTheme.colors.textSecondary,
  },
  errorText: {
    textAlign: "center",
    marginTop: accountingTheme.spacing.xxl,
    paddingHorizontal: accountingTheme.spacing.lg,
    color: accountingTheme.colors.error,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalDismiss: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: accountingTheme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  sheetHandleWrap: {
    alignItems: "center",
    paddingVertical: accountingTheme.spacing.md,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: accountingTheme.colors.borderMedium,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: accountingTheme.spacing.xxl,
    paddingBottom: accountingTheme.spacing.lg,
  },
  sheetTitle: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#1E293B",
  },
  resetText: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#3B82F6",
  },
  sheetOptions: {
    marginTop: accountingTheme.spacing.sm,
  },
  sortOptionRow: {
    paddingVertical: accountingTheme.spacing.lg,
    paddingHorizontal: accountingTheme.spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.borderLight,
  },
  sortOptionRowActive: {
    backgroundColor: accountingTheme.colors.borderLight,
  },
  sortOptionText: {
    fontSize: accountingTheme.fontSizes.lg,
    color: "#475569",
  },
  sortOptionTextActive: {
    color: accountingTheme.colors.text,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
});
