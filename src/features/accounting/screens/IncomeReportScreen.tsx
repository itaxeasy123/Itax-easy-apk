import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { AccountingHeader, BottomNav } from "../components";
import { Ionicons } from "@expo/vector-icons";
import { accountingService } from "../services/accountingService";
import { Ledger } from "../types/accountingTypes";

const format = (value: number) =>
  `Rs ${Math.abs(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function IncomeReportScreen() {
  const [sales, setSales] = useState(0);
  const [purchases, setPurchases] = useState(0);
  const [partyCount, setPartyCount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadIncomeData() {
      try {
        setLoading(true);
        setError(null);
        const [summary, ledgerResponse] = await Promise.all([
          accountingService.getInvoiceSummary(),
          accountingService.getLedgers(),
        ]);
        setSales(Number(summary.data?.total_sales ?? 0));
        setPurchases(Number(summary.data?.total_purchases ?? 0));
        setPartyCount(Number(summary.data?.number_of_parties ?? 0));
        setItemCount(Number(summary.data?.number_of_items ?? 0));
        setLedgers(ledgerResponse.data ?? []);
      } catch {
        setError("Unable to load income analysis.");
      } finally {
        setLoading(false);
      }
    }
    loadIncomeData();
  }, []);

  const receivable = useMemo(
    () =>
      ledgers
        .filter((ledger) => ledger.ledgerType === "accountsReceivable")
        .reduce((sum, ledger) => sum + Number(ledger.balance ?? 0), 0),
    [ledgers]
  );

  const topIncomeLedgers = useMemo(
    () =>
      ledgers
        .filter((ledger) =>
          ["directIncome", "indirectIncome", "accountsReceivable"].includes(ledger.ledgerType)
        )
        .sort((a, b) => Math.abs(Number(b.balance)) - Math.abs(Number(a.balance)))
        .slice(0, 6),
    [ledgers]
  );

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Income Analysis"
        showBackButton
        rightContent={<Ionicons name="ellipsis-horizontal" size={18} color="#fff" />}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? <Text style={styles.stateText}>Loading income analysis...</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {!loading && !error ? <>
        <View style={styles.topCard}>
          <View>
            <Text style={styles.metricLabel}>Gross Income</Text>
            <Text style={styles.metricValue}>{format(sales)}</Text>
          </View>
          <View>
            <Text style={styles.metricLabel}>Receivable</Text>
            <Text style={[styles.metricValue, { color: "#F97316" }]}>{format(receivable)}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statsChip}>
            <Text style={styles.statsLabel}>Parties</Text>
            <Text style={styles.statsValue}>{partyCount}</Text>
          </View>
          <View style={styles.statsChip}>
            <Text style={styles.statsLabel}>Items</Text>
            <Text style={styles.statsValue}>{itemCount}</Text>
          </View>
        </View>

        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>Income Snapshot</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Sales Income</Text>
            <Text style={styles.value}>{format(sales)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Purchase Outflow</Text>
            <Text style={[styles.value, { color: "#DC2626" }]}>{format(purchases)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Net Surplus</Text>
            <Text style={[styles.value, { color: "#059669" }]}>{format(sales - purchases)}</Text>
          </View>
        </View>

        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>Top Income Ledgers</Text>
          {topIncomeLedgers.map((ledger) => (
            <View key={ledger.id} style={styles.row}>
              <Text style={styles.label}>{ledger.ledgerName}</Text>
              <Text style={styles.value}>{format(Number(ledger.balance ?? 0))}</Text>
            </View>
          ))}
        </View>
        </> : null}
      </ScrollView>
      <BottomNav activeRoute="/accounting/reports" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F9FF" },
  content: { padding: 16, paddingBottom: 24 },
  stateText: { color: "#64748B" },
  errorText: { color: "#DC2626" },
  topCard: {
    backgroundColor: "#14B8A6",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricLabel: { fontSize: 12, color: "#D1FAF5", textTransform: "uppercase" },
  metricValue: { marginTop: 6, color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  statsRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  statsChip: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
  },
  statsLabel: { fontSize: 12, color: "#64748B" },
  statsValue: { marginTop: 4, fontSize: 16, fontWeight: "800", color: "#0F172A" },
  tableCard: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
  },
  tableTitle: { fontSize: 15, color: "#0F172A", fontWeight: "700", marginBottom: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  label: { fontSize: 13, color: "#475569", flex: 1, paddingRight: 8 },
  value: { fontSize: 13, color: "#0F172A", fontWeight: "700" },
});
