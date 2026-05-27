
import React from "react";
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
  usePathname,
  useLocalSearchParams,
} from "expo-router";

const invoiceSections = [
  {
    title:
      "9A - Amend Records b2b Invoices",

    count: 0,
  },

  {
    title:
      "9A - Amend Records b2c Large Invoices",

    count: 0,
  },

  {
    title:
      "9A - Amend Records Export Invoices",

    count: 0,
  },

  {
    title:
      "9A - Amend credits/debits notes (Registered)",

    count: 0,
  },
   {
    title:
      "9A - Amend credits/debits notes (Registered)",

    count: 0,
  },
   {
    title:
      "9A - Amend credits/debits notes (Registered)",

    count: 0,
  },
   {
    title:
      "9A - Amend credits/debits notes (Registered)",

    count: 0,
  },
];

export default function GSTR1AmmendRecordSection() {
  const pathname =
    usePathname();

  const params =
    useLocalSearchParams();

  const expanded =
    pathname ===
    "/gst/gstr1-ammed";

  const handleToggle =
    () => {
      const routeParams = {
        assessmentYear:
          params.assessmentYear,

        quarter:
          params.quarter,

        month:
          params.month,
      };

      /* CLOSE */

      if (expanded) {
        router.replace({
          pathname:
            "/gst/gstr1",

          params:
            routeParams,
        });

        return;
      }

      /* OPEN */

      router.replace({
        pathname:
          "/gst/gstr1-ammed",

        params:
          routeParams,
      });
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
                  router.push({
                    pathname:
                      "/gst/b2b-invoices",

                    params: {
                      assessmentYear:
                        params.assessmentYear,

                      quarter:
                        params.quarter,

                      month:
                        params.month,
                    },
                  })
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