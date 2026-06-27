
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  router,
} from "expo-router";

import { useB2BStore } from "../../../store/b2bStore";
import { useB2CLargeStore } from "../../../store/b2cLargeStore";
import { useB2COthersStore } from "../../../store/b2cOthersStore";
import { useCDNRStore } from "../../../store/cdnrStore";
import { useCDNURStore } from "../../../store/cdnurStore";
import { useExportStore } from "../../../store/exportStore";
import { useHSNStore } from "../../../store/hsnStore";
import { useNilRatedStore } from "../../../store/nilRatedStore";
import { useTaxLiabilityStore } from "../../../store/taxLiabilityStore";
import { useAdjustmentAdvancesStore } from "../../../store/adjustmentAdvancesStore";

import { fontSizes, fontWeights } from "../../../theme/typography";
interface GSTR1RecordSectionProps {
  isExpanded?: boolean;
  onToggle?: () => void;
}

export default function GSTR1RecordSection({ isExpanded, onToggle }: GSTR1RecordSectionProps) {

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

  const handleToggle = () => {
    if (onToggle) onToggle();
  };

  return (
    <>
      {/* DROPDOWN */}

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.dropdown}
        onPress={
          handleToggle
        }
      >
        <Text
          style={
            styles.dropdownText
          }
        >
          Add Records Details
        </Text>

        <Ionicons
          name={
            isExpanded
              ? "chevron-up"
              : "chevron-forward"
          }
          size={20}
          color="#555"
        />
      </TouchableOpacity>

      {/* OPENED FORM */}

      {isExpanded && (
        <View>
          {invoiceSections.map(
            (
              item,
              index
            ) => (
              <TouchableOpacity
                key={index}
                activeOpacity={
                  0.85
                }
                style={
                  styles.invoiceCard
                }

                /* PAGE OPEN */

                onPress={() =>
                  router.push(item.route as any)
                }
              >
                {/* TOP */}

                <View
                  style={
                    styles.invoiceTop
                  }
                >
                  <Text
                    style={
                      styles.invoiceTitle
                    }
                  >
                    {
                      item.title
                    }
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#555"
                  />
                </View>

                {/* BOTTOM */}

                <View
                  style={
                    styles.invoiceBottom
                  }
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={14}
                    color="#666"
                  />

                  <Text
                    style={
                      styles.invoiceCount
                    }
                  >
                    {
                      item.count
                    }
                  </Text>
                </View>
              </TouchableOpacity>
            )
          )}
        </View>
      )}
    </>
  );
}

const styles =
  StyleSheet.create({
    dropdown: {
      height: 58,

      backgroundColor:
        "#E8EDF5",

      borderRadius: 8,

      marginHorizontal: 10,

      marginTop: 14,

      paddingHorizontal: 14,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    dropdownText: {
      fontSize: fontSizes.md,

      color: "#444",

      fontWeight: fontWeights.medium,
    },

    invoiceCard: {
      backgroundColor:
        "#F4F6FB",

      marginHorizontal: 10,

      borderRadius: 8,

      marginTop: 10,

      borderWidth: 1,

      borderColor: "#D6DDE8",
    },

    invoiceTop: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      paddingHorizontal: 12,

      paddingVertical: 14,
    },

    invoiceTitle: {
      fontSize: fontSizes.sm,
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

      paddingHorizontal: 12,

      paddingVertical: 8,
    },

    invoiceCount: {
      marginLeft: 6,

      fontSize: fontSizes.sm,

      color: "#444",
    },
  });
