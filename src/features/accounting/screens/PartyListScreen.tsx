import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AccountingHeader, BottomNav, Card, EmptyState, Loading } from "../components";
import { accountingService } from "../services/accountingService";
import { Ledger, Party } from "../types/accountingTypes";

const formatCurrency = (value: number) =>
  `Rs ${Math.abs(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const getPartyBalance = (party: Party) =>
  (party.ledgers ?? []).reduce((sum: number, ledger: Ledger) => sum + Number(ledger.balance || 0), 0);

export default function PartyListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"customer" | "supplier">("customer");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState("This Year");

  const loadParties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await accountingService.getParties();
      setParties(result.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load parties.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadParties();
    }, [loadParties])
  );

  const filteredParties = useMemo(() => {
    const query = search.trim().toLowerCase();
    return parties.filter((party) => {
      const typeMatch = party.type === activeTab;
      const searchMatch = !query
        ? true
        : `${party.partyName} ${party.type} ${party.gstin ?? ""} ${party.phone ?? ""}`.toLowerCase().includes(query);
      return typeMatch && searchMatch;
    });
  }, [parties, search, activeTab]);

  const summary = useMemo(() => {
    const customers = parties.filter((party) => party.type === "customer");
    const suppliers = parties.filter((party) => party.type === "supplier");
    return {
      customers: customers.length,
      suppliers: suppliers.length,
      receivables: customers.reduce((sum, party) => sum + Math.max(getPartyBalance(party), 0), 0),
      payables: suppliers.reduce((sum, party) => sum + Math.abs(Math.min(getPartyBalance(party), 0)), 0),
    };
  }, [parties]);

  const handleDeleteParty = (partyId: string, partyName: string) => {
    Alert.alert("Delete Party", `Delete ${partyName}? This action cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await accountingService.deleteParty(partyId);
            await loadParties();
          } catch {
            Alert.alert("Error", "Unable to delete party.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Parties"
        showBackButton
        rightContent={<Ionicons name="ellipsis-horizontal" size={18} color="#fff" />}
        headerContent={(
          <View style={styles.headerTabsWrap}>
            <View style={styles.tabContainer}>
              <Pressable
                onPress={() => setActiveTab("customer")}
                style={[styles.tabButton, activeTab === "customer" && styles.tabButtonActive]}
              >
                <Text style={[styles.tabText, activeTab === "customer" && styles.tabTextActive]}>
                  Customers
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setActiveTab("supplier")}
                style={[styles.tabButton, activeTab === "supplier" && styles.tabButtonActive]}
              >
                <Text style={[styles.tabText, activeTab === "supplier" && styles.tabTextActive]}>
                  Suppliers
                </Text>
              </Pressable>
            </View>

            <View style={styles.balanceRow}>
              <View style={styles.balanceColumn}>
                <Text style={styles.balanceValue}>{formatCurrency(summary.receivables)}</Text>
                <Text style={styles.balanceLabel}>Receivables</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.balanceColumn}>
                <Text style={styles.balanceValue}>{formatCurrency(summary.payables)}</Text>
                <Text style={styles.balanceLabel}>Payables</Text>
              </View>
            </View>
          </View>
        )}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search"
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
          </View>
          <Pressable style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
            <Ionicons name="filter-outline" size={18} color="#64748B" />
          </Pressable>
        </View>

        {loading ? (
          <Loading text="Loading parties..." />
        ) : error ? (
          <Card style={styles.messageCard}>
            <EmptyState
              icon="alert-circle"
              title="Unable to load parties"
              description={error}
              actionText="Try Again"
              onAction={loadParties}
            />
          </Card>
        ) : filteredParties.length === 0 ? (
          <Card style={styles.messageCard}>
            <EmptyState
              icon="people"
              title="No parties found"
              description="Add a customer or supplier to begin."
              actionText="Add Party"
              onAction={() => router.navigate("/accounting/parties/create")}
            />
          </Card>
        ) : (
          <View style={styles.listArea}>
            {filteredParties.map((party) => {
              const balance = getPartyBalance(party);
              const initial = party.partyName?.trim()?.[0]?.toUpperCase() ?? "P";

              return (
                <Pressable
                  key={party.id}
                  style={styles.partyRowClean}
                  onPress={() => router.navigate(`/accounting/parties/${party.id}`)}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                  <Text style={styles.partyNameClean}>{party.partyName}</Text>
                  <Text style={styles.partyBalanceClean}>{formatCurrency(balance)}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Pressable style={[styles.fab, { bottom: 86 + Math.max(insets.bottom, 0) }]} onPress={() => router.navigate("/accounting/parties/create")}>
        <Ionicons name="person-add" size={18} color="#fff" />
        <Text style={styles.fabText}>Add Party</Text>
      </Pressable>

      <BottomNav activeRoute="/accounting/parties" />

      {/* Date Filter Popup */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowFilterModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Sort by</Text>
              <Pressable onPress={() => { setSortBy("This Year"); setShowFilterModal(false); }}>
                <Text style={styles.resetText}>Reset</Text>
              </Pressable>
            </View>

            <View style={styles.sheetOptions}>
              {["This Year", "Previous Year", "This Month", "This Week", "Custom"].map((opt) => (
                <Pressable
                  key={opt}
                  style={[styles.optionRow, sortBy === opt && styles.optionRowActive]}
                  onPress={() => {
                    setSortBy(opt);
                    setShowFilterModal(false);
                  }}
                >
                  <Text style={[styles.optionText, sortBy === opt && styles.optionTextActive]}>{opt}</Text>
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
    backgroundColor: "#FFFFFF",
  },
  headerTabsWrap: {
    alignItems: "center",
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 999,
    padding: 2,
    width: "80%",
    alignSelf: "center",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 999,
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#2563EB",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    paddingBottom: 8,
    width: "100%",
  },
  balanceColumn: {
    flex: 1,
    alignItems: "center",
  },
  balanceValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  balanceLabel: {
    color: "#EAFDFC",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  searchBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#0F172A",
    fontSize: 14,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  listArea: {
    marginTop: 8,
  },
  partyRowClean: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 14,
  },
  partyNameClean: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  partyBalanceClean: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  messageCard: {
    marginTop: 20,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 86,
    backgroundColor: "#3B82F6",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 4,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
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
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  sheetHandleWrap: {
    alignItems: "center",
    paddingVertical: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
  },
  resetText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  sheetOptions: {
    marginTop: 8,
  },
  optionRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5EAF3",
  },
  optionRowActive: {
    backgroundColor: "#F1F5F9",
  },
  optionText: {
    fontSize: 14,
    color: "#64748B",
  },
  optionTextActive: {
    color: "#0F172A",
    fontWeight: "700",
  },
});
