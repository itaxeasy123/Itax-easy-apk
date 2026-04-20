import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import ExportButton from "../components/ExportButton";
import { useExcelExport } from "../hooks/useExcelExport";

export default function ExcelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { exportExcel, loading } = useExcelExport();

  const handleExport = async () => {
    const users = [
      { name: "Rahul", age: 25, city: "Delhi" },
      { name: "Amit", age: 30, country: "India" }, // dynamic field
      { name: "Amit", age: 30, country: "India" }, // dynamic field

    ];

    const invoices = [
      { id: 1, amount: 5000, status: "Paid" },
      { id: 2, amount: 7000, status: "Pending" },
    ];

    await exportExcel(
      [
        { name: "Users", data: users },
        { name: "Invoices", data: invoices },
      ],
      "ITR_Report"
    );
  };

  return (
     <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.container}>

        {/* 🔙 HEADER */}
        <View style={styles.header}>
          <Pressable
            style={styles.backBtn}
            onPress={() => router.replace("/dashboard")}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </Pressable>

          <Text style={styles.title}>Excel Export</Text>
        </View>

        {/* 📥 EXPORT BUTTON */}
        <ExportButton onPress={handleExport} loading={loading} />
             </ScrollView>
               </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  safe: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  backBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
});