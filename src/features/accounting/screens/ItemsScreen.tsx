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
        rightContent={<Ionicons name="options-outline" size={18} color="#fff" />}
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

            <View style={styles.searchBoxTop}>
              <Ionicons name="search" size={18} color="#64748B" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search items"
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
              />
              <Pressable style={styles.filterIcon}>
                <Ionicons name="filter" size={18} color="#0F172A" />
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
                          <Ionicons name="cube" size={24} color="#F59E0B" />
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
        <Ionicons name="add" size={20} color="#fff" />
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
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  headerTabs: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  headerTab: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.24)",
  },
  headerTabActive: {
    backgroundColor: "#fff",
  },
  headerTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  headerTabTextActive: {
    color: "#0F172A",
  },
  searchBoxTop: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#0F172A",
    fontSize: 14,
  },
  filterIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 120,
    paddingTop: 16,
  },
  errorContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  emptyContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  emptyCard: {
    borderRadius: 20,
    paddingVertical: 40,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 12,
  },
  emptyDescription: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },
  emptyLink: {
    marginTop: 12,
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "700",
  },
  itemsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  itemCard: {
    borderRadius: 16,
    padding: 0,
    overflow: "hidden",
  },
  itemRowClean: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
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
    marginBottom: 12,
  },
  itemNameClean: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    marginRight: 8,
  },
  actionPillRow: {
    flexDirection: "row",
    gap: 6,
  },
  smallButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  inButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
  },
  outButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
  },
  smallButtonText: {
    fontSize: 10,
    fontWeight: "700",
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
    fontSize: 10,
    color: "#94A3B8",
    marginBottom: 4,
  },
  statValueClean: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  stockPositive: {
    color: "#22C55E",
  },
  stockNegative: {
    color: "#EF4444",
  },
  fab: {
    position: "absolute",
    bottom: 84,
    left: "50%",
    transform: [{ translateX: -80 }],
    width: 160,
    height: 48,
    backgroundColor: "#2563EB",
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 8,
  },
  fabText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
});
