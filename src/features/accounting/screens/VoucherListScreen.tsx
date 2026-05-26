import { useCallback, useState } from "react";
import { View, ScrollView, StyleSheet, Text, Pressable } from "react-native";
import { useFocusEffect, useRouter, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, EmptyState, Header, Loading } from "../components";
import { voucherService } from "../services/voucherService";
import { VoucherEntry } from "../types/accountingTypes";
import AccountingHeader from "../components/AccountingHeader";

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
                  <Ionicons name={item.icon} size={18} color="#2563EB" />
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
                <View style={{ flex: 1, paddingRight: 12 }}>
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
                    <Ionicons name="print-outline" size={16} color="#2563EB" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(voucher.id)}
                    style={styles.deletePill}
                  >
                    <Ionicons name="trash-outline" size={16} color="#DC2626" />
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
                  <Ionicons name="print-outline" size={16} color="#fff" />
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
    paddingBottom: 24,
  },
  actionArea: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  quickSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: "800",
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
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    marginBottom: 10,
  },
  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  quickCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    marginTop: 10,
  },
  quickCardSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 15,
  },
  cardArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cardActionWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  voucherNo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  meta: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  deletePill: {
    padding: 10,
    borderRadius: 999,
    backgroundColor: "#FEE2E2",
  },
  printPill: {
    padding: 10,
    borderRadius: 999,
    backgroundColor: "#DBEAFE",
  },
  detailCard: {
    marginTop: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  detailText: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 6,
  },
  linesBlock: {
    marginTop: 12,
    gap: 8,
  },
  detailPrintButton: {
    marginTop: 14,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  detailPrintText: {
    color: "#fff",
    fontWeight: "800",
  },
  lineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  lineLabel: {
    fontSize: 13,
    color: "#111827",
    flex: 1,
  },
});
