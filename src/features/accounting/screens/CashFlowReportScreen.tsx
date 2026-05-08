import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AccountingHeader, BottomNav } from "../components";
import { accountingService } from "../services/accountingService";
import { CashFlowReport } from "../types/accountingTypes";

const format = (value: number) =>
  `Rs ${Math.abs(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function CashFlowReportScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState<CashFlowReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCashFlow() {
      try {
        setLoading(true);
        setError(null);
        const response = await accountingService.getCashFlowReport(year, month);
        if (response.success && response.data) {
          setReport(response.data);
        } else {
          setError("Unable to load cash flow report.");
        }
      } catch {
        setError("Unable to load cash flow report.");
      } finally {
        setLoading(false);
      }
    }
    loadCashFlow();
  }, [month, year]);

  const moveMonth = (delta: number) => {
    const nextMonth = month + delta;
    if (nextMonth < 1) {
      setMonth(12);
      setYear((prev) => prev - 1);
      return;
    }
    if (nextMonth > 12) {
      setMonth(1);
      setYear((prev) => prev + 1);
      return;
    }
    setMonth(nextMonth);
  };

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Cash Flow"
        showBackButton
        rightContent={<Ionicons name="ellipsis-horizontal" size={18} color="#fff" />}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.periodBar}>
          <Pressable style={styles.iconBtn} onPress={() => moveMonth(-1)}>
            <Ionicons name="chevron-back" size={16} color="#2563EB" />
          </Pressable>
          <Text style={styles.periodText}>{`${month.toString().padStart(2, "0")}/${year}`}</Text>
          <Pressable style={styles.iconBtn} onPress={() => moveMonth(1)}>
            <Ionicons name="chevron-forward" size={16} color="#2563EB" />
          </Pressable>
        </View>

        {loading ? <Text style={styles.stateText}>Loading cash flow...</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && !error ? (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Operating Cash Flow</Text>
              <Text style={styles.value}>{format(report?.operatingCashFlow ?? 0)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Investing Cash Flow</Text>
              <Text style={styles.value}>{format(report?.investingCashFlow ?? 0)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Financing Cash Flow</Text>
              <Text style={styles.value}>{format(report?.financingCashFlow ?? 0)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Net Cash Flow</Text>
              <Text
                style={[
                  styles.totalValue,
                  (report?.netCashFlow ?? 0) >= 0 ? styles.positive : styles.negative,
                ]}
              >
                {format(report?.netCashFlow ?? 0)}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
      <BottomNav activeRoute="/accounting/reports" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F9FF" },
  content: { padding: 16, paddingBottom: 24 },
  periodBar: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  periodText: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  stateText: { marginTop: 12, color: "#64748B" },
  errorText: { marginTop: 12, color: "#DC2626" },
  card: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  label: { fontSize: 13, color: "#475569" },
  value: { fontSize: 13, fontWeight: "700", color: "#0F172A" },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  totalValue: { fontSize: 15, fontWeight: "800" },
  positive: { color: "#059669" },
  negative: { color: "#DC2626" },
});
