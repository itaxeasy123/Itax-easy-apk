import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AccountingHeader } from "../components";
import { accountingTheme } from "../../../theme/accounting";

export default function BankCreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [ifsc, setIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [showOtherDetails, setShowOtherDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);

    const trimmedIfsc = ifsc.trim();
    if (!trimmedIfsc) {
      setError("IFSC code is required.");
      return;
    }
    if (trimmedIfsc.length !== 11) {
      setError("IFSC code must be exactly 11 characters.");
      return;
    }

    if (!bankName.trim()) {
      setError("Bank name is required.");
      return;
    }

    if (!branchName.trim()) {
      setError("Branch name is required.");
      return;
    }

    const trimmedAcc = accountNumber.trim();
    if (!trimmedAcc) {
      setError("Account number is required.");
      return;
    }
    if (!/^\d+$/.test(trimmedAcc)) {
      setError("Account number must contain only digits.");
      return;
    }

    if (trimmedAcc !== confirmAccountNumber.trim()) {
      setError("Account numbers do not match.");
      return;
    }
    
    if (showOtherDetails && upiId.trim()) {
      if (!upiId.includes('@')) {
        setError("Please enter a valid UPI ID (must contain '@').");
        return;
      }
    }

    // Since there is no API call mapped currently, we simulate success
    Alert.alert("Success", "Bank details validated successfully!", [
      { text: "OK", onPress: () => router.back() }
    ]);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.screen} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AccountingHeader
        title="Add New Bank"
        showBackButton
      />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 + Math.max(insets.bottom, 0) }} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Details</Text>

          <View style={styles.ifscRow}>
            <TextInput
              value={ifsc}
              onChangeText={setIfsc}
              placeholder="Enter IFSC"
              style={styles.ifscInput}
              autoCapitalize="characters"
              maxLength={11}
            />
            <Pressable style={styles.fetchButton}>
              <Text style={styles.fetchButtonText}>Fetch Bank Details</Text>
            </Pressable>
          </View>

          <TextInput
            value={bankName}
            onChangeText={setBankName}
            placeholder="Bank name"
            style={styles.input}
          />

          <TextInput
            value={branchName}
            onChangeText={setBranchName}
            placeholder="Bank branch name"
            style={styles.input}
          />

          <TextInput
            value={accountNumber}
            onChangeText={setAccountNumber}
            placeholder="Bank account number"
            style={styles.input}
            keyboardType="number-pad"
            secureTextEntry 
          />

          <TextInput
            value={confirmAccountNumber}
            onChangeText={setConfirmAccountNumber}
            placeholder="Confirm bank account number"
            style={styles.input}
            keyboardType="number-pad"
          />

          <Pressable 
            style={styles.otherDetailsToggle}
            onPress={() => setShowOtherDetails(!showOtherDetails)}
          >
            <Ionicons 
              name={showOtherDetails ? "remove-circle" : "add-circle"} 
              size={20} 
              color={accountingTheme.colors.text} 
            />
            <Text style={styles.otherDetailsText}>Other Details(Optional)</Text>
          </Pressable>

          {showOtherDetails && (
            <View style={styles.otherDetailsContainer}>
              <TextInput
                value={accountHolderName}
                onChangeText={setAccountHolderName}
                placeholder="Account Holder Name"
                style={styles.input}
              />
              <TextInput
                value={upiId}
                onChangeText={setUpiId}
                placeholder="UPI ID"
                style={styles.input}
                autoCapitalize="none"
              />
            </View>
          )}
          
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={accountingTheme.colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 0) + 16 }]}>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    padding: accountingTheme.spacing.lg,
  },
  section: {
    marginBottom: accountingTheme.spacing.xxl,
  },
  sectionTitle: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.text,
    marginBottom: accountingTheme.spacing.lg,
  },
  ifscRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.md,
    marginBottom: accountingTheme.spacing.lg,
  },
  ifscInput: {
    flex: 1,
    height: 48,
    backgroundColor: accountingTheme.colors.card,
    borderWidth: 1,
    borderColor: accountingTheme.colors.borderMedium,
    borderRadius: 8,
    paddingHorizontal: accountingTheme.spacing.md,
    fontSize: accountingTheme.fontSizes.lg,
    color: accountingTheme.colors.text,
  },
  fetchButton: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#3B82F6",
    height: 48,
    paddingHorizontal: accountingTheme.spacing.lg,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  fetchButtonText: {
    color: "#3B82F6",
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  input: {
    height: 48,
    backgroundColor: accountingTheme.colors.card,
    borderWidth: 1,
    borderColor: accountingTheme.colors.borderMedium,
    borderRadius: 8,
    paddingHorizontal: accountingTheme.spacing.md,
    fontSize: accountingTheme.fontSizes.lg,
    color: accountingTheme.colors.text,
    marginBottom: accountingTheme.spacing.lg,
  },
  otherDetailsToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.sm,
    paddingVertical: accountingTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: accountingTheme.colors.borderMedium,
    marginTop: accountingTheme.spacing.sm,
  },
  otherDetailsText: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: accountingTheme.colors.text,
  },
  otherDetailsContainer: {
    paddingTop: accountingTheme.spacing.lg,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: accountingTheme.colors.dangerLight,
    padding: accountingTheme.spacing.md,
    borderRadius: 8,
    marginTop: accountingTheme.spacing.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: accountingTheme.spacing.sm,
  },
  errorText: {
    color: accountingTheme.colors.error,
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.medium,
    flex: 1,
  },
  footer: {
    backgroundColor: accountingTheme.colors.card,
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: accountingTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: accountingTheme.colors.borderMedium,
  },
  saveButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.bold,
  },
});
