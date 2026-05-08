import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AccountingHeader } from "../components";

export default function CapitalAccountPreviewScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Preview"
        showBackButton
        rightContent={
          <Pressable>
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Placeholder for the actual PDF Preview or HTML Print View */}
        <View style={styles.paper}>
          <Text style={styles.companyName}>Anand Trading Company 24-25</Text>
          <Text style={styles.companySub}>Anand Bhawan Jayendraganj</Text>
          <Text style={styles.companySub}>Gwalior</Text>
          
          <Text style={styles.reportTitle}>Capital Account</Text>
          <Text style={styles.reportSubtitle}>Group Summary</Text>
          <Text style={styles.reportDate}>1-Apr-2024 to 7-Feb-2025</Text>
          
          <Text style={styles.pageIndicator}>Page 1</Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={[styles.th, { flex: 2 }]} />
              <View style={[styles.th, { flex: 1 }]}>
                <Text style={styles.thText}>Closing Balance</Text>
              </View>
            </View>
            <View style={styles.tableHeader2}>
              <View style={[styles.th, { flex: 2 }]} />
              <View style={[styles.th, { flex: 1 }]}>
                <Text style={styles.thText}>Debit</Text>
              </View>
              <View style={[styles.th, { flex: 1 }]}>
                <Text style={styles.thText}>Credit</Text>
              </View>
            </View>

            {/* Dummy Mock Row */}
            <View style={styles.tr}>
              <Text style={[styles.td, { flex: 2 }]}>Chaitanya</Text>
              <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>1,62,000.00</Text>
              <Text style={[styles.td, { flex: 1, textAlign: "right" }]}></Text>
            </View>
            
            <View style={styles.tr}>
              <Text style={[styles.td, { flex: 2 }]}>CREDIT CARD SBI</Text>
              <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>31,225.00</Text>
              <Text style={[styles.td, { flex: 1, textAlign: "right" }]}></Text>
            </View>
            
            <View style={[styles.tr, styles.totalRow]}>
              <Text style={[styles.td, { flex: 2, fontWeight: "700" }]}>Grand Total</Text>
              <Text style={[styles.td, { flex: 1, textAlign: "right", fontWeight: "700" }]}>2,15,745.86</Text>
              <Text style={[styles.td, { flex: 1, textAlign: "right", fontWeight: "700" }]}>55,69,018.13</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Pressable style={styles.downloadBtn}>
          <Ionicons name="download-outline" size={18} color="#3B82F6" />
          <Text style={styles.downloadText}>Download</Text>
        </Pressable>
        <Pressable style={styles.shareBtn}>
          <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
          <Text style={styles.shareText}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  paper: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    minHeight: 500,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  companyName: {
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    color: "#000",
  },
  companySub: {
    fontSize: 8,
    textAlign: "center",
    color: "#000",
  },
  reportTitle: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
    color: "#000",
  },
  reportSubtitle: {
    fontSize: 9,
    textAlign: "center",
    color: "#000",
  },
  reportDate: {
    fontSize: 8,
    textAlign: "center",
    color: "#000",
    marginBottom: 8,
  },
  pageIndicator: {
    fontSize: 8,
    textAlign: "right",
    color: "#000",
    marginBottom: 4,
  },
  table: {
    borderWidth: 0.5,
    borderColor: "#000",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#000",
  },
  tableHeader2: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#000",
  },
  th: {
    padding: 4,
    borderRightWidth: 0.5,
    borderRightColor: "#000",
  },
  thText: {
    fontSize: 8,
    fontWeight: "700",
    textAlign: "center",
    color: "#000",
  },
  tr: {
    flexDirection: "row",
  },
  td: {
    fontSize: 8,
    color: "#000",
    padding: 4,
  },
  totalRow: {
    borderTopWidth: 0.5,
    borderTopColor: "#000",
    borderBottomWidth: 0.5,
    borderBottomColor: "#000",
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 12,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 8,
    gap: 8,
  },
  downloadText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    gap: 8,
  },
  shareText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
