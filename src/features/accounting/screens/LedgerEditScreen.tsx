import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { accountingService } from "../services/accountingService";
import { Ledger, LedgerType } from "../types/accountingTypes";
import { accountingTheme } from "../../../theme/accounting";

const ledgerTypeOptions: LedgerType[] = [
  "bank",
  "cash",
  "purchase",
  "sales",
  "directExpense",
  "indirectExpense",
  "directIncome",
  "indirectIncome",
  "fixedAssets",
  "currentAssets",
  "loansAndLiabilitieslw",
  "accountsReceivable",
  "accountsPayable",
];

export default function LedgerEditScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const ledgerId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [ledgerName, setLedgerName] = useState("");
  const [ledgerType, setLedgerType] = useState<LedgerType>("bank");
  const [openingBalance, setOpeningBalance] = useState("0");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ledgerId) {
      setError("Missing ledger id.");
      setLoading(false);
      return;
    }

    async function loadLedger() {
      try {
        const result = await accountingService.getLedgerById(ledgerId);
        const ledgerData = result.data;
        if (ledgerData) {
          setLedger(ledgerData);
          setLedgerName(ledgerData.ledgerName);
          setLedgerType(ledgerData.ledgerType);
          setOpeningBalance(ledgerData.openingBalance.toString());
        }
      } catch {
        setError("Unable to load ledger details.");
      } finally {
        setLoading(false);
      }
    }

    loadLedger();
  }, [ledgerId]);

  async function handleSave() {
    if (!ledgerId) {
      setError("Missing ledger id.");
      return;
    }

    const amount = Number(openingBalance || "0");

    if (!ledgerName.trim()) {
      setError("Ledger name is required.");
      return;
    }

    if (Number.isNaN(amount)) {
      setError("Opening balance must be a valid number.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await accountingService.updateLedger(ledgerId, {
        ledgerName: ledgerName.trim(),
        ledgerType,
        openingBalance: amount,
      });
      router.navigate("/accounting/ledgers");
    } catch {
      setError("Unable to save changes. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!ledgerId) {
      setError("Missing ledger id.");
      return;
    }

    Alert.alert("Delete Ledger", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setSaving(true);
            await accountingService.deleteLedger(ledgerId);
            router.replace("/accounting/ledgers");
          } catch {
            setError("Unable to delete ledger. Try again.");
            setSaving(false);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.fullScreenCenter}>
        <Text style={styles.loadingText}>Loading ledger details...</Text>
      </View>
    );
  }

  if (!ledger) {
    return (
      <View style={styles.fullScreenCenter}>
        <Text style={styles.errorText}>Ledger not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>&lt;</Text>
        </Pressable>
        <Text style={styles.headline}>Edit Ledger</Text>
      </View>

      <Text style={styles.subtitle}>Update ledger information and balances.</Text>

      <View style={styles.metaCard}>
        <Text style={styles.metaLabel}>Ledger ID</Text>
        <Text style={styles.metaValue}>{ledger.id}</Text>
        <Text style={styles.metaLabel}>Party ID</Text>
        <Text style={styles.metaValue}>{ledger.partyId ?? "Not linked"}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Ledger name</Text>
        <TextInput
          value={ledgerName}
          onChangeText={setLedgerName}
          placeholder="e.g. Bank account"
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Ledger type</Text>
        <View style={styles.typeRow}>
          {ledgerTypeOptions.slice(0, 5).map((type) => (
            <Pressable
              key={type}
              onPress={() => setLedgerType(type)}
              style={[
                styles.typeButton,
                ledgerType === type && styles.typeButtonActive,
              ]}
            >
              <Text
                style={
                  ledgerType === type
                    ? styles.typeButtonTextActive
                    : styles.typeButtonText
                }
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.typeRow}>
          {ledgerTypeOptions.slice(5).map((type) => (
            <Pressable
              key={type}
              onPress={() => setLedgerType(type)}
              style={[
                styles.typeButton,
                ledgerType === type && styles.typeButtonActive,
              ]}
            >
              <Text
                style={
                  ledgerType === type
                    ? styles.typeButtonTextActive
                    : styles.typeButtonText
                }
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Opening balance</Text>
        <TextInput
          value={openingBalance}
          onChangeText={(text) => setOpeningBalance(text.replace(/[^0-9.]/g, ""))}
          keyboardType="numeric"
          placeholder="0"
          style={styles.input}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        style={[styles.primaryButton, saving && styles.disabledButton]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.primaryButtonText}>{saving ? "Saving..." : "Save Changes"}</Text>
      </Pressable>

      <Pressable
        style={[styles.secondaryButton, saving && styles.disabledButton]}
        onPress={handleDelete}
        disabled={saving}
      >
        <Text style={styles.secondaryButtonText}>
          {saving ? "Deleting..." : "Delete Ledger"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: accountingTheme.colors.background,
  },
  content: {
    padding: accountingTheme.spacing.lg,
    paddingBottom: 32,
  },
  fullScreenCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: accountingTheme.spacing.lg,
    backgroundColor: accountingTheme.colors.background,
  },
  loadingText: {
    fontSize: accountingTheme.fontSizes.xl,
    color: "#60708A",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  backButton: {
    marginRight: accountingTheme.spacing.md,
  },
  backIcon: {
    fontSize: 22,
    color: "#347BE5",
  },
  headline: {
    fontSize: 26,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  subtitle: {
    fontSize: accountingTheme.fontSizes.md,
    color: "#60708A",
    marginTop: accountingTheme.spacing.xs,
    marginBottom: accountingTheme.spacing.xxl,
  },
  field: {
    marginBottom: 18,
  },
  metaCard: {
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.lg,
    borderWidth: 1,
    borderColor: "#E5EAF3",
    padding: 14,
    marginBottom: 18,
  },
  metaLabel: {
    fontSize: 11,
    color: "#60708A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: accountingTheme.spacing.sm,
  },
  metaValue: {
    fontSize: accountingTheme.fontSizes.md,
    color: accountingTheme.colors.text,
    fontWeight: accountingTheme.fontWeights.semiBold,
    marginTop: accountingTheme.spacing.xs,
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
  primaryButton: {
    borderRadius: accountingTheme.radius.lg,
    backgroundColor: "#347BE5",
    paddingVertical: 14,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: accountingTheme.colors.card,
    fontWeight: accountingTheme.fontWeights.bold,
    fontSize: accountingTheme.fontSizes.lg,
  },
  secondaryButton: {
    borderRadius: accountingTheme.radius.lg,
    backgroundColor: "#FEE2E2",
    paddingVertical: 14,
    alignItems: "center",
    marginTop: accountingTheme.spacing.md,
  },
  secondaryButtonText: {
    color: "#B91C1C",
    fontWeight: accountingTheme.fontWeights.bold,
    fontSize: accountingTheme.fontSizes.lg,
  },
});
