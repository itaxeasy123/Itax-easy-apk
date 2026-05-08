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
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AccountingHeader, Button, Card, Loading } from "../components";
import { accountingService } from "../services/accountingService";
import { voucherService } from "../services/voucherService";
import { Ledger, Party, VoucherLine } from "../types/accountingTypes";
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

      await voucherService.create({
        voucherNumber: safeString(receiptNumber),
        voucherType: "receipt",
        entryDate: new Date(receiptDate).toISOString(),
        narration:
          safeString(notes) ||
          `Receipt from ${selectedParty.partyName}${params.invoiceRefs ? ` against ${params.invoiceRefs}` : ""}`,
        lines: [debitLedger, creditLedger],
      });

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

  //   router.push({
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
        contentContainerStyle={styles.content}
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

          <Pressable style={styles.partyField} onPress={() => setShowPartySheet(true)}>
            <Text style={selectedParty ? styles.partyFieldText : styles.partyPlaceholder}>
              {selectedParty?.partyName || params.partyName || "Select Party"}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#64748B" />
          </Pressable>

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
            router.push({
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
          <Ionicons name="chevron-forward" size={18} color="#64748B" />
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
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
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
            <Ionicons name="print-outline" size={16} color="#2563EB" />
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
        visible={showPartySheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPartySheet(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowPartySheet(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Party</Text>
            <TextInput
              value={partySearch}
              onChangeText={setPartySearch}
              placeholder="Search"
              style={styles.sheetSearch}
            />
            <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetList}>
              {visibleParties.map((party) => (
                <Pressable
                  key={party.id}
                  style={styles.sheetRow}
                  onPress={() => {
                    setSelectedPartyId(party.id);
                    setShowPartySheet(false);
                  }}
                >
                  <Text style={styles.sheetRowTitle}>{party.partyName}</Text>
                  <Text style={styles.sheetRowMeta}>{party.type}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={styles.sheetButton} onPress={() => setShowPartySheet(false)}>
              <Text style={styles.sheetButtonText}>Add Record</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
              <TextInput value={receiptDate} onChangeText={setReceiptDate} style={styles.sheetInput} />
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
                <Ionicons name="chevron-down" size={16} color="#64748B" />
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
              <TextInput value={bankDateDraft} onChangeText={setBankDateDraft} style={styles.sheetInput} />
            </View>
            <View style={styles.sheetField}>
              <Text style={styles.fieldLabel}>Select Bank</Text>
              <View style={styles.selectBox}>
                <Text style={styles.selectBoxText}>{bankLedger?.ledgerName ?? "Select Bank"}</Text>
                <Ionicons name="chevron-down" size={16} color="#64748B" />
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
    backgroundColor: "#F5F9FF",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 132,
  },
  cardBlock: {
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  invoiceTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  invoiceMeta: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },
  linkText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 12,
  },
  sectionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  partyField: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  partyFieldText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    paddingRight: 8,
  },
  partyPlaceholder: {
    fontSize: 14,
    fontWeight: "700",
    color: "#94A3B8",
    flex: 1,
    paddingRight: 8,
  },
  balanceText: {
    marginTop: 10,
    fontSize: 12,
    color: "#334155",
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: "#0F172A",
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
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  modePreviewText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  modeChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  modeChipActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  modeText: {
    color: "#475569",
    fontWeight: "700",
  },
  modeTextActive: {
    color: "#2563EB",
  },
  bankCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  bankTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  bankMeta: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },
  bankDate: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "700",
  },
  unpaidRow: {
    marginHorizontal: 2,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unpaidLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 16,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  errorText: {
    flex: 1,
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 12,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  footerLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  footerAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 4,
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CFE0FF",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  printButtonDisabled: {
    opacity: 0.55,
  },
  printButtonText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "800",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.28)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 22,
    maxHeight: "78%",
  },
  sheetHandle: {
    width: 54,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  sheetSearch: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  sheetList: {
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 10,
  },
  sheetField: {
    marginBottom: 12,
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectBoxText: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
  },
  sheetInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#0F172A",
  },
  sheetMultiline: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  sheetRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },
  sheetRowTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  sheetRowMeta: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 3,
  },
  sheetButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 14,
  },
  sheetButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
});
