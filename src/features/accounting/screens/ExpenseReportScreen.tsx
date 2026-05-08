import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle, G } from "react-native-svg";
import { useRouter } from "expo-router";
import { BottomNav, AccountingHeader } from "../components";

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
              <Ionicons name="filter-outline" size={20} color="#FFFFFF" />
            </Pressable>
            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
            <Pressable onPress={() => setShowMoreModal(true)}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
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
    gap: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginTop: 20,
    padding: 4,
    width: "100%",
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  tabBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5EAF3",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#3B82F6",
  },
  content: {
    paddingBottom: 100,
  },
  timeFilterWrap: {
    alignItems: "center",
    marginTop: 24,
  },
  timeFilterContainer: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    padding: 4,
  },
  timeFilterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  timeFilterBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeFilterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
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
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  chartCenterAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  listAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  listAvatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  listLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },
  listAmount: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
    color: "#64748B",
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
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  sheetHandleWrap: {
    alignItems: "center",
    paddingVertical: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  resetText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  sheetOptions: {
    marginTop: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5EAF3",
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
  sortOptionRow: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  sortOptionRowActive: {
    backgroundColor: "#F1F5F9",
  },
  sortOptionText: {
    fontSize: 14,
    color: "#475569",
  },
  sortOptionTextActive: {
    color: "#0F172A",
    fontWeight: "600",
  },
});
