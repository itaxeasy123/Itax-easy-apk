import React, { useCallback, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AccountingHeader, FiscalYearBar, Loading, EmptyState } from "../components";
import { billshieldUiService, FiscalYearInfo } from "../services/billshieldUiService";
import { exportCsv, exportPdf, buildPdfHtml } from "../utils/exportFile";
import { accountingTheme } from "../../../theme/accounting";

const format = (value: number | undefined) => {
  if (value === undefined || isNaN(value)) return "₹ 0.00";
  return `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
};

interface CapitalLedger {
  id: string;
  name: string;
}

interface StatementEntry {
  voucherNo: string;
  voucherDate: string;
  voucherType: string;
  narration: string | null;
  debit: number;
  credit: number;
  runningBalance: number;
}

interface Statement {
  ledger: { id: string; name: string; group: string };
  opening: { amount: number; type: "DR" | "CR" };
  entries: StatementEntry[];
  closing: { amount: number; type: "DR" | "CR" };
}

export default function CapitalAccountReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fy, setFy] = useState<FiscalYearInfo | null>(null);
  const [ledgers, setLedgers] = useState<CapitalLedger[]>([]);
  const [statement, setStatement] = useState<Statement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLedgerPicker, setShowLedgerPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const selectedLedgerId = useRef<string | null>(null);

  const loadStatement = useCallback(async (ledgerId: string, selectedFy: FiscalYearInfo) => {
    const result = await billshieldUiService.getLedgerStatement(
      ledgerId,
      selectedFy.startDate,
      selectedFy.endDate
    );
    if (result.success && result.data) {
      setStatement(result.data);
    } else {
      setStatement(null);
      setError(result.message ?? "Unable to load the capital account statement.");
    }
  }, []);

  const load = useCallback(
    async (selectedFy: FiscalYearInfo) => {
      setLoading(true);
      setError(null);
      const tb = await billshieldUiService.getTrialBalance(selectedFy.endDate);
      if (!tb.success) {
        setError(tb.message ?? "Unable to load the capital account.");
        setLedgers([]);
        setStatement(null);
        setLoading(false);
        return;
      }
      const capital = tb.data.ledgers
        .filter((l) => l.groupPath.startsWith("capital-account"))
        .map((l) => ({ id: l.ledgerId, name: l.ledgerName }));
      setLedgers(capital);
      if (capital.length === 0) {
        setStatement(null);
        setLoading(false);
        return;
      }
      const active =
        capital.find((l) => l.id === selectedLedgerId.current) ?? capital[0];
      selectedLedgerId.current = active.id;
      await loadStatement(active.id, selectedFy);
      setLoading(false);
    },
    [loadStatement]
  );

  const onFyChange = useCallback(
    (selectedFy: FiscalYearInfo) => {
      setFy(selectedFy);
      load(selectedFy);
    },
    [load]
  );

  const pickLedger = async (ledger: CapitalLedger) => {
    setShowLedgerPicker(false);
    if (!fy || ledger.id === selectedLedgerId.current) return;
    selectedLedgerId.current = ledger.id;
    setLoading(true);
    setError(null);
    await loadStatement(ledger.id, fy);
    setLoading(false);
  };

  const entries = statement?.entries ?? [];
  const totalDebit = entries.reduce((s, e) => s + e.debit, 0);
  const totalCredit = entries.reduce((s, e) => s + e.credit, 0);

  const exportRows = (): (string | number)[][] => [
    ["Date", "Voucher", "Narration", "Debit", "Credit", "Balance"],
    ...entries.map((e) => [
      fmtDate(e.voucherDate),
      e.voucherNo,
      e.narration ?? "",
      e.debit,
      e.credit,
      e.runningBalance,
    ]),
  ];

  const handleExport = async (kind: "pdf" | "csv") => {
    setShowExportMenu(false);
    const rows = exportRows();
    const title = `Capital Account — ${statement?.ledger.name ?? ""}`;
    if (kind === "csv") await exportCsv("capital-account", rows);
    else await exportPdf("capital-account", buildPdfHtml(title, fy ? `Financial Year: ${fy.label}` : "", rows));
  };

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Capital Account"
        showBackButton
        rightContent={
          <Pressable onPress={() => setShowExportMenu(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} color={accountingTheme.colors.card} />
          </Pressable>
        }
      />

      <Pressable
        style={styles.userInfoCard}
        onPress={() => ledgers.length > 1 && setShowLedgerPicker(true)}
        disabled={ledgers.length <= 1}
      >
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={24} color={accountingTheme.colors.textMuted} />
        </View>
        <View style={styles.userInfoTextWrap}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>: {statement?.ledger.name ?? ""}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Group</Text>
            <Text style={styles.infoValue}>: {statement?.ledger.group ?? ""}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Financial year</Text>
            <Text style={styles.infoValue}>: {fy?.label ?? ""}</Text>
          </View>
        </View>
        {ledgers.length > 1 ? (
          <Ionicons name="chevron-forward" size={20} color="#475569" />
        ) : null}
      </Pressable>

      <Text style={styles.sectionTitle}>Capital Transactions</Text>

      <FiscalYearBar onChange={onFyChange} />

      <View style={styles.tableHeader}>
        <Text style={[styles.thText, { flex: 2 }]}>Particular</Text>
        <Text style={[styles.thText, { flex: 1.2, textAlign: "right" }]}>Debit</Text>
        <Text style={[styles.thText, { flex: 1.2, textAlign: "right" }]}>Credit</Text>
        <Text style={[styles.thText, { flex: 1.2, textAlign: "right" }]}>Balance</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Loading text="Loading capital account..." style={styles.loadingWrap} />
        ) : error ? (
          <EmptyState
            icon="alert-circle-outline"
            title="Unable to load"
            description={error}
            actionText="Retry"
            onAction={() => fy && load(fy)}
          />
        ) : ledgers.length === 0 ? (
          <EmptyState
            icon="briefcase-outline"
            title="No capital account found"
            description="No ledgers exist under the Capital Account group."
          />
        ) : (
          <View style={styles.tableCard}>
            {/* Opening balance */}
            <View style={[styles.row, styles.balanceRow]}>
              <Text style={[styles.particular, styles.balanceText]}>Opening Balance</Text>
              <Text style={styles.amount} />
              <Text style={styles.amount} />
              <Text style={[styles.amount, styles.balanceText]}>
                {format(statement?.opening.amount)} {statement?.opening.type ?? ""}
              </Text>
            </View>

            {entries.map((t, index) => (
              <View key={`${t.voucherNo}-${index}`} style={styles.row}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.particular}>
                    {fmtDate(t.voucherDate)} • {t.voucherNo}
                  </Text>
                  {t.narration ? <Text style={styles.narration}>{t.narration}</Text> : null}
                </View>
                <Text style={styles.amount}>{t.debit ? format(t.debit) : "-"}</Text>
                <Text style={styles.amount}>{t.credit ? format(t.credit) : "-"}</Text>
                <Text style={styles.amount}>{format(t.runningBalance)}</Text>
              </View>
            ))}

            {entries.length === 0 && (
              <Text style={styles.emptyText}>No transactions in this financial year</Text>
            )}

            {/* Closing balance */}
            <View style={[styles.row, styles.balanceRow]}>
              <Text style={[styles.particular, styles.balanceText]}>Closing Balance</Text>
              <Text style={styles.amount} />
              <Text style={styles.amount} />
              <Text style={[styles.amount, styles.balanceText]}>
                {format(statement?.closing.amount)} {statement?.closing.type ?? ""}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Total */}
      <View style={styles.footer}>
        <Text style={[styles.footerLabel, { flex: 2 }]}>Total</Text>
        <Text style={[styles.footerValue, { flex: 1.2, textAlign: "right" }]}>{format(totalDebit)}</Text>
        <Text style={[styles.footerValue, { flex: 1.2, textAlign: "right" }]}>{format(totalCredit)}</Text>
        <Text style={[styles.footerValue, { flex: 1.2 }]} />
      </View>
      <View style={{ backgroundColor: accountingTheme.colors.card, height: Math.max(insets.bottom, 0) }} />

      {/* FAB Print */}
      <Pressable
        style={[styles.fabPrint, { bottom: 86 + Math.max(insets.bottom, 0) }]}
        onPress={() => router.navigate("/accounting/reports-capital-account-preview")}
      >
        <Ionicons name="print-outline" size={20} color={accountingTheme.colors.card} />
        <Text style={styles.fabPrintText}>Print</Text>
      </Pressable>

      {/* Capital ledger picker */}
      <Modal
        visible={showLedgerPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLedgerPicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowLedgerPicker(false)} />
          <View style={styles.bottomSheet}>
            <Text style={styles.sheetTitle}>Select Capital Ledger</Text>
            {ledgers.map((l) => (
              <Pressable key={l.id} style={styles.optionRow} onPress={() => pickLedger(l)}>
                <Text style={styles.optionText}>{l.name}</Text>
                {selectedLedgerId.current === l.id ? (
                  <Ionicons name="checkmark-circle" size={20} color={accountingTheme.colors.primary} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Export menu */}
      <Modal
        visible={showExportMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExportMenu(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowExportMenu(false)} />
          <View style={styles.bottomSheet}>
            <Text style={styles.sheetTitle}>Export</Text>
            <Pressable style={styles.optionRow} onPress={() => handleExport("pdf")}>
              <Ionicons name="document-outline" size={18} color="#475569" style={styles.optionIcon} />
              <Text style={styles.optionText}>Download(PDF)</Text>
            </Pressable>
            <Pressable style={styles.optionRow} onPress={() => handleExport("csv")}>
              <Ionicons name="grid-outline" size={18} color="#475569" style={styles.optionIcon} />
              <Text style={styles.optionText}>Download(CSV)</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: accountingTheme.colors.card,
  },
  userInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: accountingTheme.colors.successLight, // Light green as per screenshot
    padding: accountingTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.borderMedium,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: accountingTheme.colors.borderMedium,
    alignItems: "center",
    justifyContent: "center",
    marginRight: accountingTheme.spacing.md,
  },
  userInfoTextWrap: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: accountingTheme.spacing.xs,
  },
  infoLabel: {
    width: 90,
    fontSize: accountingTheme.fontSizes.sm,
    color: "#334155",
    fontWeight: accountingTheme.fontWeights.medium,
  },
  infoValue: {
    flex: 1,
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.text,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  sectionTitle: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#1E293B",
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: accountingTheme.spacing.md,
    paddingBottom: accountingTheme.spacing.sm,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: accountingTheme.colors.primary,
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: accountingTheme.spacing.md,
  },
  thText: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  content: {
    paddingBottom: 80,
  },
  loadingWrap: {
    marginTop: 40,
  },
  tableCard: {
    backgroundColor: accountingTheme.colors.card,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: accountingTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.borderLight,
  },
  balanceRow: {
    backgroundColor: "#F8FAFC",
  },
  balanceText: {
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#1E293B",
  },
  particular: {
    flex: 2,
    fontSize: 11,
    color: "#475569",
    fontWeight: accountingTheme.fontWeights.medium,
  },
  narration: {
    fontSize: 10,
    color: accountingTheme.colors.textSecondary,
    marginTop: 2,
  },
  amount: {
    flex: 1.2,
    fontSize: 11,
    color: accountingTheme.colors.text,
    fontWeight: accountingTheme.fontWeights.bold,
    textAlign: "right",
  },
  emptyText: {
    textAlign: "center",
    padding: accountingTheme.spacing.xxl,
    color: accountingTheme.colors.textMuted,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: accountingTheme.colors.primary,
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: accountingTheme.spacing.lg,
  },
  footerLabel: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  footerValue: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  fabPrint: {
    position: "absolute",
    right: 16,
    bottom: 86,
    backgroundColor: accountingTheme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: accountingTheme.spacing.xl,
    paddingVertical: 14,
    borderRadius: accountingTheme.radius.full,
    elevation: 4,
    shadowColor: accountingTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    gap: accountingTheme.spacing.sm,
  },
  fabPrintText: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.lg,
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
    padding: accountingTheme.spacing.xl,
    paddingBottom: 36,
  },
  sheetTitle: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#1E293B",
    marginBottom: accountingTheme.spacing.md,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: accountingTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E5EAF3",
  },
  optionIcon: {
    marginRight: accountingTheme.spacing.md,
  },
  optionText: {
    flex: 1,
    fontSize: accountingTheme.fontSizes.lg,
    color: "#475569",
    fontWeight: accountingTheme.fontWeights.medium,
  },
});
