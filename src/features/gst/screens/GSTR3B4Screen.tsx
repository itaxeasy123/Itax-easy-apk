import React, { useState } from "react";
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
import GSTBottomBar from "../components/GSTBottomBar";

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
  { id: 8, label: "(1) As per rules", value: "0.0" },
];

export default function GSTR3B4Screen() {
  const [rows, setRows] = useState(initialRows);

  const [showModal, setShowModal] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [editValue, setEditValue] = useState("");

  const openRow = (index: number) => {
    setSelectedIndex(index);

    setEditValue(rows[index].value);

    setShowModal(true);
  };

  const saveValue = () => {
    if (selectedIndex === null) return;

    const updated = [...rows];

    updated[selectedIndex].value = editValue;

    setRows(updated);

    setShowModal(false);
  };

  const resetValues = () => {
    setRows(initialRows);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/gst/gstr3b-online")}>
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          GSTR 3B -4
        </Text>
      </View>

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

      {/* EDIT MODAL */}

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Supply Details</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Tax Value</Text>

              <TextInput
                value={editValue}
                onChangeText={setEditValue}
                keyboardType="numeric"
                style={styles.modalInput}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalConfirm} onPress={saveValue}>
                <Text style={styles.modalBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    fontSize: 13,
    marginLeft: 8,
    fontWeight: "600",
    flex: 1,
    lineHeight: 18,
  },

  description: {
    backgroundColor: "#FFF",
    padding: 10,
  },

descriptionText: {
  fontSize: 13,
  textAlign: "left",
  color: "#333",
  lineHeight: 18,
  fontWeight: "500",
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
    fontSize: 12,
    textAlign: "center",
    fontWeight: "700",
    paddingTop: 18,
  },

  valueHeader: {
    width: 100,
    color: "#FFF",
    fontSize: 12,
    textAlign: "center",
    paddingTop: 12,
    fontWeight: "700",
  },

  viewHeader: {
    width: 60,
    color: "#FFF",
    fontSize: 12,
    textAlign: "center",
    paddingTop: 18,
    fontWeight: "700",
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
    fontSize: 12,
    lineHeight: 18,
    color: "#333",
  },

  valueInput: {
    borderWidth: 1,
    borderColor: "#CFCFCF",
    backgroundColor: "#F7F7F7",
    height: 42,
    fontSize: 13,
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
    fontWeight: "600",
    fontSize: 12,
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

  modalTitle: {
    color: "#FFF",
    fontWeight: "600",
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
    fontWeight: "600",
  },
});
