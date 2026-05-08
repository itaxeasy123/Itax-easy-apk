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
import { AccountingHeader, BottomNav, SalesReportSwitcher, EmptyState } from "../components";
import { accountingService } from "../services/accountingService";
import { Payment } from "../types/accountingTypes";

type Tab = "monthly" | "customers";

const formatCurrency = (value: number) =>
  `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const getMonthYear = (dateStr: string) => {
  const date = new Date(dateStr);
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear().toString().slice(-2);
  return `${month} ${year}`;
};

export default function PaymentsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("monthly");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const result = await accountingService.getPayments();
      setPayments(result.data ?? []);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadPayments();
    }, [loadPayments])
  );

  const monthlyData = useMemo(() => {
    const grouped = new Map<string, { label: string; amount: number }>();
    payments.forEach(p => {
      const monthYear = p.createdAt ? getMonthYear(p.createdAt) : "Unknown";
      const current = grouped.get(monthYear) || { label: monthYear, amount: 0 };
      current.amount += Number(p.amount || 0);
      grouped.set(monthYear, current);
    });
    return Array.from(grouped.values());
  }, [payments]);

  const customerData = useMemo(() => {
    const grouped = new Map<string, { name: string; amount: number }>();
    payments.forEach(p => {
      const name = p.userId ? `User ${p.userId}` : "Unknown Customer";
      const current = grouped.get(name) || { name: name, amount: 0 };
      current.amount += Number(p.amount || 0);
      grouped.set(name, current);
    });
    return Array.from(grouped.values()).sort((a, b) => b.amount - a.amount);
  }, [payments]);

  const totalAmount = useMemo(() => {
    return payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [payments]);

  const renderList = () => {
    if (loading) return null;

    if (activeTab === "monthly") {
      if (monthlyData.length === 0) {
        return (
          <EmptyState
            icon="calendar-outline"
            title="No monthly payments"
            description="When API is connected, monthly payment records will appear here."
          />
        );
      }
      return monthlyData.map((item, index) => (
        <Pressable 
          key={item.label} 
          style={[styles.row, index === 0 && styles.firstRow]}
          onPress={() => router.push(`/accounting/payment-monthly-detail?month=${encodeURIComponent(item.label)}`)}
        >
          <Text style={styles.rowTitle}>{item.label}</Text>
          <Text style={styles.rowAmount}>{formatCurrency(item.amount)}</Text>
        </Pressable>
      ));
    }
    
    if (activeTab === "customers") {
      if (customerData.length === 0) {
        return (
          <EmptyState
            icon="people-outline"
            title="No customer payments"
            description="When API is connected, customer payment records will appear here."
          />
        );
      }
      return customerData.map((item, index) => (
        <Pressable 
          key={item.name} 
          style={[styles.row, index === 0 && styles.firstRow]}
          onPress={() => router.push(`/accounting/payment-customer-detail?name=${encodeURIComponent(item.name)}`)}
        >
          <Text style={styles.rowTitle}>{item.name}</Text>
          <Text style={styles.rowAmount}>{formatCurrency(item.amount)}</Text>
        </Pressable>
      ));
    }
  };

  return (
    <View style={styles.screen}>
      <AccountingHeader
        title="Payment"
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
            <Text style={styles.headerMeta}>Total Payment</Text>
          </View>
        }
      />

      <View style={styles.mainContainer}>
        <View style={styles.topWhiteSection}>
          <View style={styles.switcherWrap}>
            <SalesReportSwitcher
              active={activeTab}
              onMonthlyPress={() => setActiveTab("monthly")}
              onCustomersPress={() => setActiveTab("customers")}
            />
          </View>

          <View style={styles.yearRow}>
            <View style={styles.yearLeft}>
              <Ionicons name="calendar-outline" size={16} color="#2563EB" />
              <Text style={styles.yearText}>
                Financial Year <Text style={styles.yearTextLight}>(1 Apr 24 to 31 Mar 25)</Text>
              </Text>
            </View>
            <Pressable>
              <Text style={styles.changeText}>Change</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          <View style={styles.listContainer}>
            {renderList()}
          </View>
        </ScrollView>
        
        <Pressable 
          style={styles.fab}
          onPress={() => router.push("/accounting/payment-create")}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </Pressable>
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  switcherWrap: {
    marginBottom: 16,
  },
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },
  yearLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  yearText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "700",
  },
  yearTextLight: {
    fontWeight: "400",
    color: "#64748B",
  },
  changeText: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600",
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
    fontWeight: "500",
    color: "#334155",
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#347BE5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 2,
    borderColor: '#EAF2FF',
  },
});
