import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

import { AccountingHeader, Button, Card, Loading } from "../components";
import { accountingService } from "../services/accountingService";
import { Party } from "../types/accountingTypes";
import { formatMoney, todayInputValue } from "./voucherFlowUtils";
import { accountingTheme } from "../../../theme/accounting";

const paymentModes = ["Cash", "Cheque/DD", "Bank Transfer", "UPI"];
const banks = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank"];

export default function QuickEditsScreen() {
  const params = useLocalSearchParams<{ panel?: string }>();
  const scrollRef = useRef<ScrollView | null>(null);
  const sectionPositions = useRef<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState("");

  const [address, setAddress] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(todayInputValue());
  const [invoiceNumber, setInvoiceNumber] = useState("123");
  const [dueDate, setDueDate] = useState(todayInputValue());
  const [purchaseInvoiceNumber, setPurchaseInvoiceNumber] = useState("100");
  const [purchaseInvoiceDate, setPurchaseInvoiceDate] = useState(todayInputValue());
  const [receiptInvoiceNumber, setReceiptInvoiceNumber] = useState("21abc");
  const [receiptInvoiceDate, setReceiptInvoiceDate] = useState(todayInputValue());
  const [receiptDueDate, setReceiptDueDate] = useState(todayInputValue());

  const [paymentMode, setPaymentMode] = useState("Cash");
  const [chequeNumber, setChequeNumber] = useState("");
  const [bankDate, setBankDate] = useState(todayInputValue());
  const [selectedBank, setSelectedBank] = useState(banks[0]);
  const [bankDescription, setBankDescription] = useState("");

  const [itemName, setItemName] = useState("Nick Football");
  const [quantity, setQuantity] = useState("1");
  const [discount, setDiscount] = useState("0");
  const [taxRate, setTaxRate] = useState("0");
  const [amount, setAmount] = useState("5000");
  const [itemDescription, setItemDescription] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await accountingService.getParties();
        const nextParties = result.data ?? [];
        setParties(nextParties);
        setSelectedPartyId(nextParties[0]?.id ?? "");
        setAddress(nextParties[0]?.address ?? "");
      } catch {
        setError("Unable to load quick edit data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const selectedParty = useMemo(
    () => parties.find((party) => party.id === selectedPartyId) ?? null,
    [parties, selectedPartyId]
  );

  const panel = Array.isArray(params.panel) ? params.panel[0] : params.panel;

  const scrollToPanel = (key: string) => {
    const target = sectionPositions.current[key];
    if (typeof target === "number") {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: Math.max(target - 8, 0), animated: true });
      });
    }
  };

  useEffect(() => {
    if (loading || !panel) {
      return;
    }

    const timer = setTimeout(() => scrollToPanel(panel), 60);
    return () => clearTimeout(timer);
  }, [loading, panel]);

  const handleSaveAddress = async () => {
    if (!selectedParty) {
      setError("Please select a party.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const result = await accountingService.updateParty(selectedParty.id, {
        address: address.trim(),
      });
      const updated = result.data;
      if (updated) {
        setParties((current) =>
          current.map((party) => (party.id === updated.id ? updated : party))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update address.");
    } finally {
      setSaving(false);
    }
  };

  const money = (value: string) => formatMoney(Math.max(Number(value || 0), 0));

  if (loading) {
    return <Loading text="Loading quick edits..." fullScreen />;
  }

  return (
    <View style={styles.screen}>
      <AccountingHeader title="Quick Edits" subtitle="Compact panels from voucher flows." />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
          <Text
            style={styles.label}
            onLayout={(event) => {
              sectionPositions.current.address = event.nativeEvent.layout.y;
              if (panel === "address") scrollToPanel("address");
            }}
          >
          Edit Address
        </Text>
        <Card style={styles.panel}>
          <View style={styles.headerRow}>
            <Text style={styles.panelTitle}>Edit Address</Text>
            <Text style={styles.panelMeta}>Party address</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Select Party</Text>
              <View style={styles.selectBox}>
                <Text style={styles.selectBoxText}>{selectedParty?.partyName ?? "Select Party"}</Text>
                <Ionicons name="chevron-down" size={16} color={accountingTheme.colors.textSecondary} />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Address</Text>
              <TextInput value={address} onChangeText={setAddress} style={styles.input} placeholder="Address" />
            </View>
          </View>
          <Button title={saving ? "Updating..." : "Update"} onPress={handleSaveAddress} loading={saving} />
        </Card>

          <Text
            style={styles.label}
            onLayout={(event) => {
              sectionPositions.current.invoice = event.nativeEvent.layout.y;
              if (panel === "invoice") scrollToPanel("invoice");
            }}
          >
          Edit Invoice Date & Number
        </Text>
        <Card style={styles.panel}>
          <Text style={styles.panelTitle}>Edit Invoice Date & Number</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Select Date</Text>
            <TextInput value={invoiceDate} onChangeText={setInvoiceDate} style={styles.input} />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Invoice Number</Text>
            <TextInput value={invoiceNumber} onChangeText={setInvoiceNumber} style={styles.input} />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Due Date</Text>
            <TextInput value={dueDate} onChangeText={setDueDate} style={styles.input} />
          </View>
          <Button title="Save" onPress={() => setError(null)} />
        </Card>

          <Text
            style={styles.label}
            onLayout={(event) => {
              sectionPositions.current["purchase-invoice"] = event.nativeEvent.layout.y;
              if (panel === "purchase-invoice") scrollToPanel("purchase-invoice");
            }}
          >
          Edit Purchase Inv...
        </Text>
        <Card style={styles.panel}>
          <Text style={styles.panelTitle}>Edit Invoice Date & Number</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Select Date</Text>
            <TextInput value={purchaseInvoiceDate} onChangeText={setPurchaseInvoiceDate} style={styles.input} />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Invoice Number</Text>
            <TextInput value={purchaseInvoiceNumber} onChangeText={setPurchaseInvoiceNumber} style={styles.input} />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Due Date</Text>
            <TextInput value={dueDate} onChangeText={setDueDate} style={styles.input} />
          </View>
          <Button title="Save" onPress={() => setError(null)} />
        </Card>

          <Text
            style={styles.label}
            onLayout={(event) => {
              sectionPositions.current.bank = event.nativeEvent.layout.y;
              if (panel === "bank") scrollToPanel("bank");
            }}
          >
          Bank Details
        </Text>
        <Card style={styles.panel}>
          <Text style={styles.panelTitle}>Bank Details</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Cheque Number</Text>
            <TextInput value={chequeNumber} onChangeText={setChequeNumber} style={styles.input} />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Select Date</Text>
            <TextInput value={bankDate} onChangeText={setBankDate} style={styles.input} />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Select Bank</Text>
            <View style={styles.selectBox}>
              <Text style={styles.selectBoxText}>{selectedBank}</Text>
              <Ionicons name="chevron-down" size={16} color={accountingTheme.colors.textSecondary} />
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput value={bankDescription} onChangeText={setBankDescription} style={styles.input} />
          </View>
          <Button title="Save" onPress={() => setError(null)} />
        </Card>

          <Text
            style={styles.label}
            onLayout={(event) => {
              sectionPositions.current.payment = event.nativeEvent.layout.y;
              if (panel === "payment") scrollToPanel("payment");
            }}
          >
          Payment Mode
        </Text>
        <Card style={styles.panel}>
          <Text style={styles.panelTitle}>Payment Mode</Text>
          <View style={styles.optionColumn}>
            {paymentModes.map((mode) => {
              const active = paymentMode === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => setPaymentMode(mode)}
                  style={[styles.optionRow, active && styles.optionRowActive]}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{mode}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

          <Text
            style={styles.label}
            onLayout={(event) => {
              sectionPositions.current.item = event.nativeEvent.layout.y;
              if (panel === "item") scrollToPanel("item");
            }}
          >
          Update Item
        </Text>
        <Card style={styles.panel}>
          <Text style={styles.panelTitle}>Update Item</Text>
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Product</Text>
              <TextInput value={itemName} onChangeText={setItemName} style={styles.input} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Quantity</Text>
              <TextInput value={quantity} onChangeText={setQuantity} style={styles.input} keyboardType="numeric" />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Discount(%)</Text>
              <TextInput value={discount} onChangeText={setDiscount} style={styles.input} keyboardType="numeric" />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Tax(%)</Text>
              <TextInput value={taxRate} onChangeText={setTaxRate} style={styles.input} keyboardType="numeric" />
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Amount</Text>
            <TextInput value={amount} onChangeText={setAmount} style={styles.input} keyboardType="numeric" />
          </View>
          <View style={styles.summaryBox}>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Amount</Text>
              <Text style={styles.summaryValue}>{money(amount)}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValue}>Rs {discount || "0"}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Tax Rate(%)</Text>
              <Text style={styles.summaryValue}>{taxRate || "0"}</Text>
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput value={itemDescription} onChangeText={setItemDescription} style={[styles.input, styles.multiLine]} multiline />
          </View>
          <Button title="Update" onPress={() => setError(null)} />
        </Card>

          <Text
            style={styles.label}
            onLayout={(event) => {
              sectionPositions.current["receipt-invoice"] = event.nativeEvent.layout.y;
              if (panel === "receipt-invoice") scrollToPanel("receipt-invoice");
            }}
          >
          Edit Receipt Inv...
        </Text>
        <Card style={styles.panel}>
          <Text style={styles.panelTitle}>Edit Invoice Date & Number</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Select Date</Text>
            <TextInput value={receiptInvoiceDate} onChangeText={setReceiptInvoiceDate} style={styles.input} />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Invoice Number</Text>
            <TextInput value={receiptInvoiceNumber} onChangeText={setReceiptInvoiceNumber} style={styles.input} />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Due Date</Text>
            <TextInput value={receiptDueDate} onChangeText={setReceiptDueDate} style={styles.input} />
          </View>
          <Button title="Save" onPress={() => setError(null)} />
        </Card>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={accountingTheme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: accountingTheme.colors.background },
  content: { paddingHorizontal: 14, paddingTop: accountingTheme.spacing.sm, paddingBottom: accountingTheme.spacing.xxl },
  label: {
    color: "#9CA3AF",
    fontWeight: accountingTheme.fontWeights.bold,
    fontSize: accountingTheme.fontSizes.xxl,
    marginTop: 2,
    marginBottom: 6,
  },
  panel: { marginBottom: 10 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: accountingTheme.spacing.sm },
  panelTitle: { fontSize: accountingTheme.fontSizes.sm, fontWeight: accountingTheme.fontWeights.extraBold, color: "#111827" },
  panelMeta: { fontSize: accountingTheme.fontSizes.xs, color: "#9CA3AF" },
  row: { flexDirection: "row", gap: accountingTheme.spacing.sm },
  field: { flex: 1, marginBottom: accountingTheme.spacing.sm },
  fieldLabel: { fontSize: accountingTheme.fontSizes.xs, color: accountingTheme.colors.textSecondary, fontWeight: accountingTheme.fontWeights.bold, marginBottom: accountingTheme.spacing.xs },
  input: {
    backgroundColor: accountingTheme.colors.card,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    borderRadius: accountingTheme.radius.md,
    paddingHorizontal: 10,
    paddingVertical: accountingTheme.spacing.sm,
    fontSize: accountingTheme.fontSizes.sm,
  },
  multiLine: { minHeight: 56, textAlignVertical: "top" },
  selectBox: {
    backgroundColor: accountingTheme.colors.card,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    borderRadius: accountingTheme.radius.md,
    paddingHorizontal: 10,
    paddingVertical: accountingTheme.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectBoxText: { fontSize: accountingTheme.fontSizes.sm, color: "#111827", fontWeight: accountingTheme.fontWeights.bold },
  optionColumn: { gap: 6 },
  optionRow: {
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    borderRadius: accountingTheme.radius.md,
    paddingHorizontal: 10,
    paddingVertical: accountingTheme.spacing.sm,
    backgroundColor: accountingTheme.colors.card,
  },
  optionRowActive: { borderColor: accountingTheme.colors.primary, backgroundColor: "#EFF6FF" },
  optionText: { color: "#475569", fontSize: accountingTheme.fontSizes.sm, fontWeight: accountingTheme.fontWeights.bold },
  optionTextActive: { color: accountingTheme.colors.primary },
  summaryBox: {
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    borderRadius: accountingTheme.radius.lg,
    backgroundColor: "#F8FAFC",
    padding: 10,
    marginBottom: accountingTheme.spacing.sm,
  },
  summaryLine: { flexDirection: "row", justifyContent: "space-between", marginBottom: accountingTheme.spacing.xs },
  summaryLabel: { fontSize: accountingTheme.fontSizes.xs, color: accountingTheme.colors.textSecondary, fontWeight: accountingTheme.fontWeights.bold },
  summaryValue: { fontSize: 11, color: "#111827", fontWeight: accountingTheme.fontWeights.extraBold },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.sm,
    backgroundColor: accountingTheme.colors.dangerLight,
    borderRadius: accountingTheme.radius.lg,
    padding: accountingTheme.spacing.md,
    marginTop: accountingTheme.spacing.md,
  },
  errorText: { color: accountingTheme.colors.error, fontSize: accountingTheme.fontSizes.sm, fontWeight: accountingTheme.fontWeights.semiBold },
});
