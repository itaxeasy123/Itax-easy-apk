import { useEffect, useMemo, useState } from "react";
import {
  Modal,
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

import { AccountingHeader, Button, Card, DateField, Loading } from "../components";
import { accountingService } from "../services/accountingService";
import { voucherService } from "../services/voucherService";
import { Ledger, Party, VoucherLine } from "../types/accountingTypes";
import { accountingTheme } from "../../../theme/accounting";
import InlinePartySelector from "../components/InlinePartySelector";
import {
  findLedgerByType,
  formatMoney,
  makeId,
  safeString,
  todayInputValue,
  toNumber,
} from "./voucherFlowUtils";

type ReceiptSearchParams = {
  partyId?: string;
  partyName?: string;
  amount?: string;
  invoiceRefs?: string;
};

type PaymentMode = "cash" | "bank";

const paymentModeOptions: { label: string; value: PaymentMode }[] = [
  { label: "Cash", value: "cash" },
  { label: "Bank Transfer", value: "bank" },
];

export default function ReceiptPaymentCreateScreen() {
    const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<ReceiptSearchParams>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parties, setParties] = useState<Party[]>([]);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState<string>(params.partyId ?? "");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [receiptDate, setReceiptDate] = useState(todayInputValue());
  const [receiptNumber, setReceiptNumber] = useState(`RCT-${Date.now().toString().slice(-6)}`);
  const [partySearch, setPartySearch] = useState("");
  const [showPartySheet, setShowPartySheet] = useState(false);
  const [showInvoiceEditSheet, setShowInvoiceEditSheet] = useState(false);
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [showBankSheet, setShowBankSheet] = useState(false);
  const [showPaymentModeSheet, setShowPaymentModeSheet] = useState(false);
  const [amount, setAmount] = useState(params.amount ?? "");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [addressDraft, setAddressDraft] = useState("");
  const [chequeNumberDraft, setChequeNumberDraft] = useState("");
  const [bankDateDraft, setBankDateDraft] = useState(todayInputValue());
  const [bankDescriptionDraft, setBankDescriptionDraft] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [partyResult, ledgerResult] = await Promise.all([
          accountingService.getParties(),
          accountingService.getLedgers(),
        ]);

        setParties(partyResult.data ?? []);
        setLedgers(ledgerResult.data ?? []);

        if (!selectedPartyId && (partyResult.data ?? [])[0]?.id) {
          setSelectedPartyId((partyResult.data ?? [])[0].id);
        }
      } catch {
        setError("Unable to load receipt form data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const selectedParty = useMemo(
    () => parties.find((party) => party.id === selectedPartyId) ?? null,
    [parties, selectedPartyId]
  );

  const visibleParties = useMemo(() => {
    const query = partySearch.trim().toLowerCase();
    if (!query) {
      return parties;
    }

    return parties.filter((party) =>
      `${party.partyName} ${party.phone ?? ""} ${party.gstin ?? ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [parties, partySearch]);

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

  const cashLedger = useMemo(() => {
    if (paymentMode === "bank") {
      return findLedgerByType(ledgers, "bank") ?? findLedgerByType(ledgers, "cash") ?? null;
    }

    return findLedgerByType(ledgers, "cash") ?? findLedgerByType(ledgers, "bank") ?? null;
  }, [ledgers, paymentMode]);

  const bankLedger = useMemo(
    () => findLedgerByType(ledgers, "bank") ?? null,
    [ledgers]
  );

  const amountValue = Math.max(toNumber(amount), 0);
  const closingBalance = receivableLedger?.balance ?? 0;
  // const canPrintReceipt = Boolean(selectedParty && amountValue > 0);

  useEffect(() => {
    if (showAddressSheet) {
      setAddressDraft(selectedParty?.address ?? "");
    }
  }, [selectedParty, showAddressSheet]);

  useEffect(() => {
    if (showBankSheet) {
      setChequeNumberDraft("");
      setBankDateDraft(receiptDate);
      setBankDescriptionDraft("");
    }
  }, [receiptDate, showBankSheet]);

  const handleCreate = async () => {
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

    if (amountValue <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    const debitLedger: VoucherLine = {
      id: makeId(),
      ledgerId: cashLedger.id,
      ledgerName: cashLedger.ledgerName,
      side: "debit",
      amount: amountValue,
    };
    const creditLedger: VoucherLine = {
      id: makeId(),
      ledgerId: receivableLedger.id,
      ledgerName: receivableLedger.ledgerName,
      side: "credit",
      amount: amountValue,
    };

    try {
      setSaving(true);
      setError(null);

      const result = await voucherService.create({
        voucherNumber: safeString(receiptNumber),
        voucherType: "receipt",
        entryDate: new Date(receiptDate).toISOString(),
        narration:
          safeString(notes) ||
          `Receipt from ${selectedParty.partyName}${params.invoiceRefs ? ` against ${params.invoiceRefs}` : ""}`,
        lines: [debitLedger, creditLedger],
      });

      if (!result.success) {
        setError(result.message ?? "Unable to create receipt.");
        return;
      }

      router.replace("/accounting/vouchers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create receipt.");
    } finally {
      setSaving(false);
    }
  };

  // const handlePrintReceipt = () => {
  //   if (!selectedParty || amountValue <= 0) {
  //     setError("Please select a party and enter a valid amount.");
  //     return;
  //   }

  //   router.navigate({
  //     pathname: "/accounting/print/receipt",
  //     params: {
  //       partyId: selectedParty.id,
  //       partyName: selectedParty.partyName,
  //       amount: String(amountValue),
  //       receiptNumber,
  //       receiptDate,
  //     },
  //   });
  // };

  if (loading) {
    return <Loading text="Loading receipt form..." fullScreen />;
  }

  return (
    <View style={styles.screen}>
      <AccountingHeader title="Create Receipt" subtitle="Record a cash receipt or bank transfer." />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 132 + Math.max(insets.bottom, 0) }]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.cardBlock}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.invoiceTitle}>{receiptNumber}</Text>
              <Text style={styles.invoiceMeta}>
                {receiptDate} | Due {receiptDate}
              </Text>
            </View>
            <Pressable onPress={() => setShowInvoiceEditSheet(true)}>
              <Text style={styles.linkText}>Edit</Text>
            </Pressable>
          </View>
        </Card>

        <Card style={styles.cardBlock}>
          <View style={styles.sectionTop}>
            <Text style={styles.sectionTitle}>Select Party</Text>
            <Pressable onPress={() => setShowAddressSheet(true)}>
              <Text style={styles.linkText}>Edit Address</Text>
            </Pressable>
          </View>

          <InlinePartySelector
            parties={parties}
            selectedPartyId={selectedPartyId}
            onSelect={setSelectedPartyId}
            placeholder="Search"
          />

          {selectedParty ? (
            <Text style={styles.balanceText}>
              Closing Balance: {formatMoney(closingBalance)}
            </Text>
          ) : null}
        </Card>

        <Card style={styles.cardBlock}>
          <Text style={styles.sectionTitle}>Amount</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Enter amount"
            style={styles.input}
          />
        </Card>

        <Card style={styles.cardBlock}>
          <View style={styles.sectionTop}>
            <Text style={styles.sectionTitle}>Payment Mode</Text>
            <Pressable onPress={() => setShowPaymentModeSheet(true)}>
              <Text style={styles.linkText}>Edit</Text>
            </Pressable>
          </View>
          <View style={styles.modeRow}>
            <View style={styles.modePreview}>
              <Text style={styles.modePreviewText}>{paymentModeOptions.find((opt) => opt.value === paymentMode)?.label ?? "Cash"}</Text>
            </View>
          </View>
        </Card>

        {paymentMode === "bank" ? (
          <Card style={styles.cardBlock}>
            <View style={styles.sectionTop}>
              <Text style={styles.sectionTitle}>Bank Details</Text>
              <Pressable onPress={() => setShowBankSheet(true)}>
                <Text style={styles.linkText}>{bankLedger ? "Edit" : "Add"}</Text>
              </Pressable>
            </View>
            {bankLedger ? (
              <View style={styles.bankCard}>
                <View>
                  <Text style={styles.bankTitle}>{bankLedger.ledgerName}</Text>
                  <Text style={styles.bankMeta}>Ledger: {bankLedger.id}</Text>
                </View>
                <Text style={styles.bankDate}>{receiptDate}</Text>
              </View>
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>No bank ledger found</Text>
                <Text style={styles.emptyText}>
                  Add a bank ledger to show bank details here.
                </Text>
              </View>
            )}
          </Card>
        ) : null}

        <Pressable
          style={styles.unpaidRow}
          onPress={() =>
            router.navigate({
              pathname: "/accounting/receipt-unpaid-invoices",
              params: {
                partyId: selectedPartyId || undefined,
                partyName: selectedParty?.partyName || undefined,
                amount: amount || undefined,
              },
            })
          }
        >
          <Text style={styles.unpaidLabel}>Unpaid Invoices</Text>
          <Ionicons name="chevron-forward" size={18} color={accountingTheme.colors.textSecondary} />
        </Pressable>

        <Card style={styles.cardBlock}>
          <View style={styles.sectionTop}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Pressable onPress={() => setShowNotes((current) => !current)}>
              <Text style={styles.linkText}>{showNotes ? "Close" : "Add"}</Text>
            </Pressable>
          </View>
          {showNotes ? (
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Receipt notes"
              style={[styles.input, styles.notesInput]}
              multiline
            />
          ) : null}
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
          <Text style={styles.footerAmount}>{formatMoney(amountValue)}</Text>
        </View>

        <View style={styles.footerActions}>
          {/* <Pressable
            onPress={handlePrintReceipt}
            style={[styles.printButton, !canPrintReceipt && styles.printButtonDisabled]}
            disabled={!canPrintReceipt}
          >
            <Ionicons name="print-outline" size={16} color={accountingTheme.colors.primary} />
            <Text style={styles.printButtonText}>Print</Text>
          </Pressable> */}

          <Button
            title={saving ? "Creating..." : "Create"}
            onPress={handleCreate}
            loading={saving}
            size="large"
            style={styles.footerButton}
          />
        </View>
      </View>

      <Modal
        visible={showInvoiceEditSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInvoiceEditSheet(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowInvoiceEditSheet(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Edit Invoice Date & Number</Text>
            <View style={styles.sheetField}>
              <Text style={styles.fieldLabel}>Select Date</Text>
              <DateField value={receiptDate} onChange={setReceiptDate} placeholder="Select receipt date" />
            </View>
            <View style={styles.sheetField}>
              <Text style={styles.fieldLabel}>Invoice Number</Text>
              <TextInput value={receiptNumber} onChangeText={setReceiptNumber} style={styles.sheetInput} />
            </View>
            <Pressable style={styles.sheetButton} onPress={() => setShowInvoiceEditSheet(false)}>
              <Text style={styles.sheetButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAddressSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddressSheet(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowAddressSheet(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Edit Address</Text>
            <View style={styles.sheetField}>
              <Text style={styles.fieldLabel}>Party</Text>
              <View style={styles.selectBox}>
                <Text style={styles.selectBoxText}>{selectedParty?.partyName || "Select Party"}</Text>
                <Ionicons name="chevron-down" size={16} color={accountingTheme.colors.textSecondary} />
              </View>
            </View>
            <View style={styles.sheetField}>
              <Text style={styles.fieldLabel}>Address</Text>
              <TextInput
                value={addressDraft}
                onChangeText={setAddressDraft}
                style={[styles.sheetInput, styles.sheetMultiline]}
                multiline
              />
            </View>
            <Pressable
              style={styles.sheetButton}
              onPress={async () => {
                if (!selectedParty) return;
                try {
                  setSaving(true);
                  await accountingService.updateParty(selectedParty.id, { address: addressDraft.trim() });
                  setShowAddressSheet(false);
                } finally {
                  setSaving(false);
                }
              }}
            >
              <Text style={styles.sheetButtonText}>{saving ? "Saving..." : "Update"}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showBankSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBankSheet(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowBankSheet(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Bank Details</Text>
            <View style={styles.sheetField}>
              <Text style={styles.fieldLabel}>Cheque Number</Text>
              <TextInput value={chequeNumberDraft} onChangeText={setChequeNumberDraft} style={styles.sheetInput} />
            </View>
            <View style={styles.sheetField}>
              <Text style={styles.fieldLabel}>Select Date</Text>
              <DateField value={bankDateDraft} onChange={setBankDateDraft} placeholder="Select date" />
            </View>
            <View style={styles.sheetField}>
              <Text style={styles.fieldLabel}>Select Bank</Text>
              <View style={styles.selectBox}>
                <Text style={styles.selectBoxText}>{bankLedger?.ledgerName ?? "Select Bank"}</Text>
                <Ionicons name="chevron-down" size={16} color={accountingTheme.colors.textSecondary} />
              </View>
            </View>
            <View style={styles.sheetField}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput value={bankDescriptionDraft} onChangeText={setBankDescriptionDraft} style={styles.sheetInput} />
            </View>
            <Pressable style={styles.sheetButton} onPress={() => setShowBankSheet(false)}>
              <Text style={styles.sheetButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPaymentModeSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModeSheet(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowPaymentModeSheet(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Payment Mode</Text>
            {paymentModeOptions.map((option) => (
              <Pressable
                key={option.value}
                style={styles.sheetRow}
                onPress={() => {
                  setPaymentMode(option.value);
                  setShowPaymentModeSheet(false);
                }}
              >
                <Text style={styles.sheetRowTitle}>{option.label}</Text>
              </Pressable>
            ))}
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: accountingTheme.spacing.sm,
    paddingBottom: 132,
  },
  cardBlock: {
    marginBottom: accountingTheme.spacing.sm,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: accountingTheme.spacing.sm,
  },
  invoiceTitle: {
    fontSize: 15,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  invoiceMeta: {
    fontSize: 11,
    color: accountingTheme.colors.textSecondary,
    marginTop: accountingTheme.spacing.xs,
  },
  linkText: {
    color: accountingTheme.colors.primary,
    fontWeight: accountingTheme.fontWeights.bold,
    fontSize: accountingTheme.fontSizes.sm,
  },
  sectionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: accountingTheme.spacing.sm,
  },
  sectionTitle: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
    marginBottom: accountingTheme.spacing.sm,
  },
  partyField: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  partyFieldText: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.text,
    flex: 1,
    paddingRight: accountingTheme.spacing.sm,
  },
  partyPlaceholder: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.textMuted,
    flex: 1,
    paddingRight: accountingTheme.spacing.sm,
  },
  balanceText: {
    marginTop: 10,
    fontSize: accountingTheme.fontSizes.sm,
    color: "#334155",
    fontWeight: accountingTheme.fontWeights.bold,
  },
  input: {
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.lg,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: accountingTheme.colors.text,
  },
  notesInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  modeRow: {
    flexDirection: "row",
    gap: 10,
  },
  modePreview: {
    flex: 1,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    borderRadius: accountingTheme.radius.lg,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: accountingTheme.spacing.md,
    paddingVertical: accountingTheme.spacing.md,
  },
  modePreviewText: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.text,
  },
  modeChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    borderRadius: accountingTheme.radius.lg,
    paddingVertical: accountingTheme.spacing.md,
    alignItems: "center",
    backgroundColor: accountingTheme.colors.card,
  },
  modeChipActive: {
    backgroundColor: "#EFF6FF",
    borderColor: accountingTheme.colors.primary,
  },
  modeText: {
    color: "#475569",
    fontWeight: accountingTheme.fontWeights.bold,
  },
  modeTextActive: {
    color: accountingTheme.colors.primary,
  },
  bankCard: {
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    backgroundColor: "#F8FAFC",
    borderRadius: accountingTheme.radius.xl,
    padding: accountingTheme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: accountingTheme.spacing.md,
  },
  bankTitle: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  bankMeta: {
    fontSize: 11,
    color: accountingTheme.colors.textSecondary,
    marginTop: accountingTheme.spacing.xs,
  },
  bankDate: {
    fontSize: accountingTheme.fontSizes.sm,
    color: "#334155",
    fontWeight: accountingTheme.fontWeights.bold,
  },
  unpaidRow: {
    marginHorizontal: 2,
    marginBottom: accountingTheme.spacing.md,
    borderRadius: accountingTheme.radius.xl,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    backgroundColor: accountingTheme.colors.card,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unpaidLabel: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.text,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: accountingTheme.spacing.lg,
  },
  emptyTitle: {
    fontSize: accountingTheme.fontSizes.lg,
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
    minWidth: 126,
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  printButton: {
    minWidth: 84,
    borderRadius: accountingTheme.radius.xl,
    borderWidth: 1,
    borderColor: "#CFE0FF",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: accountingTheme.spacing.md,
    paddingVertical: accountingTheme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  printButtonDisabled: {
    opacity: 0.55,
  },
  printButtonText: {
    color: accountingTheme.colors.primary,
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.extraBold,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.28)",
  },
  sheet: {
    backgroundColor: accountingTheme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: 10,
    paddingBottom: 22,
    maxHeight: "78%",
  },
  sheetHandle: {
    width: 54,
    height: 5,
    borderRadius: accountingTheme.radius.full,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: accountingTheme.spacing.md,
  },
  sheetTitle: {
    fontSize: accountingTheme.fontSizes.xxl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
    marginBottom: accountingTheme.spacing.md,
  },
  sheetSearch: {
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    borderRadius: accountingTheme.radius.xl,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: accountingTheme.spacing.md,
    marginBottom: accountingTheme.spacing.md,
  },
  sheetList: {
    marginBottom: accountingTheme.spacing.lg,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 10,
  },
  sheetField: {
    marginBottom: accountingTheme.spacing.md,
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    color: accountingTheme.colors.textSecondary,
    fontWeight: accountingTheme.fontWeights.bold,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    borderRadius: accountingTheme.radius.lg,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: accountingTheme.spacing.md,
    paddingVertical: 10,
    color: accountingTheme.colors.text,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectBoxText: {
    color: accountingTheme.colors.text,
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  sheetInput: {
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    borderRadius: accountingTheme.radius.lg,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: accountingTheme.spacing.md,
    paddingVertical: 10,
    color: accountingTheme.colors.text,
  },
  sheetMultiline: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  sheetRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.surfaceLight,
  },
  sheetRowTitle: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.text,
  },
  sheetRowMeta: {
    fontSize: 11,
    color: accountingTheme.colors.textSecondary,
    marginTop: 3,
  },
  sheetButton: {
    backgroundColor: accountingTheme.colors.primary,
    borderRadius: accountingTheme.radius.xl,
    alignItems: "center",
    paddingVertical: 14,
  },
  sheetButtonText: {
    color: accountingTheme.colors.card,
    fontWeight: accountingTheme.fontWeights.extraBold,
  },
});
