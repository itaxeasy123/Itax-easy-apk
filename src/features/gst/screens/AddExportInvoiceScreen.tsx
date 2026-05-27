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

const gstRates = ["5%", "12%", "18%", "28%"];

export default function AddExportInvoiceScreen() {
  const router = useRouter();

  const [pos, setPos] =
    useState("Select State");

  const [invoiceNo, setInvoiceNo] =
    useState("");

  const [supplyType, setSupplyType] =
    useState("");

  const [invoiceDate, setInvoiceDate] =
    useState("");

  const [invoiceValue, setInvoiceValue] =
    useState("");

  const [totalInvoiceValue, setTotalInvoiceValue] =
    useState("");

  const [gst, setGst] = useState("5%");

  const [posModal, setPosModal] =
    useState(false);

  const [gstModal, setGstModal] =
    useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            router.push(
              "/gst/export-invoices" as any
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
          6A-Export Invoices
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

        {/* SUB TITLE */}
        <Text style={styles.subTitle}>
          Sr. No 1
        </Text>

        {/* POS */}
        <Text style={styles.label}>POS</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.selectBox}
          onPress={() => setPosModal(true)}
        >
          <Text
            style={[
              styles.selectText,
              pos === "Select State" && {
                color: "#7B8190",
              },
            ]}
          >
            {pos}
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
          placeholderTextColor="#7B8190"
          value={invoiceNo}
          onChangeText={setInvoiceNo}
          style={styles.input}
        />

        {/* SUPPLY TYPE */}
        <TextInput
          placeholder="Supply Type"
          placeholderTextColor="#7B8190"
          value={supplyType}
          onChangeText={setSupplyType}
          style={styles.input}
        />

        {/* INVOICE DATE */}
        <TextInput
          placeholder="Invoices Data"
          placeholderTextColor="#7B8190"
          value={invoiceDate}
          onChangeText={setInvoiceDate}
          style={styles.input}
        />

        {/* INVOICE VALUE */}
        <TextInput
          placeholder="Invoices Value"
          placeholderTextColor="#7B8190"
          value={invoiceValue}
          onChangeText={setInvoiceValue}
          style={styles.input}
        />

        {/* TOTAL INVOICE VALUE */}
        <TextInput
          placeholder="Total Invoices val"
          placeholderTextColor="#7B8190"
          value={totalInvoiceValue}
          onChangeText={
            setTotalInvoiceValue
          }
          style={styles.input}
        />

        {/* GST */}
        <Text style={styles.label}>GST</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.selectBox}
          onPress={() => setGstModal(true)}
        >
          <Text style={styles.selectText}>
            {gst}
          </Text>

          <Ionicons
            name="chevron-down"
            size={16}
            color="#6B7280"
          />
        </TouchableOpacity>

        {/* BUTTONS */}
        <View style={styles.buttonRow}>
          {/* BACK */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backBtn}
            onPress={() =>
              router.push(
                "/gst/export-invoices" as any
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
          >
            <Text style={styles.buttonText}>
              Add
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* POS MODAL */}
      <Modal
        visible={posModal}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setPosModal(false)}
        >
          <View style={styles.modalBox}>
            <FlatList
              data={states}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    setPos(item);
                    setPosModal(false);
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

      {/* GST MODAL */}
      <Modal
        visible={gstModal}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setGstModal(false)}
        >
          <View style={styles.modalBox}>
            <FlatList
              data={gstRates}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    setGst(item);
                    setGstModal(false);
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

  label: {
    fontSize: 11,
    color: "#374151",
    marginBottom: 6,
    marginLeft: 2,
  },

  /* SAME INPUT UI */
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

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  backBtn: {
    flex: 1,
    height: 42,
    backgroundColor: "#4B83F5",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  addBtn: {
    flex: 1,
    height: 42,
    backgroundColor: "#4B83F5",
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