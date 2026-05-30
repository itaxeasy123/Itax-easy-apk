import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AccountingHeader, Button, Card, Loading } from "../components";
import { accountingService } from "../services/accountingService";
import { invoiceService } from "../../invoice/services/invoiceService";
import { voucherService } from "../services/voucherService";
import { Ledger, Party, VoucherLine } from "../types/accountingTypes";
import { accountingTheme } from "../../../theme/accounting";
import {
  findLedgerByType,
  formatDate,
  formatMoney,
  makeId,
  safeString,
  todayInputValue,
  toNumber,
} from "./voucherFlowUtils";

type ReceiptInvoiceParams = {
  partyId?: string;
  partyName?: string;
  amount?: string;
};

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalAmount: number;
  balanceAmount: number;
  partyId: string;
  partyName: string;
};

export default function ReceiptUnpaidInvoicesScreen() {
    const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<ReceiptInvoiceParams>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parties, setParties] = useState<Party[]>([]);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState(params.partyId ?? "");
  const [search, setSearch] = useState("");
  const [receiptNumber, setReceiptNumber] = useState(`RCT-${Date.now().toString().slice(-6)}`);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [partyResult, ledgerResult, invoiceResult] = await Promise.all([
          accountingService.getParties(),
          accountingService.getLedgers(),
          invoiceService.getInvoices({
            page: 1,
            limit: 200,
            type: "sales",
            status: "unpaid",
          }),
        ]);

        const partyList = partyResult.data ?? [];
        const partyMap = new Map(
          partyList.map((party) => [party.id, party.partyName] as const)
        );
        const invoiceRows = (invoiceResult.invoices ?? []).map((invoice) => {
          const balance = Number(invoice.totalAmount ?? 0);
          return {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber || `INV-${invoice.id}`,
            invoiceDate: invoice.invoiceDate || todayInputValue(),
            totalAmount: balance,
            balanceAmount: balance,
            partyId: invoice.partyId,
            partyName: String(partyMap.get(invoice.partyId) || invoice.party?.partyName || "Party"),
          };
        });

        setParties(partyList);
        setLedgers(ledgerResult.data ?? []);
        setRows(invoiceRows);

        if (!selectedPartyId && invoiceRows[0]?.partyId) {
          setSelectedPartyId(invoiceRows[0].partyId);
        }
      } catch {
        setError("Unable to load unpaid invoices.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const partyRows = useMemo(() => {
    return selectedPartyId
      ? rows.filter((row) => row.partyId === selectedPartyId)
      : rows;
  }, [rows, selectedPartyId]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return partyRows;
    }

    return partyRows.filter((row) =>
      `${row.invoiceNumber} ${row.partyName}`.toLowerCase().includes(query)
    );
  }, [partyRows, search]);

  const totalSelected = useMemo(
    () => partyRows.reduce((sum, row) => sum + row.balanceAmount, 0),
    [partyRows]
  );

  const selectedParty = useMemo(
    () => parties.find((party) => party.id === selectedPartyId) ?? null,
    [parties, selectedPartyId]
  );

  const receivableLedger = useMemo(() => {
    if (!selectedParty) {
      return null;
    }

    return (
      findLedgerByType(selectedParty.ledgers ?? [], "accountsReceivable") ??
      findLedgerByType(ledgers, "accountsReceivable") ??
      null
    );
  }, [ledgers, selectedParty]);

  const cashLedger = useMemo(
    () => findLedgerByType(ledgers, "cash") ?? findLedgerByType(ledgers, "bank") ?? null,
    [ledgers]
  );

  const handleSetFull = (invoiceId: string) => {
    setRows((current) =>
      current.map((row) =>
        row.id === invoiceId ? { ...row, balanceAmount: row.totalAmount } : row
      )
    );
  };

  const handleChangeAmount = (invoiceId: string, value: string) => {
    const nextValue = Math.max(toNumber(value), 0);
    setRows((current) =>
      current.map((row) =>
        row.id === invoiceId ? { ...row, balanceAmount: nextValue } : row
      )
    );
  };

  const handleProceed = async () => {
    if (!selectedParty) {
      setError("Please select a party.");
      return;
    }

    if (!cashLedger) {
      setError("Cash or bank ledger is not available.");
      return;
    }

    if (!receivableLedger) {
      setError("Receivable ledger could not be resolved for this party.");
      return;
    }

    const chosen = partyRows.filter((row) => row.balanceAmount > 0);
    const amount = chosen.reduce((sum, row) => sum + row.balanceAmount, 0);

    if (amount <= 0) {
      setError("Please enter a valid amount for at least one invoice.");
      return;
    }

    const debitLedger: VoucherLine = {
      id: makeId(),
      ledgerId: cashLedger.id,
      ledgerName: cashLedger.ledgerName,
      side: "debit",
      amount,
    };
    const creditLedger: VoucherLine = {
      id: makeId(),
      ledgerId: receivableLedger.id,
      ledgerName: receivableLedger.ledgerName,
      side: "credit",
      amount,
    };

    try {
      setSaving(true);
      setError(null);

      await voucherService.create({
        voucherNumber: safeString(receiptNumber),
        voucherType: "receipt",
        entryDate: new Date().toISOString(),
        narration: `Receipt against ${chosen
          .map((row) => row.invoiceNumber)
          .join(", ") || selectedParty.partyName}`,
        lines: [debitLedger, creditLedger],
      });

      router.replace("/accounting/vouchers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to proceed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading text="Loading unpaid invoices..." fullScreen />;
  }

  return (
    <View style={styles.screen}>
      <AccountingHeader title="Unpaid Invoices" subtitle="Allocate receipt against open invoices." />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 150 + Math.max(insets.bottom, 0) }]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.topCard}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.topLabel}>{receiptNumber}</Text>
              <Text style={styles.topMeta}>
                {selectedParty?.partyName || params.partyName || "Select a party"}
              </Text>
            </View>
            <Pressable onPress={() => setReceiptNumber(`RCT-${Date.now().toString().slice(-6)}`)}>
              <Text style={styles.editLink}>Edit</Text>
            </Pressable>
          </View>
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Party</Text>
            <Text style={styles.smallAction}>Edit Address</Text>
          </View>

          <View style={styles.partyList}>
            {parties.map((party) => {
              const active = party.id === selectedPartyId;
              return (
                <Pressable
                  key={party.id}
                  onPress={() => setSelectedPartyId(party.id)}
                  style={[styles.partyChip, active && styles.partyChipActive]}
                >
                  <Text style={[styles.partyChipText, active && styles.partyChipTextActive]}>
                    {party.partyName}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search invoice"
            style={[styles.input, { marginTop: accountingTheme.spacing.md }]}
          />
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Invoices</Text>
            <Text style={styles.smallAction}>{filteredRows.length} items</Text>
          </View>

          {filteredRows.length > 0 ? (
            filteredRows.map((row) => (
              <View key={row.id} style={styles.invoiceRow}>
                <View style={styles.invoiceLeft}>
                  <Text style={styles.invoiceTitle}>{row.invoiceNumber}</Text>
                  <Text style={styles.invoiceMeta}>{formatDate(row.invoiceDate)}</Text>
                  <Text style={styles.invoiceMeta}>{row.partyName}</Text>
                </View>

                <View style={styles.invoiceRight}>
                  <TextInput
                    value={String(row.balanceAmount || "")}
                    onChangeText={(value) => handleChangeAmount(row.id, value)}
                    keyboardType="numeric"
                    style={styles.amountInput}
                    placeholder="0"
                  />
                  <Text style={styles.smallAmount}>Total {formatMoney(row.totalAmount)}</Text>
                  <Text style={styles.smallAmount}>Balance {formatMoney(row.balanceAmount)}</Text>
                  <Pressable style={styles.fullButton} onPress={() => handleSetFull(row.id)}>
                    <Text style={styles.fullButtonText}>Pay in Full</Text>
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="document-text-outline" size={28} color={accountingTheme.colors.textMuted} />
              <Text style={styles.emptyTitle}>No unpaid invoices</Text>
              <Text style={styles.emptyText}>
                Choose a party to see its unpaid sales invoices.
              </Text>
            </View>
          )}
        </Card>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={accountingTheme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 0) + 16 }]}>
        <View>
          <Text style={styles.footerLabel}>Total Amount</Text>
          <Text style={styles.footerAmount}>{formatMoney(totalSelected)}</Text>
        </View>

        <Button
          title={saving ? "Processing..." : "Proceed"}
          onPress={handleProceed}
          loading={saving}
          size="large"
          style={styles.footerButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: accountingTheme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: accountingTheme.spacing.md,
    paddingBottom: 150,
  },
  topCard: {
    marginBottom: accountingTheme.spacing.md,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: accountingTheme.spacing.md,
  },
  topLabel: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  topMeta: {
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.textSecondary,
    marginTop: accountingTheme.spacing.xs,
  },
  editLink: {
    color: accountingTheme.colors.primary,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: accountingTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  smallAction: {
    color: accountingTheme.colors.primary,
    fontWeight: accountingTheme.fontWeights.bold,
    fontSize: accountingTheme.fontSizes.sm,
  },
  partyList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: accountingTheme.spacing.sm,
  },
  partyChip: {
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.full,
    paddingHorizontal: accountingTheme.spacing.md,
    paddingVertical: accountingTheme.spacing.sm,
  },
  partyChipActive: {
    borderColor: accountingTheme.colors.primary,
    backgroundColor: "#EFF6FF",
  },
  partyChipText: {
    color: "#475569",
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  partyChipTextActive: {
    color: accountingTheme.colors.primary,
  },
  input: {
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.lg,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    paddingHorizontal: accountingTheme.spacing.md,
    paddingVertical: accountingTheme.spacing.md,
    color: accountingTheme.colors.text,
  },
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: accountingTheme.spacing.md,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: accountingTheme.colors.surfaceLight,
  },
  invoiceLeft: {
    flex: 1,
  },
  invoiceTitle: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  invoiceMeta: {
    fontSize: 11,
    color: accountingTheme.colors.textSecondary,
    marginTop: accountingTheme.spacing.xs,
  },
  invoiceRight: {
    width: 135,
    alignItems: "flex-end",
  },
  amountInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: accountingTheme.radius.lg,
    backgroundColor: accountingTheme.colors.card,
    paddingHorizontal: 10,
    paddingVertical: 10,
    textAlign: "center",
  },
  smallAmount: {
    fontSize: accountingTheme.fontSizes.xs,
    color: accountingTheme.colors.textSecondary,
    marginTop: accountingTheme.spacing.xs,
    textAlign: "right",
  },
  fullButton: {
    marginTop: accountingTheme.spacing.sm,
    borderWidth: 1,
    borderColor: accountingTheme.colors.primary,
    backgroundColor: "#EFF6FF",
    borderRadius: accountingTheme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: accountingTheme.spacing.sm,
  },
  fullButtonText: {
    color: accountingTheme.colors.primary,
    fontSize: 11,
    fontWeight: accountingTheme.fontWeights.extraBold,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: accountingTheme.spacing.xl,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  emptyText: {
    marginTop: 6,
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.sm,
    backgroundColor: accountingTheme.colors.dangerLight,
    borderRadius: accountingTheme.radius.lg,
    padding: accountingTheme.spacing.md,
    marginTop: accountingTheme.spacing.md,
  },
  errorText: {
    flex: 1,
    color: accountingTheme.colors.error,
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  bottomSpacer: {
    height: 12,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: accountingTheme.colors.card,
    borderTopWidth: 1,
    borderTopColor: accountingTheme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: accountingTheme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: accountingTheme.spacing.md,
  },
  footerLabel: {
    fontSize: 11,
    color: accountingTheme.colors.textSecondary,
    fontWeight: accountingTheme.fontWeights.bold,
    textTransform: "uppercase",
  },
  footerAmount: {
    fontSize: accountingTheme.fontSizes.xxl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
    marginTop: accountingTheme.spacing.xs,
  },
  footerButton: {
    minWidth: 132,
  },
});
