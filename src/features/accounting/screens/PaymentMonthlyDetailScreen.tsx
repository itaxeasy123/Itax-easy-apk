import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { AccountingHeader, BottomNav, EmptyState } from "../components";
import { accountingService } from "../services/accountingService";
import { Payment } from "../types/accountingTypes";
import { accountingTheme } from "../../../theme/accounting";

const formatCurrency = (value: number) =>
  `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const getMonthYear = (dateStr: string) => {
  const date = new Date(dateStr);
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear().toString().slice(-2);
  return `${month} ${year}`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear().toString().slice(-2);
  return `${day} ${month}'${year}`;
};

export default function PaymentMonthlyDetailScreen() {
  const router = useRouter();
  const { month } = useLocalSearchParams<{ month: string }>();
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

  const monthlyPayments = useMemo(() => {
    if (!month) return [];
    return payments.filter(p => p.createdAt && getMonthYear(p.createdAt) === month);
  }, [payments, month]);

  const totalAmount = useMemo(() => {
    return monthlyPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [monthlyPayments]);

  const renderList = () => {
    if (loading) return null;
    if (monthlyPayments.length === 0) {
      return (
        <EmptyState
          icon="document-text-outline"
          title="No payments found"
          description={`No payments found for ${month || 'this month'}.`}
        />
      );
    }
    
    return monthlyPayments.map((item, index) => (
      <View key={item.id} style={[styles.row, index === 0 && styles.firstRow]}>
        <View style={styles.paymentInfo}>
          <View style={styles.paymentHeaderRow}>
            <Text style={styles.paymentNumber}>#{index + 1}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.status === 'captured' ? 'Paid' : 'Unpaid'}</Text>
            </View>
          </View>
          <Text style={styles.paymentDate}>{item.createdAt ? formatDate(item.createdAt) : "Unknown Date"}</Text>
        </View>
        <View style={styles.paymentRight}>
          <Text style={styles.paymentAmount}>{formatCurrency(Number(item.amount))}</Text>
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.screen}>
      <AccountingHeader
        title={`Payment (${month || ''})`}
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
            <Text style={styles.headerMeta}>Total Payment</Text>
          </View>
        }
      />

      <View style={styles.mainContainer}>
        <View style={styles.topWhiteSection}>
          <View style={styles.yearRow}>
            <View style={styles.yearLeft}>
              <Ionicons name="calendar-outline" size={16} color={accountingTheme.colors.primary} />
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
    borderTopLeftRadius: accountingTheme.radius.xxl,
    borderTopRightRadius: accountingTheme.radius.xxl,
  },
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: accountingTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.surfaceLight,
  },
  yearLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  yearText: {
    fontSize: accountingTheme.fontSizes.md,
    color: "#334155",
    fontWeight: accountingTheme.fontWeights.bold,
  },
  yearTextLight: {
    fontWeight: accountingTheme.fontWeights.regular,
    color: accountingTheme.colors.textSecondary,
  },
  changeText: {
    fontSize: accountingTheme.fontSizes.md,
    color: accountingTheme.colors.primary,
    fontWeight: accountingTheme.fontWeights.semiBold,
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
  paymentInfo: {
    flex: 1,
    gap: accountingTheme.spacing.xs,
  },
  paymentHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.sm,
  },
  paymentNumber: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#334155",
  },
  badge: {
    backgroundColor: accountingTheme.colors.borderLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: accountingTheme.fontSizes.xs,
    fontWeight: accountingTheme.fontWeights.medium,
    color: accountingTheme.colors.textSecondary,
  },
  paymentDate: {
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.textSecondary,
  },
  paymentRight: {
    alignItems: "flex-end",
  },
  paymentAmount: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
});
