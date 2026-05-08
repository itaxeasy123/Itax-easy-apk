import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AccountingHeader, BottomNav, SalesReportSwitcher, EmptyState } from "../components";

type Tab = "monthly" | "customers" | "item";

// Real data will be fetched from API later
const MONTHLY_DATA: any[] = [];
const CUSTOMERS_DATA: any[] = [];
const ITEMS_DATA: any[] = [];

const formatCurrency = (value: number) =>
  `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function DebitNoteReportScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("monthly");

  const renderList = () => {
    if (activeTab === "monthly") {
      if (MONTHLY_DATA.length === 0) {
        return (
          <EmptyState
            icon="calendar-outline"
            title="No monthly data"
            description="Monthly debit note reports will appear here once API is connected."
          />
        );
      }
      return MONTHLY_DATA.map((item, index) => (
        <View key={item.id} style={[styles.row, index === 0 && styles.firstRow]}>
          <Text style={styles.rowTitle}>{item.label}</Text>
          <Text style={styles.rowAmount}>{formatCurrency(item.amount)}</Text>
        </View>
      ));
    }

    if (activeTab === "customers") {
      if (CUSTOMERS_DATA.length === 0) {
        return (
          <EmptyState
            icon="people-outline"
            title="No customer data"
            description="Customer-wise debit note reports will appear here once API is connected."
          />
        );
      }
      return CUSTOMERS_DATA.map((item, index) => (
        <View key={item.id} style={[styles.row, index === 0 && styles.firstRow]}>
          <Text style={styles.rowTitle}>{item.name}</Text>
          <Text style={styles.rowAmount}>{formatCurrency(item.amount)}</Text>
        </View>
      ));
    }

    if (activeTab === "item") {
      if (ITEMS_DATA.length === 0) {
        return (
          <EmptyState
            icon="cube-outline"
            title="No item data"
            description="Item-wise debit note reports will appear here once API is connected."
          />
        );
      }
      return ITEMS_DATA.map((item, index) => (
        <View key={item.id} style={[styles.row, index === 0 && styles.firstRow]}>
          <View style={styles.itemLeft}>
            <View style={styles.itemIconWrap}>
              <Ionicons name="cube" size={16} color="#EAB308" />
            </View>
            <Text style={styles.rowTitle}>{item.name}</Text>
          </View>
          <Text style={styles.rowAmount}>{formatCurrency(item.amount)}</Text>
        </View>
      ));
    }
  };

  return (
    <View style={styles.screen}>
      <AccountingHeader
        title="Debit Note"
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
            <Text style={styles.headerAmount}>₹ 0</Text>
            <Text style={styles.headerMeta}>Total Sales</Text>
          </View>
        }
      />

      <View style={styles.mainContainer}>
        <View style={styles.topWhiteSection}>
          <View style={styles.switcherWrap}>
            <SalesReportSwitcher
              active={activeTab as any}
              onMonthlyPress={() => setActiveTab("monthly")}
              onCustomersPress={() => setActiveTab("customers")}
              thirdLabel="Item Wise"
              onThirdPress={() => setActiveTab("item")}
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
      </View>

      <BottomNav activeRoute="/accounting" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6", // Gray background at the very bottom/behind
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
    marginTop: -8, // Slight overlap with header
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
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#FEF9C3",
    alignItems: "center",
    justifyContent: "center",
  },
});
