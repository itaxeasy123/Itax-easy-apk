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
      router.push("/accounting/ledgers");
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
    backgroundColor: "#F5F9FF",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  fullScreenCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F5F9FF",
  },
  loadingText: {
    fontSize: 16,
    color: "#60708A",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  backButton: {
    marginRight: 12,
  },
  backIcon: {
    fontSize: 22,
    color: "#347BE5",
  },
  headline: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    color: "#60708A",
    marginTop: 4,
    marginBottom: 24,
  },
  field: {
    marginBottom: 18,
  },
  metaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
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
    marginTop: 8,
  },
  metaValue: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "600",
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    color: "#60708A",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5EAF3",
    padding: 14,
    fontSize: 14,
    color: "#0F172A",
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  typeButton: {
    borderWidth: 1,
    borderColor: "#D1E3FF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  typeButtonActive: {
    backgroundColor: "#347BE5",
    borderColor: "#347BE5",
  },
  typeButtonText: {
    fontSize: 12,
    color: "#3B4A65",
  },
  typeButtonTextActive: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  errorText: {
    color: "#D64A4A",
    marginBottom: 12,
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: "#347BE5",
    paddingVertical: 14,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryButton: {
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  secondaryButtonText: {
    color: "#B91C1C",
    fontWeight: "700",
    fontSize: 14,
  },
});
