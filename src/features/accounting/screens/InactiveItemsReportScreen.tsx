import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AccountingHeader, Loading } from "../components";
import { accountingTheme } from "../../../theme/accounting";
import { accountingService } from "../services/accountingService";
import { exportPdf, buildPdfHtml } from "../utils/exportFile";
import type { Invoice } from "../types/accountingTypes";

const format = (value: number) =>
  `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const DAY_MS = 86400000;

const formatDate = (iso: string | null) => {
  if (!iso) return "Never sold";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Never sold";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

type InactiveItem = {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  stockValue: number;
  outOfStock: boolean;
  lastSale: string | null;
  daysInactive: number | null;
};

export default function InactiveItemsReportScreen() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<InactiveItem[]>([]);
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
        const [itemsRes, invoicesRes] = await Promise.all([
          accountingService.getItems(),
          accountingService.getInvoices({ page: 1, limit: 1000 }),
        ]);

        const rawItems = itemsRes.data ?? [];
        const invoices: Invoice[] = (invoicesRes as any)?.invoices ?? [];

        // Last sale timestamp per itemId across sales invoices
        const lastSaleByItem = new Map<string, number>();
        for (const inv of invoices) {
          if (inv.type !== "sales") continue;
          const dateStr = inv.invoiceDate ?? (inv as any).createdAt;
          const t = dateStr ? new Date(dateStr).getTime() : NaN;
          if (Number.isNaN(t)) continue;
          for (const line of inv.invoiceItems ?? []) {
            if (!line.itemId) continue;
            const prev = lastSaleByItem.get(line.itemId);
            if (prev === undefined || t > prev) lastSaleByItem.set(line.itemId, t);
          }
        }

        const now = Date.now();
        const result: InactiveItem[] = rawItems.map((item: any) => {
          const stock = item.closingStock ?? item.openingStock ?? 0;
          const last = lastSaleByItem.get(item.id);
          return {
            id: item.id,
            name: item.itemName,
            unit: item.unit || "PCS",
            currentStock: stock,
            stockValue: stock * (item.price || 0),
            outOfStock: stock <= 0,
            lastSale: last !== undefined ? new Date(last).toISOString() : null,
            daysInactive: last !== undefined ? Math.floor((now - last) / DAY_MS) : null,
          };
        });

        if (!cancelled) setItems(result);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load inactive items");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const inactiveItems = useMemo(() => {
    const threshold = sortBy === "All" || sortBy === "Out of Stock" ? 0 : parseInt(sortBy, 10) || 0;
    return items
      .filter((item) => {
        if (search.trim() && !item.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
        if (sortBy === "Out of Stock") return item.outOfStock;
        if (threshold === 0) return true;
        // Items never sold always count as inactive
        return item.daysInactive === null || item.daysInactive >= threshold;
      })
      .sort((a, b) => (b.daysInactive ?? Infinity) - (a.daysInactive ?? Infinity) || a.name.localeCompare(b.name));
  }, [items, search, sortBy]);

  const totalStockValue = inactiveItems.reduce((sum, item) => sum + item.stockValue, 0);

  const handleExportPdf = () => {
    const rows: (string | number)[][] = [
      ["Item", "Stock", "Stock Value", "Last Sale", "Days Inactive"],
      ...inactiveItems.map((item) => [
        item.name,
        `${item.currentStock} ${item.unit}`,
        item.stockValue,
        formatDate(item.lastSale),
        item.daysInactive === null ? "Never sold" : item.daysInactive,
      ]),
    ];
    exportPdf(
      "inactive-items",
      buildPdfHtml("Inactive Items", `Filter: ${sortBy} • Generated ${formatDate(new Date().toISOString())}`, rows)
    );
  };

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Inactive Items"
        showBackButton
        rightContent={
          <Pressable style={styles.pdfBtn} onPress={handleExportPdf}>
            <Ionicons name="document-text" size={16} color={accountingTheme.colors.error} />
          </Pressable>
        }
        headerContent={
          <View style={styles.statsRow}>
            <View style={styles.statsCol}>
              <Text style={styles.statsValue}>{format(totalStockValue)}</Text>
              <Text style={styles.statsLabel}>Stock Value</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statsCol}>
              <Text style={styles.statsValue}>{inactiveItems.length}</Text>
              <Text style={styles.statsLabel}>Inactive Item</Text>
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
        <Loading fullScreen text="Loading items..." />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {inactiveItems.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Ionicons name="cube" size={16} color="#EAB308" />
                </View>
                <Text style={styles.name}>{item.name}</Text>
                {item.outOfStock && (
                  <View style={styles.outOfStockBadge}>
                    <Text style={styles.outOfStockText}>Out of Stock</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardBottom}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Current Stock</Text>
                  <Text style={styles.infoValue}>{item.currentStock} {item.unit}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Last Sales Date</Text>
                  <Text style={styles.infoValue}>{formatDate(item.lastSale)}</Text>
                </View>
                <View style={[styles.infoCol, { alignItems: "flex-end" }]}>
                  <Text style={styles.infoLabel}>Inactive Since</Text>
                  <Text style={styles.infoValue}>
                    {item.daysInactive === null ? "Never sold" : `${item.daysInactive} Days`}
                  </Text>
                </View>
              </View>
            </View>
          ))}
          {inactiveItems.length === 0 && (
            <Text style={styles.emptyText}>No inactive items found</Text>
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
              {["All", "30 days", "60 days", "120 days", "180 days", "365 & above days", "Out of Stock"].map((option) => (
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
    marginTop: accountingTheme.spacing.lg,
    alignItems: "center",
  },
  statsCol: {
    flex: 1,
    alignItems: "center",
  },
  statsValue: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.card,
  },
  statsLabel: {
    fontSize: 11,
    color: accountingTheme.colors.borderMedium,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  searchSection: {
    flexDirection: "row",
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: accountingTheme.spacing.sm,
    backgroundColor: accountingTheme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.borderLight,
    gap: accountingTheme.spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: accountingTheme.colors.card,
    borderWidth: 1,
    borderColor: accountingTheme.colors.borderMedium,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
  },
  searchInput: {
    flex: 1,
    marginLeft: accountingTheme.spacing.sm,
    fontSize: accountingTheme.fontSizes.lg,
    color: accountingTheme.colors.text,
  },
  filterBtn: {
    width: 36,
    height: 36,
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
    padding: accountingTheme.spacing.md,
    marginBottom: accountingTheme.spacing.sm,
    borderWidth: 1,
    borderColor: accountingTheme.colors.borderMedium,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: accountingTheme.spacing.md,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: accountingTheme.radius.sm,
    backgroundColor: accountingTheme.colors.warningLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: accountingTheme.spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#1E293B",
  },
  outOfStockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: accountingTheme.colors.dangerLight,
    borderRadius: 4,
  },
  outOfStockText: {
    fontSize: 9,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: accountingTheme.colors.danger,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: accountingTheme.fontSizes.xs,
    color: accountingTheme.colors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#334155",
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
