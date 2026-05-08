import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
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

import { AccountingHeader, BottomNav, Card, EmptyState, Loading } from "../components";
import { accountingService } from "../services/accountingService";
import { DayBook, Ledger } from "../types/accountingTypes";
import { buildBankCashTransactions, formatCurrency, titleCase } from "../utils/bankCashReport";

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

export default function BankCashDetailScreen() {
  const params = useLocalSearchParams<{ id?: string; name?: string; type?: string }>();
  const router = useRouter();

  const ledgerId = Array.isArray(params.id) ? params.id[0] : params.id;
  const ledgerName = Array.isArray(params.name) ? params.name[0] : params.name;
  const ledgerType = Array.isArray(params.type) ? params.type[0] : params.type;

  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [dayBook, setDayBook] = useState<DayBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddReduceModal, setShowAddReduceModal] = useState(false);
  const [transactionType, setTransactionType] = useState<"add" | "reduce">("add");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [payFor, setPayFor] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("14 Nov 24");
  const [remarks, setRemarks] = useState("");

  const loadData = useCallback(async () => {
    if (!ledgerId) {
      setError("Missing ledger id.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [ledgerResult, dayBookResult] = await Promise.all([
        accountingService.getLedgers(),
        accountingService.getDayBook(),
      ]);

      setLedgers(ledgerResult.data ?? []);
      setDayBook(dayBookResult.data ?? []);
    } catch {
      setError("Unable to load bank/cash details.");
    } finally {
      setLoading(false);
    }
  }, [ledgerId]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const currentLedger = useMemo(
    () => ledgers.find((ledger) => ledger.id === ledgerId) ?? null,
    [ledgerId, ledgers]
  );

  const title = ledgerName || currentLedger?.ledgerName || "Ledger";
  const balance = Number(currentLedger?.balance || 0);
  const transactions = useMemo(
    () => buildBankCashTransactions(dayBook, ledgerId ?? ""),
    [dayBook, ledgerId]
  );
  const financialYear = useMemo(() => {
    const now = new Date();
    const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return `${currentYear} - ${String(currentYear + 1).slice(-2)}`;
  }, []);

  const handleAddReduceMoney = () => {
    setShowAddReduceModal(true);
  };

  const handleSaveTransaction = () => {
    // Implement save logic here
    setShowAddReduceModal(false);
    setAmount("");
    setRemarks("");
  };

  return (
    <View style={styles.screen}>
      <AccountingHeader
        title={title}
        subtitle={ledgerType ? `${titleCase(ledgerType)} Ledger` : "Ledger details"}
        showBackButton
        rightContent={<Ionicons name="ellipsis-horizontal" size={18} color="#fff" />}
        headerContent={(
          <View style={styles.headerBlock}>
            <Text style={styles.headerAmount}>{formatCurrency(balance)}</Text>
            <Text style={styles.headerMeta}>Total Balance</Text>
          </View>
        )}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.yearRow}>
          <View style={styles.yearLeft}>
            <Ionicons name="calendar-outline" size={16} color="#2563EB" />
            <Text style={styles.yearText}>Financial Year ({financialYear})</Text>
          </View>
          <Text style={styles.changeText}>Change</Text>
        </View>

        {loading ? <Loading text="Loading ledger transactions..." /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && !error ? (
          <Card style={styles.listCard}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>{title}</Text>
              <Text style={styles.listMeta}>{transactions.length} records</Text>
            </View>

            {transactions.length > 0 ? (
              transactions.map((row) => {
                const positive = row.side === "debit";
                return (
                  <View key={row.id} style={styles.row}>
                    <View style={styles.rowLeft}>
                      <View style={styles.rowTopLine}>
                        <Text style={styles.rowTitle}>{row.title}</Text>
                        <View style={styles.statusPill}>
                          <Text style={styles.statusText}>{titleCase(row.voucherType)}</Text>
                        </View>
                      </View>
                      <Text style={styles.rowDate}>{formatDate(row.date)}</Text>
                      <Text style={styles.rowSub}>{row.description || row.ledgerName}</Text>
                    </View>

                    <Text
                      style={[
                        styles.rowAmount,
                        positive ? styles.positiveAmount : styles.negativeAmount,
                      ]}
                    >
                      {positive ? "+" : "-"}
                      {formatCurrency(row.amount)}
                    </Text>
                  </View>
                );
              })
            ) : (
              <EmptyState
                icon="wallet-outline"
                title="No transactions found"
                description="Transactions for this ledger will appear here once vouchers are posted."
              />
            )}
          </Card>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Pressable style={styles.fab} onPress={handleAddReduceMoney}>
        <Ionicons name="wallet-outline" size={18} color="#fff" />
        <Text style={styles.fabText}>Add / Reduce Money</Text>
      </Pressable>

      <BottomNav activeRoute="/accounting/reports" />

      {/* Add/Reduce Money Modal */}
      <Modal
        visible={showAddReduceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddReduceModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowAddReduceModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Add/Reduce Money</Text>
              <Pressable onPress={() => setShowAddReduceModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <View style={styles.sheetBody}>
              <View style={styles.radioGroup}>
                <Pressable style={styles.radioItem} onPress={() => setTransactionType("add")}>
                  <View style={[styles.radioOuter, transactionType === "add" && styles.radioOuterActive]}>
                    {transactionType === "add" && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>Add Money</Text>
                </Pressable>
                <Pressable style={styles.radioItem} onPress={() => setTransactionType("reduce")}>
                  <View style={[styles.radioOuter, transactionType === "reduce" && styles.radioOuterActive]}>
                    {transactionType === "reduce" && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>Reduce Money</Text>
                </Pressable>
              </View>

              <Pressable style={styles.dropdownWrap}>
                <Text style={styles.dropdownText}>{selectedAccount || "Select Account"}</Text>
                <Ionicons name="chevron-down" size={18} color="#64748B" />
              </Pressable>

              <Pressable style={styles.dropdownWrap}>
                <Text style={styles.dropdownText}>{payFor || "Pay for"}</Text>
                <Ionicons name="chevron-down" size={18} color="#64748B" />
              </Pressable>

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="Amount"
                    style={styles.sheetInput}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <View style={styles.dateWrap}>
                    <Text style={styles.dateLabel}>Select Date</Text>
                    <Pressable style={styles.dateBox}>
                      <Text style={styles.dateText}>{date}</Text>
                      <Ionicons name="calendar-outline" size={18} color="#64748B" />
                    </Pressable>
                  </View>
                </View>
              </View>

              <TextInput
                value={remarks}
                onChangeText={setRemarks}
                placeholder="Remarks"
                style={styles.sheetInput}
              />

              <Pressable style={styles.saveBtn} onPress={handleSaveTransaction}>
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
  headerBlock: {
    alignItems: "center",
    marginTop: 8,
    paddingBottom: 2,
  },
  headerAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  headerMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#EAFDFC",
    fontWeight: "600",
  },
  yearRow: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  yearLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  yearText: {
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
  listCard: {
    padding: 0,
    overflow: "hidden",
    borderRadius: 18,
  },
  listHeader: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
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
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#EEF2F7",
  },
  rowLeft: {
    flex: 1,
    paddingRight: 10,
  },
  rowTopLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
    flexWrap: "wrap",
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#EEF2F7",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
  },
  rowDate: {
    fontSize: 12,
    color: "#64748B",
  },
  rowSub: {
    marginTop: 4,
    fontSize: 11,
    color: "#94A3B8",
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
  },
  positiveAmount: {
    color: "#059669",
  },
  negativeAmount: {
    color: "#DC2626",
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
    bottom: 84,
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
    marginBottom: 16,
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
  radioGroup: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#64748B",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterActive: {
    borderColor: "#2563EB",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  dropdownWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  dropdownText: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  dateWrap: {
    position: "relative",
  },
  dateLabel: {
    position: "absolute",
    top: -8,
    left: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
    fontSize: 10,
    color: "#64748B",
    zIndex: 1,
  },
  dateBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  dateText: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },
  sheetInput: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#0F172A",
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
