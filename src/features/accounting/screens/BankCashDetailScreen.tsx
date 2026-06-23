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
  Alert,
  ActivityIndicator,
} from "react-native";

import { AccountingHeader, BottomNav, Card, EmptyState, Loading, DateField } from "../components";
import { billshieldUiService } from "../services/billshieldUiService";
import { voucherService } from "../services/voucherService";
import { formatCurrency, titleCase } from "../utils/bankCashReport";
import { accountingTheme } from "../../../theme/accounting";

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

  const [statementData, setStatementData] = useState<any>(null);
  const [allLedgers, setAllLedgers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddReduceModal, setShowAddReduceModal] = useState(false);
  const [showLedgerSelectModal, setShowLedgerSelectModal] = useState(false);
  
  const [transactionType, setTransactionType] = useState<"add" | "reduce">("add");
  const [oppositeLedgerId, setOppositeLedgerId] = useState("");
  const [oppositeLedgerName, setOppositeLedgerName] = useState("");
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [remarks, setRemarks] = useState("");
  const [savingTransaction, setSavingTransaction] = useState(false);

  const loadData = useCallback(async () => {
    if (!ledgerId) {
      setError("Missing ledger id.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [statementResult, ledgersResult] = await Promise.all([
        billshieldUiService.getLedgerStatement(ledgerId),
        billshieldUiService.listLedgers(),
      ]);

      if (statementResult.success) {
        setStatementData(statementResult.data);
      } else {
        setError(statementResult.message ?? "Unable to load ledger statement.");
      }

      if (ledgersResult.success) {
        setAllLedgers(ledgersResult.data ?? []);
      }
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

  const title = ledgerName || statementData?.ledger?.name || "Ledger";
  const balance = statementData?.closing?.amount ?? 0;
  const balanceType = statementData?.closing?.type ?? "DR";

  const transactions = useMemo(() => {
    if (!statementData?.entries) return [];
    return statementData.entries.map((entry: any, index: number) => {
      const isDebit = entry.debit > 0;
      return {
        id: `${entry.voucherNo}-${index}`,
        title: entry.voucherNo || `Voucher #${index + 1}`,
        voucherType: entry.voucherType || "Journal",
        date: entry.voucherDate,
        description: entry.narration || "",
        amount: isDebit ? entry.debit : entry.credit,
        side: isDebit ? "debit" : "credit",
        runningBalance: entry.runningBalance,
      };
    }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [statementData]);

  const filteredLedgers = useMemo(() => {
    return allLedgers.filter((l) => {
      if (l.id === ledgerId) return false; // Exclude current bank/cash ledger itself
      if (!ledgerSearch) return true;
      return l.name.toLowerCase().includes(ledgerSearch.toLowerCase());
    });
  }, [allLedgers, ledgerId, ledgerSearch]);

  const financialYear = useMemo(() => {
    const now = new Date();
    const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return `${currentYear} - ${String(currentYear + 1).slice(-2)}`;
  }, []);

  const handleAddReduceMoney = () => {
    setShowAddReduceModal(true);
  };

  const handleSaveTransaction = async () => {
    const amt = Number(amount);
    if (!oppositeLedgerId) {
      Alert.alert("Missing account", "Please select an opposite account ledger.");
      return;
    }
    if (!amt || amt <= 0 || Number.isNaN(amt)) {
      Alert.alert("Invalid amount", "Please enter a valid amount greater than zero.");
      return;
    }
    if (!date) {
      Alert.alert("Missing date", "Please select a transaction date.");
      return;
    }

    setSavingTransaction(true);
    
    // Receipt voucher if adding money (Dr Bank/Cash, Cr Opposite)
    // Payment voucher if reducing money (Dr Opposite, Cr Bank/Cash)
    const lines = transactionType === "add"
      ? [
          { ledgerId: ledgerId!, side: "debit" as const, amount: amt },
          { ledgerId: oppositeLedgerId, side: "credit" as const, amount: amt }
        ]
      : [
          { ledgerId: oppositeLedgerId, side: "debit" as const, amount: amt },
          { ledgerId: ledgerId!, side: "credit" as const, amount: amt }
        ];

    const result = await voucherService.create({
      voucherNumber: "", // Automatically generated on device
      voucherType: transactionType === "add" ? "receipt" : "payment",
      entryDate: date,
      narration: remarks || `${transactionType === "add" ? "Received from" : "Paid to"} ${oppositeLedgerName}`,
      lines,
    });

    setSavingTransaction(false);

    if (result.success) {
      setShowAddReduceModal(false);
      setAmount("");
      setRemarks("");
      setOppositeLedgerId("");
      setOppositeLedgerName("");
      Alert.alert("Success", "Transaction successfully booked inside local double-entry system.");
      void loadData();
    } else {
      Alert.alert("Error", result.message ?? "Could not save transaction.");
    }
  };

  return (
    <View style={styles.screen}>
      <AccountingHeader
        title={title}
        subtitle={ledgerType ? `${titleCase(ledgerType)} Ledger` : "Ledger details"}
        showBackButton
        rightContent={<Ionicons name="ellipsis-horizontal" size={18} color={accountingTheme.colors.card} />}
        headerContent={(
          <View style={styles.headerBlock}>
            <Text style={styles.headerAmount}>
              {formatCurrency(balance)} {balanceType === "DR" ? "Dr" : "Cr"}
            </Text>
            <Text style={styles.headerMeta}>Total Balance</Text>
          </View>
        )}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.yearRow}>
          <View style={styles.yearLeft}>
            <Ionicons name="calendar-outline" size={16} color={accountingTheme.colors.primary} />
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
                      <Text style={styles.rowSub}>{row.description}</Text>
                    </View>

                    <View style={styles.amountWrap}>
                      <Text
                        style={[
                          styles.rowAmount,
                          positive ? styles.positiveAmount : styles.negativeAmount,
                        ]}
                      >
                        {positive ? "+" : "-"}
                        {formatCurrency(row.amount)}
                      </Text>
                      <Text style={styles.runningBalText}>
                        Bal: {formatCurrency(row.runningBalance)}
                      </Text>
                    </View>
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
        <Ionicons name="wallet-outline" size={18} color={accountingTheme.colors.card} />
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
                <Ionicons name="close" size={20} color={accountingTheme.colors.textMuted} />
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

              {/* Opposite Ledger selector dropdown */}
              <Text style={styles.fieldLabel}>Opposite Account (Double Entry)</Text>
              <Pressable style={styles.dropdownWrap} onPress={() => setShowLedgerSelectModal(true)}>
                <Text style={styles.dropdownText}>
                  {oppositeLedgerName || "Select Opposite Ledger"}
                </Text>
                <Ionicons name="chevron-down" size={18} color={accountingTheme.colors.textSecondary} />
              </Pressable>

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.fieldLabel}>Amount</Text>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="Amount"
                    style={styles.sheetInput}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.fieldLabel}>Select Date</Text>
                  <DateField value={date} onChange={setDate} />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Remarks (Optional)</Text>
              <TextInput
                value={remarks}
                onChangeText={setRemarks}
                placeholder="Remarks"
                style={styles.sheetInput}
              />

              <Pressable style={styles.saveBtn} onPress={handleSaveTransaction} disabled={savingTransaction}>
                {savingTransaction ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Post Transaction</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Ledger Selection Modal */}
      <Modal
        visible={showLedgerSelectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLedgerSelectModal(false)}
      >
        <View style={styles.ledgerSelectBackdrop}>
          <View style={styles.ledgerSelectCard}>
            <View style={styles.ledgerSelectHeader}>
              <Text style={styles.ledgerSelectTitle}>Select Account Ledger</Text>
              <Pressable onPress={() => setShowLedgerSelectModal(false)}>
                <Ionicons name="close" size={22} color="#475569" />
              </Pressable>
            </View>

            {/* Search Input */}
            <View style={styles.searchBoxWrap}>
              <Ionicons name="search-outline" size={18} color="#64748B" style={styles.searchIcon} />
              <TextInput
                value={ledgerSearch}
                onChangeText={setLedgerSearch}
                placeholder="Search accounts..."
                placeholderTextColor="#94A3B8"
                style={styles.searchBox}
              />
              {ledgerSearch ? (
                <Pressable onPress={() => setLedgerSearch("")}>
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </Pressable>
              ) : null}
            </View>

            {/* Flat List inside ScrollView */}
            <ScrollView style={styles.ledgerListScroll} keyboardShouldPersistTaps="handled">
              {filteredLedgers.length > 0 ? (
                filteredLedgers.map((l) => (
                  <Pressable
                    key={l.id}
                    style={[
                      styles.ledgerSelectItem,
                      oppositeLedgerId === l.id && styles.ledgerSelectItemActive,
                    ]}
                    onPress={() => {
                      setOppositeLedgerId(l.id);
                      setOppositeLedgerName(l.name);
                      setShowLedgerSelectModal(false);
                      setLedgerSearch("");
                    }}
                  >
                    <View>
                      <Text style={[
                        styles.ledgerSelectItemText,
                        oppositeLedgerId === l.id && styles.ledgerSelectItemTextActive
                      ]}>
                        {l.name}
                      </Text>
                      <Text style={styles.ledgerSelectItemGroupText}>{l.groupName}</Text>
                    </View>
                    {oppositeLedgerId === l.id ? (
                      <Ionicons name="checkmark" size={18} color={accountingTheme.colors.primary} />
                    ) : null}
                  </Pressable>
                ))
              ) : (
                <Text style={styles.noLedgerText}>No matching accounts found.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: accountingTheme.colors.background,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: accountingTheme.spacing.md,
    paddingBottom: 112,
  },
  headerBlock: {
    alignItems: "center",
    marginTop: accountingTheme.spacing.sm,
    paddingBottom: 2,
  },
  headerAmount: {
    fontSize: accountingTheme.fontSizes.xxxl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.card,
    letterSpacing: 0.2,
  },
  headerMeta: {
    marginTop: accountingTheme.spacing.xs,
    fontSize: accountingTheme.fontSizes.sm,
    color: "#EAFDFC",
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  yearRow: {
    marginBottom: accountingTheme.spacing.md,
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
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  listMeta: {
    fontSize: 11,
    color: accountingTheme.colors.textSecondary,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: accountingTheme.colors.surfaceLight,
  },
  rowLeft: {
    flex: 1,
    paddingRight: 10,
  },
  rowTopLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.sm,
    marginBottom: 6,
    flexWrap: "wrap",
  },
  rowTitle: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#1F2937",
  },
  statusPill: {
    paddingHorizontal: accountingTheme.spacing.sm,
    paddingVertical: 3,
    borderRadius: accountingTheme.radius.full,
    backgroundColor: accountingTheme.colors.surfaceLight,
  },
  statusText: {
    fontSize: accountingTheme.fontSizes.xs,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.textSecondary,
  },
  rowDate: {
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.textSecondary,
  },
  rowSub: {
    marginTop: accountingTheme.spacing.xs,
    fontSize: 11,
    color: accountingTheme.colors.textMuted,
  },
  amountWrap: {
    alignItems: "flex-end",
  },
  rowAmount: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
    textAlign: "right",
  },
  positiveAmount: {
    color: "#059669",
  },
  negativeAmount: {
    color: accountingTheme.colors.error,
  },
  runningBalText: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 4,
  },
  errorText: {
    color: accountingTheme.colors.error,
    marginBottom: accountingTheme.spacing.md,
  },
  bottomSpacer: {
    height: 10,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 84,
    backgroundColor: accountingTheme.colors.primary,
    borderRadius: accountingTheme.radius.full,
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: accountingTheme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.sm,
    elevation: 5,
  },
  fabText: {
    color: accountingTheme.colors.card,
    fontWeight: accountingTheme.fontWeights.extraBold,
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
    elevation: 20,
    shadowColor: accountingTheme.colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: accountingTheme.spacing.xl,
    marginBottom: accountingTheme.spacing.sm,
  },
  sheetTitle: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: "#1E293B",
  },
  closeBtn: {
    backgroundColor: accountingTheme.colors.borderLight,
    padding: accountingTheme.spacing.xs,
    borderRadius: accountingTheme.radius.xxl,
  },
  sheetBody: {
    paddingHorizontal: accountingTheme.spacing.xl,
  },
  radioGroup: {
    flexDirection: "row",
    gap: accountingTheme.spacing.xl,
    marginBottom: accountingTheme.spacing.md,
    marginTop: accountingTheme.spacing.sm,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.sm,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: accountingTheme.colors.textSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterActive: {
    borderColor: accountingTheme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: accountingTheme.colors.primary,
  },
  radioLabel: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#334155",
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 6,
    marginTop: 8,
  },
  dropdownWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: accountingTheme.colors.card,
    borderWidth: 1,
    borderColor: accountingTheme.colors.borderMedium,
    borderRadius: 8,
    paddingHorizontal: accountingTheme.spacing.md,
    height: 48,
    marginBottom: accountingTheme.spacing.sm,
  },
  dropdownText: {
    fontSize: accountingTheme.fontSizes.lg,
    color: accountingTheme.colors.text,
    fontWeight: accountingTheme.fontWeights.medium,
  },
  rowInputs: {
    flexDirection: "row",
    gap: accountingTheme.spacing.md,
    marginBottom: accountingTheme.spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  sheetInput: {
    height: 48,
    backgroundColor: accountingTheme.colors.card,
    borderWidth: 1,
    borderColor: accountingTheme.colors.borderMedium,
    borderRadius: 8,
    paddingHorizontal: accountingTheme.spacing.md,
    fontSize: accountingTheme.fontSizes.lg,
    color: accountingTheme.colors.text,
    marginBottom: accountingTheme.spacing.sm,
  },
  saveBtn: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: accountingTheme.spacing.md,
  },
  saveBtnText: {
    color: accountingTheme.colors.card,
    fontSize: 15,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  ledgerSelectBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  ledgerSelectCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    maxHeight: "80%",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  ledgerSelectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ledgerSelectTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
  },
  searchBoxWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBox: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    paddingVertical: 0,
  },
  ledgerListScroll: {
    maxHeight: 300,
  },
  ledgerSelectItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    borderRadius: 6,
  },
  ledgerSelectItemActive: {
    backgroundColor: "#F1F5F9",
  },
  ledgerSelectItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  ledgerSelectItemTextActive: {
    color: accountingTheme.colors.primary,
  },
  ledgerSelectItemGroupText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  noLedgerText: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 24,
  },
});
