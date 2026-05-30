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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { AccountingHeader } from "../components";
import { accountingTheme } from "../../../theme/accounting";

export default function PaymentCreateScreen() {
    const insets = useSafeAreaInsets();
  const router = useRouter();
  const [amount, setAmount] = useState("11,200");
  const [paymentMode, setPaymentMode] = useState("Bank Transfer");
  const [date, setDate] = useState("14 Nov 24");
  const [notes, setNotes] = useState("");

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AccountingHeader
        title="Payment"
        showBackButton
        rightContent={
          <View style={styles.headerRight}>
            <Ionicons name="search" size={20} color={accountingTheme.colors.card} />
            <Ionicons name="filter" size={20} color={accountingTheme.colors.card} />
            <Ionicons name="ellipsis-horizontal" size={20} color={accountingTheme.colors.card} />
          </View>
        }
      />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 + Math.max(insets.bottom, 0) }} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Payment Mode</Text>
          <Pressable style={styles.dropdownWrap}>
            <Text style={styles.dropdownText}>{paymentMode}</Text>
            <Ionicons name="chevron-down" size={18} color={accountingTheme.colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Select Date</Text>
          <Pressable style={styles.dropdownWrap}>
            <Text style={styles.dropdownText}>{date}</Text>
            <Ionicons name="calendar-outline" size={18} color={accountingTheme.colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.rowGroup}>
          <Text style={styles.label}>Bank Details</Text>
          <Pressable onPress={() => router.navigate("/accounting/bank-create")}>
            <Text style={styles.addLink}>Add</Text>
          </Pressable>
        </View>

        <View style={styles.rowGroup}>
          <Text style={styles.label}>Notes</Text>
          <Pressable>
            <Text style={styles.addLink}>Add</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 0) + 16 }]}>
        <View>
          <Text style={styles.footerLabel}>Total Amount</Text>
          <Text style={styles.footerAmount}>₹ {amount || "0"}</Text>
        </View>
        <Pressable style={styles.payButton}>
          <Text style={styles.payButtonText}>Pay</Text>
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.lg,
  },
  content: {
    flex: 1,
    padding: accountingTheme.spacing.lg,
    marginTop: -16, // to overlap the rounded corner if needed, but not necessary here
  },
  formGroup: {
    marginBottom: accountingTheme.spacing.xl,
  },
  label: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#334155",
    marginBottom: accountingTheme.spacing.sm,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: accountingTheme.colors.card,
    borderWidth: 1,
    borderColor: accountingTheme.colors.borderMedium,
    borderRadius: 8,
    paddingHorizontal: accountingTheme.spacing.md,
  },
  currencyPrefix: {
    fontSize: 15,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#334155",
    marginRight: accountingTheme.spacing.xs,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: accountingTheme.colors.text,
    fontWeight: accountingTheme.fontWeights.medium,
  },
  dropdownWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: accountingTheme.colors.card,
    borderWidth: 1,
    borderColor: accountingTheme.colors.borderMedium,
    borderRadius: 8,
    paddingHorizontal: accountingTheme.spacing.md,
    height: 48,
  },
  dropdownText: {
    fontSize: 15,
    color: accountingTheme.colors.text,
    fontWeight: accountingTheme.fontWeights.medium,
  },
  rowGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: accountingTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.borderMedium,
  },
  addLink: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#3B82F6",
  },
  footer: {
    backgroundColor: accountingTheme.colors.card,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: accountingTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: accountingTheme.colors.borderMedium,
  },
  footerLabel: {
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.textSecondary,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  footerAmount: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
    marginTop: 2,
  },
  payButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: accountingTheme.spacing.md,
    paddingHorizontal: 32,
  },
  payButtonText: {
    color: accountingTheme.colors.card,
    fontSize: 15,
    fontWeight: accountingTheme.fontWeights.bold,
  },
});
