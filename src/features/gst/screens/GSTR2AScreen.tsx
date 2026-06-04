import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { useWindowDimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import GSTBottomBar from "../components/GSTBottomBar";
import { useGSTBusinessProfileStore } from "../store/gstBusinessProfileStore";

import { getAssessmentYears } from "../constants/gstData";

const partAItems = [
  "B2B Invoices",
  "Credit/Debit Notes",
  "Amendments to B2B Invoices",
  "Amendments to Credit/Debit Notes",
  "Eco Documents",
  "Amendments to ECO Documents",
];

const partBItems = [
  "ISD Credits",
  "Amendments to ISD Credits",
];

const partCItems = [
  "TDS Credits",
  "Amendments to TDS Credits",
  "TCS Credits",
];

const partDItems = [
  "Import of goods from overseas",
  "Import of goods from SEZ",
];

const b2bTableData: any[] = [
  {
    gstin: "",
    name: "",
    status: "",
    date: "",
    period: ""
  },
  {
    gstin: "",
    name: "",
    status: "",
    date: "",
    period: ""
  }
];

const tableRows = [
  { label: "GSTIN of Supplier", key: "gstin", isLink: true },
  { label: "Supplier Name", key: "name" },
  { label: "GSTR-1/IFF/GSTR-1A/GSTR-5 Filing Status", key: "status" },
  { label: "GSTR-1/IFF/GSTR-1A/GSTR-5 Filing Date", key: "date" },
  { label: "GSTR-1/IFF/GSTR-1A/GSTR-5 Filing Period", key: "period" }
];

export default function GSTR2AScreen() {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const { businessProfile } = useGSTBusinessProfileStore();
  const currentYear = getAssessmentYears()[0];
  const { width } = useWindowDimensions();
  
  const tableWidth = width - 32;
  const headerWidth = tableWidth * 0.32;
  const dataWidth = tableWidth * 0.34;

  const renderPart = (title: string, items: string[]) => (
    <View style={styles.partContainer}>
      <View style={styles.partHeaderRow}>
        <Text style={styles.partTitle}>{title}</Text>
      </View>

      {items.map((item, index) => {
        const isExpanded = expandedItem === item;
        const isB2BExpanded = isExpanded && item === "B2B Invoices";
        
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

            {isExpanded && item === "B2B Invoices" && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableWrapper}>
                <View style={styles.table}>
                  {tableRows.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.tableRow}>
                      <View style={[styles.tableCell, styles.tableHeaderCell, { width: headerWidth }]}>
                        <Text style={styles.tableHeaderText}>{row.label}</Text>
                      </View>
                      {b2bTableData.map((data, dataIndex) => (
                        <View key={dataIndex} style={[styles.tableCell, { width: dataWidth }]}>
                          {row.isLink ? (
                            <TouchableOpacity>
                              <Text style={styles.tableLinkText}>{data[row.key as keyof typeof data] || ""}</Text>
                            </TouchableOpacity>
                          ) : (
                            <Text style={[styles.tableDataText, row.key === 'name' && styles.tableDataTextBold]}>
                              {data[row.key as keyof typeof data] || ""}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            {isExpanded && item !== "B2B Invoices" && (
              <View style={styles.expandedContent}>
                <TouchableOpacity>
                  <Text style={styles.expandedLinkText}>
                    {item === "Eco Documents" || item === "Amendments to ECO Documents"
                      ? `${item} - B2B Details`
                      : item === "Amendments to Credit/Debit Notes"
                      ? "Amendments Credit/Debit Notes - Supplier wise details"
                      : `${item} - Supplier wise details`}
                  </Text>
                </TouchableOpacity>
                
                <View style={styles.noDocBox}>
                  <Text style={styles.noDocText}>No document found for the provided Inputs.</Text>
                </View>
                
                <TouchableOpacity activeOpacity={0.8} style={styles.downloadBtn}>
                  <Text style={styles.downloadBtnText}>Download Documents (CSV)</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );

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
        <Text style={styles.headerTitle}>GSTR-2A</Text>
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

        {/* Content Parts */}
        {renderPart("PART - A", partAItems)}
        {renderPart("PART - B", partBItems)}
        {renderPart("PART - C", partCItems)}
        {renderPart("PART - D", partDItems)}

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
    backgroundColor: "#F8F9FA",
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
  partHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  partTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: 0.5,
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
  tableWrapper: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: "#FFF",
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
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: "#D1D5DB",
    justifyContent: "center",
  },
  tableHeaderCell: {
    backgroundColor: "#F4F6F9",
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  tableDataText: {
    fontSize: 12,
    color: "#374151",
    textAlign: "center",
  },
  tableDataTextBold: {
    fontWeight: "700",
  },
  tableLinkText: {
    fontSize: 12,
    color: "#3574E2",
    textAlign: "center",
    textDecorationLine: "none",
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
    padding: 16,
  },
  expandedLinkText: {
    color: "#3574E2",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 16,
  },
  noDocBox: {
    backgroundColor: "#F4F6F9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  noDocText: {
    color: "#374151",
    fontSize: 13,
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
