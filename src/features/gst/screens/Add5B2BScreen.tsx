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

const taxRates = ["5%", "12%", "18%", "28%"];

export default function AddLargeInvoiceScreen() {
  const router = useRouter();

  const [state, setState] = useState("Select State");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [supplyType, setSupplyType] =
    useState("");
  const [invoiceDate, setInvoiceDate] =
    useState("");
  const [invoiceValue, setInvoiceValue] =
    useState("");
  const [totalInvoiceValue, setTotalInvoiceValue] =
    useState("");
  const [taxRate, setTaxRate] = useState("5%");
  const [supply, setSupply] = useState("");

  const [stateModal, setStateModal] =
    useState(false);

  const [taxModal, setTaxModal] =
    useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            router.push("/gst/b2c-large" as any)
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
          5A-B2C (Large Invoices)
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

        {/* SELECT STATE */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.input}
          onPress={() => setStateModal(true)}
        >
          <Text
            style={[
              styles.inputText,
              state === "Select State" && {
                color: "#7C8594",
              },
            ]}
          >
            {state}
          </Text>

          <Ionicons
            name="chevron-down"
            size={16}
            color="#6B7280"
          />
        </TouchableOpacity>

        {/* INVOICE NO */}
        <TextInput
          placeholder="Invoices No."
          placeholderTextColor="#7C8594"
          value={invoiceNo}
          onChangeText={setInvoiceNo}
          style={styles.inputField}
        />

        {/* SUPPLY TYPE */}
        <TextInput
          placeholder="Supply Type"
          placeholderTextColor="#7C8594"
          value={supplyType}
          onChangeText={setSupplyType}
          style={styles.inputField}
        />

        {/* INVOICE DATE */}
        <TextInput
          placeholder="Invoices Data"
          placeholderTextColor="#7C8594"
          value={invoiceDate}
          onChangeText={setInvoiceDate}
          style={styles.inputField}
        />

        {/* INVOICE VALUE */}
        <TextInput
          placeholder="Invoices Value"
          placeholderTextColor="#7C8594"
          value={invoiceValue}
          onChangeText={setInvoiceValue}
          style={styles.inputField}
        />

        {/* TOTAL VALUE */}
        <TextInput
          placeholder="Total Invoices val"
          placeholderTextColor="#7C8594"
          value={totalInvoiceValue}
          onChangeText={setTotalInvoiceValue}
          style={styles.inputField}
        />

        {/* TAX */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.input}
          onPress={() => setTaxModal(true)}
        >
          <Text style={styles.inputText}>
            {taxRate}
          </Text>

          <Ionicons
            name="chevron-down"
            size={16}
            color="#6B7280"
          />
        </TouchableOpacity>

        {/* SUPPLY */}
        <TextInput
          placeholder="Supply Type"
          placeholderTextColor="#7C8594"
          value={supply}
          onChangeText={setSupply}
          style={styles.inputField}
        />

        {/* BUTTONS */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backBtn}
            onPress={() =>
              router.push(
                "/gst/b2c-large" as any
              )
            }
          >
            <Text style={styles.buttonText}>
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.addBtn}
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
                    setState(item);
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

      {/* TAX MODAL */}
      <Modal
        visible={taxModal}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setTaxModal(false)}
        >
          <View style={styles.modalBox}>
            <FlatList
              data={taxRates}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    setTaxRate(item);
                    setTaxModal(false);
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
    paddingTop: 12,
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

  /* SAME INPUT LIKE IMAGE */
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: "#C8D0DD",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  inputField: {
    height: 42,
    borderWidth: 1,
    borderColor: "#C8D0DD",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 11,
    color: "#111827",
  },

  inputText: {
    fontSize: 11,
    color: "#111827",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  backBtn: {
    flex: 1,
    height: 42,
    backgroundColor: "#4F86F7",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  addBtn: {
    flex: 1,
    height: 42,
    backgroundColor: "#4F86F7",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
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