import React, { useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Platform,
  Modal,
} from "react-native";

import { useRouter } from "expo-router";

import {
  Ionicons,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";

import GSTBottomBar from "../components/GSTBottomBar";

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
];

const rates = [
  "5%",
  "12%",
  "18%",
  "28%",
];

const GSTR1AdjustmentAdvancesAddScreen =
  () => {
    const router = useRouter();

    const [state, setState] =
      useState("");

    const [rate, setRate] =
      useState("5%");

    const [
      invoiceValue,
      setInvoiceValue,
    ] = useState("");

    const [
      supplyType,
      setSupplyType,
    ] = useState("");

    const [cess, setCess] =
      useState("");

    const [
      stateModal,
      setStateModal,
    ] = useState(false);

    const [
      rateModal,
      setRateModal,
    ] = useState(false);

    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View style={styles.container}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                router.push(
                  "/gst/gstr1-adjustment-advances"
                )
              }
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color="#fff"
              />
            </TouchableOpacity>

            <Text
              style={styles.headerTitle}
            >
              11B(1),11B(2)-Adjustment of
              {"\n"}
              (advances)
            </Text>
          </View>

          {/* BODY */}
          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={{
              paddingBottom: 170,
            }}
          >
            <View style={styles.body}>
              <Text style={styles.title}>
                Outward and Reverse charge
                Inward
              </Text>

              <Text style={styles.srNo}>
                Sr. No 1
              </Text>

              {/* SELECT STATE */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.inputBox}
                onPress={() =>
                  setStateModal(true)
                }
              >
                <Text
                  style={[
                    styles.inputText,
                    !state && {
                      color: "#9b9b9b",
                    },
                  ]}
                >
                  {state ||
                    "Select State"}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={18}
                  color="#7d7d7d"
                />
              </TouchableOpacity>

              {/* INVOICE VALUE */}
              <TextInput
                value={invoiceValue}
                onChangeText={
                  setInvoiceValue
                }
                placeholder="Invoices Value"
                placeholderTextColor="#9b9b9b"
                style={styles.inputBox}
              />

              {/* RATE */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.inputBox}
                onPress={() =>
                  setRateModal(true)
                }
              >
                <Text
                  style={styles.inputText}
                >
                  {rate}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={18}
                  color="#7d7d7d"
                />
              </TouchableOpacity>

              {/* SUPPLY TYPE */}
              <TextInput
                value={supplyType}
                onChangeText={
                  setSupplyType
                }
                placeholder="Supply Type"
                placeholderTextColor="#9b9b9b"
                style={styles.inputBox}
              />

              {/* CESS */}
              <TextInput
                value={cess}
                onChangeText={setCess}
                placeholder="Cess"
                placeholderTextColor="#9b9b9b"
                style={styles.inputBox}
              />

              {/* ACTION BUTTONS */}
              <View style={styles.actionRow}>
                {/* DELETE */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={
                    styles.actionButton
                  }
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={17}
                    color="#2962ff"
                  />
                </TouchableOpacity>

                {/* EDIT */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={
                    styles.actionButton
                  }
                >
                  <Feather
                    name="edit-2"
                    size={14}
                    color="#ff3b30"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* BOTTOM BUTTONS */}
          <View
            style={styles.bottomButtons}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.bottomButton}
              onPress={() =>
                router.push(
                  "/gst/gstr1-adjustment-advances"
                )
              }
            >
              <Text
                style={
                  styles.bottomButtonText
                }
              >
                Back
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.bottomButton}
            >
              <Text
                style={
                  styles.bottomButtonText
                }
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>

          {/* STATE DROPDOWN */}
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
              <View
                style={styles.dropdownBox}
              >
                <ScrollView
                  showsVerticalScrollIndicator={
                    false
                  }
                >
                  {states.map(
                    (item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={
                          styles.dropdownItem
                        }
                        onPress={() => {
                          setState(item);

                          setStateModal(
                            false
                          );
                        }}
                      >
                        <Text
                          style={
                            styles.dropdownText
                          }
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* RATE DROPDOWN */}
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
              <View
                style={styles.dropdownBox}
              >
                {rates.map(
                  (item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={
                        styles.dropdownItem
                      }
                      onPress={() => {
                        setRate(item);

                        setRateModal(
                          false
                        );
                      }}
                    >
                      <Text
                        style={
                          styles.dropdownText
                        }
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </TouchableOpacity>
          </Modal>

          {/* BOTTOM BAR */}
          <GSTBottomBar />
        </View>
      </SafeAreaView>
    );
  };

export default
  GSTR1AdjustmentAdvancesAddScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f3f3",
  },

  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  /* HEADER */
  header: {
    backgroundColor: "#4B7BE5",

    flexDirection: "row",

    alignItems: "flex-start",

    paddingHorizontal: 14,

    paddingTop:
      Platform.OS === "android"
        ? 18
        : 12,

    paddingBottom: 22,
  },

  headerTitle: {
    color: "#fff",

    fontSize: 14,

    fontWeight: "600",

    marginLeft: 8,

    lineHeight: 20,
  },

  /* BODY */
  body: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  title: {
    fontSize: 13,

    color: "#222",

    fontWeight: "500",
  },

  srNo: {
    marginTop: 10,

    marginBottom: 12,

    fontSize: 12,

    color: "#222",
  },

  /* INPUT */
  inputBox: {
    width: "100%",

    height: 46,

    borderWidth: 1,

    borderColor: "#cfd5df",

    borderRadius: 8,

    backgroundColor: "#fff",

    paddingHorizontal: 12,

    marginBottom: 12,

    fontSize: 13,

    color: "#222",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  inputText: {
    fontSize: 13,

    color: "#222",
  },

  /* ACTIONS */
  actionRow: {
    flexDirection: "row",

    alignItems: "center",

    gap: 12,

    marginTop: 6,
  },

  actionButton: {
    width: 34,

    height: 34,

    borderRadius: 100,

    backgroundColor: "#fff",

    justifyContent: "center",

    alignItems: "center",

    borderWidth: 1,

    borderColor: "#ececec",

    shadowColor: "#000",

    shadowOpacity: 0.08,

    shadowRadius: 3,

    shadowOffset: {
      width: 0,
      height: 1,
    },

    elevation: 2,
  },

  /* BOTTOM BUTTONS */
  bottomButtons: {
    position: "absolute",

    left: 14,
    right: 14,

    bottom: 92,

    flexDirection: "row",

    gap: 12,
  },

  bottomButton: {
    flex: 1,

    height: 42,

    borderRadius: 5,

    backgroundColor: "#4B7BE5",

    justifyContent: "center",

    alignItems: "center",
  },

  bottomButtonText: {
    color: "#fff",

    fontSize: 14,

    fontWeight: "600",
  },

  /* DROPDOWN */
  modalOverlay: {
    flex: 1,

    backgroundColor:
      "rgba(0,0,0,0.05)",

    paddingHorizontal: 14,

    paddingTop: 180,
  },

  dropdownBox: {
    backgroundColor: "#fff",

    borderRadius: 10,

    overflow: "hidden",

    borderWidth: 1,

    borderColor: "#e5e5e5",

    maxHeight: 250,
  },

  dropdownItem: {
    height: 46,

    justifyContent: "center",

    paddingHorizontal: 16,

    borderBottomWidth: 1,

    borderBottomColor: "#f1f1f1",
  },

  dropdownText: {
    fontSize: 13,

    color: "#222",
  },
});