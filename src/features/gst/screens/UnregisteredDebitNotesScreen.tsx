import React, { useState } from "react";
import GSTHeader from "../components/GSTHeader";
import { useCDNURStore, RecordItem } from "../../../store/cdnurStore";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import GSTBottomBar from "../components/GSTBottomBar";

import { fontSizes, fontWeights } from "../../../theme/typography";

type ViewMode = "primary" | "secondary";

export default function UnregisteredDebitNotesScreen() {
  const router = useRouter();
  const { records, deleteRecord } = useCDNURStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>("primary");
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);

  const handleAddRecord = () => {
    router.push("/gst/add-cdnur");
  };

  const handleEditRecord = (id: number) => {
    router.push({
      pathname: "/gst/add-cdnur",
      params: { editId: id }
    } as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <GSTHeader title="9B-Credit/Debit Notes (UnRegistered)" />

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
        >
          <View style={styles.tableSection}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableTitle}>Record Details</Text>
              
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {viewMode === "secondary" && (
                  <TouchableOpacity 
                    style={styles.backModeBtn}
                    onPress={() => setViewMode("primary")}
                  >
                    <Ionicons name="arrow-back" size={16} color="#4B7BE5" />
                    <Text style={styles.backModeBtnText}>Main Details</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.importBtn}>
                  <Text style={styles.importBtnText}>Import EWB</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.tableContainer}>
              <View style={styles.tableWrapper}>
                {/* HEADER ROW */}
                <View style={styles.headerRow}>
                  <Text style={[styles.headerCell, { width: 35 }, styles.firstCell]}>Sr.</Text>
                  
                  {viewMode === "primary" ? (
                    <>
                      <Text style={[styles.headerCell, { flex: 1.5 }]}>Note No.</Text>
                      <Text style={[styles.headerCell, { flex: 1.5 }]}>Note Date</Text>
                      <Text style={[styles.headerCell, { flex: 1.5 }]}>Note Type</Text>
                      <Text style={[styles.headerCell, { flex: 1.5 }]}>POS</Text>
                      <Text style={[styles.headerCell, { width: 80, textAlign: 'center' }]}>Actions</Text>
                    </>
                  ) : (
                    <>
                      <Text style={[styles.headerCell, { flex: 1.5 }]}>Note Value</Text>
                      <Text style={[styles.headerCell, { flex: 1.5 }]}>Total Taxable</Text>
                      <Text style={[styles.headerCell, { flex: 1 }]}>IGST</Text>
                      <Text style={[styles.headerCell, { flex: 1 }]}>Cess</Text>
                    </>
                  )}
                </View>

                {/* DATA ROWS */}
                {records?.filter(item => item && item.id !== undefined).map((item, index) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[styles.dataRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}
                    activeOpacity={0.7}
                    disabled={viewMode === "secondary"}
                    onPress={() => setSelectedRecord(item as RecordItem)}
                  >
                    <Text style={[styles.dataCell, { width: 35 }, styles.firstCell]}>{index + 1}</Text>
                    
                    {viewMode === "primary" ? (
                      <>
                        <Text style={[styles.dataCell, { flex: 1.5 }]} numberOfLines={1}>{item.noteNo || "-"}</Text>
                        <Text style={[styles.dataCell, { flex: 1.5 }]} numberOfLines={1}>{item.noteDate || "-"}</Text>
                        <Text style={[styles.dataCell, { flex: 1.5 }]} numberOfLines={1}>{item.noteType || "-"}</Text>
                        <Text style={[styles.dataCell, { flex: 1.5 }]} numberOfLines={1}>{item.state || "-"}</Text>
                        <View style={[styles.actionCell, { width: 80 }]}>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.iconButton}
                            onPress={(e) => { e.stopPropagation(); deleteRecord(item.id); }}
                          >
                            <MaterialIcons name="delete" size={14} color="#2962ff" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.iconButton}
                            onPress={(e) => { e.stopPropagation(); handleEditRecord(item.id); }}
                          >
                            <Feather name="edit-2" size={12} color="#ff3b30" />
                          </TouchableOpacity>
                          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                        </View>
                      </>
                    ) : (
                      <>
                        <Text style={[styles.dataCell, { flex: 1.5, fontWeight: fontWeights.bold }]} numberOfLines={1}>{item.noteValue || "0"}</Text>
                        <Text style={[styles.dataCell, { flex: 1.5 }]} numberOfLines={1}>{item.totalTaxable || "0"}</Text>
                        <Text style={[styles.dataCell, { flex: 1 }]} numberOfLines={1}>{item.integrated || "0"}</Text>
                        <Text style={[styles.dataCell, { flex: 1 }]} numberOfLines={1}>{item.cess || "0"}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ))}

                {(!records || records.length === 0) && (
                  <View style={styles.emptyRow}>
                    <Text style={styles.emptyText}>No records found</Text>
                    <Text style={{ fontSize: fontSizes.xs, color: '#94a3b8', marginTop: 4 }}>Tap 'Add Record' below</Text>
                  </View>
                )}
              </View>
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

        {/* Action Popup Bottom Sheet - Only View Details */}
        <Modal 
          visible={!!selectedRecord} 
          animationType="fade" 
          transparent={true} 
          onRequestClose={() => setSelectedRecord(null)}
        >
          {selectedRecord && (
            <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1} 
              onPress={() => setSelectedRecord(null)}
            >
              <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
                <View style={styles.sheetDragHandle} />
                
                <Text style={styles.popupTitle}>Options for Record</Text>
                
                <TouchableOpacity 
                  style={[styles.actionListItem, { borderBottomWidth: 0 }]}
                  onPress={() => {
                    setViewMode("secondary");
                    setSelectedRecord(null);
                  }}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: '#eff6ff' }]}>
                    <Ionicons name="list" size="sm" color="#3b82f6" />
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
  
  tableSection: { marginHorizontal: 10, marginTop: 16 },
  tableHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingHorizontal: 4 },
  tableTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: "#1f2937" },
  
  importBtn: { backgroundColor: "#4B7BE5", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  importBtnText: { color: "#fff", fontSize: fontSizes.xs, fontWeight: fontWeights.semibold },
  
  backModeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#eff6ff", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: '#bfdbfe' },
  backModeBtnText: { color: "#4B7BE5", fontSize: fontSizes.xs, fontWeight: fontWeights.bold, marginLeft: 4 },

  tableContainer: { backgroundColor: "#fff", borderRadius: 8, overflow: "hidden", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  tableWrapper: { width: '100%', borderTopWidth: 1, borderTopColor: '#d1d5db' },
  
  headerRow: { flexDirection: 'row', backgroundColor: '#e5e7eb', borderBottomWidth: 1, borderBottomColor: '#d1d5db' },
  headerCell: { paddingVertical: 10, paddingHorizontal: 2, fontSize: 10, fontWeight: fontWeights.bold, color: '#374151', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#d1d5db', justifyContent: 'center' },
  
  dataRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', alignItems: 'stretch' },
  rowEven: { backgroundColor: '#ffffff' },
  rowOdd: { backgroundColor: '#f8fafc' },
  dataCell: { paddingVertical: 12, paddingHorizontal: 2, fontSize: 10, color: '#4b5563', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#e5e7eb', justifyContent: 'center' },
  firstCell: { borderLeftWidth: 1, borderLeftColor: '#d1d5db' },
  
  actionCell: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 2, borderRightWidth: 1, borderRightColor: '#e5e7eb' },
  iconButton: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", justifyContent: "center", alignItems: "center" },

  emptyRow: { padding: 40, alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#d1d5db', backgroundColor: '#f9fafb' },
  emptyText: { color: '#64748b', fontSize: fontSizes.md, fontWeight: fontWeights.semibold },
  
  bottomActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 12 },
  addRecordBtn: { backgroundColor: "#4B7BE5", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6, minWidth: 100, alignItems: 'center' },
  addRecordBtnText: { color: "#fff", fontSize: fontSizes.md, fontWeight: fontWeights.semibold },
  backActionBtn: { backgroundColor: "#fff", paddingVertical: 8, paddingHorizontal: 20, borderRadius: 6, borderWidth: 1, borderColor: "#4B7BE5", minWidth: 100, alignItems: 'center' },
  backActionBtnText: { color: "#4B7BE5", fontSize: fontSizes.md, fontWeight: fontWeights.semibold },

  // Action Popup
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end", alignItems: "center" },
  bottomSheet: { width: '100%', backgroundColor: "#ffffff", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, elevation: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: -4 } },
  sheetDragHandle: { width: 40, height: 4, backgroundColor: "#e2e8f0", borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  popupTitle: { fontSize: fontSizes.md, fontWeight: fontWeights.bold, color: '#64748b', marginBottom: 16, textAlign: 'center' },
  
  actionListItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  actionIconBox: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionItemText: { flex: 1, fontSize: fontSizes.md, color: '#334155', fontWeight: fontWeights.semibold },
});
