import { useCallback, useState } from "react";
import { View, ScrollView, StyleSheet, Text, Pressable, TextInput, Alert, Modal } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card, EmptyState, Loading } from "../components";
import AccountingHeader from "../components/AccountingHeader";
import { accountingTheme } from "../../../theme/accounting";
import { billshieldUiService, BankbookRow } from "../services/billshieldUiService";

const formatDate = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const formatAmount = (value: number) =>
  value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function BankbookScreen() {
  const [rows, setRows] = useState<BankbookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reconciling, setReconciling] = useState<BankbookRow | null>(null);
  const [instrumentNo, setInstrumentNo] = useState("");
  const [statementRef, setStatementRef] = useState("");
  const [markCleared, setMarkCleared] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await billshieldUiService.getBankbook();
    setRows(result.data);
    setError(result.success ? null : result.message ?? "Unable to load bankbook");
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const openReconcile = (row: BankbookRow) => {
    setReconciling(row);
    setInstrumentNo(row.instrumentNo ?? "");
    setStatementRef(row.statementRef ?? "");
    setMarkCleared(Boolean(row.clearedOn));
  };

  const handleSaveReconcile = async () => {
    if (!reconciling) return;
    setSaving(true);
    const result = await billshieldUiService.reconcileLine(reconciling.lineId, {
      instrumentNo: instrumentNo.trim() || undefined,
      statementRef: statementRef.trim() || undefined,
      clearedOn: markCleared ? new Date().toISOString() : null,
    });
    setSaving(false);
    if (result.success) {
      setReconciling(null);
      void load();
    } else {
      Alert.alert("Could not save", result.message ?? "Please try again.");
    }
  };

  // group rows by bank ledger
  const byLedger = rows.reduce<Record<string, BankbookRow[]>>((acc, row) => {
    (acc[row.ledgerName] = acc[row.ledgerName] ?? []).push(row);
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Bankbook"
        subtitle="Bank ledger entries with reconciliation. Tap an entry to record cheque/clearing details."
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Loading text="Loading bankbook..." />
        ) : error ? (
          <View style={styles.cardArea}>
            <Card>
              <EmptyState icon="alert-circle" title="Unable to load" description={error} />
            </Card>
          </View>
        ) : rows.length === 0 ? (
          <View style={styles.cardArea}>
            <Card>
              <EmptyState
                icon="business"
                title="No bank entries yet"
                description="Post a Receipt, Payment or Contra voucher touching a bank ledger and it will appear here."
              />
            </Card>
          </View>
        ) : (
          Object.entries(byLedger).map(([ledgerName, ledgerRows]) => (
            <View key={ledgerName} style={styles.cardArea}>
              <Text style={styles.sectionTitle}>{ledgerName}</Text>
              {ledgerRows.map((row) => (
                <Card key={row.lineId} pressable onPress={() => openReconcile(row)}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.rowTop}>
                      <Text style={styles.voucherNo}>{row.voucherNo}</Text>
                      <Text style={[styles.amount, row.debit > 0 ? styles.amountIn : styles.amountOut]}>
                        {row.debit > 0 ? "+" : "-"}₹{formatAmount(row.debit > 0 ? row.debit : row.credit)}
                      </Text>
                    </View>
                    <Text style={styles.meta}>
                      {formatDate(row.voucherDate)} • {row.voucherType}
                      {row.narration ? ` • ${row.narration}` : ""}
                    </Text>
                    <View style={styles.rowBottom}>
                      <Text style={styles.meta}>Balance ₹{formatAmount(row.runningBalance)}</Text>
                      {row.clearedOn ? (
                        <View style={styles.clearedPill}>
                          <Ionicons name="checkmark-circle" size={12} color="#166534" />
                          <Text style={styles.clearedText}>Cleared {formatDate(row.clearedOn)}</Text>
                        </View>
                      ) : (
                        <View style={styles.pendingPill}>
                          <Ionicons name="time-outline" size={12} color="#92400E" />
                          <Text style={styles.pendingText}>Uncleared</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={reconciling !== null} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reconcile entry</Text>
            <Text style={styles.meta}>
              {reconciling?.voucherNo} • ₹
              {formatAmount(reconciling ? (reconciling.debit > 0 ? reconciling.debit : reconciling.credit) : 0)}
            </Text>

            <Text style={styles.modalLabel}>Cheque / Instrument No.</Text>
            <TextInput
              style={styles.modalInput}
              value={instrumentNo}
              onChangeText={setInstrumentNo}
              placeholder="e.g. 000123"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.modalLabel}>Bank Statement Reference</Text>
            <TextInput
              style={styles.modalInput}
              value={statementRef}
              onChangeText={setStatementRef}
              placeholder="e.g. UTR / statement line ref"
              placeholderTextColor="#94A3B8"
            />

            <Pressable style={styles.clearToggle} onPress={() => setMarkCleared((c) => !c)}>
              <Ionicons
                name={markCleared ? "checkbox" : "square-outline"}
                size={20}
                color={accountingTheme.colors.primary}
              />
              <Text style={styles.clearToggleText}>Mark as cleared in bank statement</Text>
            </Pressable>

            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setReconciling(null)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSave} onPress={handleSaveReconcile} disabled={saving}>
                <Text style={styles.modalSaveText}>{saving ? "Saving..." : "Save"}</Text>
              </Pressable>
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
    backgroundColor: "#f9fafb",
  },
  content: {
    paddingBottom: accountingTheme.spacing.xxl,
  },
  cardArea: {
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: accountingTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: "#111827",
    marginBottom: 10,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  voucherNo: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#111827",
  },
  amount: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
  },
  amountIn: {
    color: "#16A34A",
  },
  amountOut: {
    color: "#DC2626",
  },
  meta: {
    fontSize: accountingTheme.fontSizes.sm,
    color: "#6B7280",
    marginTop: 4,
  },
  clearedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    borderRadius: accountingTheme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  clearedText: {
    color: "#166534",
    fontSize: 10,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  pendingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    borderRadius: accountingTheme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pendingText: {
    color: "#92400E",
    fontSize: 10,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalTitle: {
    fontSize: accountingTheme.fontSizes.xxl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: "#111827",
  },
  modalLabel: {
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.textSecondary,
    marginTop: 14,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    borderRadius: accountingTheme.radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: accountingTheme.fontSizes.md,
    color: "#111827",
  },
  clearToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  clearToggleText: {
    fontSize: accountingTheme.fontSizes.md,
    color: "#111827",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    borderRadius: accountingTheme.radius.lg,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#475569",
    fontWeight: accountingTheme.fontWeights.bold,
  },
  modalSave: {
    flex: 1,
    backgroundColor: accountingTheme.colors.primary,
    borderRadius: accountingTheme.radius.lg,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalSaveText: {
    color: "#FFFFFF",
    fontWeight: accountingTheme.fontWeights.bold,
  },
});
