import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { AccountingHeader, BottomNav, EmptyState } from "../components";
import { accountingService } from "../services/accountingService";
import { BillReceivable } from "../types/accountingTypes";

type Tab = "customers" | "ageing";

const formatCurrency = (value: number) =>
  `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function BillReceivableScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("customers");
  const [bills, setBills] = useState<BillReceivable[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBills = useCallback(async () => {
    try {
      setLoading(true);
      const result = await accountingService.getAllBillReceivables();
      setBills(result.data ?? []);
    } catch {
      // Error handling can be added
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadBills();
    }, [loadBills])
  );

  const customerData = useMemo(() => {
    const grouped = new Map<string, { name: string; amount: number; count: number }>();
    bills.forEach(b => {
      const current = grouped.get(b.customerName) || { name: b.customerName, amount: 0, count: 0 };
      current.amount += Number(b.amount || 0);
      current.count += 1;
      grouped.set(b.customerName, current);
    });
    return Array.from(grouped.values()).sort((a, b) => b.amount - a.amount);
  }, [bills]);

  const totalAmount = useMemo(() => customerData.reduce((sum, item) => sum + item.amount, 0), [customerData]);

  const renderList = () => {
    if (activeTab === "customers") {
      if (loading) return null;
      if (customerData.length === 0) {
        return (
          <EmptyState
            icon="people-outline"
            title="No customers found"
            description="When API is connected, customer balances will appear here."
          />
        );
      }
      return customerData.map((item, index) => (
        <Pressable 
          key={item.name} 
          style={[styles.row, index === 0 && styles.firstRow]}
          onPress={() => router.push(`/accounting/receivable-detail?name=${encodeURIComponent(item.name)}`)}
        >
          <View>
            <Text style={styles.rowTitle}>{item.name}</Text>
            <Text style={styles.rowSubtitle}>{item.count} Invoices</Text>
          </View>
          <Text style={styles.rowAmount}>{formatCurrency(item.amount)}</Text>
        </Pressable>
      ));
    }
    
    if (activeTab === "ageing") {
      if (loading) return null;
      if (customerData.length === 0) {
        return (
          <EmptyState
            icon="calendar-outline"
            title="No ageing data"
            description="When API is connected, ageing summary will appear here."
          />
        );
      }
      // Re-using customer data for dummy ageing UI representation
      return customerData.map((item, index) => (
        <View key={item.name} style={[styles.row, index === 0 && styles.firstRow]}>
          <Text style={styles.rowTitle}>{item.name}</Text>
          <Text style={styles.rowAmount}>{formatCurrency(item.amount)}</Text>
        </View>
      ));
    }
  };

  return (
    <View style={styles.screen}>
      <AccountingHeader
        title="Receivables"
        showBackButton
        rightContent={
          <View style={styles.headerRightIcons}>
            <Ionicons name="search" size={20} color="#fff" />
            <Ionicons name="filter" size={20} color="#fff" />
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
          </View>
        }
        headerContent={
          <View style={styles.headerBlock}>
            <Text style={styles.headerAmount}>{formatCurrency(totalAmount)}</Text>
            <Text style={styles.headerMeta}>Total Amount</Text>
          </View>
        }
      />

      <View style={styles.mainContainer}>
        <View style={styles.topWhiteSection}>
          <View style={styles.switcherWrap}>
            <View style={styles.switcherContainer}>
              <Pressable
                onPress={() => setActiveTab("customers")}
                style={[styles.tab, activeTab === "customers" && styles.tabActive]}
              >
                <Text style={[styles.tabLabel, activeTab === "customers" && styles.tabLabelActive]}>
                  Customers
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setActiveTab("ageing")}
                style={[styles.tab, activeTab === "ageing" && styles.tabActive]}
              >
                <Text style={[styles.tabLabel, activeTab === "ageing" && styles.tabLabelActive]}>
                  Ageing Summary
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          <View style={styles.listContainer}>
            {renderList()}
          </View>
        </ScrollView>
      </View>

      <BottomNav activeRoute="/accounting" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  headerRightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerBlock: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  headerAmount: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#EAFDFC",
    fontWeight: "600",
  },
  mainContainer: {
    flex: 1,
    marginTop: -8,
  },
  topWhiteSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  switcherWrap: {
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 110,
  },
  listContainer: {
    backgroundColor: "#FFFFFF",
    minHeight: 400,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEF2F7",
  },
  firstRow: {
    borderTopWidth: 0,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  rowSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  switcherContainer: {
    flexDirection: "row",
    gap: 10,
  },
  tab: {
    flex: 1,
    backgroundColor: "#EEF2F7",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#2563EB",
  },
  tabLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
  },
  tabLabelActive: {
    color: "#2563EB",
  },
});
