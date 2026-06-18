import { Ionicons } from "@expo/vector-icons";
import GSTHeader from "../components/GSTHeader";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import GSTBottomBar from "../components/GSTBottomBar";
import { useGSTBusinessProfileStore } from "../store/gstBusinessProfileStore";
import { getAssessmentYears } from "../constants/gstData";
import { previewGSTRPdf } from "../services/gstrPdf.service";;

import { fontSizes, fontWeights } from "../../../theme/typography";
const taxRows = [
  { id: 1, label: "Integrated Tax (₹)" },
  { id: 2, label: "Central Tax (₹)" },
  { id: 3, label: "State/UT Tax (₹)" },
  { id: 4, label: "CESS (₹)" },
];

export default function GSTR2BRecordScreen() {
  const { part, title } = useLocalSearchParams<{ part: string; title: string }>();
  const [values, setValues] = useState<{ [key: number]: string }>({});
  const { businessProfile } = useGSTBusinessProfileStore();
  const currentYear = getAssessmentYears()[0];

  const handleValueChange = (id: number, text: string) => {
    setValues(prev => ({ ...prev, [id]: text }));
  };

  const handleDownloadExcel = async () => {
    try {
      const wsData = [
        ["Sr. No", "Supplies", "Value (₹)"],
        ...taxRows.map(row => [
          `${row.id}.`,
          row.label,
          values[row.id] || "0"
        ])
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      const colWidths = [
        { wch: 8 },
        { wch: 30 },
        { wch: 15 }
      ];
      ws['!cols'] = colWidths;
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Details");
      
      const filename = `GSTR2B_Details_${part?.replace(/[^a-zA-Z0-9]/g, "") || "Data"}.xlsx`;

      if (Platform.OS === 'web') {
        const wboutWeb = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        const blob = new Blob([wboutWeb], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, wbout, {
          encoding: FileSystem.EncodingType.Base64
        });
        await Sharing.shareAsync(fileUri, {
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            dialogTitle: `Save or Share ${filename}`
        });
      }
    } catch (error) {
      console.error("Error generating Excel:", error);
      Alert.alert("Error", "Failed to download Excel file.");
    }
  };

  const handleDownloadPdf = async () => {
    const dataForPdf = taxRows.map(row => ({
      id: row.id,
      label: row.label,
      value: values[row.id] || "0"
    }));

    await previewGSTRPdf({
      type: "details",
      title: `${part || "Part A(I)"} - ${title || "All other ITC"}`,
      data: dataForPdf,
      gstin: businessProfile?.gstin,
      financialYear: businessProfile?.financialYear || currentYear,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <GSTHeader title="GSTR 2B" />

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

          <TouchableOpacity activeOpacity={0.8} style={styles.downloadBtn} onPress={handleDownloadExcel}>
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
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: "#FFF",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: 20,
  },
  pageTitle: {
    fontSize: fontSizes.md,
    marginBottom: 24,
    lineHeight: 20,
  },
  pageTitleBold: {
    fontWeight: fontWeights.bold,
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
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: "#FFF",
    textAlign: "center",
  },
  tableDataText: {
    fontSize: fontSizes.md,
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
    fontSize: fontSizes.md,
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
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
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
    fontWeight: fontWeights.semibold,
    fontSize: fontSizes.md,
  },
});
