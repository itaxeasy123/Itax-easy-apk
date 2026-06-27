import React from "react";
import GSTHeader from "../components/GSTHeader";
import { useExportStore } from "../../../store/exportStore";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import GSTBottomBar from "../components/GSTBottomBar";;

import { fontSizes, fontWeights } from "../../../theme/typography";
export default function GSTR1ExportInvoicesScreen() {
  const router = useRouter();
  const { records, deleteRecord } = useExportStore();

  const handleAddRecord = () => {
    router.push("/gst/add-export-invoice");
  };

  const handleEditRecord = (id: number) => {
    router.push({
      pathname: "/gst/add-export-invoice",
      params: { editId: id }
    } as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <GSTHeader title="6A-Export Invoices" />

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
        >
          <View style={styles.tableSection}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableTitle}>Record Details</Text>
              <TouchableOpacity style={styles.importBtn}>
                <Text style={styles.importBtnText}>Import EWB Data</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tableContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.tableWrapper}>
                  {/* HEADER ROW */}
                  <View style={styles.headerRow}>
                    <Text style={[styles.headerCell, { minWidth: 40 }, styles.firstCell]}>Sr.</Text>
                    <Text style={[styles.headerCell, { flex: 1, minWidth: 50 }]}>POS</Text>
                    <Text style={[styles.headerCell, { flex: 1, minWidth: 70 }]}>Invoices No.</Text>
                    <Text style={[styles.headerCell, { flex: 1, minWidth: 60 }]}>Supply Type</Text>
                    <Text style={[styles.headerCell, { flex: 1, minWidth: 60 }]}>Invoices Date</Text>
                    <Text style={[styles.headerCell, { flex: 1, minWidth: 70 }]}>Invoices Value</Text>
                    <Text style={[styles.headerCell, { flex: 1, minWidth: 70 }]}>Total Invoices val</Text>
                    <Text style={[styles.headerCell, { flex: 1, minWidth: 30 }]}>%</Text>
                    <Text style={[styles.headerCell, { minWidth: 70, textAlign: 'center' }]}>Actions</Text>
                  </View>

                  {/* DATA ROWS */}
                  {records.map((item, index) => (
                    <View key={item.id} style={[styles.dataRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
                      <Text style={[styles.dataCell, { minWidth: 40 }, styles.firstCell]}>{index + 1}</Text>
                      <Text style={[styles.dataCell, { flex: 1, minWidth: 50 }]}>{item.state}</Text>
                      <Text style={[styles.dataCell, { flex: 1, minWidth: 70 }]}>{item.invoiceNo}</Text>
                      <Text style={[styles.dataCell, { flex: 1, minWidth: 60 }]}>{item.supplyType}</Text>
                      <Text style={[styles.dataCell, { flex: 1, minWidth: 60 }]}>{item.invoiceDate}</Text>
                      <Text style={[styles.dataCell, { flex: 1, minWidth: 70 }]}>{item.invoiceValue}</Text>
                      <Text style={[styles.dataCell, { flex: 1, minWidth: 70 }]}>{item.totalInvoiceValue}</Text>
                      <Text style={[styles.dataCell, { flex: 1, minWidth: 30 }]}>{item.taxRate}</Text>
                      <View style={[styles.actionCell, { minWidth: 70 }]}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.iconButton}
                          onPress={() => deleteRecord(item.id)}
                        >
                          <MaterialIcons name="delete" size={14} color="#2962ff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.iconButton}
                          onPress={() => handleEditRecord(item.id)}
                        >
                          <Feather name="edit-2" size={12} color="#ff3b30" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  {records.length === 0 && (
                    <View style={styles.emptyRow}>
                      <Text style={styles.emptyText}>No records found</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>

            <View style={styles.bottomActions}>
              <TouchableOpacity
                style={styles.addRecordBtn}
                onPress={handleAddRecord}
                activeOpacity={0.8}
              >
                <Text style={styles.addRecordBtnText}>Add Record</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.backActionBtn}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Text style={styles.backActionBtnText}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <GSTBottomBar />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f2f5" },
  container: { flex: 1 },
  header: { 
    backgroundColor: "#3D7BEA", 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 14, 
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 45) : 45, 
    paddingBottom: 16 
  },
  backButton: { marginRight: 8 },
  headerTitle: { color: "#fff", fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, flex: 1, paddingRight: 10 },
  
  tableSection: { marginHorizontal: 16, marginTop: 16 },
  tableHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  tableTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: "#1f2937" },
  importBtn: { backgroundColor: "#4B7BE5", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  importBtnText: { color: "#fff", fontSize: fontSizes.sm, fontWeight: fontWeights.semibold },
  
  tableContainer: { backgroundColor: "#fff", borderRadius: 8, overflow: "hidden", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  tableWrapper: { flex: 1, width: '100%', borderTopWidth: 1, borderTopColor: '#d1d5db' },
  headerRow: { flexDirection: 'row', backgroundColor: '#e5e7eb', borderBottomWidth: 1, borderBottomColor: '#d1d5db' },
  headerCell: { paddingVertical: 8, paddingHorizontal: 6, fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: '#374151', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#d1d5db', justifyContent: 'center' },
  dataRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#d1d5db', alignItems: 'stretch' },
  rowEven: { backgroundColor: '#ffffff' },
  rowOdd: { backgroundColor: '#f9fafb' },
  dataCell: { paddingVertical: 8, paddingHorizontal: 6, fontSize: fontSizes.sm, color: '#4b5563', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#d1d5db', justifyContent: 'center' },
  firstCell: { borderLeftWidth: 1, borderLeftColor: '#d1d5db' },
  actionCell: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 6, borderRightWidth: 1, borderRightColor: '#d1d5db' },
  iconButton: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", justifyContent: "center", alignItems: "center" },
  emptyRow: { padding: 32, alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#d1d5db' },
  emptyText: { color: '#9ca3af', fontSize: fontSizes.md },
  
  bottomActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 12 },
  addRecordBtn: { backgroundColor: "#4B7BE5", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6, minWidth: 100, alignItems: 'center' },
  addRecordBtnText: { color: "#fff", fontSize: fontSizes.md, fontWeight: fontWeights.semibold },
  backActionBtn: { backgroundColor: "#fff", paddingVertical: 8, paddingHorizontal: 20, borderRadius: 6, borderWidth: 1, borderColor: "#4B7BE5", minWidth: 100, alignItems: 'center' },
  backActionBtnText: { color: "#4B7BE5", fontSize: fontSizes.md, fontWeight: fontWeights.semibold },
});
