import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle, G } from "react-native-svg";
import { useRouter } from "expo-router";
import { BottomNav, AccountingHeader } from "../components";
import { accountingTheme } from "../../../theme/accounting";

const { width } = Dimensions.get("window");

const format = (value: number) =>
  `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function ExpenseReportScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<"all" | "paid" | "unpaid">("all");
  const [timeFilter, setTimeFilter] = useState("1M");
  
  // Modal states
  const [showSortModal, setShowSortModal] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [sortBy, setSortBy] = useState("");

  // Dummy data removed, initialized empty
  const [expenseData, setExpenseData] = useState<any[]>([]);

  const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);

  // SVG Donut chart properties
  const size = 200;
  const strokeWidth = 25;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Expenses"
        showBackButton
        rightContent={
          <View style={styles.headerIcons}>
            <Pressable onPress={() => setShowSortModal(true)}>
              <Ionicons name="filter-outline" size={20} color={accountingTheme.colors.card} />
            </Pressable>
            <Ionicons name="settings-outline" size={20} color={accountingTheme.colors.card} />
            <Pressable onPress={() => setShowMoreModal(true)}>
              <Ionicons name="ellipsis-horizontal" size={20} color={accountingTheme.colors.card} />
            </Pressable>
          </View>
        }
        headerContent={
          <View style={styles.tabsContainer}>
            <Pressable
              style={[styles.tabBtn, tab === "all" && styles.tabBtnActive]}
              onPress={() => setTab("all")}
            >
              <Text style={[styles.tabText, tab === "all" && styles.tabTextActive]}>All</Text>
            </Pressable>
            <Pressable
              style={[styles.tabBtn, tab === "paid" && styles.tabBtnActive]}
              onPress={() => setTab("paid")}
            >
              <Text style={[styles.tabText, tab === "paid" && styles.tabTextActive]}>Paid</Text>
            </Pressable>
            <Pressable
              style={[styles.tabBtn, tab === "unpaid" && styles.tabBtnActive]}
              onPress={() => setTab("unpaid")}
            >
              <Text style={[styles.tabText, tab === "unpaid" && styles.tabTextActive]}>Unpaid</Text>
            </Pressable>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Time Filters */}
        <View style={styles.timeFilterWrap}>
          <View style={styles.timeFilterContainer}>
            {["1D", "1M", "1Y", "ALL TIME"].map((tf) => (
              <Pressable
                key={tf}
                style={[styles.timeFilterBtn, timeFilter === tf && styles.timeFilterBtnActive]}
                onPress={() => setTimeFilter(tf)}
              >
                <Text style={[styles.timeFilterText, timeFilter === tf && styles.timeFilterTextActive]}>
                  {tf}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Donut Chart */}
        <View style={styles.chartContainer}>
          <Svg width={size} height={size}>
            <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
              {expenseData.map((item) => {
                const strokeDashoffset = currentOffset;
                const strokeDasharray = `${(item.amount / totalExpense) * circumference} ${circumference}`;
                currentOffset -= (item.amount / totalExpense) * circumference;
                
                // Add a small gap between segments
                const gap = 4;
                const segmentLength = Math.max(0, ((item.amount / totalExpense) * circumference) - gap);
                const actualDasharray = `${segmentLength} ${circumference}`;

                return (
                  <Circle
                    key={item.id}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={actualDasharray}
                    strokeDashoffset={strokeDashoffset}
                    fill="transparent"
                  />
                );
              })}
            </G>
          </Svg>
          
          <View style={styles.chartCenterContent}>
            <Text style={styles.chartCenterLabel}>LAST 1 MONTHS</Text>
            <Text style={styles.chartCenterLabel}>TOTAL EXPENSES</Text>
            <Text style={styles.chartCenterAmount}>{format(totalExpense)}</Text>
          </View>
        </View>

        {/* List of Categories */}
        <View style={styles.listContainer}>
          {expenseData.map((item) => (
            <View key={item.id} style={styles.listItem}>
              <View style={[styles.listAvatar, { backgroundColor: item.color }]}>
                <Text style={styles.listAvatarText}>{item.initial}</Text>
              </View>
              <Text style={styles.listLabel}>{item.label}</Text>
              <Text style={styles.listAmount}>{format(item.amount)}</Text>
            </View>
          ))}
          {expenseData.length === 0 && (
            <Text style={styles.emptyText}>No expenses to show</Text>
          )}
        </View>
      </ScrollView>
      
      <BottomNav activeRoute="/accounting/reports" />

      {/* Sort By Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowSortModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Sort by</Text>
              <Pressable onPress={() => setSortBy("")}>
                <Text style={styles.resetText}>Reset</Text>
              </Pressable>
            </View>

            <View style={styles.sheetOptions}>
              {["Amount (High-Low)", "Amount (Low-High)", "By Name (A-Z)", "By Name (Z-A)"].map((option) => (
                <Pressable
                  key={option}
                  style={[styles.sortOptionRow, sortBy === option && styles.sortOptionRowActive]}
                  onPress={() => {
                    setSortBy(option);
                    setShowSortModal(false);
                  }}
                >
                  <Text style={[styles.sortOptionText, sortBy === option && styles.sortOptionTextActive]}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* More Options Modal */}
      <Modal
        visible={showMoreModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoreModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowMoreModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>

            <View style={styles.sheetOptions}>
              <Pressable style={styles.optionRow} onPress={() => setShowMoreModal(false)}>
                <Ionicons name="download-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Import Expenses</Text>
              </Pressable>
              
              <Pressable style={styles.optionRow} onPress={() => setShowMoreModal(false)}>
                <Ionicons name="camera-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Import Report(JPG, JPEG, PNG)</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={() => setShowMoreModal(false)}>
                <Ionicons name="document-text-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Download(Excel)</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={() => setShowMoreModal(false)}>
                <Ionicons name="document-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Download(PDF)</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={() => setShowMoreModal(false)}>
                <Ionicons name="grid-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Download(CSV)</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.lg,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: accountingTheme.colors.card,
    borderRadius: 24,
    marginTop: accountingTheme.spacing.xl,
    padding: accountingTheme.spacing.xs,
    width: "100%",
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  tabBtnActive: {
    backgroundColor: accountingTheme.colors.card,
    shadowColor: accountingTheme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5EAF3",
  },
  tabText: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: accountingTheme.colors.textSecondary,
  },
  tabTextActive: {
    color: "#3B82F6",
  },
  content: {
    paddingBottom: 100,
  },
  timeFilterWrap: {
    alignItems: "center",
    marginTop: accountingTheme.spacing.xxl,
  },
  timeFilterContainer: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    padding: accountingTheme.spacing.xs,
  },
  timeFilterBtn: {
    paddingVertical: accountingTheme.spacing.sm,
    paddingHorizontal: accountingTheme.spacing.lg,
    borderRadius: 20,
  },
  timeFilterBtnActive: {
    backgroundColor: accountingTheme.colors.card,
    shadowColor: accountingTheme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeFilterText: {
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.textSecondary,
  },
  timeFilterTextActive: {
    color: "#3B82F6",
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    marginBottom: 32,
    position: "relative",
  },
  chartCenterContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  chartCenterLabel: {
    fontSize: 9,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.textSecondary,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  chartCenterAmount: {
    fontSize: 22,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: "#1E293B",
    marginTop: accountingTheme.spacing.xs,
  },
  listContainer: {
    paddingHorizontal: accountingTheme.spacing.lg,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.borderLight,
  },
  listAvatar: {
    width: 32,
    height: 32,
    borderRadius: accountingTheme.radius.xxl,
    alignItems: "center",
    justifyContent: "center",
    marginRight: accountingTheme.spacing.md,
  },
  listAvatarText: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  listLabel: {
    flex: 1,
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.medium,
    color: "#334155",
  },
  listAmount: {
    fontSize: 15,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  emptyText: {
    textAlign: "center",
    marginTop: accountingTheme.spacing.xxl,
    color: accountingTheme.colors.textSecondary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalDismiss: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: accountingTheme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  sheetHandleWrap: {
    alignItems: "center",
    paddingVertical: accountingTheme.spacing.md,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: accountingTheme.colors.borderMedium,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: accountingTheme.spacing.xxl,
    paddingBottom: accountingTheme.spacing.lg,
  },
  sheetTitle: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#1E293B",
  },
  resetText: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#3B82F6",
  },
  sheetOptions: {
    marginTop: accountingTheme.spacing.sm,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: accountingTheme.spacing.lg,
    paddingHorizontal: accountingTheme.spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: "#E5EAF3",
  },
  optionIcon: {
    marginRight: accountingTheme.spacing.md,
  },
  optionText: {
    fontSize: accountingTheme.fontSizes.lg,
    color: "#475569",
    fontWeight: accountingTheme.fontWeights.medium,
  },
  sortOptionRow: {
    paddingVertical: accountingTheme.spacing.lg,
    paddingHorizontal: accountingTheme.spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.borderLight,
  },
  sortOptionRowActive: {
    backgroundColor: accountingTheme.colors.borderLight,
  },
  sortOptionText: {
    fontSize: accountingTheme.fontSizes.lg,
    color: "#475569",
  },
  sortOptionTextActive: {
    color: accountingTheme.colors.text,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
});
