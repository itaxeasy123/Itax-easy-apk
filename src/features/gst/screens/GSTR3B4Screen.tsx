import React, { useState } from "react";
import GSTHeader from "../components/GSTHeader";
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
import GSTBottomBar from "../components/GSTBottomBar";;

import { fontSizes, fontWeights } from "../../../theme/typography";
const initialRows = [
  { id: 1, label: "(A) ITC Available (whether in full or part)", value: "" },
  { id: 2, label: "(1) Import of goods", value: "0.0" },
  { id: 3, label: "(2) Import of services", value: "0.0" },
  {
    id: 4,
    label:
      "(3) Inward supplies liable to reverse charge (other than 1 & 2 above)",
    value: "0.0",
  },
  { id: 5, label: "(4) Inward supplies from ISD", value: "0.0" },
  { id: 6, label: "(5) All other ITC", value: "0.0" },
  { id: 7, label: "(B) ITC Reversed", value: "" },
  { id: 8, label: "(1) As per rules 3B,42 & 43 of CGST Rules and section 17(5)", value: "0.0" },
  { id: 9, label: "(2) Others", value: "0.0" },
  { id: 10, label: "(C) Net ITC Available", value: "" },
  { id: 11, label: "Net ITC Available", value: "0.0" },
  { id: 12, label: "(D) Other Details", value: "" },
  { id: 13, label: "(1) ITC recliamed which was reversed under Table 4(B)(2) in earlier tax period", value: "0.0" },
  { id: 14, label: "(2) Ineligible ITC under section 16(4) & ITC restricted due to PoS rules", value: "0.0" },
];

export default function GSTR3B4Screen() {
  const [rows, setRows] = useState(initialRows);

  const openRow = (index: number) => {
    const row = rows[index];
    if (row.value === "") return;

    let parentTitle = "";
    for (let i = index; i >= 0; i--) {
      if (
        rows[i].label.startsWith("(A)") ||
        rows[i].label.startsWith("(B)") ||
        rows[i].label.startsWith("(C)") ||
        rows[i].label.startsWith("(D)")
      ) {
        parentTitle = rows[i].label;
        break;
      }
    }

    router.push({
      pathname: "/gst/gstr3b4detail",
      params: { rowId: row.id, title: parentTitle, subtitle: row.label }
    });
  };

  const resetValues = () => {
    setRows(initialRows);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <GSTHeader title="GSTR 3B -4" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 140,
        }}
      >
        {/* DESCRIPTION */}

        <View style={styles.description}>
          <Text style={styles.descriptionText}>
           Eligibe ITC
          </Text>
        </View>

        {/* TABLE */}

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Nature of Supplies</Text>

            <Text style={styles.valueHeader}>Total Tax Value (₹)</Text>

            <Text style={styles.viewHeader}>View</Text>
          </View>

          {rows.map((row, index) => (
            <View key={row.id} style={styles.tableRow}>
              <View style={styles.natureColumn}>
                <Text style={styles.rowText}>{row.label}</Text>
              </View>

              <View style={styles.valueColumn}>
                <TextInput
                  value={row.value}
                  editable={false}
                  style={styles.valueInput}
                />
              </View>

              <TouchableOpacity
                style={styles.viewColumn}
                onPress={() => openRow(index)}
              >
                <Ionicons name="eye" size={22} color="#447FF4" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* BUTTONS */}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={resetValues}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => console.log(rows)}
          >
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <GSTBottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F3F3",
  },

  header: {
    height: 56,
    backgroundColor: "#447FF4",
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
    backgroundColor: "#FFF",
    padding: 10,
  },

descriptionText: {
  fontSize: fontSizes.md,
  textAlign: "left",
  color: "#333",
  lineHeight: 18,
  fontWeight: fontWeights.medium,
  paddingLeft: 4,
},

  table: {
    margin: 10,
    borderWidth: 1,
    borderColor: "#C5CCD8",
    backgroundColor: "#FFF",
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
  minHeight: 68,
  borderTopWidth: 1,
  borderColor: "#C5CCD8",
},

natureColumn: {
  flex: 1,
  borderRightWidth: 1,
  borderColor: "#C5CCD8",
  paddingHorizontal: 8,
  paddingVertical: 6,
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
    backgroundColor: "#EF4444",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  confirmBtn: {
    flex: 1,
    height: 34,
    backgroundColor: "#447FF4",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontWeight: fontWeights.semibold,
    fontSize: fontSizes.sm,
  },
});
