import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import GSTBottomBar from "../components/GSTBottomBar";

const taxRows = [
  { id: 1, label: "Integrated Tax (₹)" },
  { id: 2, label: "Central Tax (₹)" },
  { id: 3, label: "State/UT Tax (₹)" },
  { id: 4, label: "CESS (₹)" },
];

export default function GSTR2BRecordScreen() {
  const { part, title } = useLocalSearchParams<{ part: string; title: string }>();
  const [values, setValues] = useState<{ [key: number]: string }>({});

  const handleValueChange = (id: number, text: string) => {
    setValues(prev => ({ ...prev, [id]: text }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GSTR 2B</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.pageTitle}>
            <Text style={styles.pageTitleBold}>{part || "Part A(I)"} </Text>
            <Text style={styles.pageTitleBlue}>{title || "All other ITC - Supplies from registered persons."}</Text>
          </Text>

          <View style={styles.tableWrapper}>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeaderRow}>
                <View style={[styles.tableCell, styles.tableHeaderCell, { flex: 1.5 }]}>
                  <Text style={styles.tableHeaderSubText}>Sr.</Text>
                </View>
                <View style={[styles.tableCell, styles.tableHeaderCell, { flex: 4.5 }]}>
                  <Text style={styles.tableHeaderSubText}>Supplies</Text>
                </View>
                <View style={[styles.tableCell, styles.tableHeaderCell, { flex: 4, borderRightWidth: 0 }]}>
                  <Text style={styles.tableHeaderSubText}>Value</Text>
                </View>
              </View>

              {/* Table Body */}
              {taxRows.map((row) => (
                <View key={row.id} style={styles.tableRow}>
                  <View style={[styles.tableCell, { flex: 1.5, justifyContent: 'center' }]}>
                    <Text style={styles.tableDataText}>{row.id}.</Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 4.5, justifyContent: 'center', alignItems: 'flex-start' }]}>
                    <Text style={styles.tableDataText}>{row.label}</Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 4, borderRightWidth: 0, justifyContent: 'center', alignItems: 'center' }]}>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={values[row.id] || ""}
                        onChangeText={(text) => handleValueChange(row.id, text)}
                        keyboardType="numeric"
                        placeholder="0.0"
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.8} style={styles.downloadBtn}>
            <Text style={styles.downloadBtnText}>Download GSTR-2B Details (Excel)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Back Button */}
      <View style={styles.floatingActionRow}>
        <TouchableOpacity style={styles.bottomBackBtn} onPress={() => router.back()}>
          <Text style={styles.bottomBackBtnText}>Back</Text>
        </TouchableOpacity>
      </View>

      <GSTBottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 60,
    backgroundColor: "#3574E2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: 20,
  },
  pageTitle: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  pageTitleBold: {
    fontWeight: "700",
    color: "#1F2937",
  },
  pageTitleBlue: {
    color: "#3574E2",
  },
  tableWrapper: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 32,
  },
  table: {
    flexDirection: "column",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#3574E2",
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#D1D5DB",
    minHeight: 56,
  },
  tableCell: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: "#D1D5DB",
  },
  tableHeaderCell: {
    paddingVertical: 14,
    justifyContent: "center",
  },
  tableHeaderSubText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
    textAlign: "center",
  },
  tableDataText: {
    fontSize: 13,
    color: "#374151",
    textAlign: "center",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    width: "100%",
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: "#3574E2", // The text in the input seems to be blue
  },
  downloadBtn: {
    backgroundColor: "#3574E2",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  downloadBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  floatingActionRow: {
    position: "absolute",
    bottom: 80,
    right: 16,
  },
  bottomBackBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#3574E2",
    borderRadius: 8,
  },
  bottomBackBtnText: {
    color: "#3574E2",
    fontWeight: "600",
    fontSize: 14,
  },
});
