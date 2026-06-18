import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView, Alert, Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Trash2, Pencil, ChevronLeft } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import GSTHeader from "../components/GSTHeader";
import GSTBottomBar from "../components/GSTBottomBar";
import { safeParseJson } from "../utils/gstHelpers";
import { fontSizes, fontWeights } from "../../../theme/typography";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";

type ViewMode = "primary" | "secondary";

interface InvoiceRecord {
  id: number;
  gstin?: string;
  name?: string;
  invoiceNo: string;
  invoiceDate: string;
  totalInvoiceValue: number;
  taxableValue: number;
  integratedTax: number;
  centralTax: number;
  stateTax: number;
  cess: number;
}

export default function AmendedCreditDebitNotesUnregisteredScreen() {
  const params = useLocalSearchParams();
  const years = ["2022", "2023", "2024", "2025", "2026"];

  const [records, setRecords] = useState<InvoiceRecord[]>([
    {
      id: 1,
      gstin: "23BPLM0446C1D4",
      name: "MUNICIPAL CORPORATION GWALIOR",
      invoiceNo: "SSE/24-25/010",
      invoiceDate: "05/07/2024",
      totalInvoiceValue: 5034422,
      taxableValue: 4266460,
      integratedTax: 0,
      centralTax: 383081.4,
      stateTax: 383081.4,
      cess: 0,
    },
  ]);

  const [viewMode, setViewMode] = useState<ViewMode>("primary");
  const [selectedRecord, setSelectedRecord] = useState<InvoiceRecord | null>(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [searchInvoice, setSearchInvoice] = useState("");

  useEffect(() => {
    if (params?.updatedInvoice) {
      const updatedInvoice = safeParseJson<InvoiceRecord>(params.updatedInvoice as string);
      if (!updatedInvoice) return;
      setRecords((prev) => prev.map((item) => item.id === updatedInvoice.id ? updatedInvoice : item));
    }
  }, [params?.updatedInvoice]);

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const yearMatch = selectedYear === "" ? true : item.invoiceDate.includes(selectedYear);
      const invoiceMatch = searchInvoice.trim() === "" ? true : item.invoiceNo.toLowerCase().includes(searchInvoice.toLowerCase());
      return yearMatch && invoiceMatch;
    });
  }, [selectedYear, searchInvoice, records]);

  const handleDelete = (id: number) => {
    Alert.alert("Delete Invoice", "Are you sure you want to delete this invoice?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => setRecords((prev) => prev.filter((item) => item.id !== id)) },
    ]);
  };

  const handleEdit = (item: InvoiceRecord) => {
    router.push({ pathname: "/gst/editamendedcreditdebitnotesunregistered", params: { invoiceData: JSON.stringify(item) } });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <GSTHeader title="9A-Amended Credit/Debit Notes (Not-Registered)" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
          <Text style={styles.processedText}>Processed Records</Text>

          {/* DYNAMIC TABLE */}
          <View style={styles.tableSection}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableTitle}>Record Details</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {viewMode === "secondary" && (
                  <TouchableOpacity style={styles.backModeBtn} onPress={() => setViewMode("primary")}>
                    <Ionicons name="arrow-back" size={16} color="#4B7BE5" />
                    <Text style={styles.backModeBtnText}>Main Details</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.tableContainer}>
              <View style={styles.tableWrapper}>
                {/* HEADER ROW */}
                <View style={styles.headerRow}>
                  <Text style={[styles.headerCell, { width: 35 }, styles.firstCell]}>Sr.</Text>
                  
                  {viewMode === "primary" ? (
                    <>
                      <Text style={[styles.headerCell, { flex: 1.5 }]}>GSTIN</Text>
                      <Text style={[styles.headerCell, { flex: 1.5 }]}>Rev. Inv No.</Text>
                      <Text style={[styles.headerCell, { flex: 1.2 }]}>Date</Text>
                      <Text style={[styles.headerCell, { flex: 1.5 }]}>Total Val</Text>
                      <Text style={[styles.headerCell, { width: 80, textAlign: 'center' }]}>Actions</Text>
                    </>
                  ) : (
                    <>
                      <Text style={[styles.headerCell, { flex: 1.5 }]}>Taxable</Text>
                      <Text style={[styles.headerCell, { flex: 1.2 }]}>IGST</Text>
                      <Text style={[styles.headerCell, { flex: 1.2 }]}>CGST</Text>
                      <Text style={[styles.headerCell, { flex: 1.2 }]}>SGST</Text>
                      <Text style={[styles.headerCell, { flex: 1 }]}>Cess</Text>
                    </>
                  )}
                </View>

                {/* DATA ROWS */}
                {filteredRecords.map((item, index) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[styles.dataRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}
                    activeOpacity={0.7}
                    disabled={viewMode === "secondary"}
                    onPress={() => setSelectedRecord(item)}
                  >
                    <Text style={[styles.dataCell, { width: 35 }, styles.firstCell]}>{index + 1}</Text>
                    
                    {viewMode === "primary" ? (
                      <>
                        <Text style={[styles.dataCell, { flex: 1.5 }]} numberOfLines={1}>{item.gstin || "-"}</Text>
                        <Text style={[styles.dataCell, { flex: 1.5 }]} numberOfLines={1}>{item.invoiceNo || "-"}</Text>
                        <Text style={[styles.dataCell, { flex: 1.2 }]} numberOfLines={1}>{item.invoiceDate || "-"}</Text>
                        <Text style={[styles.dataCell, { flex: 1.5, fontWeight: fontWeights?.bold || "bold" }]} numberOfLines={1}>
                          {item.totalInvoiceValue || "0"}
                        </Text>
                        <View style={[styles.actionCell, { width: 80 }]}>
                          <TouchableOpacity activeOpacity={0.8} style={styles.iconButton} onPress={(e) => { e.stopPropagation(); handleDelete(item.id); }}>
                            <MaterialIcons name="delete" size={14} color="#2962ff" />
                          </TouchableOpacity>
                          <TouchableOpacity activeOpacity={0.8} style={styles.iconButton} onPress={(e) => { e.stopPropagation(); handleEdit(item); }}>
                            <Feather name="edit-2" size={12} color="#ff3b30" />
                          </TouchableOpacity>
                          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                        </View>
                      </>
                    ) : (
                      <>
                        <Text style={[styles.dataCell, { flex: 1.5 }]} numberOfLines={1}>{item.taxableValue || "0"}</Text>
                        <Text style={[styles.dataCell, { flex: 1.2 }]} numberOfLines={1}>{item.integratedTax || "0"}</Text>
                        <Text style={[styles.dataCell, { flex: 1.2 }]} numberOfLines={1}>{item.centralTax || "0"}</Text>
                        <Text style={[styles.dataCell, { flex: 1.2 }]} numberOfLines={1}>{item.stateTax || "0"}</Text>
                        <Text style={[styles.dataCell, { flex: 1 }]} numberOfLines={1}>{item.cess || "0"}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ))}

                {filteredRecords.length === 0 && (
                  <View style={styles.emptyRow}>
                    <Text style={styles.emptyText}>No records found</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.bottomBackContainer}>
              <TouchableOpacity style={styles.bottomBackButton} onPress={() => router.push("/gst/gstr1-ammed")}>
                <ChevronLeft size={16} color="#2563eb" />
                <Text style={styles.bottomBackText}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Action Popup */}
        <Modal visible={!!selectedRecord} animationType="fade" transparent={true} onRequestClose={() => setSelectedRecord(null)}>
          {selectedRecord && (
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedRecord(null)}>
              <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
                <View style={styles.sheetDragHandle} />
                <Text style={styles.popupTitle}>Options for {selectedRecord.invoiceNo}</Text>
                <TouchableOpacity 
                  style={[styles.actionListItem, { borderBottomWidth: 0 }]}
                  onPress={() => { setViewMode("secondary"); setSelectedRecord(null); }}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: '#eff6ff' }]}>
                    <Ionicons name="list" size={20} color="#3b82f6" />
                  </View>
                  <Text style={styles.actionItemText}>View Details</Text>
                  <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        </Modal>

        <GSTBottomBar />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f2f5" },
  container: { flex: 1 },
  
  filterBox: { marginHorizontal: 10, marginTop: 10, backgroundColor: "#dfe9d4", borderWidth: 1, borderColor: "#c8d0c2", padding: 10 },
  filterRow: { flexDirection: "row", gap: 10 },
  filterItem: { flex: 1 },
  filterLabel: { fontSize: 10, color: "#333333", marginBottom: 5, fontWeight: "500" },
  pickerWrapper: { height: 36, borderWidth: 1, borderColor: "#b9b9b9", backgroundColor: "#f4f4f4", justifyContent: "center" },
  picker: { height: 38, width: "100%", color: "#000000", marginTop: -2 },
  searchInput: { height: 36, borderWidth: 1, borderColor: "#b9b9b9", backgroundColor: "#f4f4f4", paddingHorizontal: 10, fontSize: 11, color: "#000000" },
  processedText: { marginTop: 12, marginHorizontal: 12, marginBottom: 6, fontSize: 11, color: "#555555", fontWeight: "500" },

  tableSection: { marginHorizontal: 10, marginTop: 6 },
  tableHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingHorizontal: 4 },
  tableTitle: { fontSize: fontSizes?.lg || 16, fontWeight: fontWeights?.bold || "bold", color: "#1f2937" },
  
  backModeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#eff6ff", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: '#bfdbfe' },
  backModeBtnText: { color: "#4B7BE5", fontSize: fontSizes?.xs || 12, fontWeight: fontWeights?.bold || "bold", marginLeft: 4 },

  tableContainer: { backgroundColor: "#fff", borderRadius: 8, overflow: "hidden", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  tableWrapper: { width: '100%', borderTopWidth: 1, borderTopColor: '#d1d5db' },
  
  headerRow: { flexDirection: 'row', backgroundColor: '#e5e7eb', borderBottomWidth: 1, borderBottomColor: '#d1d5db' },
  headerCell: { paddingVertical: 10, paddingHorizontal: 2, fontSize: 10, fontWeight: fontWeights?.bold || "bold", color: '#374151', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#d1d5db', justifyContent: 'center' },
  
  dataRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', alignItems: 'stretch' },
  rowEven: { backgroundColor: '#ffffff' },
  rowOdd: { backgroundColor: '#f8fafc' },
  dataCell: { paddingVertical: 12, paddingHorizontal: 2, fontSize: 10, color: '#4b5563', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#e5e7eb', justifyContent: 'center' },
  firstCell: { borderLeftWidth: 1, borderLeftColor: '#d1d5db' },
  
  actionCell: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 2, borderRightWidth: 1, borderRightColor: '#e5e7eb' },
  iconButton: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", justifyContent: "center", alignItems: "center" },

  emptyRow: { padding: 40, alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#d1d5db', backgroundColor: '#f9fafb' },
  emptyText: { color: '#64748b', fontSize: fontSizes?.md || 14, fontWeight: fontWeights?.semibold || "600" },

  bottomBackContainer: { alignItems: "flex-end", marginTop: 16, marginBottom: 20 },
  bottomBackButton: { height: 34, borderWidth: 1, borderColor: "#7da3eb", backgroundColor: "#ffffff", borderRadius: 6, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  bottomBackText: { color: "#2563eb", fontSize: 12, fontWeight: "600", marginLeft: 2 },

  // Action Popup
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end", alignItems: "center" },
  bottomSheet: { width: '100%', backgroundColor: "#ffffff", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, elevation: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: -4 } },
  sheetDragHandle: { width: 40, height: 4, backgroundColor: "#e2e8f0", borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  popupTitle: { fontSize: fontSizes?.md || 14, fontWeight: fontWeights?.bold || "bold", color: '#64748b', marginBottom: 16, textAlign: 'center' },
  actionListItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  actionIconBox: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionItemText: { flex: 1, fontSize: fontSizes?.md || 14, color: '#334155', fontWeight: fontWeights?.semibold || "600" },
});
