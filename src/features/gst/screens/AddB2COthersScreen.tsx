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

export default function AddB2COthersScreen() {
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

  const [records, setRecords] = useState([
    {
      id: "1",
      state: selectedState,
      invoiceValue,
      rate: selectedRate,
      supplyType,
      cess,
    },
  ]);

  const handleDelete = (id: string) => {
    setRecords((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const handleEdit = (item: any) => {
    setSelectedState(item.state);
    setInvoiceValue(item.invoiceValue);
    setSelectedRate(item.rate);
    setSupplyType(item.supplyType);
    setCess(item.cess);
  };

  const handleAdd = () => {
    const newRecord = {
      id: Date.now().toString(),
      state: selectedState,
      invoiceValue,
      rate: selectedRate,
      supplyType,
      cess,
    };

    setRecords((prev) => [...prev, newRecord]);

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
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            router.push(
              "/gst/b2c-others" as any
            )
          }
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          7-B2C (Others)
        </Text>
      </View>

      {/* BODY */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TITLE */}
        <Text style={styles.title}>
          Outward and Reverse charge Inward
        </Text>

        <Text style={styles.subTitle}>
          Sr. No 1
        </Text>

        {/* STATE */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.selectBox}
          onPress={() => setStateModal(true)}
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
          onPress={() => setRateModal(true)}
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

        {/* ACTION ICONS */}
        <View style={styles.actionRow}>
          {/* EDIT */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.iconButton}
            onPress={() =>
              handleEdit(records[0])
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
              handleDelete(records[0]?.id)
            }
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color="#EF4444"
            />
          </TouchableOpacity>
        </View>

        {/* BUTTONS */}
        <View style={styles.buttonRow}>
          {/* BACK */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backBtn}
            onPress={() =>
              router.push(
                "/gst/b2c-others" as any
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
              Add
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
          onPress={() => setStateModal(false)}
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
                  <Text style={styles.optionText}>
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
          onPress={() => setRateModal(false)}
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
                  <Text style={styles.optionText}>
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
    fontSize: 15,
    fontWeight: "600",
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 20,
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
    marginBottom: 10,
    fontWeight: "500",
  },

  /* SAME UI */
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
    marginBottom: 12,
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
    marginBottom: 12,
  },

  /* ACTION ICONS */
  actionRow: {
    flexDirection: "row",
    marginTop: 4,
    marginBottom: 60,
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

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.10)",
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