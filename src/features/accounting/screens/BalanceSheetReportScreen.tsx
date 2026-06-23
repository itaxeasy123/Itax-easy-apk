import React, { useCallback, useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Modal, TextInput, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { AccountingHeader, DateField, FiscalYearBar, isValidIsoDate } from "../components";
import { FiscalYearInfo } from "../services/billshieldUiService";
import { Ionicons } from "@expo/vector-icons";
import { billshieldUiService } from "../services/billshieldUiService";
import { accountingTheme } from "../../../theme/accounting";
import { exportCsv, exportExcel, exportPdf, buildPdfHtml } from "../utils/exportFile";

const format = (value: number | undefined) => {
  if (value === undefined || isNaN(value)) return "₹ 0.00";
  const abs = Math.abs(value);
  const formatted = `₹ ${abs.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return value < 0 ? `-${formatted}` : formatted;
};

type TbRow = { ledgerId: string; ledgerName: string; groupName: string; groupPath: string; debit: number; credit: number; nature: string };

interface BsGroupNode {
  name: string;
  path: string;
  amount: number; // positive for debit (Assets) or credit (Liabilities)
  subgroups: BsGroupNode[];
  ledgers: {
    ledgerId: string;
    ledgerName: string;
    amount: number;
  }[];
}

const GROUP_PATH_TO_NAME: Record<string, string> = {
  "capital-account": "Capital Account",
  "loans-liability": "Loans (Liability)",
  "current-liabilities": "Current Liabilities",
  "fixed-assets": "Fixed Assets",
  "investments": "Investments",
  "current-assets": "Current Assets",
  "misc-expenses-asset": "Misc. Expenses (Asset)",
  "suspense-account": "Suspense Account",
  "branch-divisions": "Branch / Divisions",
  "capital-account/reserves-surplus": "Reserves & Surplus",
  "loans-liability/secured-loans": "Secured Loans",
  "loans-liability/unsecured-loans": "Unsecured Loans",
  "loans-liability/bank-od-occ-accounts": "Bank OD/OCC Accounts",
  "current-liabilities/sundry-creditors": "Sundry Creditors",
  "current-liabilities/duties-taxes": "Duties & Taxes",
  "current-liabilities/provisions": "Provisions",
  "current-assets/cash-in-hand": "Cash-in-Hand",
  "current-assets/bank-accounts": "Bank Accounts",
  "current-assets/sundry-debtors": "Sundry Debtors",
  "current-assets/stock-in-hand": "Stock-in-Hand",
  "current-assets/deposits-asset": "Deposits (Asset)",
  "current-assets/loans-advances-asset": "Loans & Advances (Asset)",
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

export default function BalanceSheetReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tab, setTab] = useState<"assets" | "liabilities">("assets");
  const [rows, setRows] = useState<TbRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [entryCategory, setEntryCategory] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [entryAmount, setEntryAmount] = useState("");

  const assetCategories = ["Current Assets", "Fixed Assets", "Investments", "Loans Advance"];
  const liabilityCategories = ["Current Liabilities", "Capital", "Loan"];

  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  // Set default category when modal opens
  useEffect(() => {
    if (showEntryModal && !entryCategory) {
      setEntryCategory(tab === "assets" ? "Fixed Assets" : "Capital");
    }
  }, [showEntryModal, tab]);

  const [asOf, setAsOf] = useState<string | undefined>(undefined);

  const loadBalanceSheetData = useCallback(async (asOfDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      // Fetch full ledger details via the trial balance payload
      const response = await billshieldUiService.getTrialBalance(asOfDate);
      if (response.success && response.data) {
        setRows(response.data.ledgers);
        
        // Default expand top-level sections
        const initialExpanded = new Set<string>();
        response.data.ledgers.forEach((l: TbRow) => {
          const topLevel = l.groupPath.split("/")[0];
          initialExpanded.add(topLevel);
        });
        setExpandedPaths(initialExpanded);
      } else {
        setError(response.message ?? "Unable to load balance sheet report.");
      }
    } catch {
      setError("Unable to load balance sheet report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadBalanceSheetData(asOf);
    }, [loadBalanceSheetData, asOf])
  );

  const handleFyChange = (fy: FiscalYearInfo) => {
    setAsOf(fy.endDate);
  };

  // Calculate net profit dynamically from income and expense ledgers
  const netProfit = useMemo(() => {
    let incomeSum = 0;
    let expenseSum = 0;
    rows.forEach((r) => {
      if (r.nature === "INCOME") {
        incomeSum += (r.credit - r.debit);
      } else if (r.nature === "EXPENSE") {
        expenseSum += (r.debit - r.credit);
      }
    });
    return incomeSum - expenseSum;
  }, [rows]);

  // Construct Balance Sheet hierarchical trees
  const bsTrees = useMemo(() => {
    const assetRoot: { [path: string]: BsGroupNode } = {};
    const liabilityRoot: { [path: string]: BsGroupNode } = {};

    const ensureGroupNode = (path: string, nature: string, immediateName?: string): BsGroupNode => {
      const segments = path.split("/");
      const roots = nature === "ASSET" ? assetRoot : liabilityRoot;
      let currentPath = "";
      let parentNode: BsGroupNode | null = null;

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
          let sub: BsGroupNode | undefined = parentNode.subgroups.find((g) => g.path === currentPath);
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
      if (ledger.nature !== "ASSET" && ledger.nature !== "LIABILITY") return;
      
      const groupNode = ensureGroupNode(ledger.groupPath, ledger.nature, ledger.groupName);
      const ledgerNet = ledger.nature === "ASSET" 
        ? (ledger.debit - ledger.credit) 
        : (ledger.credit - ledger.debit);

      groupNode.ledgers.push({
        ledgerId: ledger.ledgerId,
        ledgerName: ledger.ledgerName,
        amount: ledgerNet,
      });
    });

    const calculateTotals = (node: BsGroupNode) => {
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

    Object.values(assetRoot).forEach(calculateTotals);
    Object.values(liabilityRoot).forEach(calculateTotals);

    // Filter out zero-balanced primary nodes
    const sortedAssets = Object.values(assetRoot)
      .filter((n) => Math.round(n.amount * 100) !== 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    const sortedLiabilities = Object.values(liabilityRoot)
      .filter((n) => Math.round(n.amount * 100) !== 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      assets: sortedAssets,
      liabilities: sortedLiabilities,
    };
  }, [rows]);

  const totals = useMemo(() => {
    const assetsTotal = bsTrees.assets.reduce((sum, n) => sum + n.amount, 0);
    const liabTotalRaw = bsTrees.liabilities.reduce((sum, n) => sum + n.amount, 0);
    const liabilitiesTotal = liabTotalRaw + netProfit;
    const difference = Math.round((assetsTotal - liabilitiesTotal) * 100) / 100;

    return {
      assets: assetsTotal,
      liabilities: liabilitiesTotal,
      difference,
    };
  }, [bsTrees, netProfit]);

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
    const addPaths = (g: BsGroupNode) => {
      next.add(g.path);
      g.subgroups.forEach(addPaths);
    };
    const activeTree = tab === "assets" ? bsTrees.assets : bsTrees.liabilities;
    activeTree.forEach(addPaths);
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

  // ---- export menu (3-dot) ----
  const [showExport, setShowExport] = useState(false);
  
  const exportRows = (): (string | number)[][] => {
    const result: (string | number)[][] = [["Particular", "Group/Type", "Balance"]];
    
    const appendGroup = (g: BsGroupNode, level: number) => {
      const indent = "  ".repeat(level);
      result.push([`${indent}${g.name}`, "Group", g.amount]);
      g.subgroups.forEach((sub) => appendGroup(sub, level + 1));
      g.ledgers.forEach((l) => {
        result.push([`${indent}  ${l.ledgerName}`, "Ledger", l.amount]);
      });
    };

    result.push(["--- ASSETS ---", "", ""]);
    bsTrees.assets.forEach((g) => appendGroup(g, 0));
    result.push(["TOTAL ASSETS", "", totals.assets]);

    result.push(["--- LIABILITIES & EQUITIES ---", "", ""]);
    bsTrees.liabilities.forEach((g) => appendGroup(g, 0));
    result.push(["Profit & Loss (Current Period)", "Profit & Loss", netProfit]);
    result.push(["TOTAL LIABILITIES", "", totals.liabilities]);

    return result;
  };

  const handleExport = async (format: "PDF" | "CSV" | "Excel") => {
    setShowExport(false);
    const data = exportRows();
    if (format === "CSV") await exportCsv("balance-sheet", data);
    else if (format === "Excel") await exportExcel("balance-sheet", "Balance Sheet", data);
    else await exportPdf("balance-sheet", buildPdfHtml("Balance Sheet", "Exported from iTaxEasy", data));
  };

  const [savingEntry, setSavingEntry] = useState(false);

  const handleSaveEntry = async () => {
    const amount = Number(entryAmount);
    if (!entryCategory) {
      Alert.alert("Missing category", "Please choose a category.");
      return;
    }
    if (!entryDate || !isValidIsoDate(entryDate)) {
      Alert.alert("Invalid date", "Please pick a date from the calendar.");
      return;
    }
    if (!amount || amount <= 0 || Number.isNaN(amount)) {
      Alert.alert("Invalid amount", "Please enter an amount greater than zero.");
      return;
    }
    setSavingEntry(true);
    const result = await billshieldUiService.addBalanceSheetEntry({
      category: entryCategory,
      side: tab,
      date: entryDate,
      amount,
    });
    setSavingEntry(false);
    if (result.success) {
      setShowEntryModal(false);
      setEntryAmount("");
      setEntryDate("");
      Alert.alert(
        "Entry posted",
        `Booked as journal voucher ${result.data?.voucherNo ?? ""} — the other side sits in Suspense A/c until you classify it.`
      );
      void loadBalanceSheetData();
    } else {
      Alert.alert("Could not save", result.message ?? "Please try again.");
    }
  };

  // Recursive BS Tree node rendering
  const renderBSNode = (g: BsGroupNode, level: number = 0) => {
    const isExpanded = expandedPaths.has(g.path);
    const hasChildren = g.subgroups.length > 0 || g.ledgers.length > 0;

    if (g.amount === 0) return null;

    return (
      <View key={g.path}>
        {/* Row */}
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
              color={tab === "assets" ? "#10B981" : "#4F85D9"} 
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

        {/* Children Expanded */}
        {isExpanded && (
          <View>
            {g.subgroups.map((sub) => renderBSNode(sub, level + 1))}
            
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

  const currentTree = tab === "assets" ? bsTrees.assets : bsTrees.liabilities;

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Balance Sheet"
        showBackButton
        rightContent={
          <Pressable onPress={() => setShowExport(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} color={accountingTheme.colors.card} />
          </Pressable>
        }
        headerContent={
          <View style={styles.tabsContainer}>
            <Pressable
              style={[styles.tabBtn, tab === "assets" && styles.tabBtnActive]}
              onPress={() => setTab("assets")}
            >
              <Text style={[styles.tabText, tab === "assets" && styles.tabTextActive]}>Assets</Text>
            </Pressable>
            <Pressable
              style={[styles.tabBtn, tab === "liabilities" && styles.tabBtnActive]}
              onPress={() => setTab("liabilities")}
            >
              <Text style={[styles.tabText, tab === "liabilities" && styles.tabTextActive]}>Liabilities & Capital</Text>
            </Pressable>
          </View>
        }
      />

      {/* Financial Year Bar */}
      <FiscalYearBar onChange={handleFyChange} />

      {/* Tree controls */}
      <View style={styles.controlsBar}>
        <Text style={styles.controlsTitle}>{tab.toUpperCase()} HIERARCHY</Text>
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={accountingTheme.colors.primary} />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.tableCard}>
            {/* Render recursive account groups */}
            {currentTree.map((g) => renderBSNode(g))}

            {/* If Liabilities Tab, dynamically inject Net Profit node */}
            {tab === "liabilities" && (
              <View>
                <View style={[styles.groupRow, { paddingLeft: 14 }, styles.topLevelGroupRow]}>
                  <View style={styles.groupLeft}>
                    <View style={styles.bulletPlaceholder} />
                    <Ionicons name="pie-chart-outline" size={18} color="#EF4444" style={styles.groupIcon} />
                    <Text style={[styles.groupNameText, styles.topLevelGroupNameText]}>
                      Profit & Loss A/c (Current Period)
                    </Text>
                  </View>
                  <Text style={styles.groupAmountText}>{format(netProfit)}</Text>
                </View>
              </View>
            )}

            {currentTree.length === 0 && (tab === "assets" || netProfit === 0) && (
              <Text style={styles.errorText}>Nothing here yet — post a voucher first.</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB adjusts balance sheet on the fly */}
      <Pressable style={[styles.fab, { bottom: 86 + Math.max(insets.bottom, 0) }]} onPress={() => setShowEntryModal(true)}>
        <Ionicons name="add" size={18} color={accountingTheme.colors.card} />
        <Text style={styles.fabText}>Add Entry (Adjust)</Text>
      </Pressable>

      {/* Footer Totals */}
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>
          {tab === "assets" ? "Total Assets" : "Total Liabilities & Capital"}
        </Text>
        <Text style={styles.footerValue}>
          {format(tab === "assets" ? totals.assets : totals.liabilities)}
        </Text>
      </View>
      <View style={{ backgroundColor: accountingTheme.colors.card, height: Math.max(insets.bottom, 0) }} />

      {/* Export menu (3-dot) */}
      <Modal visible={showExport} transparent animationType="slide" onRequestClose={() => setShowExport(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowExport(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>
            <View style={styles.sheetContent}>
              {(["PDF", "Excel", "CSV"] as const).map((fmt) => (
                <Pressable key={fmt} style={styles.exportRow} onPress={() => handleExport(fmt)}>
                  <Ionicons
                    name={fmt === "PDF" ? "document-outline" : fmt === "Excel" ? "document-text-outline" : "grid-outline"}
                    size={18}
                    color="#475569"
                  />
                  <Text style={styles.exportText}>Download ({fmt})</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Entry Bottom Sheet Modal */}
      <Modal
        visible={showEntryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEntryModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowEntryModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>

            <View style={styles.sheetContent}>
              <Text style={styles.sheetTitle}>
                {tab === "assets" ? "Add Assets" : "Add Liabilities"}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabelOverlay}>Category</Text>
                <Pressable
                  style={styles.dropdownInput}
                  onPress={() => setShowCategoryModal(true)}
                >
                  <Text style={styles.dropdownValue}>{entryCategory}</Text>
                  <Ionicons name="chevron-down" size={16} color={accountingTheme.colors.textSecondary} />
                </Pressable>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabelOverlay}>Voucher Date</Text>
                <DateField value={entryDate} onChange={setEntryDate} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabelOverlay}>Adjustment Amount</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    value={entryAmount}
                    onChangeText={setEntryAmount}
                    placeholder="Enter amount"
                    placeholderTextColor={accountingTheme.colors.textMuted}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                  <Ionicons name="cash-outline" size={18} color={accountingTheme.colors.textSecondary} style={styles.inputIcon} />
                </View>
              </View>

              <Pressable
                style={styles.saveBtn}
                onPress={handleSaveEntry}
                disabled={savingEntry}
              >
                {savingEntry ? (
                  <ActivityIndicator size="small" color={accountingTheme.colors.card} />
                ) : (
                  <Text style={styles.saveBtnText}>Post Adjustment Voucher</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Dropdown Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={[styles.modalBackdrop, { justifyContent: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" }]}>
          <View style={[styles.bottomSheet, { marginHorizontal: 30, borderRadius: 16, paddingBottom: 16 }]}>
            <View style={styles.sheetHandleWrap}>
              <Text style={{ fontWeight: "700", color: accountingTheme.colors.text }}>Select Category</Text>
            </View>
            <ScrollView style={styles.sheetContent}>
              {(tab === "assets" ? assetCategories : liabilityCategories).map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.categoryItem, entryCategory === cat && styles.categoryItemActive]}
                  onPress={() => {
                    setEntryCategory(cat);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[styles.categoryItemText, entryCategory === cat && styles.categoryItemTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
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
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(30, 41, 59, 0.2)",
    borderRadius: 8,
    padding: 3,
    marginTop: 10,
    alignSelf: "center",
    width: "90%",
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#E2E8F0",
  },
  tabTextActive: {
    color: "#1E293B",
  },
  content: {
    paddingBottom: 120,
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
  fab: {
    position: "absolute",
    right: 18,
    backgroundColor: accountingTheme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: accountingTheme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  footerLabel: {
    color: accountingTheme.colors.card,
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  footerValue: {
    color: accountingTheme.colors.card,
    fontSize: 15,
    fontWeight: "800",
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
    paddingBottom: 32,
  },
  sheetHandleWrap: {
    alignItems: "center",
    paddingVertical: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: accountingTheme.colors.borderMedium,
    borderRadius: 2,
  },
  sheetContent: {
    paddingHorizontal: 24,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputGroup: {
    position: "relative",
    marginBottom: 16,
  },
  inputLabelOverlay: {
    position: "absolute",
    top: -8,
    left: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    zIndex: 1,
  },
  dropdownInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 44,
  },
  dropdownValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
  },
  inputIcon: {
    marginLeft: 8,
  },
  saveBtn: {
    backgroundColor: accountingTheme.colors.primary,
    borderRadius: 8,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  categoryItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  categoryItemActive: {
    backgroundColor: "#F1F5F9",
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  categoryItemText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
  categoryItemTextActive: {
    color: "#1E293B",
    fontWeight: "700",
  },
  exportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  exportText: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "600",
  },
});
