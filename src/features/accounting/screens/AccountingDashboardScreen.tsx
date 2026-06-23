import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNav, Card, Loading } from "../components";
import { accountingService } from "../services/accountingService";
import { Ledger } from "../types/accountingTypes";

type DashboardStats = {
  totalSales: number;
  totalPurchases: number;
  partyCount: number;
  itemCount: number;
  ledgerCount: number;
  receivableBalance: number;
  payableBalance: number;
};

const formatCurrency = (value: number) =>
  `Rs ${Math.abs(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const getLedgerTotal = (ledgers: Ledger[], types: Ledger["ledgerType"][]) =>
  ledgers
    .filter((ledger) => types.includes(ledger.ledgerType))
    .reduce((sum, ledger) => sum + Number(ledger.balance || 0), 0);

export default function AccountingDashboardScreen() {
  const navigateTo = (path: any) => {
    if (Platform.OS === 'web' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    router.navigate(path);
  };
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalPurchases: 0,
    partyCount: 0,
    itemCount: 0,
    ledgerCount: 0,
    receivableBalance: 0,
    payableBalance: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        accountingService.getInvoiceSummary(),
        accountingService.getParties(),
        accountingService.getItems(),
        accountingService.getLedgers(),
      ]);

      const [summaryRes, partiesRes, itemsRes, ledgersRes] = results;

      const summary = summaryRes.status === "fulfilled" ? summaryRes.value.data : null;
      const parties = partiesRes.status === "fulfilled" ? (partiesRes.value.data ?? []) : [];
      const items = itemsRes.status === "fulfilled" ? (itemsRes.value.data ?? []) : [];
      const ledgers = ledgersRes.status === "fulfilled" ? (ledgersRes.value.data ?? []) : [];

      const localSales = ledgers
        .filter((l) => l.ledgerType === "sales")
        .reduce((sum, l) => sum + Math.abs(l.balance || 0), 0);

      const localPurchases = ledgers
        .filter((l) => l.ledgerType === "purchase")
        .reduce((sum, l) => sum + Math.abs(l.balance || 0), 0);

      setStats({
        totalSales: Math.max(summary?.total_sales ?? 0, localSales),
        totalPurchases: Math.max(summary?.total_purchases ?? 0, localPurchases),
        partyCount: summary?.number_of_parties ?? parties.length,
        itemCount: summary?.number_of_items ?? items.length,
        ledgerCount: ledgers.length,
        receivableBalance: getLedgerTotal(ledgers, ["accountsReceivable"]),
        payableBalance: getLedgerTotal(ledgers, ["accountsPayable"]),
      });

      // If all requests failed, then show error
      if (results.every(r => r.status === "rejected")) {
        setError("Unable to load accounting dashboard.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );


  return (
    <View style={styles.containerWrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#0F172A" />
            </Pressable>
            {/* <View style={styles.headerIcon}>
              <Ionicons name="analytics" size={20} color="#2563EB" />
            </View> */}
            <View>
              <Text style={styles.eyebrow}>Accounting Dashboard</Text>
              {/* <Text style={styles.title}>Business snapshot</Text> */}
            </View>
          </View>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="ellipsis-horizontal" size={22} color="#0F172A" />
          </Pressable>
        </View>

        <View style={styles.topCards}>
          <Image
            source={require("../../../../assets/images/dashboard.jpeg")}
            style={styles.cardImg}
          />
          <Image
            source={require("../../../../assets/images/policy-banner.jpeg")}
            style={styles.cardImg}
          />
        </View>

        {loading ? <Loading text="Loading dashboard..." /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && !error ? (
          <>
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <Text style={styles.statLabel}>Total Sales</Text>
                <Text style={styles.statValue}>{formatCurrency(stats.totalSales)}</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statLabel}>Total Purchase</Text>
                <Text style={styles.statValue}>{formatCurrency(stats.totalPurchases)}</Text>
              </Card>
            </View>

            <View style={styles.section}>
              <View style={[styles.rowBetween, { marginBottom: 0 }]}>
                <Text style={styles.sectionTitle}>Live Overview</Text>
              </View>

              <View style={styles.liveOverviewRow}>
                <Card style={styles.liveOverviewCard}>
                  <Text style={styles.amount}>{stats.partyCount}</Text>
                  <Text style={styles.sub}>Parties</Text>
                </Card>
                <Card style={styles.liveOverviewCard}>
                  <Text style={styles.amount}>{stats.itemCount}</Text>
                  <Text style={styles.sub}>Items</Text>
                </Card>
                <Card style={styles.liveOverviewCard}>
                  <Text style={styles.amount}>{stats.ledgerCount}</Text>
                  <Text style={styles.sub}>Ledgers</Text>
                </Card>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Create</Text>

              <View style={styles.quickRow}>
                <Pressable
                  style={styles.quickCard}
                  onPress={() => navigateTo("/accounting/create-sales")}
                >
                  <Ionicons name="pricetag" size={20} color="#2563EB" />
                  <Text style={styles.quickText}>Sales Invoice</Text>
                </Pressable>

                <Pressable
                  style={styles.quickCard}
                  onPress={() => navigateTo("/accounting/parties/create")}
                >
                  <Ionicons name="person-add" size={20} color="#10B981" />
                  <Text style={styles.quickText}>New Party</Text>
                </Pressable>

                <Pressable
                  style={styles.quickCard}
                  onPress={() => navigateTo("/accounting/items-create")}
                >
                  <Ionicons name="cube" size={20} color="#F59E0B" />
                  <Text style={styles.quickText}>New Item</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>

              <View style={styles.overviewGrid}>
                <Pressable
                  style={styles.overviewCard}
                  onPress={() => navigateTo("/invoice")}
                >
                  <Ionicons name="document-text" size={18} color="#10B981" />
                  <Text style={styles.overviewText}>Invoice</Text>
                </Pressable>

                <Pressable
                  style={styles.overviewCard}
                  onPress={() => navigateTo("/accounting/bill-payable")}
                >
                  <Ionicons name="wallet" size={18} color="#EF4444" />
                  <Text style={styles.overviewText}>Bills</Text>
                </Pressable>

                <Pressable
                  style={styles.overviewCard}
                  onPress={() => navigateTo("/accounting/parties")}
                >
                  <Ionicons name="people" size={18} color="#2563EB" />
                  <Text style={styles.overviewText}>Parties</Text>
                </Pressable>

                <Pressable
                  style={styles.overviewCard}
                  onPress={() => navigateTo("/accounting/items")}
                >
                  <Ionicons name="layers" size={18} color="#8B5CF6" />
                  <Text style={styles.overviewText}>Items</Text>
                </Pressable>

                <Pressable style={styles.overviewCard} onPress={() => navigateTo("/accounting/ledgers")}>
                  <Ionicons name="book" size={18} color="#4F46E5" />
                  <Text style={styles.overviewText}>Accounts</Text>
                </Pressable>

                <Pressable style={styles.overviewCard} onPress={() => navigateTo("/accounting/vouchers")}>
                  <Ionicons name="create" size={18} color="#7C3AED" />
                  <Text style={styles.overviewText}>Journal Entries</Text>
                </Pressable>

                <Pressable style={styles.overviewCard} onPress={() => navigateTo("/accounting/reports-profit-loss")}>
                  <Ionicons name="bar-chart" size={18} color="#059669" />
                  <Text style={styles.overviewText}>Profit & Loss</Text>
                </Pressable>

                <Pressable style={styles.overviewCard} onPress={() => navigateTo("/accounting/reports-balance-sheet")}>
                  <Ionicons name="document-text" size={18} color="#D97706" />
                  <Text style={styles.overviewText}>Balance Sheet</Text>
                </Pressable>

                <Pressable style={styles.overviewCard} onPress={() => navigateTo("/accounting/trial-balance")}>
                  <Ionicons name="scale" size={18} color="#2563EB" />
                  <Text style={styles.overviewText}>Trial Balance</Text>
                </Pressable>

                <Pressable style={styles.overviewCard} onPress={() => console.log("Opening Balance Screen missing")}>
                  <Ionicons name="wallet" size={18} color="#10B981" />
                  <Text style={styles.overviewText}>Opening Balance</Text>
                </Pressable>

                <Pressable style={styles.overviewCard} onPress={() => console.log("Financial Year Closing missing")}>
                  <Ionicons name="calendar" size={18} color="#E11D48" />
                  <Text style={styles.overviewText}>Financial Year Closing</Text>
                </Pressable>

                <Pressable style={styles.overviewCard} onPress={() => navigateTo("/accounting/credit-note")}>
                  <Ionicons name="receipt" size={18} color="#6366F1" />
                  <Text style={styles.overviewText}>Credit Notes</Text>
                </Pressable>

                {/* Invisible placeholders to align the last row to the left */}
                <View style={[styles.overviewCard, { borderWidth: 0, backgroundColor: "transparent" }]} />
                <View style={[styles.overviewCard, { borderWidth: 0, backgroundColor: "transparent" }]} />
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>

      <Pressable style={[styles.fab, { bottom: 86 + Math.max(insets.bottom, 0) }]} onPress={() => navigateTo("/invoice")}>
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.fabText}>Create Invoice</Text>
      </Pressable>

      <BottomNav activeRoute="/accounting" />
    </View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
    backgroundColor: "#F5F9FF",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 12,
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    marginRight: 4,
    padding: 4,
    marginLeft: -4,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    fontSize: 15,
    color: "#121213ff",
    fontWeight: "700",
    // textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
  },
  topCards: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  cardImg: {
    width: "48%",
    height: 75,
    borderRadius: 14,
  },
  errorText: {
    color: "#DC2626",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    padding: 10,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#0F172A",
  },
  chartCard: {
    marginTop: 8,
    padding: 10,
  },
  liveOverviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
  },
  liveOverviewCard: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },
  section: {
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  year: {
    fontSize: 12,
    color: "#64748B",
  },
  chart: {
    marginLeft: -10,
    borderRadius: 16,
  },
  summaryBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  sub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
  },
  quickCard: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickText: {
    fontSize: 10,
    marginTop: 4,
    color: "#0F172A",
    fontWeight: "600",
    textAlign: "center",
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  overviewCard: {
    width: "23.5%",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: 'center',
    marginBottom: 12,
  },
  overviewText: {
    fontSize: 10,
    marginTop: 4,
    color: "#0F172A",
    fontWeight: "600",
    textAlign: "center",
  },
  overviewMeta: {
    fontSize: 9,
    marginTop: 4,
    color: "#64748B",
    textAlign: 'center',
  },
  fab: {
    position: "absolute",
    bottom: 86,
    right: 16,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 999,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fabText: {
    color: "#fff",
    fontWeight: "700",
  },
});


