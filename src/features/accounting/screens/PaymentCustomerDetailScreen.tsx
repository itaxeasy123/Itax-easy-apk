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

const formatCurrency = (value: number) =>
  `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear().toString().slice(-2);
  return `${day} ${month}'${year}`;
};

export default function PaymentCustomerDetailScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
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

  const customerPayments = useMemo(() => {
    if (!name) return [];
    return payments.filter(p => {
      const pName = p.userId ? `User ${p.userId}` : "Unknown Customer";
      return pName === name;
    });
  }, [payments, name]);

  const totalAmount = useMemo(() => {
    return customerPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [customerPayments]);

  const renderList = () => {
    if (loading) return null;
    if (customerPayments.length === 0) {
      return (
        <EmptyState
          icon="document-text-outline"
          title="No payments found"
          description={`No payments found for ${name || 'this customer'}.`}
        />
      );
    }
    
    return customerPayments.map((item, index) => (
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
        title={name || "Customer"}
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
  paymentInfo: {
    flex: 1,
    gap: 4,
  },
  paymentHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  paymentNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  badge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#64748B",
  },
  paymentDate: {
    fontSize: 12,
    color: "#64748B",
  },
  paymentRight: {
    alignItems: "flex-end",
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
});
