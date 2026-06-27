import React from "react";
import GSTHeader from "../components/GSTHeader";
import { useNilRatedStore } from "../../../store/nilRatedStore";
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
import GSTBottomBar from "../components/GSTBottomBar";

import { fontSizes, fontWeights } from "../../../theme/typography";

export default function NilRatedSuppliesScreen() {
  const router = useRouter();
  const { records, deleteRecord } = useNilRatedStore();

  const handleAddRecord = () => {
    router.push("/gst/add-nil-rated");
  };

  const handleEditRecord = (id: number) => {
    router.push({
      pathname: "/gst/add-nil-rated",
      params: { editId: id }
    } as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <GSTHeader title="8A,8B,8C,8D-Nil Rated Supplies" />

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
        >
          <View style={styles.tableSection}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableTitle}>Record Details</Text>
              <TouchableOpacity style={styles.importBtn}>
                <Text style={styles.importBtnText}>Import EWB</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tableContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.tableWrapper}>
                  {/* HEADER ROW */}
                  <View style={styles.headerRow}>
                    <Text style={[styles.headerCell, { width: 30 }, styles.firstCell]}>Sr.</Text>
                    <Text style={[styles.headerCell, { flex: 2, minWidth: 90 }]}>Category</Text>
                    <Text style={[styles.headerCell, { flex: 1, minWidth: 60 }]}>Nil Rated</Text>
                    <Text style={[styles.headerCell, { flex: 1, minWidth: 60 }]}>Exempted</Text>
                    <Text style={[styles.headerCell, { flex: 1, minWidth: 60 }]}>Non-GST</Text>
                    <Text style={[styles.headerCell, { width: 65, textAlign: 'center' }]}>Actions</Text>
                  </View>

                  {/* DATA ROWS */}
                  {records?.filter(item => item && item.id !== undefined).map((item, index) => (
                    <View 
                      key={item.id} 
                      style={[styles.dataRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}
                    >
                      <Text style={[styles.dataCell, { width: 30 }, styles.firstCell]}>{index + 1}</Text>
                      <Text style={[styles.dataCell, { flex: 2, minWidth: 90 }]} numberOfLines={2}>{item.nature || "N/A"}</Text>
                      <Text style={[styles.dataCell, { flex: 1, minWidth: 60 }]} numberOfLines={1}>{item.nilRated || "0"}</Text>
                      <Text style={[styles.dataCell, { flex: 1, minWidth: 60 }]} numberOfLines={1}>{item.exempted || "0"}</Text>
                      <Text style={[styles.dataCell, { flex: 1, minWidth: 60 }]} numberOfLines={1}>{item.nonGst || "0"}</Text>
                      <View style={[styles.actionCell, { width: 65 }]}>
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

                  {(!records || records.length === 0) && (
                    <View style={styles.emptyRow}>
                      <Text style={styles.emptyText}>No records found</Text>
                      <Text style={{ fontSize: fontSizes.xs, color: '#94a3b8', marginTop: 4 }}>Tap 'Add Record' below</Text>
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
  
  tableSection: { marginHorizontal: 10, marginTop: 16 },
  tableHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingHorizontal: 4 },
  tableTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: "#1f2937" },
  
  importBtn: { backgroundColor: "#4B7BE5", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  importBtnText: { color: "#fff", fontSize: fontSizes.xs, fontWeight: fontWeights.semibold },
  
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
});
