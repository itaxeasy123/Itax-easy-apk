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
        rightContent={<Ionicons name="ellipsis-horizontal" size={18} color={accountingTheme.colors.card} />}
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

              <Pressable style={styles.dropdownWrap}>
                <Text style={styles.dropdownText}>{selectedAccount || "Select Account"}</Text>
                <Ionicons name="chevron-down" size={18} color={accountingTheme.colors.textSecondary} />
              </Pressable>

              <Pressable style={styles.dropdownWrap}>
                <Text style={styles.dropdownText}>{payFor || "Pay for"}</Text>
                <Ionicons name="chevron-down" size={18} color={accountingTheme.colors.textSecondary} />
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
                      <Ionicons name="calendar-outline" size={18} color={accountingTheme.colors.textSecondary} />
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
    marginBottom: accountingTheme.spacing.lg,
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
    marginBottom: accountingTheme.spacing.lg,
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
    marginBottom: accountingTheme.spacing.lg,
  },
  dropdownText: {
    fontSize: accountingTheme.fontSizes.lg,
    color: accountingTheme.colors.text,
    fontWeight: accountingTheme.fontWeights.medium,
  },
  rowInputs: {
    flexDirection: "row",
    gap: accountingTheme.spacing.md,
    marginBottom: accountingTheme.spacing.lg,
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
    backgroundColor: accountingTheme.colors.card,
    paddingHorizontal: accountingTheme.spacing.xs,
    fontSize: accountingTheme.fontSizes.xs,
    color: accountingTheme.colors.textSecondary,
    zIndex: 1,
  },
  dateBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: accountingTheme.colors.card,
    borderWidth: 1,
    borderColor: accountingTheme.colors.borderMedium,
    borderRadius: 8,
    paddingHorizontal: accountingTheme.spacing.md,
    height: 48,
  },
  dateText: {
    fontSize: accountingTheme.fontSizes.lg,
    color: accountingTheme.colors.text,
    fontWeight: accountingTheme.fontWeights.medium,
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
    marginBottom: accountingTheme.spacing.lg,
  },
  saveBtn: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: accountingTheme.spacing.xs,
  },
  saveBtnText: {
    color: accountingTheme.colors.card,
    fontSize: 15,
    fontWeight: accountingTheme.fontWeights.bold,
  },
});
