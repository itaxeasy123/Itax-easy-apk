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
  { id: 1, section: "A", title: "(1) Tax", value: "0.0" },
  { id: 2, section: "A", title: "(2) Interest", value: "0.0" },
  { id: 3, section: "A", title: "(3) Late Fees", value: "0.0" },
  { id: 4, section: "B", title: "(1) Tax", value: "0.0" },
  { id: 5, section: "B", title: "(2) Interest", value: "0.0" },
  { id: 6, section: "B", title: "(3) Late Fees", value: "0.0" },
  { id: 7, section: "NONE", title: "(1) Other than reverse charge tax to be paid in cash ₹", value: "0.0" },
  { id: 8, section: "NONE", title: "(2) Integrated ₹", value: "0.0" },
  { id: 9, section: "NONE", title: "(3) Central ₹", value: "0.0" },
  { id: 10, section: "NONE", title: "(4) State/UT", value: "0.0" },
  { id: 11, section: "NONE", title: "(5) CESS ₹", value: "0.0" },
  { id: 12, section: "NONE", title: "(6) Other than reverse charge tax to be paid in cash ₹", value: "0.0" },
  { id: 13, section: "NONE", title: "(7) Reverse charge tax payable ₹", value: "0.0" },
  { id: 14, section: "NONE", title: "(8) Reverse charge tax to be paid in cash ₹", value: "0.0" },
  { id: 15, section: "NONE", title: "(9) Interest payable (₹)", value: "0.0" },
  { id: 16, section: "NONE", title: "(10) Interest to be paid in cash (₹)", value: "0.0" },
  { id: 17, section: "NONE", title: "(11) Late Fees to be paid in cash ₹", value: "0.0" },
  { id: 18, section: "NONE", title: "(12) Utilizable cash balance (₹)", value: "0.0" },
  { id: 19, section: "NONE", title: "(13) Additional cash required (₹)", value: "0.0" },
];

export default function GSTR3B61Screen() {
  const [rows, setRows] = useState(initialRows);

  const openRow = (index: number) => {
    const row = rows[index];
    
    let parentTitle = "";
    let extractedSubtitle = "";

    if (row.section === "NONE") {
      extractedSubtitle = row.title;
    } else {
      parentTitle = row.section === "A" ? "(A) Cash Ledger Balance" : "(B) Credit Ledger Balance";
      extractedSubtitle = "- " + row.title.replace(/^\(\d+\)\s*/, '');
    }

    router.push({
      pathname: "/gst/gstr3b61detail",
      params: { rowId: row.id, title: parentTitle, subtitle: extractedSubtitle }
    });
  };

  const resetValues = () => {
    setRows(initialRows);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <GSTHeader title="GSTR 3B -6.1 (payment of tax)" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 140,
        }}
      >
        {/* DESCRIPTION */}

        <View style={styles.description}>
          <Text style={styles.descriptionText}>6.1 Payment of tax</Text>
        </View>

        {/* TABLE */}

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Description</Text>

            <Text style={styles.valueHeader}>Total Tax Value (₹)</Text>

            <Text style={styles.viewHeader}>View</Text>
          </View>

          {["A", "B", "NONE"].map((sectionKey) => (
            <React.Fragment key={sectionKey}>
              {sectionKey !== "NONE" ? (
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionText}>
                    {sectionKey === "A" ? "(A) Cash Ledger Balance" : "(B) Credit Ledger Balance"}
                  </Text>
                </View>
              ) : (
                <View style={{ height: 16, backgroundColor: "#F5F7FA", borderTopWidth: 1, borderColor: "#C5CCD8" }} />
              )}
              {rows.map((row, index) => {
                if (row.section !== sectionKey) return null;
                return (
                  <View key={row.id} style={styles.tableRow}>
                    <View style={styles.natureColumn}>
                      <Text style={styles.rowText}>{row.title}</Text>
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
                );
              })}
            </React.Fragment>
          ))}
        </View>

        {/* BUTTONS */}
      </ScrollView>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={() => router.push("/gst/gstr3b-online")}>
          <Text style={styles.buttonText}>Back</Text>

        </TouchableOpacity>
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={() => {
            const updated = rows.map((item) => ({
              ...item,
              value: Number(item.value || 0).toFixed(2),
            }));

            setRows(updated);
          }}
        >
          <Text style={styles.buttonText}>Create Challenge</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={resetValues}>
          <Text style={styles.buttonText}>Payment ledger</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={() => console.log(rows)}
        >
          <Text style={styles.buttonText}>Proceed to file</Text>
        </TouchableOpacity>
      </View>

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
  sectionText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: "#333",
  },
  sectionRow: {
    backgroundColor: "#F5F7FA",
    borderTopWidth: 1,
    borderColor: "#C5CCD8",
    paddingHorizontal: 10,
    paddingVertical: 8,
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
