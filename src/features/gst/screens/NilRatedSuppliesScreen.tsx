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

const rates = ["5%", "12%", "18%", "28%"];

export default function NilRatedSuppliesScreen() {
  const router = useRouter();

  const [selectedState, setSelectedState] =
    useState("Select State");

  const [invoiceValue, setInvoiceValue] =
    useState("");

  const [selectedRate, setSelectedRate] =
    useState("5%");

  const [supplyType, setSupplyType] =
    useState("");

  const [cess, setCess] = useState("");

  const [stateModal, setStateModal] =
    useState(false);

  const [rateModal, setRateModal] =
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

    setSelectedState(item.state);

    setInvoiceValue(item.invoiceValue);

    setSelectedRate(item.rate);

    setSupplyType(item.supplyType);

    setCess(item.cess);
  };

  // ADD / UPDATE
  const handleAdd = () => {
    if (
      selectedState === "Select State" ||
      !invoiceValue ||
      !supplyType
    ) {
      Alert.alert(
        "Validation",
        "Please fill all required fields"
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
                state: selectedState,
                invoiceValue,
                rate: selectedRate,
                supplyType,
                cess,
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
        state: selectedState,
        invoiceValue,
        rate: selectedRate,
        supplyType,
        cess,
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
    setSelectedState("Select State");

    setInvoiceValue("");

    setSelectedRate("5%");

    setSupplyType("");

    setCess("");
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
          8A,8B,8C,8D-Nil Rated Supplies
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

        {/* STATE */}
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

        {/* INVOICE VALUE */}
        <TextInput
          placeholder="Invoices Value"
          placeholderTextColor="#7B8190"
          value={invoiceValue}
          onChangeText={setInvoiceValue}
          style={styles.input}
        />

        {/* RATE */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.selectBox}
          onPress={() =>
            setRateModal(true)
          }
        >
          <Text style={styles.selectText}>
            {selectedRate}
          </Text>

          <Ionicons
            name="chevron-down"
            size={16}
            color="#6B7280"
          />
        </TouchableOpacity>

        {/* SUPPLY TYPE */}
        <TextInput
          placeholder="Supply Type"
          placeholderTextColor="#7B8190"
          value={supplyType}
          onChangeText={setSupplyType}
          style={styles.input}
        />

        {/* CESS */}
        <TextInput
          placeholder="Cess"
          placeholderTextColor="#7B8190"
          value={cess}
          onChangeText={setCess}
          style={styles.input}
        />

        {/* ICONS */}
        <View style={styles.recordsWrapper}>
          {records.length === 0 ? (
            <View style={styles.recordCard}>
              {/* EDIT */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.iconButton}
                onPress={() => {
                  Alert.alert(
                    "Edit",
                    "Please add record first"
                  );
                }}
              >
                <Ionicons
                  name="create-outline"
                  size={18}
                  color="#2563EB"
                />
              </TouchableOpacity>

              {/* DELETE */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.iconButton}
                onPress={() => {
                  Alert.alert(
                    "Delete",
                    "No record found"
                  );
                }}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color="#EF4444"
                />
              </TouchableOpacity>
            </View>
          ) : (
            records.map((item) => (
              <View
                key={item.id}
                style={styles.recordCard}
              >
                {/* EDIT */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.iconButton}
                  onPress={() =>
                    handleEdit(item)
                  }
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color="#2563EB"
                  />
                </TouchableOpacity>

                {/* DELETE */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.iconButton}
                  onPress={() =>
                    handleDelete(item.id)
                  }
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color="#EF4444"
                  />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

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

      {/* RATE MODAL */}
      <Modal
        visible={rateModal}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() =>
            setRateModal(false)
          }
        >
          <View style={styles.modalBox}>
            <FlatList
              data={rates}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    setSelectedRate(item);

                    setRateModal(false);
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

  /* HEADER */
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

  /* BODY */
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

  /* INPUT */
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
    marginBottom: 14,
  },

  selectText: {
    fontSize: 11,
    color: "#111827",
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
    marginBottom: 14,
  },

  /* ICONS */
  recordsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    marginBottom: 60,
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

  /* BUTTONS */
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

  /* MODAL */
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