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
import { accountingTheme } from "../../../theme/accounting";

const formatCurrency = (value: number) =>
  `₹ ${Math.abs(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const LEDGER_TYPE_COLORS: Record<string, string> = {
  bank: "#3B82F6",
  cash: accountingTheme.colors.success,
  sales: accountingTheme.colors.purple,
  purchase: accountingTheme.colors.warning,
  directExpense: accountingTheme.colors.danger,
  indirectExpense: "#F97316",
  directIncome: "#06B6D4",
  indirectIncome: "#6366F1",
  fixedAssets: "#84CC16",
  currentAssets: "#14B8A6",
  loansAndLiabilitieslw: "#E879F9",
  accountsReceivable: accountingTheme.colors.primary,
  accountsPayable: accountingTheme.colors.error,
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

  const typeColor = (type: string) => LEDGER_TYPE_COLORS[type] ?? accountingTheme.colors.textSecondary;
  const typeIcon = (type: string) => LEDGER_TYPE_ICONS[type] ?? "document";

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Ledgers"
        showBackButton
        rightContent={
          <Pressable onPress={() => router.navigate("/accounting/ledgers/create")}>
            <Ionicons name="add" size={22} color={accountingTheme.colors.card} />
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
                <Ionicons name="search" size={16} color={accountingTheme.colors.textMuted} style={{ marginRight: accountingTheme.spacing.sm }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search ledgers..."
                  value={search}
                  onChangeText={setSearch}
                  placeholderTextColor={accountingTheme.colors.textMuted}
                />
              </View>
              <Pressable style={styles.filterBtn} onPress={() => setShowSortModal(true)}>
                <Ionicons name="filter" size={18} color={accountingTheme.colors.textSecondary} />
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
                  <Ionicons name="trash-outline" size={14} color={accountingTheme.colors.danger} />
                </Pressable>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => router.navigate("/accounting/ledgers/create")}>
        <Ionicons name="add" size={20} color={accountingTheme.colors.card} />
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
  headerContent: { paddingBottom: accountingTheme.spacing.md },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: accountingTheme.radius.xl,
    paddingVertical: accountingTheme.spacing.md,
    paddingHorizontal: accountingTheme.spacing.lg,
    marginBottom: accountingTheme.spacing.md,
  },
  statCard: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.3)" },
  statValue: { fontSize: accountingTheme.fontSizes.xl, fontWeight: accountingTheme.fontWeights.extraBold, color: accountingTheme.colors.card },
  statLabel: { fontSize: accountingTheme.fontSizes.xs, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  searchRow: { flexDirection: "row", gap: 10 },
  searchInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.md,
    paddingHorizontal: accountingTheme.spacing.md,
    height: 40,
  },
  searchInput: { flex: 1, fontSize: accountingTheme.fontSizes.lg, color: accountingTheme.colors.text },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: accountingTheme.radius.md,
    backgroundColor: accountingTheme.colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { paddingHorizontal: accountingTheme.spacing.lg, paddingTop: accountingTheme.spacing.md, paddingBottom: 100 },
  loaderWrap: { padding: 40, alignItems: "center" },
  errorWrap: { marginTop: accountingTheme.spacing.xxl },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.xxl,
    padding: 14,
    marginBottom: 10,
    shadowColor: accountingTheme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: { opacity: 0.75 },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: accountingTheme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: accountingTheme.fontSizes.lg, fontWeight: accountingTheme.fontWeights.bold, color: accountingTheme.colors.text, marginBottom: 6 },
  typePill: {
    alignSelf: "flex-start",
    borderRadius: accountingTheme.radius.sm,
    paddingHorizontal: accountingTheme.spacing.sm,
    paddingVertical: 3,
  },
  typePillText: { fontSize: accountingTheme.fontSizes.xs, fontWeight: accountingTheme.fontWeights.bold },
  cardRight: { alignItems: "flex-end", gap: accountingTheme.spacing.sm },
  cardBalance: { fontSize: accountingTheme.fontSizes.lg, fontWeight: accountingTheme.fontWeights.extraBold, color: accountingTheme.colors.text },
  deleteIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: accountingTheme.colors.dangerLight,
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
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: accountingTheme.spacing.md,
    borderRadius: 24,
    elevation: 4,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    gap: 6,
  },
  fabText: { color: accountingTheme.colors.card, fontSize: accountingTheme.fontSizes.lg, fontWeight: accountingTheme.fontWeights.semiBold },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalDismiss: { flex: 1 },
  bottomSheet: {
    backgroundColor: accountingTheme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  sheetHandleWrap: { alignItems: "center", paddingVertical: accountingTheme.spacing.md },
  sheetHandle: { width: 40, height: 4, backgroundColor: accountingTheme.colors.borderMedium, borderRadius: 2 },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: accountingTheme.spacing.xxl,
    paddingBottom: accountingTheme.spacing.sm,
  },
  sheetTitle: { fontSize: accountingTheme.fontSizes.xl, fontWeight: accountingTheme.fontWeights.bold, color: "#1E293B" },
  resetText: { fontSize: accountingTheme.fontSizes.lg, fontWeight: accountingTheme.fontWeights.semiBold, color: "#3B82F6" },
  sheetOption: {
    paddingVertical: 14,
    paddingHorizontal: accountingTheme.spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.borderLight,
  },
  sheetOptionActive: { backgroundColor: accountingTheme.colors.borderLight },
  sheetOptionText: { fontSize: accountingTheme.fontSizes.lg, color: "#475569" },
  sheetOptionTextActive: { color: accountingTheme.colors.text, fontWeight: accountingTheme.fontWeights.semiBold },
});
