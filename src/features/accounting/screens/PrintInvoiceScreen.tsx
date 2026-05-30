import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AccountingHeader, Card, Loading } from "../components";
import { exportHtmlToPdf, buildA4Html, escapeHtml, formatINR } from "../print/printHelpers";
import { invoiceService } from "../../invoice/services/invoiceService";
import type { Invoice } from "../../invoice/types/invoice.types";
import { accountingTheme } from "../../../theme/accounting";

const formatDate = (value?: string | null) => {
  if (!value) return "NA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export default function PrintInvoiceScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        if (id) {
          const result = await invoiceService.getInvoiceById(id);
          setInvoice(result ?? null);
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  const handlePrint = async () => {
    if (!invoice) return;
    const lines = (invoice.invoiceItems ?? [])
      .map(
        (line, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(line.item?.itemName ?? line.itemId ?? "Item")}</td>
            <td>${escapeHtml(line.quantity)}</td>
            <td>${escapeHtml(line.discount)}</td>
            <td>${escapeHtml(line.taxPercent ?? 0)}</td>
            <td>${escapeHtml(formatINR((Number(line.quantity || 0) * Number(line.item?.price || 0)) - Number(line.discount || 0)))}</td>
          </tr>
        `
      )
      .join("");

    const html = buildA4Html(
      "Invoice",
      `
        <div class="grid">
          <div class="card">
            <div class="cardTitle">Invoice Info</div>
            <div class="row"><div class="label">Number</div><div class="value">${escapeHtml(invoice.invoiceNumber || "INV-DRAFT")}</div></div>
            <div class="row"><div class="label">Date</div><div class="value">${escapeHtml(formatDate(invoice.invoiceDate))}</div></div>
            <div class="row"><div class="label">Due Date</div><div class="value">${escapeHtml(formatDate(invoice.dueDate))}</div></div>
          </div>
          <div class="card">
            <div class="cardTitle">Party</div>
            <div class="row"><div class="label">Name</div><div class="value">${escapeHtml(invoice.party?.partyName ?? invoice.partyId)}</div></div>
            <div class="row"><div class="label">GST</div><div class="value">${escapeHtml(invoice.gstNumber ?? "NA")}</div></div>
            <div class="row"><div class="label">Type</div><div class="value">${escapeHtml(invoice.type)}</div></div>
          </div>
        </div>

        <div class="card">
          <div class="cardTitle">Items</div>
          <table>
            <thead>
              <tr>
                <th>#</th><th>Description</th><th>Qty</th><th>Discount</th><th>Tax %</th><th>Amount</th>
              </tr>
            </thead>
            <tbody>${lines || `<tr><td colspan="6">No items</td></tr>`}</tbody>
          </table>
        </div>

        <div class="totals">
          <div class="totalsBox">
            <div class="totalsRow"><div class="totalsLabel">Subtotal</div><div class="totalsValue">${escapeHtml(formatINR(invoice.totalAmount - (invoice.totalGst || 0)))}</div></div>
            <div class="totalsRow"><div class="totalsLabel">GST</div><div class="totalsValue">${escapeHtml(formatINR(invoice.totalGst || 0))}</div></div>
            <div class="totalsRow"><div class="totalsLabel">Total</div><div class="totalsValue">${escapeHtml(formatINR(invoice.totalAmount))}</div></div>
          </div>
        </div>
      `
    );

    setSaving(true);
    try {
      await exportHtmlToPdf(html, `invoice-${invoice.invoiceNumber || invoice.id}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading text="Loading print view..." fullScreen />;

  if (!invoice) {
    return (
      <View style={styles.container}>
        <AccountingHeader title="Print Invoice" showBackButton />
        <View style={styles.empty}><Text style={styles.error}>Invoice not found.</Text></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AccountingHeader title="Print Invoice" showBackButton />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.headRow}>
            <View>
              <Text style={styles.title}>{invoice.invoiceNumber || "INV-DRAFT"}</Text>
              <Text style={styles.meta}>{invoice.party?.partyName ?? invoice.partyId}</Text>
            </View>
            <View style={styles.amountPill}>
              <Text style={styles.amountText}>{formatINR(invoice.totalAmount)}</Text>
            </View>
          </View>
          <Pressable style={styles.btn} onPress={handlePrint}>
            <Ionicons name="print-outline" size={18} color={accountingTheme.colors.card} />
            <Text style={styles.btnText}>{saving ? "Preparing..." : "Export PDF"}</Text>
          </Pressable>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: accountingTheme.colors.background },
  content: { padding: accountingTheme.spacing.lg },
  headRow: { flexDirection: "row", justifyContent: "space-between", gap: accountingTheme.spacing.md },
  title: { fontSize: 22, fontWeight: accountingTheme.fontWeights.extraBold, color: accountingTheme.colors.text },
  meta: { fontSize: accountingTheme.fontSizes.md, color: accountingTheme.colors.textSecondary, marginTop: accountingTheme.spacing.xs },
  amountPill: { backgroundColor: "#DBEAFE", borderRadius: accountingTheme.radius.full, paddingHorizontal: accountingTheme.spacing.md, paddingVertical: accountingTheme.spacing.sm, alignSelf: "flex-start" },
  amountText: { fontWeight: accountingTheme.fontWeights.extraBold, color: "#1D4ED8" },
  btn: { marginTop: accountingTheme.spacing.lg, backgroundColor: accountingTheme.colors.primary, borderRadius: accountingTheme.radius.xl, paddingVertical: 14, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: accountingTheme.spacing.sm },
  btnText: { color: accountingTheme.colors.card, fontWeight: accountingTheme.fontWeights.extraBold },
  empty: { padding: accountingTheme.spacing.lg },
  error: { color: accountingTheme.colors.error },
});
