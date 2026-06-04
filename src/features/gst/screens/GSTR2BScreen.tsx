import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { useWindowDimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import GSTBottomBar from "../components/GSTBottomBar";
import { useGSTBusinessProfileStore } from "../store/gstBusinessProfileStore";
import { getAssessmentYears } from "../constants/gstData";

const tableRows = [
  { sr: "Part A", nature: "ITC Available - Credit may be claimed in relevant heading in GSTR - 3B", table: "", view: false, isHeader: true, group: "A" },
  { sr: "I", nature: "All other ITC - Supplies from registered persons.", table: "4(A)(5)", view: true, group: "A" },
  { sr: "II", nature: "Inward Supplies from ISD", table: "4(A)(4)", view: true, group: "A" },
  { sr: "III", nature: "Inward Supplies liable for reverse charge", table: "4(A)(3)", view: true, group: "A" },
  { sr: "IV", nature: "Import of Goods", table: "4(A)(2)", view: true, group: "A" },
  { sr: "Part B", nature: "ITC Reversal - Credit which must be reversed in relevant heading in GSTR - 3B", table: "", view: false, isHeader: true, group: "B" },
  { sr: "I", nature: "Others", table: "4(B)(2)", view: true, group: "B" },
];

const notAvailableTableRows = [
  { sr: "Part A", nature: "ITC Not Available", table: "", view: false, isHeader: true, group: "A" },
  { sr: "I", nature: "All other ITC - Supplies from registered persons.", table: "4(D)(2)", view: true, group: "A" },
  { sr: "II", nature: "Inward Supplies from ISD", table: "4(D)(3)", view: true, group: "A" },
  { sr: "III", nature: "Inward Supplies liable for reverse charge", table: "4(D)(4)", view: true, group: "A" },
  { sr: "Part B", nature: "ITC Not Available - Others", table: "", view: false, isHeader: true, group: "B" },
  { sr: "I", nature: "Others", table: "4(D)(5)", view: true, group: "B" },
];

const dummySupplierData = [
  { sr: "1", name: "INTERGLOBE AVIATION LIMITED" },
  { sr: "2", name: "TATA SIA AIRLINES LIMITED" },
  { sr: "3", name: "HOTEL DURGA" },
  { sr: "4", name: "BDH HOTEL & RESORT" },
  { sr: "5", name: "YATRA ONLINE LIMITED" },
  { sr: "6", name: "MAKE MY TRIP (INDIA) PVT. LMT." },
];

const dummyDocumentData = [
  { sr: "1", name: "INV/2024/001" },
  { sr: "2", name: "INV/2024/002" },
  { sr: "3", name: "INV/2024/003" },
  { sr: "4", name: "INV/2024/004" },
];

export default function GSTR2BScreen() {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Summary" | "All Tables">("Summary");
  const { businessProfile } = useGSTBusinessProfileStore();
  const currentYear = getAssessmentYears()[0];
  const { width } = useWindowDimensions();
  
  const tableWidth = width - 32;

  const renderTable = (data: any[]) => (
    <View style={styles.expandedContent}>
      <View style={styles.tableWrapper}>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.tableHeaderCell, { flex: 1.5 }]}>
              <Text style={styles.tableHeaderSubText}>Sr. No</Text>
            </View>
            <View style={[styles.tableCell, styles.tableHeaderCell, { flex: 4.5 }]}>
              <Text style={styles.tableHeaderSubText}>Nature of Supplies</Text>
            </View>
            <View style={[styles.tableCell, styles.tableHeaderCell, { flex: 2.5 }]}>
              <Text style={styles.tableHeaderSubText}>GSTR - 2B table</Text>
            </View>
            <View style={[styles.tableCell, styles.tableHeaderCell, { flex: 1.5 }]}>
              <Text style={styles.tableHeaderSubText}>View</Text>
            </View>
          </View>

          {/* Table Body */}
          {data.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              <View style={[styles.tableCell, { flex: 1.5 }]}>
                <Text style={[styles.tableDataText, row.isHeader && styles.tableDataTextBold]}>{row.sr}</Text>
              </View>
              <View style={[styles.tableCell, { flex: row.isHeader ? 8.5 : 4.5 }]}>
                <Text style={[styles.tableDataText, row.isHeader && styles.tableDataTextBold, !row.isHeader && { textAlign: 'left' }]}>
                  {row.nature}
                </Text>
              </View>
              {!row.isHeader && (
                <>
                  <View style={[styles.tableCell, { flex: 2.5 }]}>
                    <Text style={styles.tableDataText}>{row.table}</Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 1.5, alignItems: "center" }]}>
                    {row.view && (
                      <TouchableOpacity
                        onPress={() => {
                          router.push({
                            pathname: "/gst/gstr2b-record",
                            params: {
                              part: `Part ${row.group}(${row.sr})`,
                              title: row.nature
                            }
                          });
                        }}
                      >
                        <Ionicons name="eye" size={20} color="#3574E2" />
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.8} style={styles.downloadBtn}>
        <Text style={styles.downloadBtnText}>Download GSTR-2B Summary (PDF)</Text>
      </TouchableOpacity>
    </View>
  );

  const renderListTable = (data: any[], colName: string, type: string) => (
    <View style={styles.expandedContent}>
      <View style={styles.tableWrapper}>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.tableHeaderCell, { flex: 1.5 }]}>
              <Text style={styles.tableHeaderSubText}>Sr. No</Text>
            </View>
            <View style={[styles.tableCell, styles.tableHeaderCell, { flex: 7 }]}>
              <Text style={styles.tableHeaderSubText}>{colName}</Text>
            </View>
            <View style={[styles.tableCell, styles.tableHeaderCell, { flex: 1.5 }]}>
              <Text style={styles.tableHeaderSubText}>View</Text>
            </View>
          </View>

          {/* Table Body */}
          {data.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              <View style={[styles.tableCell, { flex: 1.5 }]}>
                <Text style={styles.tableDataText}>{row.sr}</Text>
              </View>
              <View style={[styles.tableCell, { flex: 7, alignItems: "flex-start" }]}>
                <Text style={[styles.tableDataText, { textAlign: 'left', textTransform: 'uppercase' }]}>{row.name}</Text>
              </View>
              <View style={[styles.tableCell, { flex: 1.5, alignItems: "center" }]}>
                <TouchableOpacity
                  onPress={() => {
                    router.push({
                      pathname: "/gst/gstr2b-supplier-record",
                      params: {
                        name: row.name,
                        type: type
                      }
                    });
                  }}
                >
                  <Ionicons name="eye" size={20} color="#3574E2" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const getAccordions = () => {
    return activeTab === "Summary" 
      ? ["ITC Available", "ITC Not Available"] 
      : ["Supplier wise Details", "Document Details"];
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
        <Text style={styles.headerTitle}>GSTR-2B (Month)</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <LinearGradient
          colors={["#E8F5E9", "#F1F8E9"]}
          style={styles.profileCard}
        >
          <View style={styles.profileContent}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.profileDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ID</Text>
                <Text style={styles.detailValue}>: {businessProfile?.id || "N/A"}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>GSTIN</Text>
                <Text style={styles.detailValue}>: {businessProfile?.gstin || "N/A"}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Financial year</Text>
                <Text style={styles.detailValue}>: {businessProfile?.financialYear || currentYear}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.profileArrow}>
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <View style={styles.divider} />

        {/* Content */}
        <View style={styles.partContainer}>
          {!expandedItem ? (
            <>
              <Text style={styles.sectionTitle}>Auto ITC Quarter</Text>
              <View style={styles.tabContainer}>
                <TouchableOpacity 
                  style={[styles.tabButton, activeTab === "Summary" && styles.tabButtonActive]}
                  onPress={() => { setActiveTab("Summary"); setExpandedItem(null); }}
                >
                  <Text style={[styles.tabButtonText, activeTab === "Summary" && styles.tabButtonTextActive]}>Summary</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.tabButton, activeTab === "All Tables" && styles.tabButtonActive]}
                  onPress={() => { setActiveTab("All Tables"); setExpandedItem(null); }}
                >
                  <Text style={[styles.tabButtonText, activeTab === "All Tables" && styles.tabButtonTextActive]}>All Tables</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.viewQuarterRow}>
              <TouchableOpacity style={styles.viewBtn}>
                <Text style={styles.viewBtnText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quarterBtn}>
                <Text style={styles.quarterBtnText}>Quarter</Text>
                <Ionicons name="chevron-down" size={16} color="#4B5563" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          )}

          {getAccordions().map((item, index) => {
            const isExpanded = expandedItem === item;
            
            return (
              <View key={index} style={styles.accordionContainer}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.accordionItem, isExpanded && styles.accordionItemExpanded]}
                  onPress={() => setExpandedItem(isExpanded ? null : item)}
                >
                  <Text style={styles.accordionTitle}>{item}</Text>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#4B5563"
                  />
                </TouchableOpacity>

                {isExpanded && item === "ITC Available" && renderTable(tableRows)}
                {isExpanded && item === "ITC Not Available" && renderTable(notAvailableTableRows)}
                {isExpanded && item === "Supplier wise Details" && renderListTable(dummySupplierData, "Trade/legal name", "supplier")}
                {isExpanded && item === "Document Details" && renderListTable(dummySupplierData, "Trade/legal name", "supplier")}
              </View>
            );
          })}
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
  profileCard: {
    padding: 16,
    paddingVertical: 20,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    backgroundColor: "#3E7BFA",
    alignItems: "center",
    justifyContent: "center",
  },
  profileDetails: {
    flex: 1,
    justifyContent: "center",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  detailLabel: {
    width: 100,
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  detailValue: {
    flex: 1,
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  profileArrow: {
    paddingLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#000",
    width: "100%",
  },
  partContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 16,
    borderRadius: 4,
  },
  tabButtonActive: {
    backgroundColor: "#E8F0FE",
    borderWidth: 1,
    borderColor: "#3574E2",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  tabButtonTextActive: {
    color: "#3574E2",
  },
  viewQuarterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  viewBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 12,
  },
  viewBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  quarterBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  quarterBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  accordionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F6F8",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 16,
  },
  accordionItemExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  accordionContainer: {
    marginBottom: 12,
  },
  accordionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  expandedContent: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: "#FFF",
    padding: 12,
  },
  tableWrapper: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 16,
  },
  table: {
    flexDirection: "column",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
  },
  tableCell: {
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: "#D1D5DB",
    justifyContent: "center",
  },
  tableHeaderCell: {
    backgroundColor: "#3574E2",
  },
  tableHeaderSubText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
    textAlign: "center",
  },
  tableDataText: {
    fontSize: 11,
    color: "#374151",
    textAlign: "center",
  },
  tableDataTextBold: {
    fontWeight: "600",
  },
  downloadBtn: {
    backgroundColor: "#3574E2",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  downloadBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  noDocBox: {
    backgroundColor: "#F4F6F9",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  noDocText: {
    color: "#374151",
    fontSize: 13,
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
