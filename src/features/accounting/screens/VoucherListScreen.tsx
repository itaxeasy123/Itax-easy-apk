import { useCallback, useState } from "react";
import { View, ScrollView, StyleSheet, Text, Pressable } from "react-native";
import { useFocusEffect, useRouter, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, EmptyState, Header, Loading } from "../components";
import { voucherService } from "../services/voucherService";
import { VoucherEntry } from "../types/accountingTypes";
import AccountingHeader from "../components/AccountingHeader";
import { accountingTheme } from "../../../theme/accounting";

type QuickVoucherIcon = React.ComponentProps<typeof Ionicons>["name"];
const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

export default function VoucherListScreen() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<VoucherEntry[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVouchers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await voucherService.getAll();
      setVouchers(result.data ?? []);
      setSelectedVoucher((current) =>
        current ? result.data?.find((voucher) => voucher.id === current.id) ?? null : null
      );
    } catch {
      setError("Unable to load vouchers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadVouchers();
    }, [loadVouchers])
  );

  const handleDelete = async (id: string) => {
    await voucherService.delete(id);
    await loadVouchers();
  };

  const transactionVouchers = [
    { id: "sales", title: "Sales", subtitle: "Create sales invoice", route: "/accounting/create-sales", icon: "cart-outline" },
    { id: "purchase", title: "Purchase", subtitle: "Create purchase invoice", route: "/accounting/create-purchase", icon: "bag-outline" },
    { id: "receipt", title: "Receipt", subtitle: "Record payment received", route: "/accounting/receipt", icon: "download-outline" },
    { id: "credit", title: "Credit Note", subtitle: "Return and adjustment", route: "/accounting/credit-note", icon: "return-down-back-outline" },
    { id: "debit", title: "Debit Note", subtitle: "Return and adjustment", route: "/accounting/debit-note", icon: "return-up-forward-outline" },
  ] as {
    id: string;
    title: string;
    subtitle: string;
    route: Href;
    icon: QuickVoucherIcon;
  }[];

  return (
    <View style={styles.container}>
      <AccountingHeader title="Vouchers" subtitle="Journal entries with debit and credit lines." />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* <Header
          title="Vouchers"
          subtitle="Journal entries with debit and credit lines."
        /> */}

        <View style={styles.actionArea}>
          <Button
            title="Create Voucher"
            onPress={() => router.navigate("/accounting/vouchers-create")}
            size="large"
            fullWidth
          />
        </View>

        <View style={styles.quickSection}>
          <Text style={styles.quickTitle}>Transaction Vouchers</Text>
          <View style={styles.quickGrid}>
            {transactionVouchers.map((item) => (
              <Pressable
                key={item.id}
                style={styles.quickCard}
                onPress={() => router.navigate(item.route)}
              >
                <View style={styles.quickIcon}>
                  <Ionicons name={item.icon} size={18} color={accountingTheme.colors.primary} />
                </View>
                <Text style={styles.quickCardTitle}>{item.title}</Text>
                <Text style={styles.quickCardSubtitle}>{item.subtitle}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {loading ? (
          <Loading text="Loading vouchers..." />
        ) : error ? (
          <View style={styles.cardArea}>
            <Card>
              <EmptyState icon="alert-circle" title="Unable to load vouchers" description={error} />
            </Card>
          </View>
        ) : vouchers.length === 0 ? (
          <View style={styles.cardArea}>
            <Card>
              <EmptyState
                icon="document-text"
                title="No vouchers found"
                description="Create a voucher to start tracking debit and credit entries."
                actionText="Create Voucher"
                onAction={() => router.navigate("/accounting/vouchers-create")}
              />
            </Card>
          </View>
        ) : (
          <View style={styles.cardArea}>
            {vouchers.map((voucher) => (
              <Card
                key={voucher.id}
                pressable
                onPress={() =>
                  setSelectedVoucher((current) => (current?.id === voucher.id ? null : voucher))
                }
              >
                <View style={{ flex: 1, paddingRight: accountingTheme.spacing.md }}>
                  <Text style={styles.voucherNo}>{voucher.voucherNumber}</Text>
                  <Text style={styles.meta}>
                    {voucher.voucherType.toUpperCase()} • {formatDate(voucher.entryDate)}
                  </Text>
                  <Text style={styles.meta}>
                    Debit {voucher.totalDebit} | Credit {voucher.totalCredit}
                  </Text>
                </View>
                <View style={styles.cardActionWrap}>
                  <Pressable
                    onPress={() =>
                      router.navigate({
                        pathname: "/accounting/print/voucher",
                        params: { id: voucher.id },
                      })
                    }
                    style={styles.printPill}
                  >
                    <Ionicons name="print-outline" size={16} color={accountingTheme.colors.primary} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(voucher.id)}
                    style={styles.deletePill}
                  >
                    <Ionicons name="trash-outline" size={16} color={accountingTheme.colors.error} />
                  </Pressable>
                </View>
              </Card>
            ))}

            {selectedVoucher ? (
              <Card style={styles.detailCard}>
                <Text style={styles.detailTitle}>{selectedVoucher.voucherNumber}</Text>
                <Text style={styles.detailText}>{selectedVoucher.narration}</Text>
                <Text style={styles.detailText}>
                  Entry Date: {formatDate(selectedVoucher.entryDate)}
                </Text>
                <View style={styles.linesBlock}>
                  {selectedVoucher.lines.map((line) => (
                    <View key={line.id} style={styles.lineRow}>
                      <Text style={styles.lineLabel}>
                        {line.ledgerName || line.ledgerId}
                      </Text>
                      <Text style={styles.lineLabel}>
                        {line.side.toUpperCase()} • {line.amount}
                      </Text>
                    </View>
                  ))}
                </View>
                <Pressable
                  style={styles.detailPrintButton}
                  onPress={() =>
                    router.navigate({
                      pathname: "/accounting/print/voucher",
                      params: { id: selectedVoucher.id },
                    })
                  }
                >
                  <Ionicons name="print-outline" size={16} color={accountingTheme.colors.card} />
                  <Text style={styles.detailPrintText}>Print PDF</Text>
                </Pressable>
              </Card>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    paddingBottom: accountingTheme.spacing.xxl,
  },
  actionArea: {
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: accountingTheme.spacing.lg,
  },
  quickSection: {
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: accountingTheme.spacing.md,
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: "#111827",
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  quickCard: {
    width: "48%",
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.xxl,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    padding: 14,
    marginBottom: 10,
  },
  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: accountingTheme.radius.lg,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  quickCardTitle: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: "#111827",
    marginTop: 10,
  },
  quickCardSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: accountingTheme.spacing.xs,
    lineHeight: 15,
  },
  cardArea: {
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: accountingTheme.spacing.md,
  },
  cardActionWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.sm,
  },
  voucherNo: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#111827",
  },
  meta: {
    fontSize: accountingTheme.fontSizes.sm,
    color: "#6B7280",
    marginTop: accountingTheme.spacing.xs,
  },
  deletePill: {
    padding: 10,
    borderRadius: accountingTheme.radius.full,
    backgroundColor: "#FEE2E2",
  },
  printPill: {
    padding: 10,
    borderRadius: accountingTheme.radius.full,
    backgroundColor: "#DBEAFE",
  },
  detailCard: {
    marginTop: accountingTheme.spacing.sm,
  },
  detailTitle: {
    fontSize: accountingTheme.fontSizes.xxl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: "#111827",
  },
  detailText: {
    fontSize: accountingTheme.fontSizes.md,
    color: "#4B5563",
    marginTop: 6,
  },
  linesBlock: {
    marginTop: accountingTheme.spacing.md,
    gap: accountingTheme.spacing.sm,
  },
  detailPrintButton: {
    marginTop: 14,
    backgroundColor: accountingTheme.colors.primary,
    borderRadius: accountingTheme.radius.xl,
    paddingVertical: accountingTheme.spacing.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: accountingTheme.spacing.sm,
  },
  detailPrintText: {
    color: accountingTheme.colors.card,
    fontWeight: accountingTheme.fontWeights.extraBold,
  },
  lineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: accountingTheme.spacing.md,
    paddingVertical: accountingTheme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: accountingTheme.colors.border,
  },
  lineLabel: {
    fontSize: accountingTheme.fontSizes.md,
    color: "#111827",
    flex: 1,
  },
});
