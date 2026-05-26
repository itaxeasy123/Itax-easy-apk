import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AccountingHeader, BottomNav, Card, EmptyState, Loading } from "../components";
import { accountingService } from "../services/accountingService";
import { Ledger } from "../types/accountingTypes";
import {
  BankCashTab,
  buildBankCashLedgerRows,
  buildBankCashSummary,
  formatCurrency,
} from "../utils/bankCashReport";

const TAB_LABELS: { key: BankCashTab; label: string }[] = [
  { key: "bank", label: "Bank" },
  { key: "cash", label: "Cash" },
];

export default function BankCashReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [activeTab, setActiveTab] = useState<BankCashTab>("bank");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCashCategoryModal, setShowCashCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");

  const loadLedgers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await accountingService.getLedgers();
      setLedgers(result.data ?? []);
    } catch {
      setError("Unable to load bank and cash ledgers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadLedgers();
    }, [loadLedgers])
  );

  const summary = useMemo(() => buildBankCashSummary(ledgers), [ledgers]);
  const activeRows = useMemo(
    () => buildBankCashLedgerRows(ledgers, activeTab).rows,
    [activeTab, ledgers]
  );

  const handleOpenLedger = (ledgerId: string, ledgerName: string, ledgerType: Ledger["ledgerType"]) => {
    router.navigate({
      pathname: "/accounting/reports-bank-cash/[id]",
      params: {
        id: ledgerId,
        name: ledgerName,
        type: ledgerType,
      },
    });
  };

  const handleAddLedger = () => {
    if (activeTab === "bank") {
      router.navigate("/accounting/bank-create");
    } else {
      setShowCashCategoryModal(true);
    }
  };

  const handleSaveCategory = () => {
    // Implement save logic here later
    setShowCashCategoryModal(false);
    setCategoryName("");
    setOpeningBalance("");
  };

  return (
    <View style={styles.screen}>
      <AccountingHeader
        title="Bank & Cash"
        subtitle="Track bank accounts and cash balances."
        showBackButton
        rightContent={<Ionicons name="ellipsis-horizontal" size={18} color="#fff" />}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.tabRow}>
          {TAB_LABELS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabChip, active && styles.tabChipActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryAmount}>{formatCurrency(summary.bankTotal)}</Text>
            <Text style={styles.summaryLabel}>Bank Balance</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryAmount}>{formatCurrency(summary.cashTotal)}</Text>
            <Text style={styles.summaryLabel}>Cash In Hand</Text>
          </Card>
        </View>

        {loading ? <Loading text="Loading bank and cash ledgers..." /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && !error ? (
          <Card style={styles.listCard}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>
                {activeTab === "bank" ? "Bank Ledgers" : "Cash Ledgers"}
              </Text>
              <Text style={styles.listMeta}>{activeRows.length} records</Text>
            </View>

            {activeRows.length > 0 ? (
              activeRows.map((ledger) => (
                <Pressable
                  key={ledger.id}
                  style={styles.row}
                  onPress={() => handleOpenLedger(ledger.id, ledger.ledgerName, ledger.ledgerType)}
                >
                  <View style={styles.rowLeft}>
                    <Text style={styles.rowTitle}>{ledger.ledgerName}</Text>
                    <Text style={styles.rowSub}>
                      {ledger.ledgerType === "bank" ? "Bank Balance" : "Cash Ledger"}
                    </Text>
                  </View>
                  <Text style={styles.rowAmount}>{formatCurrency(ledger.balance)}</Text>
                </Pressable>
              ))
            ) : (
              <EmptyState
                icon="wallet-outline"
                title={activeTab === "bank" ? "No bank ledgers" : "No cash ledgers"}
                description={
                  activeTab === "bank"
                    ? "Create a bank ledger to start tracking balances."
                    : "Create a cash ledger to start tracking balances."
                }
              />
            )}
          </Card>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Pressable style={[styles.fab, { bottom: 130 + Math.max(insets.bottom, 0) }]} onPress={handleAddLedger}>
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.fabText}>
          {activeTab === "bank" ? "Add New Bank" : "Add Category"}
        </Text>
      </Pressable>

      <BottomNav activeRoute="/accounting/reports" />

      {/* Add Cash Category Modal */}
      <Modal
        visible={showCashCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCashCategoryModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowCashCategoryModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Add Cash Category</Text>
              <Pressable onPress={() => setShowCashCategoryModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <View style={styles.sheetBody}>
              <TextInput
                value={categoryName}
                onChangeText={setCategoryName}
                placeholder="Category Name"
                style={styles.sheetInput}
              />
              <TextInput
                value={openingBalance}
                onChangeText={setOpeningBalance}
                placeholder="Opening Balance(Optional)"
                style={styles.sheetInput}
                keyboardType="numeric"
              />

              <Pressable style={styles.saveBtn} onPress={handleSaveCategory}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 112,
  },
  tabRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  tabChip: {
    flex: 1,
    backgroundColor: "#EEF2F7",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },
  tabChipActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#2563EB",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#2563EB",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    marginBottom: 0,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  listCard: {
    padding: 0,
    overflow: "hidden",
    borderRadius: 18,
  },
  listHeader: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  listMeta: {
    fontSize: 11,
    color: "#64748B",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#EEF2F7",
  },
  rowLeft: {
    flex: 1,
    paddingRight: 10,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  rowSub: {
    marginTop: 4,
    fontSize: 11,
    color: "#64748B",
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    textAlign: "right",
  },
  errorText: {
    color: "#DC2626",
    marginBottom: 12,
  },
  bottomSpacer: {
    height: 10,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 130,
    backgroundColor: "#2563EB",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 5,
  },
  fabText: {
    color: "#fff",
    fontWeight: "800",
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
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
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
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
  },
  closeBtn: {
    backgroundColor: "#F1F5F9",
    padding: 4,
    borderRadius: 16,
  },
  sheetBody: {
    paddingHorizontal: 20,
  },
  sheetInput: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#0F172A",
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
