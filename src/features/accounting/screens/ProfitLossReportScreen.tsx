import React, { useCallback, useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { AccountingHeader, FiscalYearBar } from "../components";
import { Ionicons } from "@expo/vector-icons";
import { billshieldUiService, FiscalYearInfo } from "../services/billshieldUiService";
import { accountingTheme } from "../../../theme/accounting";
import { exportCsv, exportExcel, exportPdf, buildPdfHtml } from "../utils/exportFile";

const format = (value: number | undefined) => {
  if (value === undefined || isNaN(value)) return "₹ 0.00";
  const abs = Math.abs(value);
  const formatted = `₹ ${abs.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return value < 0 ? `-${formatted}` : formatted;
};

type TbRow = { ledgerId: string; ledgerName: string; groupName: string; groupPath: string; debit: number; credit: number; nature: string };

interface PlTreeNode {
  name: string;
  path: string;
  amount: number; // net credit for income, net debit for expense
  subgroups: PlTreeNode[];
  ledgers: {
    ledgerId: string;
    ledgerName: string;
    amount: number;
  }[];
}

const GROUP_PATH_TO_NAME: Record<string, string> = {
  "sales-accounts": "Sales Accounts",
  "purchase-accounts": "Purchase Accounts",
  "direct-income": "Direct Income",
  "direct-expenses": "Direct Expenses",
  "indirect-income": "Indirect Income",
  "indirect-expenses": "Indirect Expenses",
};

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getGroupName(path: string, immediateName?: string): string {
  if (GROUP_PATH_TO_NAME[path]) return GROUP_PATH_TO_NAME[path];
  if (immediateName && path.endsWith(slug(immediateName))) return immediateName;
  const segments = path.split("/");
  const lastSegment = segments[segments.length - 1];
  return lastSegment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ProfitLossReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [rows, setRows] = useState<TbRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const loadProfitLossData = useCallback(async (from?: string, to?: string) => {
    try {
      setLoading(true);
      setError(null);
      // Fetch the full ledger ledger list with net balances
      const response = await billshieldUiService.getTrialBalance(to);
      if (response.success && response.data) {
        setRows(response.data.ledgers);
        
        // Auto-expand standard root P&L groups by default
        const initialExpanded = new Set<string>([
          "sales-accounts",
          "purchase-accounts",
          "direct-income",
          "direct-expenses",
          "indirect-income",
          "indirect-expenses",
        ]);
        setExpandedPaths(initialExpanded);
      } else {
        setError(response.message ?? "Unable to load profit and loss report.");
      }
    } catch {
      setError("Unable to load profit and loss report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProfitLossData(range.from, range.to);
    }, [loadProfitLossData, range])
  );

  const handleFyChange = (fy: FiscalYearInfo) => {
    setRange({ from: fy.startDate, to: fy.endDate });
  };

  const isDirectIncome = (path: string) => path.startsWith("sales-accounts") || path.startsWith("direct-income");
  const isDirectExpense = (path: string) => path.startsWith("purchase-accounts") || path.startsWith("direct-expenses");
  const isIndirectIncome = (path: string) => path.startsWith("indirect-income");
  const isIndirectExpense = (path: string) => path.startsWith("indirect-expenses");

  // Construct P&L trees dynamically from Income/Expense Trial Balance rows
  const plTrees = useMemo(() => {
    const directIncomeRoot: { [path: string]: PlTreeNode } = {};
    const directExpenseRoot: { [path: string]: PlTreeNode } = {};
    const indirectIncomeRoot: { [path: string]: PlTreeNode } = {};
    const indirectExpenseRoot: { [path: string]: PlTreeNode } = {};

    const ensureGroupNode = (path: string, type: "DI" | "DE" | "II" | "IE", immediateName?: string): PlTreeNode => {
      const segments = path.split("/");
      let roots = directIncomeRoot;
      if (type === "DE") roots = directExpenseRoot;
      else if (type === "II") roots = indirectIncomeRoot;
      else if (type === "IE") roots = indirectExpenseRoot;

      let currentPath = "";
      let parentNode: PlTreeNode | null = null;

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        currentPath = currentPath ? `${currentPath}/${seg}` : seg;

        if (i === 0) {
          if (!roots[currentPath]) {
            roots[currentPath] = {
              name: getGroupName(currentPath, i === segments.length - 1 ? immediateName : undefined),
              path: currentPath,
              amount: 0,
              subgroups: [],
              ledgers: [],
            };
          }
          parentNode = roots[currentPath];
        } else if (parentNode) {
          let sub: PlTreeNode | undefined = parentNode.subgroups.find((g) => g.path === currentPath);
          if (!sub) {
            sub = {
              name: getGroupName(currentPath, i === segments.length - 1 ? immediateName : undefined),
              path: currentPath,
              amount: 0,
              subgroups: [],
              ledgers: [],
            };
            parentNode.subgroups.push(sub);
          }
          parentNode = sub;
        }
      }
      return parentNode!;
    };

    rows.forEach((ledger) => {
      if (ledger.nature !== "INCOME" && ledger.nature !== "EXPENSE") return;

      let type: "DI" | "DE" | "II" | "IE" | null = null;
      if (isDirectIncome(ledger.groupPath)) type = "DI";
      else if (isDirectExpense(ledger.groupPath)) type = "DE";
      else if (isIndirectIncome(ledger.groupPath)) type = "II";
      else if (isIndirectExpense(ledger.groupPath)) type = "IE";

      if (!type) return;

      const groupNode = ensureGroupNode(ledger.groupPath, type, ledger.groupName);
      
      // Net Income is net credit balance, net Expense is net debit balance
      const balance = ledger.nature === "INCOME" 
        ? (ledger.credit - ledger.debit) 
        : (ledger.debit - ledger.credit);

      groupNode.ledgers.push({
        ledgerId: ledger.ledgerId,
        ledgerName: ledger.ledgerName,
        amount: balance,
      });
    });

    const calculateTotals = (node: PlTreeNode) => {
      let subSum = 0;
      node.subgroups.forEach((sub) => {
        calculateTotals(sub);
        subSum += sub.amount;
      });
      node.ledgers.forEach((l) => {
        subSum += l.amount;
      });
      node.amount = subSum;
    };

    Object.values(directIncomeRoot).forEach(calculateTotals);
    Object.values(directExpenseRoot).forEach(calculateTotals);
    Object.values(indirectIncomeRoot).forEach(calculateTotals);
    Object.values(indirectExpenseRoot).forEach(calculateTotals);

    return {
      directIncome: Object.values(directIncomeRoot).filter((n) => Math.round(n.amount * 100) !== 0),
      directExpense: Object.values(directExpenseRoot).filter((n) => Math.round(n.amount * 100) !== 0),
      indirectIncome: Object.values(indirectIncomeRoot).filter((n) => Math.round(n.amount * 100) !== 0),
      indirectExpense: Object.values(indirectExpenseRoot).filter((n) => Math.round(n.amount * 100) !== 0),
    };
  }, [rows]);

  const calculations = useMemo(() => {
    const totalDirectIncome = plTrees.directIncome.reduce((sum, n) => sum + n.amount, 0);
    const totalDirectExpense = plTrees.directExpense.reduce((sum, n) => sum + n.amount, 0);
    const grossProfit = totalDirectIncome - totalDirectExpense;

    const totalIndirectIncome = plTrees.indirectIncome.reduce((sum, n) => sum + n.amount, 0);
    const totalIndirectExpense = plTrees.indirectExpense.reduce((sum, n) => sum + n.amount, 0);
    const netProfit = grossProfit + totalIndirectIncome - totalIndirectExpense;

    return {
      totalDirectIncome,
      totalDirectExpense,
      grossProfit,
      totalIndirectIncome,
      totalIndirectExpense,
      netProfit,
    };
  }, [plTrees]);

  const toggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const expandAll = () => {
    const next = new Set<string>();
    const addPaths = (g: PlTreeNode) => {
      next.add(g.path);
      g.subgroups.forEach(addPaths);
    };
    [
      ...plTrees.directIncome,
      ...plTrees.directExpense,
      ...plTrees.indirectIncome,
      ...plTrees.indirectExpense,
    ].forEach(addPaths);
    setExpandedPaths(next);
  };

  const collapseAll = () => {
    setExpandedPaths(new Set());
  };

  const handleLedgerPress = (ledgerId: string, ledgerName: string) => {
    router.navigate({
      pathname: "/accounting/reports-bank-cash/[id]",
      params: { id: ledgerId, name: ledgerName },
    });
  };

  // ---- export ----
  const exportRows = (): (string | number)[][] => {
    const result: (string | number)[][] = [["Particular", "Section", "Amount"]];
    
    const appendGroup = (g: PlTreeNode, section: string, level: number) => {
      const indent = "  ".repeat(level);
      result.push([`${indent}${g.name}`, section, g.amount]);
      g.subgroups.forEach((sub) => appendGroup(sub, section, level + 1));
      g.ledgers.forEach((l) => {
        result.push([`${indent}  ${l.ledgerName}`, section, l.amount]);
      });
    };

    result.push(["--- TRADING INCOME ---", "", ""]);
    plTrees.directIncome.forEach((g) => appendGroup(g, "Trading Income", 0));
    result.push(["TOTAL TRADING INCOME", "", calculations.totalDirectIncome]);

    result.push(["--- TRADING COST / EXPENSE ---", "", ""]);
    plTrees.directExpense.forEach((g) => appendGroup(g, "Trading Cost", 0));
    result.push(["TOTAL TRADING COST", "", calculations.totalDirectExpense]);

    result.push(["GROSS PROFIT", "", calculations.grossProfit]);

    result.push(["--- INDIRECT INCOME ---", "", ""]);
    plTrees.indirectIncome.forEach((g) => appendGroup(g, "Indirect Income", 0));
    result.push(["TOTAL INDIRECT INCOME", "", calculations.totalIndirectIncome]);

    result.push(["--- INDIRECT EXPENSES ---", "", ""]);
    plTrees.indirectExpense.forEach((g) => appendGroup(g, "Indirect Expense", 0));
    result.push(["TOTAL INDIRECT EXPENSE", "", calculations.totalIndirectExpense]);

    result.push(["NET PROFIT", "", calculations.netProfit]);

    return result;
  };

  const handleExport = async (format: "PDF" | "CSV" | "Excel") => {
    setShowActionModal(false);
    const data = exportRows();
    if (format === "CSV") await exportCsv("profit-loss", data);
    else if (format === "Excel") await exportExcel("profit-loss", "Profit & Loss", data);
    else await exportPdf("profit-loss", buildPdfHtml("Profit & Loss", "Exported from iTaxEasy", data));
  };

  // Recursive Tree Renderer
  const renderPlNode = (g: PlTreeNode, level: number = 0, themeColor: string) => {
    const isExpanded = expandedPaths.has(g.path);
    const hasChildren = g.subgroups.length > 0 || g.ledgers.length > 0;

    if (g.amount === 0) return null;

    return (
      <View key={g.path}>
        <Pressable 
          onPress={() => hasChildren && toggleExpand(g.path)}
          style={[
            styles.groupRow, 
            { paddingLeft: 14 + level * 16 },
            level === 0 && styles.topLevelGroupRow
          ]}
        >
          <View style={styles.groupLeft}>
            {hasChildren ? (
              <Ionicons 
                name={isExpanded ? "chevron-down" : "chevron-forward"} 
                size={16} 
                color={level === 0 ? "#1E293B" : "#475569"} 
                style={styles.chevron}
              />
            ) : (
              <View style={styles.bulletPlaceholder} />
            )}
            <Ionicons 
              name="folder-open-outline" 
              size={18} 
              color={themeColor} 
              style={styles.groupIcon} 
            />
            <Text style={[
              styles.groupNameText, 
              level === 0 ? styles.topLevelGroupNameText : styles.subGroupNameText
            ]}>
              {g.name}
            </Text>
          </View>
          <Text style={styles.groupAmountText}>{format(g.amount)}</Text>
        </Pressable>

        {isExpanded && (
          <View>
            {g.subgroups.map((sub) => renderPlNode(sub, level + 1, themeColor))}
            
            {g.ledgers.map((l) => (
              <Pressable
                key={l.ledgerId}
                onPress={() => handleLedgerPress(l.ledgerId, l.ledgerName)}
                style={[styles.ledgerRow, { paddingLeft: 34 + level * 16 }]}
              >
                <View style={styles.ledgerLeft}>
                  <Ionicons name="document-text-outline" size={15} color="#64748B" style={styles.ledgerIcon} />
                  <Text style={styles.ledgerNameText}>{l.ledgerName}</Text>
                  <Ionicons name="arrow-redo-outline" size={12} color="#94A3B8" style={styles.drillIcon} />
                </View>
                <Text style={styles.ledgerAmountText}>{format(l.amount)}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Profit & Loss"
        showBackButton
        rightContent={
          <Pressable onPress={() => setShowActionModal(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} color={accountingTheme.colors.card} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Financial Year Bar */}
        <FiscalYearBar onChange={handleFyChange} />

        {/* Tree controls */}
        <View style={styles.controlsBar}>
          <Text style={styles.controlsTitle}>STATEMENT OF OPERATION</Text>
          <View style={styles.controlsButtons}>
            <Pressable onPress={expandAll} style={styles.controlBtn}>
              <Ionicons name="add-circle-outline" size={14} color="#3B82F6" />
              <Text style={styles.controlBtnText}>Expand All</Text>
            </Pressable>
            <Pressable onPress={collapseAll} style={styles.controlBtn}>
              <Ionicons name="remove-circle-outline" size={14} color="#64748B" />
              <Text style={styles.controlBtnText}>Collapse</Text>
            </Pressable>
          </View>
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={accountingTheme.colors.primary} />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.tableCard}>
            
            {/* TRADING ACCOUNT SECTION */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>1. Trading Account (Direct)</Text>
            </View>

            {plTrees.directIncome.map((g) => renderPlNode(g, 0, "#10B981"))}
            {plTrees.directExpense.map((g) => renderPlNode(g, 0, "#EF4444"))}

            {plTrees.directIncome.length === 0 && plTrees.directExpense.length === 0 && (
              <Text style={styles.emptyText}>No trading transactions posted for this period.</Text>
            )}

            <View style={styles.highlightRow}>
              <Text style={styles.highlightLabel}>Gross Profit / Loss</Text>
              <Text style={styles.highlightValue}>{format(calculations.grossProfit)}</Text>
            </View>

            {/* PROFIT & LOSS SECTION */}
            <View style={[styles.sectionHeader, { marginTop: 14 }]}>
              <Text style={styles.sectionHeaderText}>2. Income & Overheads (Indirect)</Text>
            </View>

            {plTrees.indirectIncome.map((g) => renderPlNode(g, 0, "#10B981"))}
            {plTrees.indirectExpense.map((g) => renderPlNode(g, 0, "#F59E0B"))}

            {plTrees.indirectIncome.length === 0 && plTrees.indirectExpense.length === 0 && (
              <Text style={styles.emptyText}>No indirect transactions posted for this period.</Text>
            )}

            <View style={[styles.highlightRow, styles.netProfitHighlightRow]}>
              <Text style={styles.highlightLabel}>Net Profit / Loss</Text>
              <Text style={styles.highlightValue}>{format(calculations.netProfit)}</Text>
            </View>

          </View>
        )}
      </ScrollView>

      {/* Action Bottom Sheet */}
      <Modal
        visible={showActionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowActionModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>

            <View style={styles.sheetOptions}>
              <Pressable style={styles.optionRow} onPress={() => handleExport("PDF")}>
                <Ionicons name="document-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Download (PDF)</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={() => handleExport("Excel")}>
                <Ionicons name="document-text-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Download (Excel)</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={() => handleExport("CSV")}>
                <Ionicons name="grid-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Download (CSV)</Text>
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
  content: {
    paddingBottom: 60,
  },
  controlsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  controlsTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  controlsButtons: {
    flexDirection: "row",
    gap: 12,
  },
  controlBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  controlBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
  },
  loaderWrap: {
    padding: 40,
    alignItems: "center",
  },
  errorText: {
    color: accountingTheme.colors.error,
    textAlign: "center",
    marginTop: 40,
    fontWeight: "500",
  },
  tableCard: {
    backgroundColor: "#FFFFFF",
  },
  sectionHeader: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  topLevelGroupRow: {
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  groupLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  chevron: {
    marginRight: 6,
    width: 14,
  },
  bulletPlaceholder: {
    width: 14,
    marginRight: 6,
  },
  groupIcon: {
    marginRight: 8,
  },
  groupNameText: {
    fontSize: 13,
    color: "#1E293B",
    flex: 1,
  },
  topLevelGroupNameText: {
    fontWeight: "700",
    color: "#0F172A",
  },
  subGroupNameText: {
    fontWeight: "600",
    color: "#334155",
  },
  groupAmountText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "right",
  },
  ledgerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  ledgerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  ledgerIcon: {
    marginRight: 8,
  },
  ledgerNameText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
  },
  drillIcon: {
    marginLeft: 6,
  },
  ledgerAmountText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#475569",
    textAlign: "right",
  },
  highlightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    borderBottomWidth: 2,
    borderBottomColor: "#E2E8F0",
  },
  netProfitHighlightRow: {
    backgroundColor: "#EFF6FF",
    borderBottomColor: "#3B82F6",
    borderBottomWidth: 3,
  },
  highlightLabel: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "800",
    textTransform: "uppercase",
  },
  highlightValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "800",
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 12,
    padding: 16,
    textAlign: "center",
    fontStyle: "italic",
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
});
