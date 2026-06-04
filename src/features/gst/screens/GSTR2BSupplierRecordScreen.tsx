import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import GSTBottomBar from "../components/GSTBottomBar";

export default function GSTR2BSupplierRecordScreen() {
  const { name, type } = useLocalSearchParams<{ name: string, type: string }>();
  const tradeName = name || "INTERGLOBE AVIATION LIMITED";

  const initialValues = {
    gstin: "",
    invoiceNumber: "",
    invoiceDate: "",
    invoiceType: "",
    invoiceValue: "",
    placeOfSupply: "",
    reverseCharge: "",
    totalTaxableValue: "",
    integratedTax: "",
    centralTax: "",
    stateTax: "",
    cess: ""
  };

  const [values, setValues] = useState(initialValues);

  const handleValueChange = (key: keyof typeof initialValues, text: string) => {
    setValues(prev => ({ ...prev, [key]: text }));
  };

  const rows: { label: string; key: keyof typeof initialValues | 'name' }[] = [
    { label: "GSTIN of supplier", key: "gstin" },
    { label: "Trade/Legal name", key: "name" },
    { label: "Invoice Number", key: "invoiceNumber" },
    { label: "Invoice Date", key: "invoiceDate" },
    { label: "Invoice type", key: "invoiceType" },
    { label: "Invoice Value (₹)", key: "invoiceValue" },
    { label: "Place of supply", key: "placeOfSupply" },
    { label: "Supply attract Reverse Charge", key: "reverseCharge" },
    { label: "Total Taxable Value (₹)", key: "totalTaxableValue" },
    { label: "Integrated Tax (₹)", key: "integratedTax" },
    { label: "Central Tax (₹)", key: "centralTax" },
    { label: "State/UT Tax (₹)", key: "stateTax" },
    { label: "Cess (₹)", key: "cess" },
  ];

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
            <Text style={styles.pageTitleBold}>{type === 'document' ? 'Document Number: ' : 'Trade Name: '}</Text>
            <Text style={styles.pageTitleBlue}>{tradeName}</Text>
          </Text>

          <View style={styles.tableWrapper}>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeaderRow}>
                <View style={[styles.tableCell, styles.tableHeaderCell, { flex: 5 }]}>
                  <Text style={styles.tableHeaderSubText}>Information</Text>
                </View>
                <View style={[styles.tableCell, styles.tableHeaderCell, { flex: 5, borderRightWidth: 0 }]}>
                  <Text style={styles.tableHeaderSubText}>Data</Text>
                </View>
              </View>

              {/* Table Body */}
              {rows.map((row, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={[styles.tableCell, { flex: 5, justifyContent: 'center', alignItems: 'flex-start' }]}>
                    <Text style={styles.tableDataText}>{row.label}</Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 5, borderRightWidth: 0, justifyContent: 'center', alignItems: 'flex-start' }]}>
                    {row.key === 'name' ? (
                      <Text style={[styles.tableDataText, { fontWeight: '600' }]}>{tradeName}</Text>
                    ) : (
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.input}
                          value={values[row.key as keyof typeof initialValues]}
                          onChangeText={(text) => handleValueChange(row.key as keyof typeof initialValues, text)}
                        />
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
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
    textTransform: 'uppercase',
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
    minHeight: 48,
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
    fontSize: 12,
    color: "#374151",
    textAlign: "left",
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 12,
    color: "#374151",
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
