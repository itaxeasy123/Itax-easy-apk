import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button, Card, Header, Loading } from "../components";
import AccountingHeader from "../components/AccountingHeader";
import { accountingService } from "../services/accountingService";
import { voucherService } from "../services/voucherService";
import {
  Ledger,
  VoucherLine,
  VoucherType,
} from "../types/accountingTypes";

type EditableLine = {
  id: string;
  ledgerId: string;
  ledgerName: string;
  side: "debit" | "credit";
  amount: string;
};

const voucherTypes: VoucherType[] = ["journal", "payment", "receipt", "contra", "sales", "purchase"];

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function VoucherCreateScreen() {
  const router = useRouter();
  const [voucherNumber, setVoucherNumber] = useState(`VCH-${Date.now().toString().slice(-6)}`);
  const [voucherType, setVoucherType] = useState<VoucherType>("journal");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [narration, setNarration] = useState("");
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showLines, setShowLines] = useState(false);
  const [lines, setLines] = useState<EditableLine[]>([
    { id: makeId(), ledgerId: "", ledgerName: "", side: "debit", amount: "" },
    { id: makeId(), ledgerId: "", ledgerName: "", side: "credit", amount: "" },
  ]);
  const [activeLineId, setActiveLineId] = useState<string | null>(null);

  useEffect(() => {
    async function loadLedgers() {
      try {
        setLoading(true);
        const result = await accountingService.getLedgers();
        setLedgers(result.data ?? []);
      } catch {
        setError("Unable to load ledgers for voucher selection.");
      } finally {
        setLoading(false);
      }
    }

    void loadLedgers();
  }, []);

  const totals = useMemo(() => {
    const totalDebit = lines
      .filter((line) => line.side === "debit")
      .reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
    const totalCredit = lines
      .filter((line) => line.side === "credit")
      .reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
    return { totalDebit, totalCredit, difference: totalDebit - totalCredit };
  }, [lines]);

  const updateLine = (id: string, patch: Partial<EditableLine>) => {
    setLines((current) =>
      current.map((line) => (line.id === id ? { ...line, ...patch } : line))
    );
  };

  const addLine = () => {
    const nextSide = lines.length % 2 === 0 ? "debit" : "credit";
    setLines((current) => [
      ...current,
      { id: makeId(), ledgerId: "", ledgerName: "", side: nextSide, amount: "" },
    ]);
  };

  const removeLine = (id: string) => {
    setLines((current) => (current.length > 2 ? current.filter((line) => line.id !== id) : current));
  };

  const selectLedgerForLine = (lineId: string, ledger: Ledger) => {
    updateLine(lineId, {
      ledgerId: ledger.id,
      ledgerName: ledger.ledgerName,
    });
    setActiveLineId(null);
  };

  const handleSave = async () => {
    const cleanLines: VoucherLine[] = [];
    if (!voucherNumber.trim()) {
      setError("Voucher number is required.");
      return;
    }
    if (!entryDate.trim()) {
      setError("Entry date is required.");
      return;
    }
    if (!narration.trim()) {
      setError("Narration is required.");
      return;
    }

    for (const line of lines) {
      if (!line.ledgerId.trim()) {
        setError("Please select a ledger for every line.");
        return;
      }
      const amount = Number(line.amount);
      if (!amount || amount <= 0) {
        setError("Every line must have a valid amount.");
        return;
      }
      cleanLines.push({
        id: line.id,
        ledgerId: line.ledgerId,
        ledgerName: line.ledgerName,
        side: line.side,
        amount,
      });
    }

    if (totals.totalDebit !== totals.totalCredit) {
      setError("Debit and credit totals must match.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      await voucherService.create({
        voucherNumber: voucherNumber.trim(),
        voucherType,
        entryDate: new Date(entryDate).toISOString(),
        narration: narration.trim(),
        lines: cleanLines,
      });

      setSuccessMessage("Voucher created successfully.");
      router.replace("/accounting/vouchers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create voucher.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading text="Loading ledgers..." />;
  }

  return (
    <View style={styles.container}>
     <AccountingHeader title="Create Voucher" />
    
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* <Header
          title="Create Voucher"
          subtitle="Record debit and credit lines in a balanced journal entry."
        /> */}

        <View style={styles.field}>
          <Text style={styles.label}>Voucher Number</Text>
          <TextInput
            value={voucherNumber}
            onChangeText={setVoucherNumber}
            style={styles.input}
            placeholder="VCH-0001"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Entry Date</Text>
          <TextInput
            value={entryDate}
            onChangeText={setEntryDate}
            style={styles.input}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Voucher Type</Text>
          <View style={styles.typeRow}>
            {voucherTypes.map((type) => (
              <Pressable
                key={type}
                style={[styles.typeChip, voucherType === type && styles.typeChipActive]}
                onPress={() => setVoucherType(type)}
              >
                <Text style={[styles.typeText, voucherType === type && styles.typeTextActive]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Narration</Text>
          <TextInput
            value={narration}
            onChangeText={setNarration}
            style={[styles.input, styles.multiline]}
            multiline
            placeholder="Describe the transaction"
          />
        </View>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Total Debit</Text>
              <Text style={styles.summaryValue}>{totals.totalDebit}</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Total Credit</Text>
              <Text style={styles.summaryValue}>{totals.totalCredit}</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Difference</Text>
              <Text style={styles.summaryValue}>{totals.difference}</Text>
            </View>
          </View>
        </Card>

        <Card>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Lines</Text>
            <Pressable onPress={() => setShowLines((current) => !current)}>
              <Text style={styles.linkText}>{showLines ? "Close" : "Add"}</Text>
            </Pressable>
          </View>

          {showLines ? (
            <>
              {lines.map((line, index) => (
                <Card key={line.id} style={styles.lineCard}>
                  <View style={styles.lineHeader}>
                    <Text style={styles.lineTitle}>Line {index + 1}</Text>
                    <Pressable onPress={() => removeLine(line.id)} disabled={lines.length <= 2}>
                      <Ionicons
                        name="remove-circle-outline"
                        size={20}
                        color={lines.length <= 2 ? "#CBD5E1" : "#EF4444"}
                      />
                    </Pressable>
                  </View>

                  <View style={styles.lineRow}>
                    <Pressable
                      style={styles.ledgerPickerButton}
                      onPress={() => setActiveLineId(activeLineId === line.id ? null : line.id)}
                    >
                      <Text style={styles.ledgerPickerTitle}>
                        {line.ledgerName || "Select Ledger"}
                      </Text>
                      <Text style={styles.ledgerPickerMeta}>
                        {line.ledgerId ? line.ledgerId : "Tap to choose from ledgers"}
                      </Text>
                    </Pressable>

                    <View style={styles.sideGroup}>
                      {(["debit", "credit"] as const).map((side) => (
                        <Pressable
                          key={side}
                          style={[styles.sideChip, line.side === side && styles.sideChipActive]}
                          onPress={() => updateLine(line.id, { side })}
                        >
                          <Text style={[styles.sideText, line.side === side && styles.sideTextActive]}>
                            {side}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <View style={styles.amountRow}>
                    <TextInput
                      value={line.amount}
                      onChangeText={(amount) => updateLine(line.id, { amount })}
                      placeholder="Amount"
                      style={styles.input}
                      keyboardType="decimal-pad"
                    />
                  </View>

                  {activeLineId === line.id ? (
                    <Card style={styles.ledgerListCard}>
                      <Text style={styles.ledgerListTitle}>Choose a ledger</Text>
                      {ledgers.map((ledger) => (
                        <Pressable
                          key={ledger.id}
                          style={styles.ledgerOption}
                          onPress={() => selectLedgerForLine(line.id, ledger)}
                        >
                          <Text style={styles.ledgerOptionName}>{ledger.ledgerName}</Text>
                          <Text style={styles.ledgerOptionMeta}>
                            {ledger.ledgerType} • {ledger.id}
                          </Text>
                        </Pressable>
                      ))}
                    </Card>
                  ) : null}
                </Card>
              ))}

              <Button title="Add Line" onPress={addLine} variant="outline" fullWidth />
            </>
          ) : null}
        </Card>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        <Button
          title={saving ? "Saving..." : "Save Voucher"}
          onPress={handleSave}
          loading={saving}
          size="large"
          fullWidth
        />
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
    padding: 16,
    paddingBottom: 32,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    color: "#111827",
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  typeChipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  typeText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
  typeTextActive: {
    color: "#fff",
  },
  summaryCard: {
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginTop: 12,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  linkText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 12,
  },
  lineCard: {
    marginBottom: 12,
  },
  lineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  lineTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  lineRow: {
    gap: 12,
  },
  ledgerPickerButton: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
  },
  ledgerPickerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  ledgerPickerMeta: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  sideGroup: {
    flexDirection: "row",
    gap: 8,
  },
  sideChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  sideChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  sideText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  sideTextActive: {
    color: "#fff",
  },
  amountRow: {
    marginTop: 12,
  },
  ledgerListCard: {
    marginTop: 12,
    marginBottom: 0,
  },
  ledgerListTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  ledgerOption: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  ledgerOptionName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  ledgerOptionMeta: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  errorText: {
    color: "#DC2626",
    marginLeft: 8,
    flex: 1,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  successText: {
    color: "#16A34A",
    marginLeft: 8,
    flex: 1,
  },
});

