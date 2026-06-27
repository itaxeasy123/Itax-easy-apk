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
import { BillPayable } from "../types/accountingTypes";
import { accountingTheme } from "../../../theme/accounting";

const formatCurrency = (value: number) =>
  `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function BillPayableScreen() {
  const router = useRouter();
  const [bills, setBills] = useState<BillPayable[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBills = useCallback(async () => {
    try {
      setLoading(true);
      const result = await accountingService.getAllBillPayables();
      setBills(result.data ?? []);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadBills();
    }, [loadBills])
  );

  const supplierData = useMemo(() => {
    const grouped = new Map<string, { name: string; amount: number; count: number }>();
    bills.forEach(b => {
      const current = grouped.get(b.supplierName) || { name: b.supplierName, amount: 0, count: 0 };
      current.amount += Number(b.billAmount || 0);
      current.count += 1;
      grouped.set(b.supplierName, current);
    });
    return Array.from(grouped.values()).sort((a, b) => b.amount - a.amount);
  }, [bills]);

  const totalAmount = useMemo(() => supplierData.reduce((sum, item) => sum + item.amount, 0), [supplierData]);

  const renderList = () => {
    if (loading) return null;
    if (supplierData.length === 0) {
      return (
        <EmptyState
          icon="wallet-outline"
          title="No payables found"
          description="When API is connected, supplier balances will appear here."
        />
      );
    }
    
    return supplierData.map((item, index) => (
      <Pressable 
        key={item.name} 
        style={[styles.row, index === 0 && styles.firstRow]}
        onPress={() => router.navigate(`/accounting/payable-detail?name=${encodeURIComponent(item.name)}`)}
      >
        <View>
          <Text style={styles.rowTitle}>{item.name}</Text>
          <Text style={styles.rowSubtitle}>{item.count} Bills</Text>
        </View>
        <Text style={styles.rowAmount}>{formatCurrency(item.amount)}</Text>
      </Pressable>
    ));
  };

  return (
    <View style={styles.screen}>
      <AccountingHeader
        title="Payables"
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
        <View style={styles.topWhiteSection} />
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
    paddingTop: accountingTheme.spacing.lg,
    borderTopLeftRadius: accountingTheme.radius.xxl,
    borderTopRightRadius: accountingTheme.radius.xxl,
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
});
