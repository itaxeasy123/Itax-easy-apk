import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  Alert,
} from "react-native";

import { useRouter } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import GSTBottomBar from "../components/GSTBottomBar";

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
];

const noteTypes = [
  "Credit",
  "Debit",
];

export default function CreditDebitNotesScreen() {
  const router = useRouter();

  const [gstin, setGstin] =
    useState("");

  const [selectedState, setSelectedState] =
    useState("Select State");

  const [recipientName, setRecipientName] =
    useState("");

  const [masterName, setMasterName] =
    useState("");

  const [noteDate, setNoteDate] =
    useState("10/05/2026");

  const [selectedNoteType, setSelectedNoteType] =
    useState("Credit");

  const [stateTax, setStateTax] =
    useState("");

  const [supplyType, setSupplyType] =
    useState("");

  const [stateModal, setStateModal] =
    useState(false);

  const [noteModal, setNoteModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [records, setRecords] = useState<
    any[]
  >([]);

  // DELETE
  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this record?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setRecords((prev) =>
              prev.filter(
                (item) => item.id !== id
              )
            );
          },
        },
      ]
    );
  };

  // EDIT
  const handleEdit = (item: any) => {
    setEditingId(item.id);

    setGstin(item.gstin);

    setSelectedState(item.state);

    setRecipientName(
      item.recipientName
    );

    setMasterName(item.masterName);

    setNoteDate(item.noteDate);

    setSelectedNoteType(
      item.noteType
    );

    setStateTax(item.stateTax);

    setSupplyType(item.supplyType);
  };

  // ADD / UPDATE
  const handleAdd = () => {
    if (
      !gstin ||
      selectedState === "Select State"
    ) {
      Alert.alert(
        "Validation",
        "Please fill required fields"
      );

      return;
    }

    // UPDATE
    if (editingId) {
      setRecords((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                gstin,
                state: selectedState,
                recipientName,
                masterName,
                noteDate,
                noteType:
                  selectedNoteType,
                stateTax,
                supplyType,
              }
            : item
        )
      );

      setEditingId(null);

      Alert.alert(
        "Updated",
        "Record updated successfully"
      );
    } else {
      // ADD
      const newRecord = {
        id: Date.now().toString(),
        gstin,
        state: selectedState,
        recipientName,
        masterName,
        noteDate,
        noteType: selectedNoteType,
        stateTax,
        supplyType,
      };

      setRecords((prev) => [
        ...prev,
        newRecord,
      ]);

      Alert.alert(
        "Added",
        "Record added successfully"
      );
    }

    // RESET
    setGstin("");

    setSelectedState("Select State");

    setRecipientName("");

    setMasterName("");

    setNoteDate("10/05/2026");

    setSelectedNoteType("Credit");

    setStateTax("");

    setSupplyType("");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        {/* BACK */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() =>
            router.push(
              "/gst/gstr1-records" as any
            )
          }
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* TITLE */}
        <Text style={styles.headerTitle}>
          9B-Credit/Debit Notes
          (Registered)
        </Text>
      </View>

      {/* BODY */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* TITLE */}
        <Text style={styles.title}>
          Outward and Reverse charge
          Inward
        </Text>

        {/* SUB TITLE */}
        <Text style={styles.subTitle}>
          Sr. No 1
        </Text>

        {/* GSTIN */}
        <View style={styles.sameSpacing}>
          <TextInput
            placeholder="GSTIN/UIN"
            placeholderTextColor="#7B8190"
            value={gstin}
            onChangeText={setGstin}
            style={styles.input}
          />
        </View>

        {/* STATE */}
        <View style={styles.sameSpacing}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.selectBox}
            onPress={() =>
              setStateModal(true)
            }
          >
            <Text
              style={[
                styles.selectText,
                selectedState ===
                  "Select State" && {
                  color: "#7B8190",
                },
              ]}
            >
              {selectedState}
            </Text>

            <Ionicons
              name="chevron-down"
              size={16}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        {/* RECIPIENT NAME */}
        <View style={styles.sameSpacing}>
          <TextInput
            placeholder="Recipient Name"
            placeholderTextColor="#7B8190"
            value={recipientName}
            onChangeText={
              setRecipientName
            }
            style={styles.input}
          />
        </View>

        {/* MASTER NAME */}
        <View style={styles.sameSpacing}>
          <TextInput
            placeholder="Name as in Master"
            placeholderTextColor="#7B8190"
            value={masterName}
            onChangeText={setMasterName}
            style={styles.input}
          />
        </View>

        {/* DATE */}
        <View style={styles.sameSpacing}>
          <Text style={styles.smallLabel}>
            Debit/Credit Note Date
          </Text>

          <TextInput
            value={noteDate}
            onChangeText={setNoteDate}
            style={styles.input}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#7B8190"
          />
        </View>

        {/* STATE TAX */}
        <View style={styles.sameSpacing}>
          <TextInput
            placeholder="State Tax"
            placeholderTextColor="#7B8190"
            value={stateTax}
            onChangeText={setStateTax}
            style={styles.input}
          />
        </View>

        {/* NOTE TYPE */}
        <View style={styles.sameSpacing}>
          <Text style={styles.smallLabel}>
            Note Type
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.selectBox}
            onPress={() =>
              setNoteModal(true)
            }
          >
            <Text
              style={styles.selectText}
            >
              {selectedNoteType}
            </Text>

            <Ionicons
              name="chevron-down"
              size={16}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        {/* SUPPLY TYPE */}
        <View style={styles.sameSpacing}>
          <TextInput
            placeholder="Supply Type"
            placeholderTextColor="#7B8190"
            value={supplyType}
            onChangeText={setSupplyType}
            style={styles.input}
          />
        </View>

        {/* ITEM DETAILS */}
        <Text style={styles.itemText}>
          Item Details
        </Text>


        {/* BUTTONS */}
        <View style={styles.buttonRow}>
          {/* BACK */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backBtn}
            onPress={() =>
              router.push(
                "/gst/gstr1-records" as any
              )
            }
          >
            <Text style={styles.buttonText}>
              Back
            </Text>
          </TouchableOpacity>

          {/* ADD */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.addBtn}
            onPress={handleAdd}
          >
            <Text style={styles.buttonText}>
              {editingId
                ? "Update"
                : "Add"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* STATE MODAL */}
      <Modal
        visible={stateModal}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() =>
            setStateModal(false)
          }
        >
          <View style={styles.modalBox}>
            <FlatList
              data={states}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    setSelectedState(item);

                    setStateModal(false);
                  }}
                >
                  <Text
                    style={styles.optionText}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* NOTE TYPE MODAL */}
      <Modal
        visible={noteModal}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() =>
            setNoteModal(false)
          }
        >
          <View style={styles.modalBox}>
            <FlatList
              data={noteTypes}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    setSelectedNoteType(
                      item
                    );

                    setNoteModal(false);
                  }}
                >
                  <Text
                    style={styles.optionText}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* BOTTOM BAR */}
      <GSTBottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  header: {
    height: 58,
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  backButton: {
    marginRight: 10,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 24,
  },

  title: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
    marginBottom: 10,
  },

  subTitle: {
    fontSize: 11,
    color: "#2563EB",
    marginBottom: 12,
    fontWeight: "500",
  },

  sameSpacing: {
    marginBottom: 14,
  },

  input: {
    height: 42,
    borderWidth: 1,
    borderColor: "#C9D2E3",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    fontSize: 11,
    color: "#111827",
  },

  selectBox: {
    height: 42,
    borderWidth: 1,
    borderColor: "#C9D2E3",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectText: {
    fontSize: 11,
    color: "#111827",
  },

  smallLabel: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 2,
    marginLeft: 10,
  },

  itemText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 18,
    marginTop: 4,
  },

  recordsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 50,
  },

  recordCard: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 12,
  },

  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  backBtn: {
    flex: 1,
    height: 42,
    backgroundColor: "#4B83F5",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },

  addBtn: {
    flex: 1,
    height: 42,
    backgroundColor: "#4B83F5",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.10)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  modalBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    overflow: "hidden",
    maxHeight: 220,
  },

  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },

  optionText: {
    fontSize: 13,
    color: "#111827",
  },
});