
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

const invoiceSections = [
  {
    title: "4A,4B,6B,6C-B2B Invoices",
    count: 0,
    route: "/gst/b2b-invoices",
  },
  {
    title: "5A-B2C (Large Invoices)",
    count: 0,
    route: "/gst/b2c-large",
  },
  {
    title: "6A-Export Invoices",
    count: 0,
    route: "/gst/export-invoices",
  },
  {
    title: "7-B2C Others",
    count: 0,
    route: "/gst/b2c-others",
  },
  {
    title: "8A,8B, 8C,8D-Nil Rated Supplies",
    count: 0,
    route: "/gst/nil-rated-supplies",
  },
  {
    title: "9B-Credit/Debit Notes(Registered)",
    count: 0,
    route: "/gst/credit-debit-notes",
  },
  {
    title: "9B-Credit/Debit Notes(UnRegistered)",
    count: 0,
    route: "/gst/unregistered-debit-notes",
  },
  {
    title: "11A(1),11A(2)-Tax Liability (Advances Received)",
    count: 0,
    route: "/gst/gstr1-tax-liability",
  },
  {
    title: "11B(1),11B(2)-Tax Adjustment of(Advances)",
    count: 0,
    route: "/gst/gstr1-adjustment-advances",
  },
  {
    title: "12-HSN-wise Summary of Outward Supplies",
    count: 0,
    route: "/gst/gstr1-hsn-summary",
  },
];

export default function GSTR1RecordSection() {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    setExpanded(!expanded);
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
            expanded
              ? "chevron-up"
              : "chevron-forward"
          }
          size={20}
          color="#555"
        />
      </TouchableOpacity>

      {/* OPENED FORM */}

      {expanded && (
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
      fontSize: 13,

      color: "#444",

      fontWeight: "500",
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
      fontSize: 12,

      color: "#333",

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

      fontSize: 12,

      color: "#444",
    },
  });