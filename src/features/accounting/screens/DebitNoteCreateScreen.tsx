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
import { useRouter } from "expo-router";

import { AccountingHeader, Button, Card, Loading } from "../components";
import { accountingService } from "../services/accountingService";
import { invoiceService } from "../../invoice/services/invoiceService";
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

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalAmount: number;
  balanceAmount: number;
  partyId: string;
  partyName: string;
};

type PartyOption = Party & {
  displayName: string;
};

const returnReasons = [
  "Sales Return",
  "Purchase Return",
  "Damaged Goods",
  "Wrong Item",
  "Price Difference",
];

const gstOptions = ["IGST", "CGST", "GST 18%", "GST 2.5%", "GST 1%"];

const money = (value: number) => formatMoney(value);

export default function DebitNoteCreateScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parties, setParties] = useState<PartyOption[]>([]);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [returnReason, setReturnReason] = useState(returnReasons[0]);
  const [partySearch, setPartySearch] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [showPartySheet, setShowPartySheet] = useState(false);
  const [showInvoiceSheet, setShowInvoiceSheet] = useState(false);
  const [showInvoiceEditSheet, setShowInvoiceEditSheet] = useState(false);
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [showGstSheet, setShowGstSheet] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [showGst, setShowGst] = useState(false);
  const [showOtherCharges, setShowOtherCharges] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState(`DN-${Date.now().toString().slice(-6)}`);
  const [invoiceDate, setInvoiceDate] = useState(todayInputValue());
  const [dueDate, setDueDate] = useState(todayInputValue());
  const [gstAmount, setGstAmount] = useState("0");
  const [selectedGstOption, setSelectedGstOption] = useState<string | null>(null);
  const [gstSearch, setGstSearch] = useState("");
  const [otherCharges, setOtherCharges] = useState("0");
  const [notes, setNotes] = useState("");
  const [addressDraft, setAddressDraft] = useState("");
  const [items, setItems] = useState([
    {
      id: makeId(),
      name: "",
      qty: "1",
      amount: "",
    },
  ]);

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
          }),
        ]);

        const nextParties = (partyResult.data ?? []).map((party) => ({
          ...party,
          displayName: party.partyName,
        }));

        const partyMap = new Map(nextParties.map((party) => [party.id, party.displayName]));
        const nextInvoices = (invoiceResult.invoices ?? []).map((invoice) => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber || `INV-${invoice.id}`,
          invoiceDate: invoice.invoiceDate || todayInputValue(),
          totalAmount: Number(invoice.totalAmount ?? 0),
          balanceAmount: Number(invoice.totalAmount ?? 0),
          partyId: invoice.partyId,
          partyName: partyMap.get(invoice.partyId) || invoice.party?.partyName || "Party",
        }));

        setParties(nextParties);
        setLedgers(ledgerResult.data ?? []);
        setInvoices(nextInvoices);
        setSelectedPartyId(nextParties[0]?.id ?? "");
        setSelectedInvoiceId(nextInvoices[0]?.id ?? "");
      } catch {
        setError("Unable to load debit note data.");
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

  const selectedInvoice = useMemo(
    () => invoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null,
    [invoices, selectedInvoiceId]
  );

  const partyLedger = useMemo(() => {
    if (!selectedParty) {
      return null;
    }

    return (
      findLedgerByType(selectedParty.ledgers ?? [], "accountsPayable") ??
      findLedgerByType(ledgers, "accountsPayable") ??
      null
    );
  }, [ledgers, selectedParty]);

  const purchaseLedger = useMemo(
    () =>
      findLedgerByType(ledgers, "purchase") ?? findLedgerByType(ledgers, "directExpense") ?? null,
    [ledgers]
  );

  const cashLedger = useMemo(
    () => findLedgerByType(ledgers, "cash") ?? findLedgerByType(ledgers, "bank") ?? null,
    [ledgers]
  );

  const visibleParties = useMemo(() => {
    const query = partySearch.trim().toLowerCase();
    if (!query) {
      return parties;
    }
    return parties.filter((party) =>
      `${party.displayName} ${party.phone ?? ""} ${party.gstin ?? ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [parties, partySearch]);

  const visibleInvoices = useMemo(() => {
    const partyFiltered = selectedPartyId
      ? invoices.filter((invoice) => invoice.partyId === selectedPartyId)
      : invoices;
    const query = invoiceSearch.trim().toLowerCase();
    if (!query) {
      return partyFiltered;
    }
    return partyFiltered.filter((invoice) =>
      `${invoice.invoiceNumber} ${invoice.partyName}`.toLowerCase().includes(query)
    );
  }, [invoices, invoiceSearch, selectedPartyId]);

  const visibleGstOptions = useMemo(() => {
    const query = gstSearch.trim().toLowerCase();
    if (!query) {
      return gstOptions;
    }
    return gstOptions.filter((option) => option.toLowerCase().includes(query));
  }, [gstSearch]);

  const invoiceAmount = Math.max(
    toNumber(selectedInvoice?.balanceAmount ? String(selectedInvoice.balanceAmount) : "0"),
    0
  );
  const lineTotal = items.reduce((sum, item) => sum + Math.max(toNumber(item.amount), 0), 0);
  const itemTotal = lineTotal + Math.max(toNumber(gstAmount), 0) + Math.max(toNumber(otherCharges), 0);
  const totalAmount = Math.max(invoiceAmount, itemTotal);

  useEffect(() => {
    if (showAddressSheet) {
      setAddressDraft(selectedParty?.address ?? "");
    }
  }, [selectedParty, showAddressSheet]);

  const saveAddress = async () => {
    if (!selectedParty) {
      setError("Please select a party.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const result = await accountingService.updateParty(selectedParty.id, {
        address: addressDraft.trim(),
      });
      const updated = result.data;
      if (updated) {
        setParties((current) =>
          current.map((party) =>
            party.id === updated.id ? { ...updated, displayName: updated.partyName } : party
          )
        );
      }
      setShowAddressSheet(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update address.");
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (id: string, patch: Partial<{ name: string; qty: string; amount: string }>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const addItem = () => {
    setItems((current) => [...current, { id: makeId(), name: "", qty: "1", amount: "" }]);
  };

  const removeItem = (id: string) => {
    setItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current));
  };

  const handleCreate = async () => {
    if (!selectedParty) {
      setError("Please select a party.");
      return;
    }

    if (!selectedInvoice) {
      setError("Please select an invoice.");
      return;
    }

    if (totalAmount <= 0) {
      setError("Please add a valid amount.");
      return;
    }

    const partyLine: VoucherLine = {
      id: makeId(),
      ledgerId: partyLedger?.id || selectedParty.id,
      ledgerName: partyLedger?.ledgerName || selectedParty.displayName,
      side: "debit",
      amount: totalAmount,
    };

    const purchaseLine: VoucherLine = {
      id: makeId(),
      ledgerId: purchaseLedger?.id || cashLedger?.id || selectedParty.id,
      ledgerName: purchaseLedger?.ledgerName || cashLedger?.ledgerName || "Purchase",
      side: "credit",
      amount: totalAmount,
    };

    try {
      setSaving(true);
      setError(null);

      const itemNarration = items
        .filter((item) => item.name.trim())
        .map((item) => `${item.name} x${item.qty} @ ${money(Math.max(toNumber(item.amount), 0))}`)
        .join(" | ");

      await voucherService.create({
        voucherNumber: safeString(invoiceNumber),
        voucherType: "purchase",
        entryDate: new Date(invoiceDate).toISOString(),
        narration: [
          safeString(notes),
          `${returnReason} for ${selectedParty.displayName}`,
          `Invoice ${selectedInvoice.invoiceNumber}`,
          itemNarration,
        ]
          .filter(Boolean)
          .join(" - "),
        lines: [partyLine, purchaseLine],
      });

      router.replace("/accounting/vouchers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create debit note.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading text="Loading debit note..." fullScreen />;
  }

  return (
    <View style={styles.screen}>
      <AccountingHeader title="Create Debit Note" subtitle="Record returns and adjustments." />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.cardBlock}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.invoiceTitle}>{invoiceNumber}</Text>
              <Text style={styles.invoiceMeta}>
                {invoiceDate} | Due {dueDate}
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
              {selectedParty?.displayName || "Select Party"}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#64748B" />
          </Pressable>

          <View style={styles.dropdownField}>
            <Text style={styles.dropdownLabel}>Return Reason</Text>
            <View style={styles.dropdown}>
              <Text style={styles.dropdownValue}>{returnReason}</Text>
              <Ionicons name="chevron-down" size={18} color="#64748B" />
            </View>
            <View style={styles.chipRow}>
              {returnReasons.map((reason) => {
                const active = returnReason === reason;
                return (
                  <Pressable
                    key={reason}
                    onPress={() => setReturnReason(reason)}
                    style={[styles.reasonChip, active && styles.reasonChipActive]}
                  >
                    <Text style={[styles.reasonText, active && styles.reasonTextActive]}>
                      {reason}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable style={styles.selectInvoiceLink} onPress={() => setShowInvoiceSheet(true)}>
            <Ionicons name="attach-outline" size={14} color="#2563EB" />
            <Text style={styles.selectInvoiceText}>Select Invoice</Text>
          </Pressable>
        </Card>

        <Card style={styles.cardBlock}>
          <View style={styles.sectionTop}>
            <Text style={styles.sectionTitle}>Items</Text>
            <Pressable onPress={() => setShowItems((current) => !current)}>
              <Text style={styles.linkText}>{showItems ? "Close" : "Add"}</Text>
            </Pressable>
          </View>

          {showItems ? (
            <>
              {items.map((item, index) => (
                <View key={item.id} style={styles.itemBlock}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.itemTitle}>{item.name || `Item ${index + 1}`}</Text>
                    <View style={styles.itemActions}>
                      <Pressable onPress={() => removeItem(item.id)} disabled={items.length <= 1}>
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color={items.length <= 1 ? "#CBD5E1" : "#DC2626"}
                        />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.gridRow}>
                    <View style={styles.gridField}>
                      <Text style={styles.fieldLabel}>Item / Reason</Text>
                      <TextInput
                        value={item.name}
                        onChangeText={(value) => updateItem(item.id, { name: value })}
                        style={styles.input}
                        placeholder="Item name"
                      />
                    </View>
                  </View>

                  <View style={styles.gridRow}>
                    <View style={styles.gridField}>
                      <Text style={styles.fieldLabel}>Qty</Text>
                      <TextInput
                        value={item.qty}
                        onChangeText={(value) => updateItem(item.id, { qty: value })}
                        keyboardType="numeric"
                        style={styles.input}
                      />
                    </View>
                    <View style={styles.gridField}>
                      <Text style={styles.fieldLabel}>Amount</Text>
                      <TextInput
                        value={item.amount}
                        onChangeText={(value) => updateItem(item.id, { amount: value })}
                        keyboardType="numeric"
                        style={styles.input}
                      />
                    </View>
                  </View>
                </View>
              ))}

              <Pressable onPress={addItem} style={styles.inlineAddRow}>
                <Ionicons name="add-circle-outline" size={16} color="#2563EB" />
                <Text style={styles.inlineAddText}>Add Item</Text>
              </Pressable>
            </>
          ) : null}
        </Card>

        <Card style={styles.cardBlock}>
          <View style={styles.sectionTop}>
            <Text style={styles.sectionTitle}>GST</Text>
            <Pressable onPress={() => setShowGst((current) => !current)}>
              <Text style={styles.linkText}>{showGst ? "Close" : "Add"}</Text>
            </Pressable>
          </View>
          {showGst ? (
            <View style={styles.gridRow}>
              <View style={styles.gridField}>
                <Text style={styles.fieldLabel}>Select GST</Text>
                <Pressable style={styles.selectBox} onPress={() => setShowGstSheet(true)}>
                  <Text style={styles.selectBoxText}>{selectedGstOption || "Select GST"}</Text>
                  <Ionicons name="chevron-down" size={18} color="#64748B" />
                </Pressable>
              </View>
              <View style={styles.gridField}>
                <Text style={styles.fieldLabel}>Amount</Text>
                <TextInput
                  value={gstAmount}
                  onChangeText={setGstAmount}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>
          ) : null}
        </Card>

        <Card style={styles.cardBlock}>
          <View style={styles.sectionTop}>
            <Text style={styles.sectionTitle}>Other Charges</Text>
            <Pressable onPress={() => setShowOtherCharges((current) => !current)}>
              <Text style={styles.linkText}>{showOtherCharges ? "Close" : "Add"}</Text>
            </Pressable>
          </View>
          {showOtherCharges ? (
            <TextInput
              value={otherCharges}
              onChangeText={setOtherCharges}
              keyboardType="numeric"
              style={styles.input}
              placeholder="Other charges"
            />
          ) : null}
        </Card>

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
              style={[styles.input, styles.notesInput]}
              placeholder="Notes"
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

      <Modal
        transparent
        visible={showGstSheet}
        animationType="slide"
        onRequestClose={() => setShowGstSheet(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowGstSheet(false)} />
          <View style={[styles.sheet, styles.gstSheet]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select GST & Taxes</Text>
            <View style={styles.sheetSearchRow}>
              <Ionicons name="search" size={18} color="#64748B" />
              <TextInput
                value={gstSearch}
                onChangeText={setGstSearch}
                placeholder="Search GST"
                placeholderTextColor="#94A3B8"
                style={styles.sheetSearchInput}
              />
            </View>
            <ScrollView style={[styles.sheetList, styles.gstSheetList]} keyboardShouldPersistTaps="handled">
              {visibleGstOptions.map((option) => {
                const active = selectedGstOption === option;
                return (
                  <Pressable
                    key={option}
                    style={[styles.sheetRow, active && styles.sheetRowActive]}
                    onPress={() => {
                      setSelectedGstOption(option);
                      setShowGstSheet(false);
                    }}
                  >
                    <Text style={styles.sheetRowTitle}>{option}</Text>
                    {active ? <Ionicons name="checkmark" size={18} color="#2563EB" /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total Amount</Text>
          <Text style={styles.footerAmount}>{money(totalAmount)}</Text>
        </View>
        <Button
          title={saving ? "Creating..." : "Create"}
          onPress={handleCreate}
          loading={saving}
          size="large"
          style={styles.footerButton}
        />
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
                  <Text style={styles.sheetRowTitle}>{party.displayName}</Text>
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
        visible={showInvoiceSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInvoiceSheet(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowInvoiceSheet(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Invoice</Text>
            <TextInput
              value={invoiceSearch}
              onChangeText={setInvoiceSearch}
              placeholder="Search invoice"
              style={styles.sheetSearch}
            />
            <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetList}>
              {visibleInvoices.map((invoice) => (
                <Pressable
                  key={invoice.id}
                  style={styles.invoiceSheetRow}
                  onPress={() => {
                    setSelectedInvoiceId(invoice.id);
                    setSelectedPartyId(invoice.partyId);
                    setShowInvoiceSheet(false);
                  }}
                >
                  <View>
                    <Text style={styles.sheetRowTitle}>{invoice.invoiceNumber}</Text>
                    <Text style={styles.sheetRowMeta}>{invoice.partyName}</Text>
                  </View>
                  <Text style={styles.sheetRowMeta}>{money(invoice.balanceAmount)}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={styles.sheetButton} onPress={() => setShowInvoiceSheet(false)}>
              <Text style={styles.sheetButtonText}>Close</Text>
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
              <TextInput value={invoiceDate} onChangeText={setInvoiceDate} style={styles.sheetInput} />
            </View>
            <View style={styles.sheetField}>
              <Text style={styles.fieldLabel}>Invoice Number</Text>
              <TextInput value={invoiceNumber} onChangeText={setInvoiceNumber} style={styles.sheetInput} />
            </View>
            <View style={styles.sheetField}>
              <Text style={styles.fieldLabel}>Due Date</Text>
              <TextInput value={dueDate} onChangeText={setDueDate} style={styles.sheetInput} />
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
                <Text style={styles.selectBoxText}>{selectedParty?.displayName || "Select Party"}</Text>
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
            <Pressable style={styles.sheetButton} onPress={saveAddress}>
              <Text style={styles.sheetButtonText}>{saving ? "Saving..." : "Update"}</Text>
            </Pressable>
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
  dropdownField: {
    marginTop: 12,
  },
  dropdownLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownValue: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "700",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  reasonChip: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reasonChipActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  reasonText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "700",
  },
  reasonTextActive: {
    color: "#2563EB",
  },
  selectInvoiceLink: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  selectInvoiceText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
  },
  itemBlock: {
    borderTopWidth: 1,
    borderTopColor: "#EEF2F7",
    paddingTop: 12,
    marginTop: 12,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineAddRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    marginTop: 8,
  },
  inlineAddText: {
    color: "#2563EB",
    fontWeight: "800",
    fontSize: 12,
  },
  gridRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  gridField: {
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
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: "#0F172A",
  },
  selectBox: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectBoxText: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "700",
  },
  notesInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: 18,
    color: "#0F172A",
    fontWeight: "800",
    marginTop: 4,
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
    minWidth: 132,
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
  sheetSearchRow: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sheetSearchInput: {
    flex: 1,
    color: "#0F172A",
    paddingVertical: 10,
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
    minHeight: 52,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sheetRowActive: {
    backgroundColor: "#EFF6FF",
  },
  invoiceSheetRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
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
  gstSheet: {
    maxHeight: "58%",
  },
  gstSheetList: {
    maxHeight: 280,
  },
  sheetButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
});
