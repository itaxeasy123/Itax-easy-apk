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
            <Ionicons name="search" size={20} color="#fff" />
            <Ionicons name="filter" size={20} color="#fff" />
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
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
            <Ionicons name="chevron-down" size={18} color="#64748B" />
          </Pressable>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Select Date</Text>
          <Pressable style={styles.dropdownWrap}>
            <Text style={styles.dropdownText}>{date}</Text>
            <Ionicons name="calendar-outline" size={18} color="#64748B" />
          </Pressable>
        </View>

        <View style={styles.rowGroup}>
          <Text style={styles.label}>Bank Details</Text>
          <Pressable onPress={() => router.push("/accounting/bank-create")}>
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
    gap: 16,
  },
  content: {
    flex: 1,
    padding: 16,
    marginTop: -16, // to overlap the rounded corner if needed, but not necessary here
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencyPrefix: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
  },
  dropdownWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  dropdownText: {
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
  },
  rowGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  addLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  footer: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  footerLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  footerAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
  },
  payButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
