import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AccountingHeader, Button, Card, EmptyState, Loading } from "../components";
import { accountingService } from "../services/accountingService";
import { Ledger, Party, PartyType } from "../types/accountingTypes";
import { accountingTheme } from "../../../theme/accounting";

const partyTypeOptions: { label: string; value: PartyType }[] = [
  { label: "Customer", value: "customer" },
  { label: "Supplier", value: "supplier" },
];

const formatCurrency = (value: number) =>
  `Rs ${Math.abs(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

export default function PartyEditScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const partyId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [party, setParty] = useState<Party | null>(null);
  const [partyName, setPartyName] = useState("");
  const [type, setType] = useState<PartyType>("customer");
  const [selectedTab, setSelectedTab] = useState<"overview" | "ledgers" | "edit">(
    "overview"
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!partyId) {
      setError("Missing party id.");
      setLoading(false);
      return;
    }

    async function loadParty() {
      try {
        setLoading(true);
        const result = await accountingService.getPartyById(partyId);
        const currentParty = result.data ?? null;
        if (currentParty) {
          setParty(currentParty);
          setPartyName(currentParty.partyName);
          setType(currentParty.type);
        } else {
          setError("Party not found.");
        }
      } catch {
        setError("Unable to load party details.");
      } finally {
        setLoading(false);
      }
    }

    loadParty();
  }, [partyId]);

  const balance = useMemo(
    () => (party?.ledgers ?? []).reduce((sum, ledger) => sum + Number(ledger.balance || 0), 0),
    [party]
  );

  const linkedLedgers = party?.ledgers ?? [];
  const isCustomer = type === "customer";

  async function handleSave() {
    if (!partyId) {
      setError("Missing party id.");
      return;
    }

    if (!partyName.trim()) {
      setError("Party name is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const result = await accountingService.updateParty(partyId, {
        partyName: partyName.trim(),
        type,
      });
      setParty(result.data ?? party);
      setSelectedTab("overview");
    } catch {
      setError("Unable to save party. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!partyId) {
      setError("Missing party id.");
      return;
    }

    Alert.alert("Delete Party", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setSaving(true);
            await accountingService.deleteParty(partyId);
            router.replace("/accounting/parties");
          } catch {
            setError("Unable to delete party. Try again.");
            setSaving(false);
          }
        },
      },
    ]);
  }

  const onContactPress = (kind: "call" | "whatsapp" | "email") => {
    if (!party) return;

    if (kind === "call" && party.phone) {
      void Linking.openURL(`tel:${party.phone}`);
      return;
    }

    if (kind === "whatsapp" && party.phone) {
      void Linking.openURL(`https://wa.me/${party.phone.replace(/\D/g, "")}`);
      return;
    }

    if (kind === "email" && party.email) {
      void Linking.openURL(`mailto:${party.email}`);
    }
  };

  if (loading) {
    return <Loading text="Loading party..." fullScreen />;
  }

  if (!partyId || error || !party) {
    return (
      <View style={styles.container}>
        <AccountingHeader title="Customer Details" subtitle="View and edit party information." />
        <View style={styles.formArea}>
          <Card>
            <EmptyState
              icon="alert-circle"
              title="Unable to open party"
              description={error ?? "Party not found."}
            />
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AccountingHeader
        title={isCustomer ? "Customer Details" : "Supplier Details"}
        subtitle="View, edit, and manage the linked ledgers."
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryArea}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View>
                <Text style={styles.partyName}>{party.partyName}</Text>
                <Text style={styles.balanceText}>
                  {formatCurrency(balance)}{" "}
                  <Text style={styles.balanceSmall}>
                    ({isCustomer ? "Receivables" : "Payables"})
                  </Text>
                </Text>
              </View>
              <Text style={[styles.typeBadge, isCustomer ? styles.customerBadge : styles.supplierBadge]}>
                {party.type}
              </Text>
            </View>

            <View style={styles.actionRow}>
              <Pressable
                style={[styles.actionChip, !party.phone && styles.actionChipDisabled]}
                onPress={() => onContactPress("whatsapp")}
                disabled={!party.phone}
              >
                <Ionicons name="logo-whatsapp" size={18} color={accountingTheme.colors.card} />
                <Text style={styles.actionText}>WhatsApp</Text>
              </Pressable>
              <Pressable
                style={[styles.actionChip, !party.phone && styles.actionChipDisabled]}
                onPress={() => onContactPress("call")}
                disabled={!party.phone}
              >
                <Ionicons name="call" size={18} color={accountingTheme.colors.card} />
                <Text style={styles.actionText}>Call</Text>
              </Pressable>
              <Pressable
                style={[styles.actionChip, !party.email && styles.actionChipDisabled]}
                onPress={() => onContactPress("email")}
                disabled={!party.email}
              >
                <Ionicons name="mail" size={18} color={accountingTheme.colors.card} />
                <Text style={styles.actionText}>Email</Text>
              </Pressable>
            </View>
          </Card>
        </View>

        <View style={styles.tabRow}>
          {[
            { key: "overview", label: "Overview" },
            { key: "ledgers", label: "Ledgers" },
            { key: "edit", label: "Edit" },
          ].map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setSelectedTab(tab.key as "overview" | "ledgers" | "edit")}
              style={[styles.tabChip, selectedTab === tab.key && styles.tabChipActive]}
            >
              <Text style={[styles.tabText, selectedTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {selectedTab === "overview" ? (
          <View style={styles.sectionArea}>
            <Card style={styles.detailCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Party Type</Text>
                <Text style={styles.detailValue}>{party.type}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{party.phone ?? "Not added"}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{party.email ?? "Not added"}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>GSTIN</Text>
                <Text style={styles.detailValue}>{party.gstin ?? "Not added"}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>{party.address ?? "Not added"}</Text>
              </View>
            </Card>

            <Card style={styles.detailCard}>
              <Text style={styles.sectionCardTitle}>Summary</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{linkedLedgers.length}</Text>
                  <Text style={styles.summaryLabel}>Linked Ledgers</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{formatCurrency(balance)}</Text>
                  <Text style={styles.summaryLabel}>Current Balance</Text>
                </View>
              </View>
            </Card>
          </View>
        ) : null}

        {selectedTab === "ledgers" ? (
          <View style={styles.sectionArea}>
            {linkedLedgers.length === 0 ? (
              <Card>
                <EmptyState
                  icon="layers"
                  title="No linked ledgers"
                  description="This party does not have any linked ledger entries yet."
                />
              </Card>
            ) : (
              linkedLedgers.map((ledger: Ledger) => (
                <Card key={ledger.id} style={styles.ledgerCard}>
                  <Pressable onPress={() => router.navigate(`/accounting/ledgers/${ledger.id}`)}>
                    <View style={styles.ledgerRow}>
                      <View style={styles.ledgerLeft}>
                        <Text style={styles.ledgerName}>{ledger.ledgerName}</Text>
                        <Text style={styles.ledgerMeta}>
                          {ledger.ledgerType} • {ledger.year}/{ledger.month}
                        </Text>
                        <Text style={styles.ledgerMeta}>Ledger ID: {ledger.id}</Text>
                      </View>
                      <Text style={styles.ledgerBalance}>{formatCurrency(Number(ledger.balance || 0))}</Text>
                    </View>
                  </Pressable>
                </Card>
              ))
            )}
          </View>
        ) : null}

        {selectedTab === "edit" ? (
          <View style={styles.sectionArea}>
            <Card>
              <View style={styles.field}>
                <Text style={styles.label}>Party name</Text>
                <TextInput
                  value={partyName}
                  onChangeText={setPartyName}
                  placeholder="e.g. Acme Supplies"
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Party type</Text>
                <View style={styles.typeRow}>
                  {partyTypeOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => setType(option.value)}
                      style={[
                        styles.typeButton,
                        type === option.value && styles.typeButtonActive,
                      ]}
                    >
                      <Text
                        style={
                          type === option.value
                            ? styles.typeButtonTextActive
                            : styles.typeButtonText
                        }
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                title="Save Party"
                onPress={handleSave}
                loading={saving}
                size="large"
                fullWidth
              />

              <View style={styles.deleteWrap}>
                <Button
                  title="Delete Party"
                  variant="danger"
                  onPress={handleDelete}
                  loading={saving}
                  size="large"
                  fullWidth
                />
              </View>
            </Card>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F7FA",
  },
  content: {
    paddingBottom: accountingTheme.spacing.xxl,
  },
  summaryArea: {
    paddingHorizontal: accountingTheme.spacing.md,
    paddingTop: accountingTheme.spacing.md,
  },
  summaryCard: {
    marginBottom: 0,
  },
  summaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: accountingTheme.spacing.md,
  },
  partyName: {
    fontSize: 22,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  balanceText: {
    color: accountingTheme.colors.text,
    fontSize: accountingTheme.fontSizes.xxl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    marginTop: accountingTheme.spacing.xs,
  },
  balanceSmall: {
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: accountingTheme.colors.textSecondary,
  },
  typeBadge: {
    fontSize: 11,
    fontWeight: accountingTheme.fontWeights.bold,
    paddingHorizontal: accountingTheme.spacing.sm,
    paddingVertical: accountingTheme.spacing.xs,
    borderRadius: accountingTheme.radius.full,
    overflow: "hidden",
  },
  customerBadge: {
    backgroundColor: "#DBEAFE",
    color: "#1D4ED8",
  },
  supplierBadge: {
    backgroundColor: accountingTheme.colors.warningLight,
    color: "#B45309",
  },
  actionRow: {
    flexDirection: "row",
    gap: accountingTheme.spacing.sm,
    marginTop: 14,
    flexWrap: "wrap",
  },
  actionChip: {
    backgroundColor: "#45B8B6",
    borderRadius: accountingTheme.radius.full,
    paddingHorizontal: accountingTheme.spacing.md,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionChipDisabled: {
    opacity: 0.55,
  },
  actionText: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  tabRow: {
    flexDirection: "row",
    gap: accountingTheme.spacing.sm,
    marginTop: accountingTheme.spacing.md,
    paddingHorizontal: accountingTheme.spacing.md,
  },
  tabChip: {
    flex: 1,
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.full,
    borderWidth: 1,
    borderColor: "#D8E4EE",
    paddingVertical: 10,
    alignItems: "center",
  },
  tabChipActive: {
    backgroundColor: accountingTheme.colors.primary,
    borderColor: accountingTheme.colors.primary,
  },
  tabText: {
    color: "#475569",
    fontWeight: accountingTheme.fontWeights.bold,
    fontSize: accountingTheme.fontSizes.sm,
  },
  tabTextActive: {
    color: accountingTheme.colors.card,
  },
  sectionArea: {
    paddingHorizontal: accountingTheme.spacing.md,
    paddingTop: accountingTheme.spacing.md,
  },
  detailCard: {
    marginBottom: accountingTheme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: accountingTheme.spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.surfaceLight,
  },
  detailLabel: {
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: accountingTheme.fontSizes.md,
    color: accountingTheme.colors.text,
    fontWeight: accountingTheme.fontWeights.bold,
    flex: 1,
    textAlign: "right",
  },
  sectionCardTitle: {
    fontSize: 15,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
    marginBottom: accountingTheme.spacing.md,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: accountingTheme.spacing.md,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: accountingTheme.radius.xl,
    padding: accountingTheme.spacing.md,
  },
  summaryNumber: {
    fontSize: accountingTheme.fontSizes.xxl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  summaryLabel: {
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.textSecondary,
    marginTop: accountingTheme.spacing.xs,
  },
  ledgerCard: {
    marginBottom: accountingTheme.spacing.md,
  },
  ledgerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: accountingTheme.spacing.md,
  },
  ledgerLeft: {
    flex: 1,
  },
  ledgerName: {
    fontSize: 15,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  ledgerMeta: {
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.textSecondary,
    marginTop: accountingTheme.spacing.xs,
  },
  ledgerBalance: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  formArea: {
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: accountingTheme.spacing.lg,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: accountingTheme.fontSizes.sm,
    color: "#60708A",
    marginBottom: accountingTheme.spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.lg,
    borderWidth: 1,
    borderColor: "#E5EAF3",
    padding: 14,
    fontSize: accountingTheme.fontSizes.lg,
    color: accountingTheme.colors.text,
  },
  deleteWrap: {
    marginTop: accountingTheme.spacing.md,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  typeButton: {
    borderWidth: 1,
    borderColor: "#D1E3FF",
    borderRadius: accountingTheme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: accountingTheme.spacing.md,
    marginRight: accountingTheme.spacing.sm,
    marginBottom: accountingTheme.spacing.sm,
  },
  typeButtonActive: {
    backgroundColor: "#347BE5",
    borderColor: "#347BE5",
  },
  typeButtonText: {
    fontSize: accountingTheme.fontSizes.sm,
    color: "#3B4A65",
  },
  typeButtonTextActive: {
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.card,
  },
  errorText: {
    color: "#D64A4A",
    marginBottom: accountingTheme.spacing.md,
  },
});
