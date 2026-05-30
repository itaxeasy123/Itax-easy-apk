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
import { accountingTheme } from "../../../theme/accounting";

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
            <Ionicons name="search" size={20} color={accountingTheme.colors.card} />
            <Ionicons name="filter" size={20} color={accountingTheme.colors.card} />
            <Ionicons name="ellipsis-horizontal" size={20} color={accountingTheme.colors.card} />
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
    backgroundColor: "#F3F4F6", // Gray background at the very bottom/behind
  },
  headerRightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.lg,
  },
  headerBlock: {
    alignItems: "center",
    marginTop: accountingTheme.spacing.xs,
    marginBottom: accountingTheme.spacing.md,
  },
  headerAmount: {
    fontSize: accountingTheme.fontSizes.xxxl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.card,
  },
  headerMeta: {
    marginTop: 2,
    fontSize: 11,
    color: "#EAFDFC",
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  mainContainer: {
    flex: 1,
    marginTop: -8, // Slight overlap with header
  },
  topWhiteSection: {
    backgroundColor: accountingTheme.colors.card,
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: accountingTheme.spacing.lg,
  },
  switcherWrap: {
    marginBottom: accountingTheme.spacing.md,
  },
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: accountingTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.surfaceLight,
  },
  yearLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.xs,
    flex: 1,
  },
  yearText: {
    fontSize: 11,
    color: "#334155",
    fontWeight: accountingTheme.fontWeights.bold,
  },
  yearTextLight: {
    fontWeight: accountingTheme.fontWeights.regular,
    color: accountingTheme.colors.textSecondary,
  },
  changeText: {
    fontSize: 11,
    color: accountingTheme.colors.primary,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  listContent: {
    paddingBottom: 110,
  },
  listContainer: {
    backgroundColor: accountingTheme.colors.card,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: accountingTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: accountingTheme.colors.surfaceLight,
  },
  firstRow: {
    borderTopWidth: 0,
  },
  rowTitle: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.medium,
    color: "#334155",
  },
  rowAmount: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#FEF9C3",
    alignItems: "center",
    justifyContent: "center",
  },
});
