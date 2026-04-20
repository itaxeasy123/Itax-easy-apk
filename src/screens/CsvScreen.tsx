import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CSVService } from "../services/csvService";

export default function CsvScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleCSVExport = async () => {
    const data = [
      { Name: "Rahul", Age: 25, City: "Delhi" },
      { Name: "Amit", Age: 30, City: "Noida" },
    ];

    await CSVService.exportCSV({
      data,
      fileName: "User_Report",
    });
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
         
          <Text style={styles.title}>CSV Export</Text>
        </View>

        {/* 📥 BUTTON */}
        <Pressable style={styles.button} onPress={handleCSVExport}>
          <Ionicons name="download-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}>Download CSV</Text>
        </Pressable>

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
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#16A34A",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
    backBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },
  btnText: { color: "#fff", fontWeight: "600" },

});