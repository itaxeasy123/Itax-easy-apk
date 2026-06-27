import React from "react";
import GSTHeader from "../components/GSTHeader";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import GSTBottomBar from "../components/GSTBottomBar";
import { useB2BStore } from "../../../store/b2bStore";
import { useB2CLargeStore } from "../../../store/b2cLargeStore";
import { useB2COthersStore } from "../../../store/b2cOthersStore";
import { useCDNRStore } from "../../../store/cdnrStore";
import { useCDNURStore } from "../../../store/cdnurStore";
import { useExportStore } from "../../../store/exportStore";
import { useHSNStore } from "../../../store/hsnStore";
import { useNilRatedStore } from "../../../store/nilRatedStore";
import { useTaxLiabilityStore } from "../../../store/taxLiabilityStore";
import { useAdjustmentAdvancesStore } from "../../../store/adjustmentAdvancesStore";;

import { fontSizes, fontWeights } from "../../../theme/typography";
export default function GSTR1RecordsScreen() {
  const params = useLocalSearchParams();

  const b2bCount = useB2BStore(state => state.records?.length || 0);
  const b2cLargeCount = useB2CLargeStore(state => state.records?.length || 0);
  const exportCount = useExportStore(state => state.records?.length || 0);
  const b2cOthersCount = useB2COthersStore(state => state.records?.length || 0);
  const nilRatedCount = useNilRatedStore(state => state.records?.length || 0);
  const cdnrCount = useCDNRStore(state => state.records?.length || 0);
  const cdnurCount = useCDNURStore(state => state.records?.length || 0);
  const taxLiabilityCount = useTaxLiabilityStore(state => state.records?.length || 0);
  const adjustmentAdvancesCount = useAdjustmentAdvancesStore(state => state.records?.length || 0);
  const hsnCount = useHSNStore(state => state.records?.length || 0);

  const invoiceSections = [
    {
      title: "4A,4B,6B,6C-B2B Invoices",
      count: b2bCount,
      route: "/gst/b2b-invoices",
    },
    {
      title: "5A-B2C (Large Invoices)",
      count: b2cLargeCount,
      route: "/gst/b2c-large",
    },
    {
      title: "6A-Export Invoices",
      count: exportCount,
      route: "/gst/export-invoices",
    },
    {
      title: "7-B2C Others",
      count: b2cOthersCount,
      route: "/gst/b2c-others",
    },
    {
      title: "8A,8B, 8C,8D-Nil Rated Supplies",
      count: nilRatedCount,
      route: "/gst/nil-rated-supplies",
    },
    {
      title: "9B-Credit/Debit Notes(Registered)",
      count: cdnrCount,
      route: "/gst/credit-debit-notes",
    },
    {
      title: "9B-Credit/Debit Notes(UnRegistered)",
      count: cdnurCount,
      route: "/gst/unregistered-debit-notes",
    },
    {
      title: "11A(1),11A(2)-Tax Liability (Advances Received)",
      count: taxLiabilityCount,
      route: "/gst/gstr1-tax-liability",
    },
    {
      title: "11B(1),11B(2)-Tax Adjustment of(Advances)",
      count: adjustmentAdvancesCount,
      route: "/gst/gstr1-adjustment-advances",
    },
    {
      title: "12-HSN-wise Summary of Outward Supplies",
      count: hsnCount,
      route: "/gst/gstr1-hsn-summary",
    },
  ];

  const assessmentYear = params.assessmentYear || "2024-25";

  const profile = {
    name: "Shabaz Alam",

    gstin: "22AAAAA0000A1Z5",
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <GSTHeader title="GSTR-1 / IFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* PROFILE */}

        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color="#FFF" />
            </View>

            <View>
              <View style={styles.profileRow}>
                <Text style={styles.label}>ID</Text>

                <Text style={styles.value}>: {profile.name}</Text>
              </View>

              <View style={styles.profileRow}>
                <Text style={styles.label}>GSTIN</Text>

                <Text style={styles.value}>: {profile.gstin}</Text>
              </View>

              <Text style={styles.yearText}>
                Financial year : {assessmentYear}
              </Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#333" />
        </View>

        {/* ADD RECORD */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.dropdown}
          onPress={() => router.replace("/gst/gstr1")}
        >
          <Text style={styles.dropdownText}>Add Records Details</Text>

          <Ionicons name="chevron-up" size={20} color="#555" />
        </TouchableOpacity>

        {/* RECORD CARDS */}

        {invoiceSections.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.85}
            style={styles.invoiceCard}
            onPress={() =>
              router.push({
                pathname: item.route as any,

                params: {
                  assessmentYear: params.assessmentYear,

                  quarter: params.quarter,

                  month: params.month,
                },
              })
            }
          >
            <View style={styles.invoiceTop}>
              <Text style={styles.invoiceTitle}>{item.title}</Text>

              <Ionicons name="chevron-forward" size={18} color="#555" />
            </View>

            <View style={styles.invoiceBottom}>
              <Ionicons name="alert-circle-outline" size={14} color="#666" />

              <Text style={styles.invoiceCount}>{item.count}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* BUTTONS */}

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* BOTTOM */}

      <View style={styles.bottomWrap}>
        <GSTBottomBar />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,

    backgroundColor: "#F3F4F6",
  },

  header: {
    backgroundColor: "#3D7BEA",

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 14,

    paddingTop: Platform.OS === "android" ? 40 : 16,

    paddingBottom: 16,
  },

  headerTitle: {
    color: "#FFF",

    fontSize: fontSizes.lg,

    fontWeight: fontWeights.semibold,

    marginLeft: 12,
  },

  profileCard: {
    backgroundColor: "#DDEFD8",

    marginTop: 10,

    padding: 12,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  profileLeft: {
    flexDirection: "row",

    alignItems: "center",
  },

  avatar: {
    width: 44,

    height: 44,

    borderRadius: 22,

    backgroundColor: "#3D7BEA",

    alignItems: "center",

    justifyContent: "center",

    marginRight: 10,
  },

  profileRow: {
    flexDirection: "row",

    marginBottom: 2,
  },

  label: {
    width: 52,

    fontSize: fontSizes.sm,

    fontWeight: fontWeights.bold,

    color: "#222",
  },

  value: {
    fontSize: fontSizes.sm,

    color: "#222",
  },

  yearText: {
    marginTop: 2,

    fontSize: fontSizes.sm,

    color: "#222",
  },

  dropdown: {
    height: 58,

    backgroundColor: "#F0F4FA",

    borderRadius: 8,

    marginHorizontal: 10,

    marginTop: 14,

    paddingHorizontal: 14,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  dropdownText: {
    fontSize: fontSizes.md,

    color: "#222",

    fontWeight: fontWeights.semibold,
  },

  invoiceCard: {
    backgroundColor: "#FFFFFF",

    marginHorizontal: 10,

    borderRadius: 8,

    marginTop: 10,

    borderWidth: 1,

    borderColor: "#4B7BE5",
  },

  invoiceTop: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    paddingHorizontal: 14,

    paddingVertical: 14,
  },

  invoiceTitle: {
    fontSize: fontSizes.md,
    color: "#3D7BEA",
    fontWeight: fontWeights.bold,
    flex: 1,
    paddingRight: 8,
  },

  invoiceBottom: {
    borderTopWidth: 1,

    borderColor: "#E1E7EF",

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 14,

    paddingVertical: 10,
  },

  invoiceCount: {
    marginLeft: 8,

    fontSize: fontSizes.md,

    color: "#444",

    fontWeight: fontWeights.medium,
  },

  btnRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    marginHorizontal: 10,

    marginTop: 30,
  },

  actionBtn: {
    width: "47%",

    height: 42,

    backgroundColor: "#3D7BEA",

    borderRadius: 6,

    alignItems: "center",

    justifyContent: "center",
  },

  actionText: {
    color: "#FFF",

    fontWeight: fontWeights.semibold,

    fontSize: fontSizes.md,
  },

  bottomWrap: {
    position: "absolute",

    width: "100%",

    bottom: 0,
  },
});
