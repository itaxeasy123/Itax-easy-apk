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
import { BillPayable } from "../types/accountingTypes";

const formatCurrency = (value: number) =>
  `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function PayableDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [bills, setBills] = useState<BillPayable[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBills = useCallback(async () => {
    try {
      setLoading(true);
      const result = await accountingService.getAllBillPayables();
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

  const supplierBills = useMemo(() => {
    if (!name) return [];
    return bills.filter(b => b.supplierName === name);
  }, [bills, name]);

  const totalAmount = useMemo(() => {
    return supplierBills.reduce((sum, bill) => sum + Number(bill.billAmount || 0), 0);
  }, [supplierBills]);

  const avatarLetter = name ? name.charAt(0).toUpperCase() : "M";

  const renderList = () => {
    if (loading) return null;
    if (supplierBills.length === 0) {
      return (
        <EmptyState
          icon="document-text-outline"
          title="No bills found"
          description={`No bills found for ${name || 'this supplier'}.`}
        />
      );
    }
    
    return supplierBills.map((item, index) => (
      <View key={item.id} style={[styles.row, index === 0 && styles.firstRow]}>
        <View style={styles.billInfo}>
          <Text style={styles.billNumber}>#{item.billNumber}</Text>
          <Text style={styles.billDate}>Due: {item.dueDate || "N/A"}</Text>
        </View>
        <View style={styles.billRight}>
          <Text style={styles.billAmount}>{formatCurrency(Number(item.billAmount))}</Text>
          <View style={styles.billIcons}>
            <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
            <Ionicons name="document-text" size={16} color="#DC2626" />
          </View>
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.screen}>
      <AccountingHeader
        title="Payables"
        showBackButton
        rightContent={
          <View style={styles.headerRightIcons}>
            <Ionicons name="search" size={20} color="#fff" />
            <Ionicons name="filter" size={20} color="#fff" />
          </View>
        }
        headerContent={
          <View style={styles.profileBlock}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{name || "Unknown Supplier"}</Text>
              <Text style={styles.profileAmount}>{formatCurrency(totalAmount)}</Text>
            </View>
          </View>
        }
      >
        <View style={styles.actionBar}>
          <Pressable style={styles.actionItem}>
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={styles.actionText}>WhatsApp</Text>
          </Pressable>
          <Pressable style={styles.actionItem}>
            <Ionicons name="call-outline" size={20} color="#fff" />
            <Text style={styles.actionText}>Call</Text>
          </Pressable>
          <Pressable style={styles.actionItem}>
            <Ionicons name="mail-outline" size={20} color="#fff" />
            <Text style={styles.actionText}>Email</Text>
          </Pressable>
          <Pressable style={styles.actionItem}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
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
    backgroundColor: "#FFFFFF",
  },
  headerRightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profileBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  profileAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 2,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginTop: 10,
    paddingBottom: 10,
  },
  actionItem: {
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "500",
  },
  mainContainer: {
    flex: 1,
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
  billInfo: {
    flex: 1,
  },
  billNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  billDate: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },
  billRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  billAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  billIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
