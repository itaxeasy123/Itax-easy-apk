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
import { useRouter } from "expo-router";

import { AccountingHeader, Button, Card, Loading } from "../components";
import { accountingService } from "../services/accountingService";
import { voucherService } from "../services/voucherService";
import { useAccountingSessionStore } from "../../../store/accountingSessionStore";
import { Ledger, Party, VoucherLine } from "../types/accountingTypes";
import {
  addDaysInputValue,
  findLedgerByType,
  formatMoney,
  makeId,
  safeString,
  todayInputValue,
  toNumber,
} from "./voucherFlowUtils";

type ItemLike = {
  id: string;
  itemName: string;
  unit: string;
  price?: number | null;
  purchasePrice?: number | null;
};

type ItemApiResponse = {
  id?: string | number;
  itemName?: string;
  name?: string;
  unit?: string;
  price?: number | null;
  unitPrice?: number | null;
  purchasePrice?: number | null;
};

type VoucherMode = "sales" | "purchase";

type VoucherLineDraft = {
  id: string;
  itemId: string;
  itemName: string;
  quantity: string;
  rate: string;
  discount: string;
  taxPercent: string;
};

type DealVoucherCreateScreenProps = {
  mode: VoucherMode;
  title: string;
  subtitle: string;
  invoicePrefix: string;
};

const defaultLine = (): VoucherLineDraft => ({
  id: makeId(),
  itemId: "",
  itemName: "",
  quantity: "1",
  rate: "",
  discount: "0",
  taxPercent: "0",
});

const gstOptions = ["IGST", "CGST", "GST 18%", "GST 2.5%", "GST 1%"];

const money = (value: number) => formatMoney(value);

export default function DealVoucherCreateScreen({
  mode,
  title,
  subtitle,
  invoicePrefix,
}: DealVoucherCreateScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const { draftVouchers, setDraftVoucher, clearDraftVoucher } = useAccountingSessionStore();
  const draft = draftVouchers[mode];

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parties, setParties] = useState<Party[]>([]);
  const [items, setItems] = useState<ItemLike[]>([]);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState(draft?.selectedPartyId ?? "");
  const [partySearch, setPartySearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [showPartySheet, setShowPartySheet] = useState(false);
  const [showItemSheet, setShowItemSheet] = useState(false);
  const [showInvoiceEditSheet, setShowInvoiceEditSheet] = useState(false);
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [showGstSheet, setShowGstSheet] = useState(false);
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const [showItems, setShowItems] = useState(false);
  const [showGst, setShowGst] = useState(false);
  const [showOtherCharges, setShowOtherCharges] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState(
    draft?.invoiceDate ? `${invoicePrefix}-${Date.now().toString().slice(-6)}` : `${invoicePrefix}-${Date.now().toString().slice(-6)}`
  );
  const [invoiceDate, setInvoiceDate] = useState(draft?.invoiceDate ?? todayInputValue());
  const [dueDate, setDueDate] = useState(draft?.dueDate ?? addDaysInputValue(14));
  const [gstAmount, setGstAmount] = useState(draft?.gstAmount ?? "0");
  const [selectedGstOption, setSelectedGstOption] = useState<string | null>(draft?.selectedGstOption ?? null);
  const [gstSearch, setGstSearch] = useState("");
  const [otherCharges, setOtherCharges] = useState(draft?.otherCharges ?? "0");
  const [notes, setNotes] = useState(draft?.notes ?? "");
  const [addressDraft, setAddressDraft] = useState("");
  const [lineItems, setLineItems] = useState<VoucherLineDraft[]>(draft?.lineItems ?? [defaultLine()]);

  useEffect(() => {
    setDraftVoucher(mode, {
      selectedPartyId,
      invoiceDate,
      dueDate,
      gstAmount,
      selectedGstOption,
      otherCharges,
      notes,
      lineItems,
    });
  }, [mode, selectedPartyId, invoiceDate, dueDate, gstAmount, selectedGstOption, otherCharges, notes, lineItems, setDraftVoucher]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [partyResult, itemResult, ledgerResult] = await Promise.all([
          accountingService.getParties(),
          accountingService.getItems(),
          accountingService.getLedgers(),
        ]);

        setParties(partyResult.data ?? []);
        setItems(
          ((itemResult.data ?? []) as ItemApiResponse[]).map((item) => ({
            id: String(item.id),
            itemName: String(item.itemName ?? item.name ?? ""),
            unit: String(item.unit ?? ""),
            price: item.price ?? item.unitPrice ?? 0,
            purchasePrice: item.purchasePrice ?? null,
          }))
        );
        setLedgers(ledgerResult.data ?? []);
        setSelectedPartyId((prev) => prev || ((partyResult.data ?? [])[0]?.id ?? ""));
      } catch {
        setError("Unable to load voucher form data.");
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

  const selectedPartyLedger = useMemo(() => {
    const partyLedgers = selectedParty?.ledgers ?? [];
    const byParty =
      findLedgerByType(
        partyLedgers,
        mode === "sales" ? "accountsReceivable" : "accountsPayable"
      ) ?? null;
    if (byParty) return byParty;

    return (
      findLedgerByType(
        ledgers,
        mode === "sales" ? "accountsReceivable" : "accountsPayable"
      ) ?? null
    );
  }, [ledgers, mode, selectedParty]);

  useEffect(() => {
    if (showAddressSheet) {
      setAddressDraft(selectedParty?.address ?? "");
    }
  }, [selectedParty, showAddressSheet]);

  const systemLedger = useMemo(() => {
    return (
      findLedgerByType(ledgers, mode === "sales" ? "sales" : "purchase") ??
      findLedgerByType(ledgers, mode === "sales" ? "directIncome" : "directExpense") ??
      null
    );
  }, [ledgers, mode]);

  const visibleParties = useMemo(() => {
    const query = partySearch.trim().toLowerCase();
    if (!query) return parties;
    return parties.filter((party) =>
      `${party.partyName} ${party.phone ?? ""} ${party.gstin ?? ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [parties, partySearch]);

  const visibleItems = useMemo(() => {
    const query = itemSearch.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      `${item.itemName} ${item.unit}`.toLowerCase().includes(query)
    );
  }, [items, itemSearch]);

  const visibleGstOptions = useMemo(() => {
    const query = gstSearch.trim().toLowerCase();
    if (!query) return gstOptions;
    return gstOptions.filter((option) => option.toLowerCase().includes(query));
  }, [gstSearch]);

  const updateLine = (id: string, patch: Partial<VoucherLineDraft>) => {
    setLineItems((current) =>
      current.map((line) => (line.id === id ? { ...line, ...patch } : line))
    );
  };

  const selectItem = (item: ItemLike) => {
    if (!activeLineId) return;

    updateLine(activeLineId, {
      itemId: item.id,
      itemName: item.itemName,
      rate:
        mode === "purchase"
          ? String(item.purchasePrice ?? item.price ?? 0)
          : String(item.price ?? 0),
    });
    setShowItemSheet(false);
    setActiveLineId(null);
  };

  const lineAmount = (line: VoucherLineDraft) => {
    const qty = Math.max(toNumber(line.quantity), 0);
    const rate = Math.max(toNumber(line.rate), 0);
    const discount = Math.max(toNumber(line.discount), 0);
    const gst = Math.max(toNumber(line.taxPercent), 0);
    const taxable = Math.max(qty * rate - discount, 0);
    return taxable + (taxable * gst) / 100;
  };

  const summary = useMemo(() => {
    const subtotal = lineItems.reduce((sum, line) => sum + lineAmount(line), 0);
    const gst = Math.max(toNumber(gstAmount), 0);
    const charges = Math.max(toNumber(otherCharges), 0);
    return {
      subtotal,
      gst,
      charges,
      total: subtotal + gst + charges,
    };
  }, [gstAmount, lineItems, otherCharges]);

  const addLine = () => {
    setLineItems((current) => [...current, defaultLine()]);
  };

  const removeLine = (id: string) => {
    setLineItems((current) =>
      current.length > 1 ? current.filter((line) => line.id !== id) : current
    );
  };

  const handleSaveAddress = async () => {
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
          current.map((party) => (party.id === updated.id ? updated : party))
        );
      }
      setShowAddressSheet(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update address.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedPartyId || !selectedParty) {
      setError("Please select a party.");
      return;
    }

    if (!invoiceNumber.trim()) {
      setError("Invoice number is required.");
      return;
    }
    
    if (invoiceDate.trim() && Number.isNaN(new Date(invoiceDate).getTime())) {
      setError("Invoice date must be a valid date (e.g. YYYY-MM-DD).");
      return;
    }
    
    if (dueDate.trim() && Number.isNaN(new Date(dueDate).getTime())) {
      setError("Due date must be a valid date (e.g. YYYY-MM-DD).");
      return;
    }

    if (!selectedPartyLedger || !systemLedger) {
      setError("Required ledgers are missing.");
      return;
    }

    if (summary.total <= 0) {
      setError("Total amount must be greater than zero. Please add valid items.");
      return;
    }
    
    // Validate individual lines
    for (const line of lineItems) {
      if (line.itemId && (toNumber(line.quantity) <= 0)) {
        setError(`Quantity for item ${line.itemName} must be greater than 0.`);
        return;
      }
      if (line.itemId && (toNumber(line.discount) < 0 || toNumber(line.taxPercent) < 0)) {
        setError("Discount and GST cannot be negative.");
        return;
      }
    }

    const partyLine: VoucherLine = {
      id: makeId(),
      ledgerId: selectedPartyLedger.id,
      ledgerName: selectedPartyLedger.ledgerName,
      side: mode === "sales" ? "debit" : "credit",
      amount: summary.total,
    };

    const businessLine: VoucherLine = {
      id: makeId(),
      ledgerId: systemLedger.id,
      ledgerName: systemLedger.ledgerName,
      side: mode === "sales" ? "credit" : "debit",
      amount: summary.total,
    };

    try {
      setSaving(true);
      setError(null);

      const itemNarration = lineItems
        .filter((line) => line.itemName)
        .map((line) => {
          const amount = lineAmount(line);
          return `${line.itemName} x${line.quantity} @ ${money(amount)}`;
        })
        .join(" | ");

      await voucherService.create({
        voucherNumber: safeString(invoiceNumber),
        voucherType: mode,
        entryDate: new Date(invoiceDate).toISOString(),
        narration: [
          safeString(notes),
          `${mode === "sales" ? "Sales" : "Purchase"} voucher for ${selectedParty.partyName}`,
          itemNarration,
        ]
          .filter(Boolean)
          .join(" - "),
        lines: [partyLine, businessLine],
      });

      clearDraftVoucher(mode);
      router.replace("/accounting/vouchers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create voucher.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading text="Loading voucher form..." fullScreen />;
  }

  return (
    <View style={styles.screen}>
      <AccountingHeader title={title} subtitle={subtitle} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 132 + Math.max(insets.bottom, 0) }]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.cardBlock}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.invoiceTitle}>{invoiceNumber}</Text>
              <Text style={styles.invoiceMeta}>{invoiceDate} | Due {dueDate}</Text>
            </View>
            <Pressable
              onPress={() => {
                setShowInvoiceEditSheet(true);
              }}
            >
              <Text style={styles.linkText}>Edit</Text>
            </Pressable>
          </View>
        </Card>

        <Card style={styles.cardBlock}>
          <View style={styles.sectionTop}>
            <Text style={styles.sectionTitle}>Select Party</Text>
            <Pressable
              onPress={() => {
                setShowAddressSheet(true);
              }}
            >
              <Text style={styles.linkText}>Edit Address</Text>
            </Pressable>
          </View>

          <Pressable style={styles.partyField} onPress={() => setShowPartySheet(true)}>
            <Text style={selectedParty ? styles.partyFieldText : styles.partyPlaceholder}>
              {selectedParty?.partyName || "Select Party"}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#64748B" />
          </Pressable>

          {selectedParty ? (
            <Text style={styles.balanceText}>
              Closing Balance: {money(selectedPartyLedger?.balance ?? 0)}
            </Text>
          ) : null}
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
              {lineItems.map((line, index) => (
                <View key={line.id} style={styles.itemBlock}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.itemTitle}>Item {index + 1}</Text>
                    <Pressable onPress={() => removeLine(line.id)} disabled={lineItems.length <= 1}>
                      <Ionicons
                        name="remove-circle-outline"
                        size={20}
                        color={lineItems.length <= 1 ? "#CBD5E1" : "#EF4444"}
                      />
                    </Pressable>
                  </View>

                  <Pressable
                    style={styles.selectItemField}
                    onPress={() => {
                      setActiveLineId(line.id);
                      setShowItemSheet(true);
                    }}
                  >
                    <Text style={line.itemName ? styles.selectItemText : styles.partyPlaceholder}>
                      {line.itemName || "Select Item"}
                    </Text>
                    <Text style={styles.selectItemMeta}>
                      {line.itemId || "Tap to choose from item list"}
                    </Text>
                  </Pressable>

                  <View style={styles.gridRow}>
                    <View style={styles.gridField}>
                      <Text style={styles.fieldLabel}>Qty</Text>
                      <TextInput
                        value={line.quantity}
                        onChangeText={(value) => updateLine(line.id, { quantity: value })}
                        keyboardType="numeric"
                        style={styles.input}
                      />
                    </View>
                    <View style={styles.gridField}>
                      <Text style={styles.fieldLabel}>Rate</Text>
                      <TextInput
                        value={line.rate}
                        onChangeText={(value) => updateLine(line.id, { rate: value })}
                        keyboardType="numeric"
                        style={styles.input}
                      />
                    </View>
                  </View>

                  <View style={styles.gridRow}>
                    <View style={styles.gridField}>
                      <Text style={styles.fieldLabel}>Discount</Text>
                      <TextInput
                        value={line.discount}
                        onChangeText={(value) => updateLine(line.id, { discount: value })}
                        keyboardType="numeric"
                        style={styles.input}
                      />
                    </View>
                    <View style={styles.gridField}>
                      <Text style={styles.fieldLabel}>GST %</Text>
                      <TextInput
                        value={line.taxPercent}
                        onChangeText={(value) => updateLine(line.id, { taxPercent: value })}
                        keyboardType="numeric"
                        style={styles.input}
                      />
                    </View>
                  </View>
                </View>
              ))}

              <Pressable onPress={addLine} style={styles.inlineAddRow}>
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
                  placeholder="GST amount"
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

      <Modal transparent visible={showGstSheet} animationType="slide" onRequestClose={() => setShowGstSheet(false)}>
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

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 0) + 16 }]}>
        <View>
          <Text style={styles.footerLabel}>Total Amount</Text>
          <Text style={styles.footerAmount}>{money(summary.total)}</Text>
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
        visible={showItemSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowItemSheet(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowItemSheet(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Item</Text>
            <TextInput
              value={itemSearch}
              onChangeText={setItemSearch}
              placeholder="Search item"
              style={styles.sheetSearch}
            />
            <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetList}>
              {visibleItems.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.sheetRow}
                  onPress={() => selectItem(item)}
                >
                  <Text style={styles.sheetRowTitle}>{item.itemName}</Text>
                  <Text style={styles.sheetRowMeta}>
                    {mode === "purchase"
                      ? money(Number(item.purchasePrice ?? item.price ?? 0))
                      : money(Number(item.price ?? 0))}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={styles.sheetButton} onPress={() => setShowItemSheet(false)}>
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
            <View style={styles.fieldRow}>
              <View style={styles.sheetField}>
                <Text style={styles.fieldLabel}>Select Date</Text>
                <TextInput value={invoiceDate} onChangeText={setInvoiceDate} style={styles.sheetInput} />
              </View>
              <View style={styles.sheetField}>
                <Text style={styles.fieldLabel}>Invoice Number</Text>
                <TextInput value={invoiceNumber} onChangeText={setInvoiceNumber} style={styles.sheetInput} />
              </View>
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
                placeholder="Address"
              />
            </View>
            <Pressable style={styles.sheetButton} onPress={handleSaveAddress}>
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
  balanceText: {
    marginTop: 10,
    fontSize: 12,
    color: "#334155",
    fontWeight: "700",
  },
  itemBlock: {
    borderTopWidth: 1,
    borderTopColor: "#EEF2F7",
    paddingTop: 12,
    marginTop: 12,
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
  itemTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  selectItemField: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  selectItemText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  selectItemMeta: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
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
    flex: 1,
    marginRight: 8,
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
