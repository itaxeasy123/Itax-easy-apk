import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { Button, Card, DateField, Header, Loading, isValidIsoDate } from "../components";
import AccountingHeader from "../components/AccountingHeader";
import { accountingService } from "../services/accountingService";
import { voucherService } from "../services/voucherService";
import { accountingTheme } from "../../../theme/accounting";
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

const voucherTypes: VoucherType[] = [
  "journal",
  "payment",
  "receipt",
  "contra",
  "sales",
  "purchase",
  "debitNote",
  "creditNote",
];

const VOUCHER_TYPE_LABEL: Record<VoucherType, string> = {
  journal: "journal",
  payment: "payment",
  receipt: "receipt",
  contra: "contra",
  sales: "sales",
  purchase: "purchase",
  debitNote: "debit note",
  creditNote: "credit note",
};

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function VoucherCreateScreen() {
  const insets = useSafeAreaInsets();
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

  // GST invoice detail (sales/purchase vouchers) — feeds GSTR reports
  const [showGst, setShowGst] = useState(false);
  const [gstHsn, setGstHsn] = useState("");
  const [gstTaxable, setGstTaxable] = useState("");
  const [gstCgst, setGstCgst] = useState("");
  const [gstSgst, setGstSgst] = useState("");
  const [gstIgst, setGstIgst] = useState("");
  const supportsGst = ["sales", "purchase", "debitNote", "creditNote"].includes(voucherType);

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
    if (!entryDate.trim() || !isValidIsoDate(entryDate.trim())) {
      setError("Please pick a valid entry date (YYYY-MM-DD).");
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

      const gstLines =
        supportsGst && Number(gstTaxable) > 0
          ? [
              {
                hsnSac: gstHsn.trim() || undefined,
                taxableValue: Number(gstTaxable) || 0,
                cgst: Number(gstCgst) || 0,
                sgst: Number(gstSgst) || 0,
                igst: Number(gstIgst) || 0,
              },
            ]
          : undefined;

      await voucherService.create({
        voucherNumber: voucherNumber.trim(),
        voucherType,
        entryDate: new Date(entryDate).toISOString(),
        narration: narration.trim(),
        lines: cleanLines,
        gstLines,
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
          <DateField value={entryDate} onChange={setEntryDate} placeholder="Select entry date" />
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
                  {VOUCHER_TYPE_LABEL[type]}
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
                        color={lines.length <= 2 ? "#CBD5E1" : accountingTheme.colors.danger}
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

        {supportsGst ? (
          <Card>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>GST Details (for GSTR)</Text>
              <Pressable onPress={() => setShowGst((current) => !current)}>
                <Text style={styles.linkText}>{showGst ? "Close" : "Add"}</Text>
              </Pressable>
            </View>

            {showGst ? (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>HSN / SAC</Text>
                  <TextInput
                    value={gstHsn}
                    onChangeText={setGstHsn}
                    style={styles.input}
                    placeholder="e.g. 8471"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Taxable Value</Text>
                  <TextInput
                    value={gstTaxable}
                    onChangeText={setGstTaxable}
                    style={styles.input}
                    placeholder="Amount before tax"
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.gstTaxRow}>
                  <View style={styles.gstTaxField}>
                    <Text style={styles.label}>CGST</Text>
                    <TextInput
                      value={gstCgst}
                      onChangeText={setGstCgst}
                      style={styles.input}
                      placeholder="0"
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={styles.gstTaxField}>
                    <Text style={styles.label}>SGST</Text>
                    <TextInput
                      value={gstSgst}
                      onChangeText={setGstSgst}
                      style={styles.input}
                      placeholder="0"
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={styles.gstTaxField}>
                    <Text style={styles.label}>IGST</Text>
                    <TextInput
                      value={gstIgst}
                      onChangeText={setGstIgst}
                      style={styles.input}
                      placeholder="0"
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
                <Text style={styles.gstHint}>
                  Note: the GST amounts must also appear as voucher lines against the GST Output/Input
                  ledgers — this section is the invoice-level break-up used for GST returns.
                </Text>
              </>
            ) : null}
          </Card>
        ) : null}

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={accountingTheme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) + 16 }]}>
        <Button
          title={saving ? "Saving..." : "Save Voucher"}
          onPress={handleSave}
          loading={saving}
          size="large"
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: accountingTheme.colors.card,
    borderTopWidth: 1,
    borderTopColor: accountingTheme.colors.border,
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: accountingTheme.spacing.lg,
  },
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    padding: accountingTheme.spacing.lg,
    paddingBottom: 100,
  },
  field: {
    marginBottom: accountingTheme.spacing.lg,
  },
  label: {
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.textSecondary,
    marginBottom: accountingTheme.spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: accountingTheme.colors.card,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    borderRadius: accountingTheme.radius.lg,
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
    gap: accountingTheme.spacing.sm,
  },
  typeChip: {
    paddingHorizontal: accountingTheme.spacing.md,
    paddingVertical: accountingTheme.spacing.sm,
    borderRadius: accountingTheme.radius.full,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    backgroundColor: accountingTheme.colors.card,
  },
  typeChipActive: {
    backgroundColor: accountingTheme.colors.primary,
    borderColor: accountingTheme.colors.primary,
  },
  typeText: {
    fontSize: accountingTheme.fontSizes.sm,
    color: "#475569",
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  typeTextActive: {
    color: accountingTheme.colors.card,
  },
  summaryCard: {
    marginTop: accountingTheme.spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: accountingTheme.spacing.md,
  },
  summaryLabel: {
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: accountingTheme.fontSizes.xxl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: "#111827",
    marginTop: accountingTheme.spacing.xs,
  },
  sectionTitle: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: "#111827",
    marginTop: accountingTheme.spacing.md,
    marginBottom: accountingTheme.spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: accountingTheme.spacing.md,
    marginBottom: accountingTheme.spacing.sm,
  },
  linkText: {
    color: accountingTheme.colors.primary,
    fontWeight: accountingTheme.fontWeights.bold,
    fontSize: accountingTheme.fontSizes.sm,
  },
  lineCard: {
    marginBottom: accountingTheme.spacing.md,
  },
  lineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: accountingTheme.spacing.md,
  },
  lineTitle: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#111827",
  },
  lineRow: {
    gap: accountingTheme.spacing.md,
  },
  ledgerPickerButton: {
    backgroundColor: "#F8FAFC",
    borderRadius: accountingTheme.radius.lg,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    padding: accountingTheme.spacing.md,
  },
  ledgerPickerTitle: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#111827",
  },
  ledgerPickerMeta: {
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.textSecondary,
    marginTop: accountingTheme.spacing.xs,
  },
  sideGroup: {
    flexDirection: "row",
    gap: accountingTheme.spacing.sm,
  },
  sideChip: {
    paddingHorizontal: accountingTheme.spacing.md,
    paddingVertical: accountingTheme.spacing.sm,
    borderRadius: accountingTheme.radius.full,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    backgroundColor: accountingTheme.colors.card,
  },
  sideChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  sideText: {
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#475569",
  },
  sideTextActive: {
    color: accountingTheme.colors.card,
  },
  amountRow: {
    marginTop: accountingTheme.spacing.md,
  },
  gstTaxRow: {
    flexDirection: "row",
    gap: accountingTheme.spacing.sm,
  },
  gstTaxField: {
    flex: 1,
  },
  gstHint: {
    fontSize: 11,
    color: accountingTheme.colors.textSecondary,
    fontStyle: "italic",
    marginBottom: accountingTheme.spacing.sm,
  },
  ledgerListCard: {
    marginTop: accountingTheme.spacing.md,
    marginBottom: 0,
  },
  ledgerListTitle: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#111827",
    marginBottom: 10,
  },
  ledgerOption: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: accountingTheme.colors.border,
  },
  ledgerOptionName: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#111827",
  },
  ledgerOptionMeta: {
    fontSize: 11,
    color: accountingTheme.colors.textSecondary,
    marginTop: 2,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: accountingTheme.colors.dangerLight,
    borderRadius: accountingTheme.radius.lg,
    padding: accountingTheme.spacing.md,
    marginTop: accountingTheme.spacing.md,
  },
  errorText: {
    color: accountingTheme.colors.error,
    marginLeft: accountingTheme.spacing.sm,
    flex: 1,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: accountingTheme.radius.lg,
    padding: accountingTheme.spacing.md,
    marginTop: accountingTheme.spacing.md,
  },
  successText: {
    color: "#16A34A",
    marginLeft: accountingTheme.spacing.sm,
    flex: 1,
  },
});

