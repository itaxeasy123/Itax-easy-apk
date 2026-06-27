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
import { accountingTheme } from "../../../theme/accounting";

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
          onPress={() => router.navigate(`/accounting/receivable-detail?name=${encodeURIComponent(item.name)}`)}
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
            <Ionicons name="search" size={20} color={accountingTheme.colors.card} />
            <Ionicons name="filter" size={20} color={accountingTheme.colors.card} />
            <Ionicons name="ellipsis-horizontal" size={20} color={accountingTheme.colors.card} />
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
    gap: accountingTheme.spacing.lg,
  },
  headerBlock: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: accountingTheme.spacing.xl,
  },
  headerAmount: {
    fontSize: 28,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.card,
  },
  headerMeta: {
    marginTop: accountingTheme.spacing.xs,
    fontSize: accountingTheme.fontSizes.sm,
    color: "#EAFDFC",
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  mainContainer: {
    flex: 1,
    marginTop: -8,
  },
  topWhiteSection: {
    backgroundColor: accountingTheme.colors.card,
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: accountingTheme.spacing.lg,
    paddingBottom: accountingTheme.spacing.sm,
    borderTopLeftRadius: accountingTheme.radius.xxl,
    borderTopRightRadius: accountingTheme.radius.xxl,
  },
  switcherWrap: {
    marginBottom: accountingTheme.spacing.sm,
  },
  listContent: {
    paddingBottom: 110,
  },
  listContainer: {
    backgroundColor: accountingTheme.colors.card,
    minHeight: 400,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: accountingTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: accountingTheme.colors.surfaceLight,
  },
  firstRow: {
    borderTopWidth: 0,
  },
  rowTitle: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#334155",
  },
  rowSubtitle: {
    fontSize: 11,
    color: accountingTheme.colors.textSecondary,
    marginTop: accountingTheme.spacing.xs,
  },
  rowAmount: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  switcherContainer: {
    flexDirection: "row",
    gap: 10,
  },
  tab: {
    flex: 1,
    backgroundColor: accountingTheme.colors.surfaceLight,
    borderRadius: accountingTheme.radius.full,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: accountingTheme.colors.borderMedium,
  },
  tabActive: {
    backgroundColor: accountingTheme.colors.card,
    borderColor: accountingTheme.colors.primary,
  },
  tabLabel: {
    color: accountingTheme.colors.textSecondary,
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  tabLabelActive: {
    color: accountingTheme.colors.primary,
  },
});
