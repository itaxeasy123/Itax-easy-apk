import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { accountingService } from "../services/accountingService";

type BankLookupResult = Record<string, string | number | boolean | null | undefined>;

export default function BankTransactionsScreen() {
  const router = useRouter();
  const [ifsc, setIfsc] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [mobile, setMobile] = useState("");
  const [lookupResult, setLookupResult] = useState<BankLookupResult | null>(null);
  const [verifyResult, setVerifyResult] = useState<BankLookupResult | null>(null);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!ifsc.trim()) {
      setError("IFSC is required.");
      return;
    }

    try {
      setLoadingLookup(true);
      setError(null);
      const result = await accountingService.getBankDetailsByIfsc(ifsc.trim());
      setLookupResult(result.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to fetch bank details.");
    } finally {
      setLoadingLookup(false);
    }
  };

  const handleVerify = async () => {
    if (!ifsc.trim() || !accountNumber.trim() || !accountName.trim() || !mobile.trim()) {
      setError("IFSC, account number, account holder name and mobile are required.");
      return;
    }

    try {
      setLoadingVerify(true);
      setError(null);
      const result = await accountingService.verifyBankAccount({
        ifsc: ifsc.trim(),
        accountNumber: accountNumber.trim(),
        name: accountName.trim(),
        mobile: mobile.trim(),
      });
      setVerifyResult(result.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify bank account.");
    } finally {
      setLoadingVerify(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#347BE5" />
        </Pressable>
        <Text style={styles.headline}>Bank Tools</Text>
      </View>

      <Text style={styles.subtitle}>
        Backend currently supports IFSC lookup and account verification.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Find Bank by IFSC</Text>
        <TextInput
          value={ifsc}
          onChangeText={setIfsc}
          placeholder="Enter IFSC"
          style={styles.input}
          placeholderTextColor="#94A3B8"
        />
        <Pressable style={styles.button} onPress={handleLookup} disabled={loadingLookup}>
          <Text style={styles.buttonText}>
            {loadingLookup ? "Checking..." : "Lookup IFSC"}
          </Text>
        </Pressable>
        {lookupResult ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>Bank: {lookupResult?.BANK ?? lookupResult?.bank ?? "NA"}</Text>
            <Text style={styles.resultText}>Branch: {lookupResult?.BRANCH ?? lookupResult?.branch ?? "NA"}</Text>
            <Text style={styles.resultText}>State: {lookupResult?.STATE ?? lookupResult?.state ?? "NA"}</Text>
            <Text style={styles.resultText}>Address: {lookupResult?.ADDRESS ?? lookupResult?.address ?? "NA"}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Verify Bank Account</Text>
        <TextInput
          value={accountNumber}
          onChangeText={setAccountNumber}
          placeholder="Account Number"
          style={styles.input}
          placeholderTextColor="#94A3B8"
        />
        <TextInput
          value={accountName}
          onChangeText={setAccountName}
          placeholder="Account Holder Name"
          style={styles.input}
          placeholderTextColor="#94A3B8"
        />
        <TextInput
          value={mobile}
          onChangeText={setMobile}
          placeholder="Mobile Number"
          style={styles.input}
          placeholderTextColor="#94A3B8"
        />
        <Pressable style={styles.button} onPress={handleVerify} disabled={loadingVerify}>
          <Text style={styles.buttonText}>
            {loadingVerify ? "Verifying..." : "Verify Account"}
          </Text>
        </Pressable>
        {verifyResult ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>
              Name Match: {String(verifyResult?.name_at_bank ?? verifyResult?.nameMatch ?? "NA")}
            </Text>
            <Text style={styles.resultText}>
              Account Exists: {String(verifyResult?.account_exists ?? verifyResult?.accountExists ?? "NA")}
            </Text>
            <Text style={styles.resultText}>
              Status: {verifyResult?.status ?? verifyResult?.remarks ?? "Verified"}
            </Text>
          </View>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable style={styles.secondaryButton} onPress={() => router.push("/accounting")}>
        <Text style={styles.secondaryButtonText}>Back to Accounting</Text>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: {
    marginRight: 12,
  },
  headline: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    color: "#60708A",
    marginBottom: 18,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#24406D",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5EAF3",
    padding: 14,
    fontSize: 14,
    color: "#0F172A",
    marginBottom: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#347BE5",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  resultBox: {
    marginTop: 14,
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 12,
  },
  resultText: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 20,
  },
  errorText: {
    color: "#D64A4A",
    marginBottom: 16,
  },
  secondaryButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#E5EAF3",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#347BE5",
    fontWeight: "700",
  },
});
