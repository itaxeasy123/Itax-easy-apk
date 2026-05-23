import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AccountingHeader } from "../components";

const format = (value: number | undefined) => {
  if (value === undefined || isNaN(value)) return "₹ 0.00";
  return `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

export default function CapitalAccountReportScreen() {
    const insets = useSafeAreaInsets();
  const router = useRouter();
  const [report, setReport] = useState<any>(null); // Start with empty state
  
  // Dummy data removed, waiting for API

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Capital Account"
        showBackButton
        rightContent={
          <Pressable>
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
          </Pressable>
        }
      />

      <View style={styles.userInfoCard}>
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={24} color="#94A3B8" />
        </View>
        <View style={styles.userInfoTextWrap}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>: {report?.name || ""}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>GSTIN</Text>
            <Text style={styles.infoValue}>: {report?.gstin || ""}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Financial year</Text>
            <Text style={styles.infoValue}>: {report?.financialYear || ""}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#475569" />
      </View>

      <Text style={styles.sectionTitle}>Capital Transactions</Text>

      <View style={styles.periodBar}>
        <View style={styles.periodLeft}>
          <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
          <Text style={styles.periodText}>
            Financial Year <Text style={styles.periodSubText}>(1 Apr 24 to 31 Mar 25)</Text>
          </Text>
        </View>
        <Pressable>
          <Text style={styles.changeText}>Change</Text>
        </Pressable>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.thText, { flex: 2 }]}>Particular</Text>
        <Text style={[styles.thText, { flex: 1.5, textAlign: "right" }]}>Debit</Text>
        <Text style={[styles.thText, { flex: 1.5, textAlign: "right" }]}>Credit</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tableCard}>
          {/* Map over dynamic transactions from report when API is hooked */}
          {report?.transactions?.map((t: any, index: number) => (
            <View key={index} style={styles.row}>
              <Text style={styles.particular}>{t.particular}</Text>
              <Text style={styles.amount}>{format(t.debit)}</Text>
              <Text style={styles.amount}>{format(t.credit)}</Text>
            </View>
          ))}
          
          {(!report?.transactions || report.transactions.length === 0) && (
            <Text style={styles.emptyText}>No transactions found</Text>
          )}
        </View>
      </ScrollView>

      {/* Footer Total */}
      <View style={styles.footer}>
        <Text style={[styles.footerLabel, { flex: 2 }]}>Total</Text>
        <Text style={[styles.footerValue, { flex: 1.5, textAlign: "right" }]}>{format(report?.totalDebit)}</Text>
        <Text style={[styles.footerValue, { flex: 1.5, textAlign: "right" }]}>{format(report?.totalCredit)}</Text>
      </View>
      <View style={{ backgroundColor: "#FFFFFF", height: Math.max(insets.bottom, 0) }} />

      {/* FAB Print */}
      <Pressable 
        style={[styles.fabPrint, { bottom: 80 + Math.max(insets.bottom, 0) }]} 
        onPress={() => router.push("/accounting/reports-capital-account-preview")}
      >
        <Ionicons name="print-outline" size={20} color="#FFFFFF" />
        <Text style={styles.fabPrintText}>Print</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  userInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7", // Light green as per screenshot
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  userInfoTextWrap: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    width: 100,
    fontSize: 13,
    color: "#334155",
    fontWeight: "500",
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  periodBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  periodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  periodText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  periodSubText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#64748B",
  },
  changeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3B82F6",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  thText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    paddingBottom: 80,
  },
  tableCard: {
    backgroundColor: "#FFFFFF",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  particular: {
    flex: 2,
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  amount: {
    flex: 1.5,
    fontSize: 12,
    color: "#0F172A",
    fontWeight: "700",
    textAlign: "right",
  },
  emptyText: {
    textAlign: "center",
    padding: 24,
    color: "#94A3B8",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  footerLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  footerValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  fabPrint: {
    position: "absolute",
    right: 16,
    bottom: 80,
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    gap: 8,
  },
  fabPrintText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
