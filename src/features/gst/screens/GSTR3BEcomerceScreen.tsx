import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import GSTBottomBar from "../components/GSTBottomBar";

import { fontSizes, fontWeights } from "../../../theme/typography";
const initialRows = [
  {
    id: 1,
    title:
      "(1) Supplies taxed under Section 9(5) must be reported by the e-commerce operator.",
    value: "0.0",
  },
  {
    id: 2,
    title:
      "(2) Taxable supplies via e-commerce, taxed under Section 9(5), must be reported by the supplier.",
    value: "0.0",
  },
];

export default function GSTR3B311Screen() {
  const [rows, setRows] =
    useState(initialRows);

  const openRow = (
    index: number
  ) => {
    const row = rows[index];
    router.push({
      pathname: "/gst/gstr3b311detail",
      params: { rowId: row.id, title: row.title }
    });
  };

  const resetValues = () => {
    setRows(initialRows);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.push(
              "/gst/gstr3b-online"
            )
          }
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color="#FFF"
          />
        </TouchableOpacity>

        <Text
          style={styles.headerTitle}
        >
          GSTR 3B - 3.1
          (Supplies through
          E-Commerce Operators)
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom: 140,
        }}
      >
        {/* DESCRIPTION */}

        <View
          style={styles.description}
        >
          <Text
            style={
              styles.descriptionText
            }
          >
            3.1.1 (i) and (ii) are
            auto-drafted based on
            values provided in
            GSTR - 1/I1A
          </Text>
        </View>

        {/* TABLE */}

        <View style={styles.table}>
          <View
            style={
              styles.tableHeader
            }
          >
            <Text
              style={
                styles.headerCell
              }
            >
              Nature of Supplies
            </Text>

            <Text
              style={
                styles.valueHeader
              }
            >
              Total Tax Value
              (₹)
            </Text>

            <Text
              style={
                styles.viewHeader
              }
            >
              View
            </Text>
          </View>

          {rows.map(
            (row, index) => (
              <View
                key={row.id}
                style={
                  styles.tableRow
                }
              >
                <View
                  style={
                    styles.natureColumn
                  }
                >
                  <Text
                    style={
                      styles.rowText
                    }
                  >
                    {row.title}
                  </Text>
                </View>

                <View
                  style={
                    styles.valueColumn
                  }
                >
                  <TextInput
                    value={row.value}
                    editable={
                      false
                    }
                    style={
                      styles.valueInput
                    }
                  />
                </View>

                <TouchableOpacity
                  style={
                    styles.viewColumn
                  }
                  onPress={() =>
                    openRow(
                      index
                    )
                  }
                >
                  <Ionicons
                    name="eye"
                    size={22}
                    color="#447FF4"
                  />
                </TouchableOpacity>
              </View>
            )
          )}
        </View>

        {/* BUTTONS */}

        <View
          style={styles.buttonRow}
        >
          <TouchableOpacity
            style={
              styles.cancelBtn
            }
            onPress={
              resetValues
            }
          >
            <Text
              style={
                styles.buttonText
              }
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.confirmBtn
            }
            onPress={() =>
              console.log(
                rows
              )
            }
          >
            <Text
              style={
                styles.buttonText
              }
            >
              Confirm
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <GSTBottomBar />
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F3F3F3",
    },

    header: {
      height: 56,
      backgroundColor:
        "#447FF4",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
    },

   headerTitle: {
  color: "#FFF",
  fontSize: fontSizes.md,
  marginLeft: 8,
  fontWeight: fontWeights.semibold,
  flex: 1,
  lineHeight: 18,
},

    description: {
      backgroundColor:
        "#FFF",
      padding: 10,
    },

descriptionText: {
  fontSize: fontSizes.md,
  textAlign: "center",
  color: "#333",
  lineHeight: 18,
},

    table: {
      margin: 10,
      borderWidth: 1,
      borderColor:
        "#C5CCD8",
      backgroundColor:
        "#FFF",
    },

   tableHeader: {
  flexDirection: "row",
  backgroundColor: "#447FF4",
  height: 52,
},

headerCell: {
  flex: 1,
  color: "#FFF",
  fontSize: fontSizes.sm,
  textAlign: "center",
  fontWeight: fontWeights.bold,
  paddingTop: 18,
},

valueHeader: {
  width: 100,
  color: "#FFF",
  fontSize: fontSizes.sm,
  textAlign: "center",
  paddingTop: 12,
  fontWeight: fontWeights.bold,
},

viewHeader: {
  width: 60,
  color: "#FFF",
  fontSize: fontSizes.sm,
  textAlign: "center",
  paddingTop: 18,
  fontWeight: fontWeights.bold,
},

tableRow: {
  flexDirection: "row",
  minHeight: 120,
  borderTopWidth: 1,
  borderColor: "#C5CCD8",
},

 natureColumn: {
  flex: 1,
  borderRightWidth: 1,
  borderColor: "#C5CCD8",
  padding: 10,
  justifyContent: "center",
},

valueColumn: {
  width: 100,
  borderRightWidth: 1,
  borderColor: "#C5CCD8",
  justifyContent: "center",
  paddingHorizontal: 8,
},

viewColumn: {
  width: 60,
  justifyContent: "center",
  alignItems: "center",
},

rowText: {
  fontSize: fontSizes.sm,
  lineHeight: 18,
  color: "#333",
},

valueInput: {
  borderWidth: 1,
  borderColor: "#CFCFCF",
  backgroundColor: "#F7F7F7",
  height: 42,
  fontSize: fontSizes.md,
  paddingHorizontal: 8,
},

    buttonRow: {
      flexDirection: "row",
      marginHorizontal: 10,
      marginTop: 18,
      gap: 10,
    },

    cancelBtn: {
      flex: 1,
      height: 34,
      backgroundColor:
        "#EF4444",
      borderRadius: 5,
      justifyContent:
        "center",
      alignItems: "center",
    },

    confirmBtn: {
      flex: 1,
      height: 34,
      backgroundColor:
        "#447FF4",
      borderRadius: 5,
      justifyContent:
        "center",
      alignItems: "center",
    },

    buttonText: {
      color: "#FFF",
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
    },
  });
