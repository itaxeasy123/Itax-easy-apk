import React, { useState } from "react";
import GSTHeader from "../components/GSTHeader";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import GSTBottomBar from "../components/GSTBottomBar";;

import { fontSizes, fontWeights } from "../../../theme/typography";
const initialRows = [
  {
    id: 1,
    title:
      "From a supplier under composition scheme, Exempt and Nil rated supply",
    interState: "0.0",
    intraState: "0.0",
  },
  {
    id: 2,
    title: "Non GST Supply",
    interState: "0.0",
    intraState: "0.0",
  },
];

export default function GSTR3B5Screen() {
  const [rows, setRows] = useState(initialRows);

  const [showModal, setShowModal] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [editValue, setEditValue] = useState("");

  const openRow = (index: number) => {
    setSelectedIndex(index);

    setEditValue(rows[index].interState);

    setShowModal(true);
  };

  const saveValue = () => {
    if (selectedIndex === null) return;

    const updated = [...rows];

    updated[selectedIndex].interState = editValue;

    setRows(updated);

    setShowModal(false);
  };

  const resetValues = () => {
    setRows(initialRows);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <GSTHeader title="GSTR 3B - 5 (Inward Supplies)" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 140,
        }}
      >
        {/* DESCRIPTION */}

        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            5 Values of empty, nil rated and non-GST inward supplies
          </Text>
        </View>

        {/* TABLE */}

        <View style={styles.table}>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.natureHeader}>Nature of Supplies</Text>

              <Text style={styles.taxHeader}>Inter-State Supplies (₹)</Text>

              <Text style={styles.taxHeader}>Intra-State Supplies (₹)</Text>
            </View>

            {rows.map((row, index) => (
              <View key={row.id} style={styles.tableRow}>
                <View style={styles.leftColumn}>
                  <Text style={styles.rowText}>{row.title}</Text>
                </View>

                <View style={styles.inputColumn}>
                  <TextInput
                    value={row.interState}
                    keyboardType="numeric"
                    style={styles.input}
                    onChangeText={(text) => {
                      const updated = [...rows];
                      updated[index].interState = text;
                      setRows(updated);
                    }}
                  />
                </View>

                <View style={styles.inputColumn}>
                  <TextInput
                    value={row.intraState}
                    keyboardType="numeric"
                    style={styles.input}
                    onChangeText={(text) => {
                      const updated = [...rows];
                      updated[index].intraState = text;
                      setRows(updated);
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* BUTTONS */}
      </ScrollView>

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

  natureHeader: {
  flex: 2,
  color: "#FFF",
  fontSize: fontSizes.sm,
  fontWeight: fontWeights.bold,
  textAlign: "center",
  paddingVertical: 12,
},

taxHeader: {
  flex: 1,
  color: "#FFF",
  fontSize: fontSizes.sm,
  fontWeight: fontWeights.bold,
  textAlign: "center",
  paddingVertical: 12,
},

leftColumn: {
  flex: 2,
  borderRightWidth: 1,
  borderColor: "#D5D5D5",
  paddingHorizontal: 8,
  justifyContent: "center",
},

inputColumn: {
  flex: 1,
  borderRightWidth: 1,
  borderColor: "#D5D5D5",
  justifyContent: "center",
  paddingHorizontal: 6,
},

viewHeader: {
  width: 60,
  color: "#FFF",
  fontSize: fontSizes.sm,
  fontWeight: fontWeights.bold,
  textAlign: "center",
  paddingVertical: 12,
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

  tableRow: {
    flexDirection: "row",
    minHeight: 70,
    borderTopWidth: 1,
    borderColor: "#C7CED9",
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

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 6,
    overflow: "hidden",
  },

  modalHeader: {
    backgroundColor: "#447FF4",
    padding: 12,
  },
  input: {
    height: 34,
    borderWidth: 1,
    borderColor: "#D3D3D3",
    backgroundColor: "#F8F8F8",
    fontSize: fontSizes.sm,
    paddingHorizontal: 6,
  },

  modalTitle: {
    color: "#FFF",
    fontWeight: fontWeights.semibold,
  },

  modalBody: {
    padding: 15,
  },

  modalLabel: {
    marginBottom: 8,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: "#CFCFCF",
    height: 40,
    paddingHorizontal: 10,
  },

  modalFooter: {
    flexDirection: "row",
  },

  modalCancel: {
    flex: 1,
    height: 42,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },

  modalConfirm: {
    flex: 1,
    height: 42,
    backgroundColor: "#447FF4",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBtnText: {
    color: "#FFF",
    fontWeight: fontWeights.semibold,
  },
});
