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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AccountingHeader, BottomNav, EmptyState } from "../components";
import { accountingService } from "../services/accountingService";
import { Ledger } from "../types/accountingTypes";

const formatCurrency = (value: number) =>
  `₹ ${Math.abs(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const LEDGER_TYPE_COLORS: Record<string, string> = {
  bank: "#3B82F6",
  cash: "#10B981",
  sales: "#8B5CF6",
  purchase: "#F59E0B",
  directExpense: "#EF4444",
  indirectExpense: "#F97316",
  directIncome: "#06B6D4",
  indirectIncome: "#6366F1",
  fixedAssets: "#84CC16",
  currentAssets: "#14B8A6",
  loansAndLiabilitieslw: "#E879F9",
  accountsReceivable: "#2563EB",
  accountsPayable: "#DC2626",
};

const LEDGER_TYPE_ICONS: Record<string, any> = {
  bank: "business",
  cash: "cash",
  sales: "trending-up",
  purchase: "cart",
  directExpense: "remove-circle",
  indirectExpense: "alert-circle",
  directIncome: "add-circle",
  indirectIncome: "checkmark-circle",
  fixedAssets: "cube",
  currentAssets: "layers",
  loansAndLiabilitieslw: "link",
  accountsReceivable: "arrow-down-circle",
  accountsPayable: "arrow-up-circle",
};

export default function LedgerListScreen() {
  const router = useRouter();
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState("All");

  const loadLedgers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await accountingService.getLedgers();
      setLedgers(result.data ?? []);
    } catch {
      setError("Unable to load ledgers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadLedgers();
    }, [loadLedgers])
  );

  const filteredLedgers = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = !query
      ? ledgers
      : ledgers.filter((l) =>
          `${l.ledgerName} ${l.ledgerType}`.toLowerCase().includes(query)
        );
    if (sortBy !== "All") {
      list = list.filter((l) => l.ledgerType === sortBy);
    }
    return list;
  }, [ledgers, search, sortBy]);

  const totalBalance = useMemo(
    () => ledgers.reduce((sum, l) => sum + Number(l.balance || 0), 0),
    [ledgers]
  );

  const handleDeleteLedger = (ledgerId: string, ledgerName: string) => {
    Alert.alert(
      "Delete Ledger",
      `Delete "${ledgerName}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await accountingService.deleteLedger(ledgerId);
              await loadLedgers();
            } catch {
              Alert.alert("Error", "Unable to delete ledger.");
            }
          },
        },
      ]
    );
  };

  const typeColor = (type: string) => LEDGER_TYPE_COLORS[type] ?? "#64748B";
  const typeIcon = (type: string) => LEDGER_TYPE_ICONS[type] ?? "document";

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Ledgers"
        showBackButton
        rightContent={
          <Pressable onPress={() => router.navigate("/accounting/ledgers/create")}>
            <Ionicons name="add" size={22} color="#fff" />
          </Pressable>
        }
        headerContent={
          <View style={styles.headerContent}>
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{ledgers.length}</Text>
                <Text style={styles.statLabel}>Total Ledgers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{formatCurrency(totalBalance)}</Text>
                <Text style={styles.statLabel}>Net Balance</Text>
              </View>
            </View>

            {/* Search + Filter */}
            <View style={styles.searchRow}>
              <View style={styles.searchInputWrap}>
                <Ionicons name="search" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search ledgers..."
                  value={search}
                  onChangeText={setSearch}
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <Pressable style={styles.filterBtn} onPress={() => setShowSortModal(true)}>
                <Ionicons name="filter" size={18} color="#64748B" />
              </Pressable>
            </View>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : error ? (
          <View style={styles.errorWrap}>
            <EmptyState
              icon="alert-circle"
              title="Unable to load ledgers"
              description={error}
              actionText="Try Again"
              onAction={loadLedgers}
            />
          </View>
        ) : filteredLedgers.length === 0 ? (
          <View style={styles.errorWrap}>
            <EmptyState
              icon="book"
              title="No ledgers found"
              description={search ? "Try a different search." : "Create your first ledger."}
            />
          </View>
        ) : (
          filteredLedgers.map((ledger) => (
            <Pressable
              key={ledger.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => router.navigate(`/accounting/ledgers/${ledger.id}`)}
            >
              {/* Left icon */}
              <View style={[styles.cardIcon, { backgroundColor: `${typeColor(ledger.ledgerType)}18` }]}>
                <Ionicons name={typeIcon(ledger.ledgerType)} size={20} color={typeColor(ledger.ledgerType)} />
              </View>

              {/* Info */}
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={1}>{ledger.ledgerName}</Text>
                <View style={[styles.typePill, { backgroundColor: `${typeColor(ledger.ledgerType)}18` }]}>
                  <Text style={[styles.typePillText, { color: typeColor(ledger.ledgerType) }]}>
                    {ledger.ledgerType}
                  </Text>
                </View>
              </View>

              {/* Balance */}
              <View style={styles.cardRight}>
                <Text style={styles.cardBalance}>{formatCurrency(Number(ledger.balance ?? 0))}</Text>
                <Pressable
                  style={styles.deleteIconBtn}
                  onPress={() => handleDeleteLedger(ledger.id, ledger.ledgerName)}
                >
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
                </Pressable>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => router.navigate("/accounting/ledgers/create")}>
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.fabText}>New Ledger</Text>
      </Pressable>

      <BottomNav activeRoute="/accounting/more" />

      {/* Sort Modal */}
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
              <Text style={styles.sheetTitle}>Filter by Type</Text>
              <Pressable onPress={() => { setSortBy("All"); setShowSortModal(false); }}>
                <Text style={styles.resetText}>Reset</Text>
              </Pressable>
            </View>
            {["All", "bank", "cash", "sales", "purchase", "directExpense", "indirectExpense", "fixedAssets", "currentAssets", "accountsReceivable", "accountsPayable"].map((opt) => (
              <Pressable
                key={opt}
                style={[styles.sheetOption, sortBy === opt && styles.sheetOptionActive]}
                onPress={() => { setSortBy(opt); setShowSortModal(false); }}
              >
                <Text style={[styles.sheetOptionText, sortBy === opt && styles.sheetOptionTextActive]}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  headerContent: { paddingBottom: 12 },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statCard: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.3)" },
  statValue: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  searchRow: { flexDirection: "row", gap: 10 },
  searchInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#0F172A" },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
  loaderWrap: { padding: 40, alignItems: "center" },
  errorWrap: { marginTop: 24 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: { opacity: 0.75 },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#0F172A", marginBottom: 6 },
  typePill: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typePillText: { fontSize: 10, fontWeight: "700" },
  cardRight: { alignItems: "flex-end", gap: 8 },
  cardBalance: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
  deleteIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    bottom: 72,
    right: 16,
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    gap: 6,
  },
  fabText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalDismiss: { flex: 1 },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  sheetHandleWrap: { alignItems: "center", paddingVertical: 12 },
  sheetHandle: { width: 40, height: 4, backgroundColor: "#E2E8F0", borderRadius: 2 },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  resetText: { fontSize: 14, fontWeight: "600", color: "#3B82F6" },
  sheetOption: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  sheetOptionActive: { backgroundColor: "#F1F5F9" },
  sheetOptionText: { fontSize: 14, color: "#475569" },
  sheetOptionTextActive: { color: "#0F172A", fontWeight: "600" },
});
