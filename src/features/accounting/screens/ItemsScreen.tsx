import React, { useCallback, useState } from "react";
import { useRouter , useFocusEffect } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Pressable,
  Text,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomNav,
  Card,
  EmptyState,
  Loading,
  AccountingHeader,
} from "../components";
import { accountingService } from "../services/accountingService";
import { accountingTheme } from "../../../theme/accounting";
import CustomSearchBar from "../../../components/CustomSearchBar";

type ItemFilterKey = "all" | "instock" | "outofstock";

interface Item {
  id: string;
  itemName: string;
  unit: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  purchasePrice?: number;
}

const formatCurrency = (value: number) =>
  `₹ ${Math.abs(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

export default function ItemsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<ItemFilterKey>("all");

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountingService.getItems();
      setItems(response.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadItems();
    }, [loadItems])
  );

  const filteredItems = items.filter((item) => {
    const matchesFilter =
      filterTab === "all" ||
      (filterTab === "instock" && (item.quantity || 0) > 0) ||
      (filterTab === "outofstock" && (item.quantity || 0) === 0);

    const matchesSearch =
      !search.trim() ||
      item.itemName.toLowerCase().includes(search.trim().toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleAddItem = () => {
    router.navigate("/accounting/items-create");
  };

  const handleItemPress = (item: Item) => {
    router.navigate({
      pathname: "/accounting/items/[id]",
      params: { id: item.id },
    });
  };

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Items"
        subtitle="Manage your inventory"
        showBackButton
        rightContent={<Ionicons name="options-outline" size={18} color={accountingTheme.colors.card} />}
        headerContent={(
          <>
            <View style={styles.headerTabs}>
              {[
                { key: "all", label: "Show All" },
                { key: "instock", label: "In Stock" },
                { key: "outofstock", label: "Out of Stock" },
              ].map((tab) => (
                <Pressable
                  key={tab.key}
                  onPress={() => setFilterTab(tab.key as ItemFilterKey)}
                  style={[
                    styles.headerTab,
                    filterTab === tab.key && styles.headerTabActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.headerTabText,
                      filterTab === tab.key && styles.headerTabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8, marginTop: 10 }}>
              <CustomSearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="Search items"
                style={{ flex: 1, backgroundColor: accountingTheme.colors.card, borderColor: accountingTheme.colors.borderMedium }}
              />
              <Pressable style={styles.filterIcon}>
                <Ionicons name="filter" size={18} color={accountingTheme.colors.text} />
              </Pressable>
            </View>
          </>
        )}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <Loading text="Loading items..." />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Card>
              <EmptyState
                icon="alert-circle"
                title="Error"
                description={error}
                actionText="Try Again"
                onAction={loadItems}
              />
            </Card>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Card style={styles.emptyCard}>
              <Ionicons name="cube" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No items found</Text>
              <Text style={styles.emptyDescription}>
                {filterTab === "all" ? "Start by adding your first item" : `No ${filterTab === "instock" ? "in stock" : "out of stock"} items`}
              </Text>
              {filterTab === "all" ? (
                <Pressable onPress={handleAddItem}>
                  <Text style={styles.emptyLink}>Add Item</Text>
                </Pressable>
              ) : null}
            </Card>
          </View>
        ) : (
          <View style={styles.itemsContainer}>
            {filteredItems.map((item) => {
              const stockNegative = (item.quantity || 0) < 0;
              return (
                <Card key={item.id} style={styles.itemCard}>
                  <Pressable onPress={() => handleItemPress(item)}>
                      <View style={styles.itemRowClean}>
                        <View style={styles.itemIcon}>
                          <Ionicons name="cube" size={24} color={accountingTheme.colors.warning} />
                        </View>
                        <View style={styles.itemContent}>
                          <View style={styles.itemTopRow}>
                            <Text style={styles.itemNameClean}>{item.itemName}</Text>
                            <View style={styles.actionPillRow}>
                              <Pressable style={[styles.smallButton, styles.inButton]}>
                                <Text style={styles.smallButtonText}>+ IN</Text>
                              </Pressable>
                              <Pressable style={[styles.smallButton, styles.outButton]}>
                                <Text style={styles.smallButtonText}>+ OUT</Text>
                              </Pressable>
                            </View>
                          </View>
                          <View style={styles.itemStatsRow}>
                            <View style={styles.statColumn}>
                              <Text style={styles.statLabelClean}>Sale Price</Text>
                              <Text style={styles.statValueClean}>₹ {item.unitPrice?.toLocaleString("en-IN")}</Text>
                            </View>
                            <View style={styles.statColumn}>
                              <Text style={styles.statLabelClean}>Purchase Price</Text>
                              <Text style={styles.statValueClean}>₹ {(item.purchasePrice ?? item.unitPrice)?.toLocaleString("en-IN")}</Text>
                            </View>
                            <View style={styles.statColumn}>
                              <Text style={styles.statLabelClean}>Current Stock</Text>
                              <Text style={[styles.statValueClean, stockNegative ? styles.stockNegative : styles.stockPositive]}>
                                {item.quantity || 0}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Pressable style={[styles.fab, { bottom: 84 + Math.max(insets.bottom, 0) }]} onPress={handleAddItem}>
        <Ionicons name="add" size={20} color={accountingTheme.colors.card} />
        <Text style={styles.fabText}>Add Item</Text>
      </Pressable>

      <BottomNav activeRoute="/accounting/items" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F7FA",
  },
  topGradient: {
    paddingTop: 48,
    paddingBottom: accountingTheme.spacing.lg,
    paddingHorizontal: accountingTheme.spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: accountingTheme.spacing.lg,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: accountingTheme.radius.lg,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.card,
  },
  headerTabs: {
    flexDirection: "row",
    gap: accountingTheme.spacing.sm,
    marginBottom: 10,
  },
  headerTab: {
    flex: 1,
    borderRadius: accountingTheme.radius.full,
    paddingVertical: 6,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.24)",
  },
  headerTabActive: {
    backgroundColor: accountingTheme.colors.card,
  },
  headerTabText: {
    fontSize: 11,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.card,
  },
  headerTabTextActive: {
    color: accountingTheme.colors.text,
  },
  searchBoxTop: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.full,
    paddingVertical: 6,
    paddingHorizontal: accountingTheme.spacing.md,
    gap: accountingTheme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 36,
    color: accountingTheme.colors.text,
    fontSize: accountingTheme.fontSizes.md,
  },
  filterIcon: {
    width: 32,
    height: 32,
    borderRadius: accountingTheme.radius.md,
    backgroundColor: accountingTheme.colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 120,
    paddingTop: accountingTheme.spacing.lg,
  },
  errorContainer: {
    paddingHorizontal: accountingTheme.spacing.lg,
    marginTop: accountingTheme.spacing.xl,
  },
  emptyContainer: {
    paddingHorizontal: accountingTheme.spacing.lg,
    marginTop: accountingTheme.spacing.xl,
  },
  emptyCard: {
    borderRadius: 20,
    paddingVertical: 40,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
    marginTop: accountingTheme.spacing.md,
  },
  emptyDescription: {
    fontSize: accountingTheme.fontSizes.md,
    color: accountingTheme.colors.textSecondary,
    marginTop: accountingTheme.spacing.xs,
    textAlign: "center",
  },
  emptyLink: {
    marginTop: accountingTheme.spacing.md,
    fontSize: accountingTheme.fontSizes.md,
    color: accountingTheme.colors.primary,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  itemsContainer: {
    paddingHorizontal: accountingTheme.spacing.lg,
    gap: accountingTheme.spacing.sm,
  },
  itemCard: {
    borderRadius: accountingTheme.radius.lg,
    padding: 0,
    overflow: "hidden",
  },
  itemRowClean: {
    flexDirection: "row",
    padding: accountingTheme.spacing.md,
    gap: 10,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: accountingTheme.radius.md,
    backgroundColor: accountingTheme.colors.warningLight,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: accountingTheme.spacing.sm,
  },
  itemNameClean: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.text,
    flex: 1,
    marginRight: accountingTheme.spacing.sm,
  },
  actionPillRow: {
    flexDirection: "row",
    gap: accountingTheme.spacing.xs,
  },
  smallButton: {
    paddingVertical: accountingTheme.spacing.xs,
    paddingHorizontal: 6,
    borderRadius: accountingTheme.radius.sm,
    borderWidth: 1,
  },
  inButton: {
    backgroundColor: accountingTheme.colors.card,
    borderColor: "#D1D5DB",
  },
  outButton: {
    backgroundColor: accountingTheme.colors.card,
    borderColor: "#D1D5DB",
  },
  smallButtonText: {
    fontSize: accountingTheme.fontSizes.xs,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#374151",
  },
  itemStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  statColumn: {
    flex: 1,
  },
  statLabelClean: {
    fontSize: 9,
    color: accountingTheme.colors.textMuted,
    marginBottom: accountingTheme.spacing.xs,
  },
  statValueClean: {
    fontSize: 11,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.text,
  },
  stockPositive: {
    color: "#22C55E",
  },
  stockNegative: {
    color: accountingTheme.colors.danger,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 86,
    backgroundColor: accountingTheme.colors.primary,
    borderRadius: accountingTheme.radius.full,
    paddingHorizontal: accountingTheme.spacing.xl,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.sm,
    elevation: 4,
    shadowColor: accountingTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.bold,
  },
});
