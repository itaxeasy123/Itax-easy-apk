import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { AccountingHeader, BottomNav, EmptyState } from "../components";
import { accountingService } from "../services/accountingService";
import { BillReceivable } from "../types/accountingTypes";
import { accountingTheme } from "../../../theme/accounting";

const formatCurrency = (value: number) =>
  `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function ReceivableDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [bills, setBills] = useState<BillReceivable[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBills = useCallback(async () => {
    try {
      setLoading(true);
      const result = await accountingService.getAllBillReceivables();
      setBills(result.data ?? []);
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadBills();
    }, [loadBills])
  );

  const customerInvoices = useMemo(() => {
    if (!name) return [];
    return bills.filter(b => b.customerName === name);
  }, [bills, name]);

  const totalAmount = useMemo(() => {
    return customerInvoices.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
  }, [customerInvoices]);

  const avatarLetter = name ? name.charAt(0).toUpperCase() : "M";

  const renderList = () => {
    if (loading) return null;
    if (customerInvoices.length === 0) {
      return (
        <EmptyState
          icon="document-text-outline"
          title="No invoices found"
          description={`No invoices found for ${name || 'this customer'}.`}
        />
      );
    }
    
    return customerInvoices.map((item, index) => (
      <View key={item.id} style={[styles.row, index === 0 && styles.firstRow]}>
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceNumber}>#{item.billNumber}</Text>
          <Text style={styles.invoiceDate}>Due: {item.dueDate || "N/A"}</Text>
        </View>
        <View style={styles.invoiceRight}>
          <Text style={styles.invoiceAmount}>{formatCurrency(Number(item.amount))}</Text>
          <View style={styles.invoiceIcons}>
            <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
            <Ionicons name="document-text" size={16} color={accountingTheme.colors.error} />
          </View>
        </View>
      </View>
    ));
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
          </View>
        }
        headerContent={
          <View style={styles.profileBlock}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{name || "Unknown Customer"}</Text>
              <Text style={styles.profileAmount}>{formatCurrency(totalAmount)}</Text>
            </View>
          </View>
        }
      >
        <View style={styles.actionBar}>
          <Pressable style={styles.actionItem}>
            <Ionicons name="logo-whatsapp" size={20} color={accountingTheme.colors.card} />
            <Text style={styles.actionText}>WhatsApp</Text>
          </Pressable>
          <Pressable style={styles.actionItem}>
            <Ionicons name="call-outline" size={20} color={accountingTheme.colors.card} />
            <Text style={styles.actionText}>Call</Text>
          </Pressable>
          <Pressable style={styles.actionItem}>
            <Ionicons name="mail-outline" size={20} color={accountingTheme.colors.card} />
            <Text style={styles.actionText}>Email</Text>
          </Pressable>
          <Pressable style={styles.actionItem}>
            <Ionicons name="ellipsis-horizontal" size={20} color={accountingTheme.colors.card} />
            <Text style={styles.actionText}>More</Text>
          </Pressable>
        </View>
      </AccountingHeader>

      <View style={styles.mainContainer}>
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
    backgroundColor: accountingTheme.colors.card,
  },
  headerRightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.lg,
  },
  profileBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.md,
    marginTop: 10,
    marginBottom: accountingTheme.spacing.xl,
    paddingHorizontal: accountingTheme.spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: accountingTheme.colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: accountingTheme.fontSizes.xxxl,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.text,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: accountingTheme.fontSizes.xl,
    color: accountingTheme.colors.card,
    fontWeight: accountingTheme.fontWeights.medium,
  },
  profileAmount: {
    fontSize: accountingTheme.fontSizes.xxxl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.card,
    marginTop: 2,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: accountingTheme.spacing.sm,
    marginTop: 10,
    paddingBottom: 10,
  },
  actionItem: {
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    color: accountingTheme.colors.card,
    fontSize: 11,
    fontWeight: accountingTheme.fontWeights.medium,
  },
  mainContainer: {
    flex: 1,
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
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#334155",
  },
  invoiceDate: {
    fontSize: 11,
    color: accountingTheme.colors.textSecondary,
    marginTop: accountingTheme.spacing.xs,
  },
  invoiceRight: {
    alignItems: "flex-end",
    gap: accountingTheme.spacing.sm,
  },
  invoiceAmount: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  invoiceIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.md,
  },
});
