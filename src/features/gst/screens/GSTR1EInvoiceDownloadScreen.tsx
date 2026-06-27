/* eslint-disable import/namespace */
import React, { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import GSTBottomBar from "../components/GSTBottomBar";
import GSTHeader from "../components/GSTHeader";

import { fontSizes, fontWeights } from "../../../theme/typography";
interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  amount: number;
  status: "Generated" | "Pending";
  irn: string;
}

export default function GSTR1EInvoiceDownloadScreen() {
  const [invoices] = useState<InvoiceItem[]>([]);

  const totalAmount = useMemo(() => {
    return invoices.reduce((total, item) => total + item.amount, 0);
  }, [invoices]);

  const handleBack = () => {
    router.back();
  };

  const handleDownloadExcel = async () => {
    try {
      const excelData = invoices.length > 0
        ? invoices.map(item => ({
            "Invoice Number": item.invoiceNumber,
            "Date": item.invoiceDate,
            "Customer": item.customerName,
            "Amount": item.amount,
            "Status": item.status,
            "IRN": item.irn,
          }))
        : [{ Message: "No files available for download" }];

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "E-Invoices");

      if (Platform.OS === 'web') {
        XLSX.writeFile(workbook, "gstr1-einvoice-history.xlsx");
        alert("Excel downloaded successfully");
      } else {
        const excelBinary = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
         
        // @ts-ignore
        const fileUri = FileSystem.documentDirectory + "gstr1-einvoice-history.xlsx";
         
        // @ts-ignore
        await FileSystem.writeAsStringAsync(fileUri, excelBinary, { encoding: FileSystem.EncodingType.Base64 });
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Download E-Invoice Excel",
        });
        Alert.alert("Success", "Excel downloaded successfully");
      }
    } catch (error) {
      console.log("Excel Download Error", error);
      if (Platform.OS === 'web') {
        alert("Error downloading excel");
      } else {
        Alert.alert("Error", "Could not download excel");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <GSTHeader title="GSTR-1 / IFF" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {invoices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No files available for download</Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Invoices</Text>
                <Text style={styles.summaryValue}>{invoices.length}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.summaryValue}>₹{totalAmount.toLocaleString()}</Text>
              </View>
            </View>

            {invoices.map((invoice) => (
              <View key={invoice.id} style={styles.invoiceCard}>
                <View style={styles.invoiceTop}>
                  <View>
                    <Text style={styles.invoiceNo}>{invoice.invoiceNumber}</Text>
                    <Text style={styles.invoiceDate}>{invoice.invoiceDate}</Text>
                  </View>
                  <View style={[styles.statusBadge, invoice.status === "Generated" ? styles.generatedBadge : styles.pendingBadge]}>
                    <Text style={styles.statusText}>{invoice.status}</Text>
                  </View>
                </View>
                <Text style={styles.customerText}>{invoice.customerName}</Text>
                <Text style={styles.irnText}>IRN : {invoice.irn}</Text>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Invoice Amount</Text>
                  <Text style={styles.amountValue}>₹{invoice.amount.toLocaleString()}</Text>
                </View>
                <TouchableOpacity activeOpacity={0.9} style={styles.downloadButton} onPress={handleDownloadExcel}>
                  <Ionicons name="download" size={16} color="#FFFFFF" />
                  <Text style={styles.downloadButtonText}>Download Invoice</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.9} style={styles.excelButton} onPress={handleDownloadExcel}>
          <Text style={styles.excelButtonText}>Download E-Invoice Details (Excel)</Text>
        </TouchableOpacity>

        <View style={styles.footerBottomRow}>
          <TouchableOpacity activeOpacity={0.9} style={styles.backFooterButton} onPress={handleBack}>
            <Text style={styles.backFooterButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomWrap}>
        <GSTBottomBar />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 170,
  },
  emptyContainer: {
    marginTop: 20,
    marginHorizontal: 18,
    backgroundColor: "#F4F7FB",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  emptyText: {
    color: "#000000",
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  summaryCard: {
    marginTop: 14,
    marginHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: "#555",
  },
  summaryValue: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: "#111",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  invoiceCard: {
    marginTop: 14,
    marginHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  invoiceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  invoiceNo: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: "#111827",
  },
  invoiceDate: {
    marginTop: 4,
    fontSize: fontSizes.sm,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  generatedBadge: {
    backgroundColor: "#DCFCE7",
  },
  pendingBadge: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: "#111827",
  },
  customerText: {
    marginTop: 14,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: "#111827",
  },
  irnText: {
    marginTop: 8,
    fontSize: fontSizes.sm,
    color: "#666",
  },
  amountRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: {
    fontSize: fontSizes.md,
    color: "#555",
    fontWeight: fontWeights.semibold,
  },
  amountValue: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: "#111827",
  },
  downloadButton: {
    height: 42,
    borderRadius: 10,
    backgroundColor: "#3D7BEA",
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  downloadButtonText: {
    color: "#FFFFFF",
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 62,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingBottom: 16,
    paddingTop: 12,
  },
  excelButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "#3D7BEA",
    alignItems: "center",
    justifyContent: "center",
  },
  excelButtonText: {
    color: "#FFFFFF",
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  footerBottomRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  backFooterButton: {
    width: 82,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3D7BEA",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  backFooterButtonText: {
    color: "#3D7BEA",
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  bottomWrap: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
});
