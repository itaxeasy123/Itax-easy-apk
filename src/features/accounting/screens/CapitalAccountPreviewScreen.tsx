import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AccountingHeader } from "../components";
import { accountingTheme } from "../../../theme/accounting";

export default function CapitalAccountPreviewScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Preview"
        showBackButton
        rightContent={
          <Pressable>
            <Ionicons name="ellipsis-horizontal" size={20} color={accountingTheme.colors.card} />
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
              <Text style={[styles.td, { flex: 2, fontWeight: accountingTheme.fontWeights.bold }]}>Grand Total</Text>
              <Text style={[styles.td, { flex: 1, textAlign: "right", fontWeight: accountingTheme.fontWeights.bold }]}>2,15,745.86</Text>
              <Text style={[styles.td, { flex: 1, textAlign: "right", fontWeight: accountingTheme.fontWeights.bold }]}>55,69,018.13</Text>
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
          <Ionicons name="share-social-outline" size={18} color={accountingTheme.colors.card} />
          <Text style={styles.shareText}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: accountingTheme.colors.borderLight,
  },
  content: {
    padding: accountingTheme.spacing.lg,
    paddingBottom: 100,
  },
  paper: {
    backgroundColor: accountingTheme.colors.card,
    padding: accountingTheme.spacing.xxl,
    minHeight: 500,
    shadowColor: accountingTheme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  companyName: {
    fontSize: accountingTheme.fontSizes.xs,
    fontWeight: accountingTheme.fontWeights.bold,
    textAlign: "center",
    color: accountingTheme.colors.black,
  },
  companySub: {
    fontSize: 8,
    textAlign: "center",
    color: accountingTheme.colors.black,
  },
  reportTitle: {
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.bold,
    textAlign: "center",
    marginTop: accountingTheme.spacing.md,
    color: accountingTheme.colors.black,
  },
  reportSubtitle: {
    fontSize: 9,
    textAlign: "center",
    color: accountingTheme.colors.black,
  },
  reportDate: {
    fontSize: 8,
    textAlign: "center",
    color: accountingTheme.colors.black,
    marginBottom: accountingTheme.spacing.sm,
  },
  pageIndicator: {
    fontSize: 8,
    textAlign: "right",
    color: accountingTheme.colors.black,
    marginBottom: accountingTheme.spacing.xs,
  },
  table: {
    borderWidth: 0.5,
    borderColor: accountingTheme.colors.black,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: accountingTheme.colors.black,
  },
  tableHeader2: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: accountingTheme.colors.black,
  },
  th: {
    padding: accountingTheme.spacing.xs,
    borderRightWidth: 0.5,
    borderRightColor: accountingTheme.colors.black,
  },
  thText: {
    fontSize: 8,
    fontWeight: accountingTheme.fontWeights.bold,
    textAlign: "center",
    color: accountingTheme.colors.black,
  },
  tr: {
    flexDirection: "row",
  },
  td: {
    fontSize: 8,
    color: accountingTheme.colors.black,
    padding: accountingTheme.spacing.xs,
  },
  totalRow: {
    borderTopWidth: 0.5,
    borderTopColor: accountingTheme.colors.black,
    borderBottomWidth: 0.5,
    borderBottomColor: accountingTheme.colors.black,
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: accountingTheme.colors.card,
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: accountingTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: accountingTheme.colors.borderMedium,
    gap: accountingTheme.spacing.md,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: accountingTheme.spacing.md,
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 8,
    gap: accountingTheme.spacing.sm,
  },
  downloadText: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#3B82F6",
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: accountingTheme.spacing.md,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    gap: accountingTheme.spacing.sm,
  },
  shareText: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: accountingTheme.colors.card,
  },
});
