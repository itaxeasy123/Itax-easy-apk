
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

import { fontSizes, fontWeights } from "../../../theme/typography";
import {
  router,
} from "expo-router";

const invoiceSections = [
  {
    title: "9A Amended B2B Invoices",
    count: 0,
    route: "/gst/amended-b2b-invoices",
  },
  {
    title: "9A Amended B2C(Large) Invoices",
    count: 0,
    route: "/gst/amended-b2c-large-invoices",
  },
  {
    title: "9A Amended Export Invoices",
    count: 0,
    route: "/gst/amended-export-invoices",
  },
  {
    title: "9A Amended Credit/Debit Notes(Registered)",
    count: 0,
    route: "/gst/amended-credit-debit-notes",
  },
  {
    title: "9A Amended Credit/Debit Notes(Not Registered)",
    count: 0,
    route: "/gst/amended-credit-debit-notes-unregistered",
  },
  {
    title: "Amended B2B (Other)",
    count: 0,
    route: "/gst/amended-b2b-others",
  },
  {
    title: "Amended Tax Liability (Advances Received)",
    count: 0,
    route: "/gst/amended-tax-liability-advances-received",
  },
  {
    title: " 11A-Amended Tax Liability (Advances Received)",
    count: 0,
    route: "/gst/amended-advance-received",
  },
  {
    title: " 11B-Amended of Adjustment of Advances",
    count: 0,
    route: "/gst/amended-adjustment-of-advances",
  },
];

interface GSTR1AmmendRecordSectionProps {
  isExpanded?: boolean;
  onToggle?: () => void;
}

export default function GSTR1AmmendRecordSection({ isExpanded, onToggle }: GSTR1AmmendRecordSectionProps) {

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
          Amend Records Details
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
