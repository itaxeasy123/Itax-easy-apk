import { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AccountingHeader } from "../components";
import { accountingService } from "../services/accountingService";
import { LedgerType } from "../types/accountingTypes";

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

const ledgerTypeOptions: { type: LedgerType; label: string; icon: string; color: string }[] = [
  { type: "bank",               label: "Bank",               icon: "business",         color: "#3B82F6" },
  { type: "cash",               label: "Cash",               icon: "cash",             color: "#10B981" },
  { type: "sales",              label: "Sales",              icon: "trending-up",      color: "#8B5CF6" },
  { type: "purchase",           label: "Purchase",           icon: "cart",             color: "#F59E0B" },
  { type: "directExpense",      label: "Direct Expense",     icon: "remove-circle",    color: "#EF4444" },
  { type: "indirectExpense",    label: "Indirect Expense",   icon: "alert-circle",     color: "#F97316" },
  { type: "directIncome",       label: "Direct Income",      icon: "add-circle",       color: "#06B6D4" },
  { type: "indirectIncome",     label: "Indirect Income",    icon: "checkmark-circle", color: "#6366F1" },
  { type: "fixedAssets",        label: "Fixed Assets",       icon: "cube",             color: "#84CC16" },
  { type: "currentAssets",      label: "Current Assets",     icon: "layers",           color: "#14B8A6" },
  { type: "loansAndLiabilitieslw", label: "Loans",           icon: "link",             color: "#E879F9" },
  { type: "accountsReceivable", label: "Receivable",         icon: "arrow-down-circle",color: "#2563EB" },
  { type: "accountsPayable",    label: "Payable",            icon: "arrow-up-circle",  color: "#DC2626" },
];

export default function LedgerCreateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const initialLedgerType = useMemo<LedgerType>(() => {
    const paramType = Array.isArray(params.type) ? params.type[0] : params.type;
    return paramType === "cash" ? "cash" : "bank";
  }, [params.type]);

  const [ledgerName, setLedgerName] = useState("");
  const [ledgerType, setLedgerType] = useState<LedgerType>(initialLedgerType);
  const [openingBalance, setOpeningBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedOption = ledgerTypeOptions.find((o) => o.type === ledgerType);

  async function handleSave() {
    const amount = Number(openingBalance || "0");
    if (!ledgerName.trim()) {
      setError("Ledger name is required.");
      return;
    }
    if (Number.isNaN(amount)) {
      setError("Opening balance must be a number.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await accountingService.createLedger({
        ledgerName: ledgerName.trim(),
        ledgerType,
        openingBalance: amount,
      });
      router.push("/accounting/ledgers");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to create ledger. Try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="New Ledger"
        showBackButton
        rightContent={
          loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Pressable onPress={handleSave}>
              <Text style={styles.headerSave}>Save</Text>
            </Pressable>
          )
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Ledger Name */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ledger Name</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="document-text-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              value={ledgerName}
              onChangeText={setLedgerName}
              placeholder="e.g. Cash Account"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />
          </View>
        </View>

        {/* Opening Balance */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Opening Balance</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.currencySign}>₹</Text>
            <TextInput
              value={openingBalance}
              onChangeText={(text) => setOpeningBalance(text.replace(/[^0-9.]/g, ""))}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94A3B8"
              style={[styles.input, { marginLeft: 8 }]}
            />
          </View>
        </View>

        {/* Ledger Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ledger Type</Text>
          <View style={styles.typeGrid}>
            {ledgerTypeOptions.map((opt) => (
              <Pressable
                key={opt.type}
                onPress={() => setLedgerType(opt.type)}
                style={[
                  styles.typeCard,
                  ledgerType === opt.type && {
                    borderColor: opt.color,
                    backgroundColor: `${opt.color}12`,
                  },
                ]}
              >
                <View
                  style={[
                    styles.typeIconWrap,
                    { backgroundColor: `${opt.color}18` },
                  ]}
                >
                  <Ionicons name={opt.icon as any} size={18} color={opt.color} />
                </View>
                <Text
                  style={[
                    styles.typeLabel,
                    ledgerType === opt.type && { color: opt.color, fontWeight: "700" },
                  ]}
                  numberOfLines={2}
                >
                  {opt.label}
                </Text>
                {ledgerType === opt.type && (
                  <Ionicons name="checkmark-circle" size={14} color={opt.color} style={styles.typeCheck} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Selected Summary */}
        {selectedOption && (
          <View style={[styles.summaryCard, { borderColor: selectedOption.color }]}>
            <Ionicons name={selectedOption.icon as any} size={20} color={selectedOption.color} />
            <Text style={[styles.summaryText, { color: selectedOption.color }]}>
              Creating <Text style={{ fontWeight: "800" }}>{selectedOption.label}</Text> ledger
            </Text>
          </View>
        )}

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Bottom Save */}
      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save Ledger</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  headerSave: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  content: { padding: 16, paddingBottom: 100 },
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  inputIcon: { marginRight: 10 },
  currencySign: { fontSize: 16, color: "#475569", fontWeight: "600" },
  input: { flex: 1, fontSize: 15, color: "#0F172A" },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeCard: {
    width: "30%",
    minWidth: 90,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    padding: 10,
    alignItems: "center",
    position: "relative",
  },
  typeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  typeLabel: {
    fontSize: 10,
    color: "#475569",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 14,
  },
  typeCheck: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 16,
  },
  summaryText: { fontSize: 14 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#DC2626", fontSize: 13, flex: 1 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  saveBtn: {
    backgroundColor: "#3B82F6",
    borderRadius: 14,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
