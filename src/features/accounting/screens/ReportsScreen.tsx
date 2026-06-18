import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { AccountingHeader, BottomNav } from "../components";
import { accountingTheme } from "../../../theme/accounting";

type ReportCard = {
  id: string;
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  route?: string;
  bg: string;
  iconColor: string;
};

export default function ReportsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const salesReportCards: ReportCard[] = useMemo(
    () => [
      {
        id: "sales-monthly",
        title: "Sales Monthly",
        icon: "stats-chart",
        route: "/accounting/reports-sales-monthly",
        bg: "#DCEBFF",
        iconColor: accountingTheme.colors.primary,
      },
      {
        id: "sales-customers",
        title: "Sales Customers",
        icon: "people",
        route: "/accounting/reports-sales-customers",
        bg: "#DDF2EC",
        iconColor: "#2B8C5A",
      },
      {
        id: "debit-notes",
        title: "Debit Notes",
        icon: "receipt",
        route: "/accounting/reports-debit-note",
        bg: accountingTheme.colors.warningLight,
        iconColor: "#D97706",
      },
    ],
    []
  );
  const receiptReportCards: ReportCard[] = useMemo(
    () => [
      {
        id: "receipt-monthly",
        title: "Receipt Monthly",
        icon: "download",
        route: "/accounting/reports-receipt-monthly",
        bg: "#DCEBFF",
        iconColor: accountingTheme.colors.primary,
      },
      {
        id: "receipt-customers",
        title: "Receipt Customers",
        icon: "people",
        route: "/accounting/reports-receipt-customers",
        bg: "#DDF2EC",
        iconColor: "#2B8C5A",
      },
    ],
    []
  );
  const accountingReportCards: ReportCard[] = useMemo(
    () => [
      {
        id: "daybook",
        title: "Day Book",
        icon: "book",
        route: "/accounting/daybook",
        bg: "#DDF2EC",
        iconColor: "#3A9A73",
      },
      {
        id: "expense",
        title: "Expenses",
        icon: "pie-chart",
        route: "/accounting/reports-expense",
        bg: "#ECE9F7",
        iconColor: "#8D5BE1",
      },
      {
        id: "inactive-customers",
        title: "Inactive Customers",
        icon: "person-remove",
        route: "/accounting/reports-inactive-customers",
        bg: "#F6E8F6",
        iconColor: "#BC4BB9",
      },
      {
        id: "inactive-items",
        title: "Inactive Item",
        icon: "book",
        route: "/accounting/reports-inactive-items",
        bg: "#F6E8F6",
        iconColor: "#BC4B95",
      },
    ],
    []
  );
  const bankCashReportCards: ReportCard[] = useMemo(
    () => [
      {
        id: "bank-cash",
        title: "Bank & Cash",
        icon: "wallet",
        route: "/accounting/reports-bank-cash",
        bg: "#EAF6FF",
        iconColor: accountingTheme.colors.primary,
      },
    ],
    []
  );
  const financeReportCards: ReportCard[] = useMemo(
    () => [
      {
        id: "trial",
        title: "Trial Balance",
        icon: "server",
        route: "/accounting/trial-balance",
        bg: "#F7ECEE",
        iconColor: "#E15554",
      },
      {
        id: "profit",
        title: "Profit & Loss",
        icon: "trending-up",
        route: "/accounting/reports-profit-loss",
        bg: "#E7EDF8",
        iconColor: "#3E88F7",
      },
      {
        id: "capital-account",
        title: "Capital Account",
        icon: "calculator",
        route: "/accounting/reports-capital-account",
        bg: "#E7EDF8",
        iconColor: "#4F85D9",
      },
      {
        id: "cash-flow",
        title: "Cash Flow",
        icon: "swap-vertical",
        route: "/accounting/reports-cash-flow",
        bg: "#EAF6EC",
        iconColor: "#2B8C5A",
      },
      {
        id: "balance",
        title: "Balance Sheet",
        icon: "scale",
        route: "/accounting/reports-balance-sheet",
        bg: "#F4F2DB",
        iconColor: "#B7AB2D",
      },
    ],
    []
  );

  const handleCardPress = (card: ReportCard) => {
    if (card.route) {
      router.navigate(card.route as Href);
      return;
    }
    Alert.alert("Coming soon", `${card.title} report will be available soon.`);
  };

  const horizontalPadding = 16;
  const gridGap = 12;
  const columnCount = width >= 1100 ? 6 : width >= 900 ? 5 : width >= 700 ? 4 : 3;
  const cardWidth =
    (width - horizontalPadding * 2 - gridGap * (columnCount - 1)) / columnCount;

  return (
    <View style={styles.wrapper}>
      <AccountingHeader
        title="Reports"
        showBackButton
        rightContent={<Ionicons name="ellipsis-horizontal" size={18} color={accountingTheme.colors.card} />}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Sales Reports</Text>
        <View style={styles.grid}>
          {salesReportCards.map((report) => (
            <Pressable
              key={report.id}
              style={[styles.reportCard, { backgroundColor: report.bg, width: cardWidth }]}
              onPress={() => handleCardPress(report)}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={report.icon} size={24} color={report.iconColor} />
              </View>
              <Text style={styles.reportTitle}>{report.title}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.financeTitle]}>Receipt Reports</Text>
        <View style={styles.grid}>
          {receiptReportCards.map((report) => (
            <Pressable
              key={report.id}
              style={[styles.reportCard, { backgroundColor: report.bg, width: cardWidth }]}
              onPress={() => handleCardPress(report)}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={report.icon} size={24} color={report.iconColor} />
              </View>
              <Text style={styles.reportTitle}>{report.title}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Accounting Reports</Text>
        <View style={styles.grid}>
          {accountingReportCards.map((report) => (
            <Pressable
              key={report.id}
              style={[styles.reportCard, { backgroundColor: report.bg, width: cardWidth }]}
              onPress={() => handleCardPress(report)}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={report.icon} size={24} color={report.iconColor} />
              </View>
              <Text style={styles.reportTitle}>{report.title}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.financeTitle]}>Bank & Cash</Text>
        <View style={styles.grid}>
          {bankCashReportCards.map((report) => (
            <Pressable
              key={report.id}
              style={[styles.reportCard, { backgroundColor: report.bg, width: cardWidth }]}
              onPress={() => handleCardPress(report)}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={report.icon} size={24} color={report.iconColor} />
              </View>
              <Text style={styles.reportTitle}>{report.title}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.financeTitle]}>Finance Reports</Text>
        <View style={styles.grid}>
          {financeReportCards.map((report) => (
            <Pressable
              key={report.id}
              style={[styles.reportCard, { backgroundColor: report.bg, width: cardWidth }]}
              onPress={() => handleCardPress(report)}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={report.icon} size={24} color={report.iconColor} />
              </View>
              <Text style={styles.reportTitle}>{report.title}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <BottomNav activeRoute="/accounting/reports" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: accountingTheme.spacing.md,
    paddingBottom: 110,
  },
  sectionTitle: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: "#32323F",
    marginBottom: 10,
  },
  financeTitle: {
    marginTop: 22,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: accountingTheme.spacing.md,
    columnGap: accountingTheme.spacing.md,
  },
  reportCard: {
    minHeight: 92,
    borderRadius: accountingTheme.radius.md,
    paddingTop: 10,
    paddingHorizontal: 6,
    paddingBottom: accountingTheme.spacing.sm,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: accountingTheme.colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  iconWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  reportTitle: {
    marginTop: accountingTheme.spacing.xs,
    textAlign: "center",
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#343341",
  },
});
