import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import GSTBottomBar from "../components/GSTBottomBar";

const defaultRows = [
  {
    id: 1,
    label:
      "(a) Outward taxable supplies (other than zero rated, nil rated and exempted)",
    value: "0.0",
  },
  {
    id: 2,
    label: "(b) Outward taxable supplies (Nil rated, exempted)",
    value: "0.0",
  },
  {
    id: 3,
    label: "(c) Outward taxable supplies (Nil rated, exempted)",
    value: "0.0",
  },
  {
    id: 4,
    label: "(d) Inward supplies (liable to reverse charge)",
    value: "0.0",
  },
];

export default function GSTR3B31Screen() {
  const [rows, setRows] = useState(defaultRows);

  const [showModal, setShowModal] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [editValue, setEditValue] = useState("0.0");

  const updateValue = (index: number, value: string) => {
    const updated = [...rows];

    updated[index].value = value;

    setRows(updated);
  };

  const handleCancel = () => {
    setRows(defaultRows);

    Alert.alert("Cancelled", "All values reset.");
  };

  const handleConfirm = () => {
    Alert.alert("Success", "GSTR 3.1 saved successfully.");
  };


const openDetails = (row: any) => {
  router.push({
    pathname: "/gst/gstr3b31detail" as any,
    params: {
      rowId: String(row.id),
      title: row.label,
    },
  } as any);
};

  const saveValue = () => {
    if (selectedIndex === null) return;

    const updated = [...rows];

    updated[selectedIndex].value = editValue;

    setRows(updated);

    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/gst/gstr3b-online")}>
          <Ionicons name="chevron-back" size={18} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          GSTR 3B - 3.1 (Outward And Reverse Charge Inward)
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 130,
        }}
      >
        {/* DESCRIPTION */}

        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            3.1 Details of Outward Supplies and inward supplies liable to
            reverse charge
          </Text>
        </View>

        {/* TABLE */}

        <View style={styles.table}>
          {/* HEADER */}

<View style={styles.tableHeader}>
  <View
    style={{
      flex: 1,
      borderRightWidth: 1,
      borderRightColor: "#7EA4F8",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
    }}
  >
    <Text style={styles.headerCell}>Nature of Supplies</Text>
  </View>

  <View
    style={{
      width: 85,
      borderRightWidth: 1,
      borderRightColor: "#7EA4F8",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
    }}
  >
    <Text style={styles.headerCell}>Total Tax Value (₹)</Text>
  </View>

  <View
    style={{
      width: 45,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Text style={styles.viewHeader}>View</Text>
  </View>
</View>
          {/* ROWS */}

          {rows.map((row, index) => (
            <View key={row.id} style={styles.row}>
              <View style={styles.natureColumn}>
                <Text style={styles.rowText}>{row.label}</Text>
              </View>

              <View style={styles.valueColumn}>
                <TextInput
                  value={row.value}
                  keyboardType="numeric"
                  style={styles.input}
                  onChangeText={(text) => updateValue(index, text)}
                />
              </View>

              <TouchableOpacity
                style={styles.viewColumn}
                // onPress={() =>
                //   openDetails(row)
                // }
               onPress={() => openDetails(row)}
              >
                <Ionicons name="eye" size={18} color="#4B7CF4" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* BUTTONS */}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* DETAILS MODAL */}

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View
            style={{
              width: "92%",
              backgroundColor: "#FFF",
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                backgroundColor: "#447FF4",
                padding: 12,
              }}
            >
              <Text
                style={{
                  color: "#FFF",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                Supply Details
              </Text>
            </View>

            <View
              style={{
                padding: 15,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  marginBottom: 8,
                }}
              >
                Tax Value
              </Text>

              <TextInput
                value={editValue}
                onChangeText={setEditValue}
                keyboardType="numeric"
                style={{
                  borderWidth: 1,
                  borderColor: "#CFCFCF",
                  height: 42,
                  borderRadius: 4,
                  paddingHorizontal: 10,
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#EF4444",
                  height: 44,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => setShowModal(false)}
              >
                <Text
                  style={{
                    color: "#FFF",
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#447FF4",
                  height: 44,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={saveValue}
              >
                <Text
                  style={{
                    color: "#FFF",
                    fontWeight: "600",
                  }}
                >
                  Confirm
                </Text>
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
    backgroundColor: "#F5F5F5",
  },

  header: {
    height: 52,
    backgroundColor: "#4F84F7",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

headerTitle: {
  color: "#FFF",
  fontSize: 13, // 11 se 13
  marginLeft: 6,
  flex: 1,
  fontWeight: "600",
},

  description: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: "#FFF",
  },

descriptionText: {
  fontSize: 12, // 11 se 12
  color: "#222",
  lineHeight: 18,
},

  table: {
    marginHorizontal: 8,
    marginTop: 8,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D6D6D6",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#4F84F7",
    height: 50,
    alignItems: "center",
  },

headerCell: {
  color: "#FFF",
  fontSize: 11,
  fontWeight: "600",
  textAlign: "center",
},

viewHeader: {
  color: "#FFF",
  fontSize: 11,
  fontWeight: "600",
  textAlign: "center",
},

  row: {
    flexDirection: "row",
    minHeight: 90,
    borderTopWidth: 1,
    borderTopColor: "#D6D6D6",
  },

  natureColumn: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#D6D6D6",
  },

  valueColumn: {
    width: 82,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#D6D6D6",
  },

  viewColumn: {
    width: 46,
    justifyContent: "center",
    alignItems: "center",
  },

  rowText: {
    fontSize: 11,
    color: "#444",
    lineHeight: 16,
  },

  input: {
    width: 66,
    height: 34,
    borderWidth: 1,
    borderColor: "#BDBDBD",
    borderRadius: 2,
    backgroundColor: "#FFF",
    fontSize: 11,
    paddingHorizontal: 6,
    textAlign: "left",
  },

  buttonRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    marginTop: 10,
    gap: 8,
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "#EF4444",
    height: 34,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  confirmBtn: {
    flex: 1,
    backgroundColor: "#4F84F7",
    height: 34,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
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

  modalTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },

  modalText: {
    fontSize: 12,
    color: "#333",
  },

  modalValue: {
    fontSize: 14,
    fontWeight: "600",
  },

  closeButton: {
    marginTop: 12,
    backgroundColor: "#4F84F7",
    height: 40,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  closeText: {
    color: "#FFF",
    fontWeight: "600",
  },
});