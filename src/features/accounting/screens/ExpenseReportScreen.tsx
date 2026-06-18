import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle, G } from "react-native-svg";
import { BottomNav, AccountingHeader, FiscalYearBar, Loading, EmptyState } from "../components";
import { billshieldUiService, FiscalYearInfo } from "../services/billshieldUiService";
import { exportCsv, exportExcel, exportPdf, buildPdfHtml } from "../utils/exportFile";
import { accountingTheme } from "../../../theme/accounting";

const format = (value: number) =>
  `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const PALETTE = [
  "#3B82F6",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
  "#84CC16",
];

interface ExpenseRow {
  id: string;
  label: string;
  group: string;
  amount: number;
  color: string;
  initial: string;
}

export default function ExpenseReportScreen() {
  // Modal states
  const [showSortModal, setShowSortModal] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [sortBy, setSortBy] = useState("");

  const [fy, setFy] = useState<FiscalYearInfo | null>(null);
  const [expenseData, setExpenseData] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (selected: FiscalYearInfo) => {
    setLoading(true);
    setError(null);
    const result = await billshieldUiService.getTrialBalance(selected.endDate);
    if (!result.success) {
      setError(result.message ?? "Unable to load expenses.");
      setExpenseData([]);
      setLoading(false);
      return;
    }
    const rows = result.data.ledgers
      .filter((l) => l.nature === "EXPENSE" && l.debit > 0)
      .map((l, i) => ({
        id: l.ledgerId,
        label: l.ledgerName,
        group: l.groupName,
        amount: l.debit,
        color: PALETTE[i % PALETTE.length],
        initial: (l.ledgerName.trim()[0] ?? "?").toUpperCase(),
      }));
    setExpenseData(rows);
    setLoading(false);
  }, []);

  const onFyChange = useCallback(
    (selected: FiscalYearInfo) => {
      setFy(selected);
      load(selected);
    },
    [load]
  );

  const sortedData = useMemo(() => {
    const rows = [...expenseData];
    switch (sortBy) {
      case "Amount (High-Low)":
        return rows.sort((a, b) => b.amount - a.amount);
      case "Amount (Low-High)":
        return rows.sort((a, b) => a.amount - b.amount);
      case "By Name (A-Z)":
        return rows.sort((a, b) => a.label.localeCompare(b.label));
      case "By Name (Z-A)":
        return rows.sort((a, b) => b.label.localeCompare(a.label));
      default:
        return rows;
    }
  }, [expenseData, sortBy]);

  const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);

  const exportRows = (): (string | number)[][] => [
    ["Expense Ledger", "Group", "Amount"],
    ...sortedData.map((r) => [r.label, r.group, r.amount]),
  ];

  const exportSubtitle = fy ? `Financial Year: ${fy.label}` : "";

  const handleExport = async (kind: "csv" | "excel" | "pdf") => {
    setShowMoreModal(false);
    const rows = exportRows();
    if (kind === "csv") await exportCsv("expense-report", rows);
    else if (kind === "excel") await exportExcel("expense-report", "Expense Report", rows);
    else await exportPdf("expense-report", buildPdfHtml("Expense Report", exportSubtitle, rows));
  };

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
            <Pressable onPress={() => setShowMoreModal(true)}>
              <Ionicons name="ellipsis-horizontal" size={20} color={accountingTheme.colors.card} />
            </Pressable>
          </View>
        }
      />

      <FiscalYearBar onChange={onFyChange} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Loading text="Loading expenses..." style={styles.loadingWrap} />
        ) : error ? (
          <EmptyState
            icon="alert-circle-outline"
            title="Unable to load expenses"
            description={error}
            actionText="Retry"
            onAction={() => fy && load(fy)}
          />
        ) : expenseData.length === 0 ? (
          <EmptyState
            icon="wallet-outline"
            title="No expenses to show"
            description="No expense ledgers have a debit balance for this financial year."
          />
        ) : (
          <>
            {/* Donut Chart */}
            <View style={styles.chartContainer}>
              <Svg width={size} height={size}>
                <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                  {totalExpense > 0 &&
                    sortedData.map((item) => {
                      const strokeDashoffset = currentOffset;
                      currentOffset -= (item.amount / totalExpense) * circumference;

                      // Add a small gap between segments
                      const gap = sortedData.length > 1 ? 4 : 0;
                      const segmentLength = Math.max(
                        0,
                        (item.amount / totalExpense) * circumference - gap
                      );
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
                <Text style={styles.chartCenterLabel}>{fy ? fy.label.toUpperCase() : ""}</Text>
                <Text style={styles.chartCenterLabel}>TOTAL EXPENSES</Text>
                <Text style={styles.chartCenterAmount}>{format(totalExpense)}</Text>
              </View>
            </View>

            {/* List of Expense Ledgers */}
            <View style={styles.listContainer}>
              {sortedData.map((item) => (
                <View key={item.id} style={styles.listItem}>
                  <View style={[styles.listAvatar, { backgroundColor: item.color }]}>
                    <Text style={styles.listAvatarText}>{item.initial}</Text>
                  </View>
                  <View style={styles.listLabelWrap}>
                    <Text style={styles.listLabel}>{item.label}</Text>
                    <Text style={styles.listGroup}>{item.group}</Text>
                  </View>
                  <Text style={styles.listAmount}>{format(item.amount)}</Text>
                </View>
              ))}
            </View>
          </>
        )}
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
              <Pressable style={styles.optionRow} onPress={() => handleExport("excel")}>
                <Ionicons name="document-text-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Download(Excel)</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={() => handleExport("pdf")}>
                <Ionicons name="document-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Download(PDF)</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={() => handleExport("csv")}>
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
  content: {
    paddingBottom: 100,
  },
  loadingWrap: {
    marginTop: 48,
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
  listLabelWrap: {
    flex: 1,
  },
  listLabel: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.medium,
    color: "#334155",
  },
  listGroup: {
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.textSecondary,
    marginTop: 1,
  },
  listAmount: {
    fontSize: 15,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
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
