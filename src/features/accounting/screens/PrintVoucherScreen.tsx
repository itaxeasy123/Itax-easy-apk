import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AccountingHeader, Card, Loading } from "../components";
import { voucherService } from "../services/voucherService";
import { buildA4Html, escapeHtml, exportHtmlToPdf, formatINR } from "../print/printHelpers";
import { VoucherEntry } from "../types/accountingTypes";

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-IN");
};

export default function PrintVoucherScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [voucher, setVoucher] = useState<VoucherEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        if (id) {
          const result = await voucherService.getById(id);
          setVoucher(result.data ?? null);
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  const handlePrint = async () => {
    if (!voucher) return;
    const lines = voucher.lines
      .map(
        (line, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(line.ledgerName || line.ledgerId)}</td>
            <td>${escapeHtml(line.side)}</td>
            <td>${escapeHtml(formatINR(line.amount))}</td>
          </tr>
        `
      )
      .join("");

    const html = buildA4Html(
      "Voucher",
      `
        <div class="grid">
          <div class="card">
            <div class="cardTitle">Voucher Info</div>
            <div class="row"><div class="label">Number</div><div class="value">${escapeHtml(voucher.voucherNumber)}</div></div>
            <div class="row"><div class="label">Date</div><div class="value">${escapeHtml(formatDate(voucher.entryDate))}</div></div>
            <div class="row"><div class="label">Type</div><div class="value">${escapeHtml(voucher.voucherType)}</div></div>
          </div>
          <div class="card">
            <div class="cardTitle">Summary</div>
            <div class="row"><div class="label">Total Debit</div><div class="value">${escapeHtml(formatINR(voucher.totalDebit))}</div></div>
            <div class="row"><div class="label">Total Credit</div><div class="value">${escapeHtml(formatINR(voucher.totalCredit))}</div></div>
          </div>
        </div>
        <div class="card">
          <div class="cardTitle">Narration</div>
          <div style="font-size:11px; line-height:1.6;">${escapeHtml(voucher.narration || "NA")}</div>
        </div>
        <div class="card">
          <div class="cardTitle">Lines</div>
          <table>
            <thead><tr><th>#</th><th>Ledger</th><th>Side</th><th>Amount</th></tr></thead>
            <tbody>${lines || `<tr><td colspan="4">No lines</td></tr>`}</tbody>
          </table>
        </div>
      `
    );

    setSaving(true);
    try {
      await exportHtmlToPdf(html, `voucher-${voucher.voucherNumber}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading text="Loading print view..." fullScreen />;
  if (!voucher) {
    return (
      <View style={styles.container}>
        <AccountingHeader title="Print Voucher" showBackButton />
        <View style={styles.empty}><Text style={styles.error}>Voucher not found.</Text></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AccountingHeader title="Print Voucher" showBackButton />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.title}>{voucher.voucherNumber}</Text>
          <Text style={styles.meta}>{voucher.voucherType.toUpperCase()} | {formatDate(voucher.entryDate)}</Text>
          <Pressable style={styles.btn} onPress={handlePrint}>
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
  title: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  meta: { fontSize: 13, color: "#64748B", marginTop: 4 },
  btn: { marginTop: 16, backgroundColor: "#2563EB", borderRadius: 14, paddingVertical: 14, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  btnText: { color: "#fff", fontWeight: "800" },
  empty: { padding: 16 },
  error: { color: "#DC2626" },
});
