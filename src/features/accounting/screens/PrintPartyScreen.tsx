import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AccountingHeader, Card, Loading } from "../components";
import { accountingService } from "../services/accountingService";
import { exportHtmlToPdf, buildA4Html, escapeHtml, formatINR } from "../print/printHelpers";
import type { Party } from "../types/accountingTypes";

export default function PrintPartyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const partyId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const result = await accountingService.getPartyById(partyId ?? "");
        setParty(result.data ?? null);
      } catch {
        setError("Unable to load party.");
      } finally {
        setLoading(false);
      }
    }
    if (partyId) void load();
    else setLoading(false);
  }, [partyId]);

  const balance = useMemo(
    () => (party?.ledgers ?? []).reduce((sum, ledger) => sum + Number(ledger.balance || 0), 0),
    [party]
  );

  const handlePrint = async () => {
    if (!party) return;
    const rows = [
      ["Party Name", party.partyName],
      ["Type", party.type],
      ["Phone", party.phone ?? "NA"],
      ["Email", party.email ?? "NA"],
      ["GSTIN", party.gstin ?? "NA"],
      ["PAN", party.pan ?? "NA"],
      ["TAN", party.tan ?? "NA"],
      ["UPI", party.upi ?? "NA"],
      ["Address", party.address ?? "NA"],
      ["Bank Name", party.bankName ?? "NA"],
      ["Bank Account", party.bankAccountNumber ?? "NA"],
      ["IFSC", party.bankIfsc ?? "NA"],
      ["Branch", party.bankBranch ?? "NA"],
    ]
      .map(
        ([label, value]) => `<div class="row"><div class="label">${escapeHtml(label)}</div><div class="value">${escapeHtml(value)}</div></div>`
      )
      .join("");

    const html = buildA4Html(
      "Party Details",
      `
        <div class="grid">
          <div class="card">
            <div class="cardTitle">Summary</div>
            <div class="row"><div class="label">Name</div><div class="value">${escapeHtml(party.partyName)}</div></div>
            <div class="row"><div class="label">Balance</div><div class="value">${escapeHtml(formatINR(balance))}</div></div>
          </div>
          <div class="card">
            <div class="cardTitle">Contact</div>
            <div class="row"><div class="label">Phone</div><div class="value">${escapeHtml(party.phone ?? "NA")}</div></div>
            <div class="row"><div class="label">Email</div><div class="value">${escapeHtml(party.email ?? "NA")}</div></div>
          </div>
        </div>
        <div class="card">
          <div class="cardTitle">Party Information</div>
          ${rows}
        </div>
      `
    );

    setSaving(true);
    try {
      await exportHtmlToPdf(html, `party-${party.partyName}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading text="Loading print view..." fullScreen />;
  }

  if (!party) {
    return (
      <View style={styles.container}>
        <AccountingHeader title="Print Party" showBackButton />
        <View style={styles.emptyWrap}>
          <Card>
            <Text style={styles.emptyText}>{error || "Party not found."}</Text>
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AccountingHeader title="Print Party" showBackButton />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.name}>{party.partyName}</Text>
              <Text style={styles.meta}>{formatINR(balance)} balance</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{party.type}</Text>
            </View>
          </View>
          <View style={styles.previewGrid}>
            <View style={styles.previewBox}><Text style={styles.smallLabel}>Phone</Text><Text style={styles.smallValue}>{party.phone ?? "NA"}</Text></View>
            <View style={styles.previewBox}><Text style={styles.smallLabel}>Email</Text><Text style={styles.smallValue}>{party.email ?? "NA"}</Text></View>
          </View>
          <Pressable style={styles.printBtn} onPress={handlePrint}>
            <Ionicons name="print-outline" size={18} color="#fff" />
            <Text style={styles.printBtnText}>{saving ? "Preparing..." : "Export PDF"}</Text>
          </Pressable>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F9FF" },
  content: { padding: 16, paddingBottom: 28 },
  previewCard: { marginTop: 4 },
  previewHeader: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  name: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  meta: { fontSize: 13, color: "#64748B", marginTop: 4 },
  pill: { backgroundColor: "#DBEAFE", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  pillText: { color: "#1D4ED8", fontWeight: "700", fontSize: 11 },
  previewGrid: { flexDirection: "row", gap: 10, marginTop: 16 },
  previewBox: { flex: 1, backgroundColor: "#F8FAFC", borderRadius: 14, padding: 12 },
  smallLabel: { fontSize: 11, color: "#64748B", textTransform: "uppercase" },
  smallValue: { fontSize: 13, fontWeight: "700", color: "#0F172A", marginTop: 6 },
  printBtn: { marginTop: 16, backgroundColor: "#2563EB", borderRadius: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  printBtnText: { color: "#fff", fontWeight: "800" },
  emptyWrap: { padding: 16 },
  emptyText: { color: "#DC2626" },
});
