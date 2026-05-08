import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AccountingHeader, Card } from "../components";
import { accountingService } from "../services/accountingService";
import { buildA4Html, escapeHtml, exportHtmlToPdf, formatINR } from "../print/printHelpers";

export default function PrintReceiptScreen() {
  const params = useLocalSearchParams<{
    partyId?: string;
    partyName?: string;
    amount?: string;
    receiptNumber?: string;
    receiptDate?: string;
  }>();

  const [partyName, setPartyName] = useState(params.partyName ?? "");
  const [partyId, setPartyId] = useState(params.partyId ?? "");
  const [amount, setAmount] = useState(params.amount ?? "");
  const [receiptNumber, setReceiptNumber] = useState(params.receiptNumber ?? `RCT-${Date.now().toString().slice(-6)}`);
  const [receiptDate, setReceiptDate] = useState(params.receiptDate ?? new Date().toISOString().slice(0, 10));
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  const amountValue = Math.max(Number(amount || 0), 0);

  const handlePrint = async () => {
    const html = buildA4Html(
      "Receipt",
      `
        <div class="grid">
          <div class="card">
            <div class="cardTitle">Receipt Info</div>
            <div class="row"><div class="label">Number</div><div class="value">${escapeHtml(receiptNumber)}</div></div>
            <div class="row"><div class="label">Date</div><div class="value">${escapeHtml(receiptDate)}</div></div>
            <div class="row"><div class="label">Amount</div><div class="value">${escapeHtml(formatINR(amountValue))}</div></div>
          </div>
          <div class="card">
            <div class="cardTitle">Party</div>
            <div class="row"><div class="label">Name</div><div class="value">${escapeHtml(partyName || "Select Party")}</div></div>
            <div class="row"><div class="label">Party ID</div><div class="value">${escapeHtml(partyId || "NA")}</div></div>
          </div>
        </div>
        <div class="card">
          <div class="cardTitle">Address</div>
          <div style="font-size:11px; line-height:1.6;">${escapeHtml(address || "NA")}</div>
        </div>
        <div class="totals">
          <div class="totalsBox">
            <div class="totalsRow"><div class="totalsLabel">Total Amount</div><div class="totalsValue">${escapeHtml(formatINR(amountValue))}</div></div>
            <div class="totalsRow"><div class="totalsLabel">Mode</div><div class="totalsValue">Receipt</div></div>
          </div>
        </div>
      `
    );

    setSaving(true);
    try {
      if (partyId) {
        const result = await accountingService.getPartyById(partyId);
        if (result.data?.address && !address) {
          setAddress(result.data.address);
        }
      }
      await exportHtmlToPdf(html, `receipt-${receiptNumber}`);
    } finally {
      setSaving(false);
    }
  };

  const canPrint = useMemo(() => amountValue > 0 || partyName.trim().length > 0, [amountValue, partyName]);

  return (
    <View style={styles.container}>
      <AccountingHeader title="Print Receipt" showBackButton />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.field}><Text style={styles.label}>Receipt Number</Text><TextInput value={receiptNumber} onChangeText={setReceiptNumber} style={styles.input} /></View>
          <View style={styles.field}><Text style={styles.label}>Party Name</Text><TextInput value={partyName} onChangeText={setPartyName} style={styles.input} /></View>
          <View style={styles.field}><Text style={styles.label}>Party ID</Text><TextInput value={partyId} onChangeText={setPartyId} style={styles.input} /></View>
          <View style={styles.field}><Text style={styles.label}>Amount</Text><TextInput value={amount} onChangeText={setAmount} style={styles.input} keyboardType="numeric" /></View>
          <View style={styles.field}><Text style={styles.label}>Receipt Date</Text><TextInput value={receiptDate} onChangeText={setReceiptDate} style={styles.input} /></View>
          <View style={styles.field}><Text style={styles.label}>Address (optional)</Text><TextInput value={address} onChangeText={setAddress} style={styles.input} multiline /></View>
          <Pressable style={[styles.btn, !canPrint && styles.btnDisabled]} onPress={handlePrint} disabled={!canPrint}>
            <Ionicons name="print-outline" size={18} color="#fff" />
            <Text style={styles.btnText}>{saving ? "Preparing..." : "Export PDF"}</Text>
          </Pressable>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F9FF" },
  content: { padding: 16 },
  field: { marginBottom: 14 },
  label: { fontSize: 12, color: "#60708A", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E5EAF3", padding: 14, fontSize: 14, color: "#0F172A" },
  btn: { marginTop: 6, backgroundColor: "#2563EB", borderRadius: 14, paddingVertical: 14, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "800" },
});
