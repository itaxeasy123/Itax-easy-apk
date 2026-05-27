import React, {
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  router,
} from "expo-router";

import GSTBottomBar from "../components/GSTBottomBar";

const STATE_LIST = [
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

const TAX_RATES = [
  "5%",
  "12%",
  "18%",
  "28%",
];

export default function AddB2BRecordScreen() {
  const [gstin, setGstin] =
    useState("");

  const [state, setState] =
    useState("");

  const [
    showStates,
    setShowStates,
  ] = useState(false);

  const [
    invoiceNo,
    setInvoiceNo,
  ] = useState("");

  const [
    invoiceDate,
    setInvoiceDate,
  ] = useState("");

  const [
    taxRate,
    setTaxRate,
  ] = useState("5%");

  const [
    showTax,
    setShowTax,
  ] = useState(false);

  const [nature, setNature] =
    useState("");

  const [sources, setSources] =
    useState("");

  const [
    supplyType,
    setSupplyType,
  ] = useState("");

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text
          style={styles.headerTitle}
        >
          4A,4B,6B,6C-B2B
          Invoices
        </Text>
      </View>

      {/* BODY */}

      <ScrollView
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom: 130,
        }}
      >
        <View style={styles.content}>
          <Text
            style={styles.mainTitle}
          >
            Outward and Reverse
            charge Inward
          </Text>

          <Text
            style={styles.subTitle}
          >
            Sr. No 1
          </Text>

          {/* GSTIN */}

          <TextInput
            placeholder="GSTIN"
            placeholderTextColor="#8B8B8B"
            value={gstin}
            onChangeText={setGstin}
            style={styles.input}
          />

          {/* STATE */}

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.dropdownBox}
            onPress={() =>
              setShowStates(
                !showStates
              )
            }
          >
            <Text
              style={
                state
                  ? styles.dropdownValue
                  : styles.dropdownPlaceholder
              }
            >
              {state ||
                "Select State"}
            </Text>

            <Ionicons
              name={
                showStates
                  ? "chevron-up"
                  : "chevron-down"
              }
              size={18}
              color="#666"
            />
          </TouchableOpacity>

          {showStates && (
            <View
              style={
                styles.dropdownList
              }
            >
              <ScrollView
                nestedScrollEnabled
                style={{
                  maxHeight: 180,
                }}
                showsVerticalScrollIndicator={
                  false
                }
              >
                {STATE_LIST.map(
                  item => (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={
                        0.8
                      }
                      style={
                        styles.dropdownItem
                      }
                      onPress={() => {
                        setState(
                          item
                        );

                        setShowStates(
                          false
                        );
                      }}
                    >
                      <Text
                        style={
                          styles.dropdownItemText
                        }
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </ScrollView>
            </View>
          )}

          {/* INVOICE NUMBER */}

          <TextInput
            placeholder="Invoices No."
            placeholderTextColor="#8B8B8B"
            value={invoiceNo}
            onChangeText={
              setInvoiceNo
            }
            style={styles.input}
          />

          {/* INVOICE DATE */}

          <TextInput
            placeholder="Invoices Data"
            placeholderTextColor="#8B8B8B"
            value={invoiceDate}
            onChangeText={
              setInvoiceDate
            }
            style={styles.input}
          />

          {/* TAX RATE */}

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.dropdownBox}
            onPress={() =>
              setShowTax(
                !showTax
              )
            }
          >
            <Text
              style={
                styles.dropdownValue
              }
            >
              {taxRate}
            </Text>

            <Ionicons
              name={
                showTax
                  ? "chevron-up"
                  : "chevron-down"
              }
              size={18}
              color="#666"
            />
          </TouchableOpacity>

          {showTax && (
            <View
              style={
                styles.taxDropdownList
              }
            >
              {TAX_RATES.map(
                item => (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={
                      0.8
                    }
                    style={
                      styles.dropdownItem
                    }
                    onPress={() => {
                      setTaxRate(
                        item
                      );

                      setShowTax(
                        false
                      );
                    }}
                  >
                    <Text
                      style={
                        styles.dropdownItemText
                      }
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          )}

          {/* NATURE */}

          <TextInput
            placeholder="Nature"
            placeholderTextColor="#8B8B8B"
            value={nature}
            onChangeText={
              setNature
            }
            style={styles.input}
          />

          {/* SOURCES */}

          <TextInput
            placeholder="Sources"
            placeholderTextColor="#8B8B8B"
            value={sources}
            onChangeText={
              setSources
            }
            style={styles.input}
          />

          {/* SUPPLY TYPE */}

          <TextInput
            placeholder="Supply Type"
            placeholderTextColor="#8B8B8B"
            value={supplyType}
            onChangeText={
              setSupplyType
            }
            style={styles.input}
          />

          {/* BUTTONS */}

          <View
            style={
              styles.buttonRow
            }
          >
            <TouchableOpacity
              activeOpacity={0.85}
              style={
                styles.actionButton
              }
            >
              <Text
                style={
                  styles.actionText
                }
              >
                View
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={
                styles.actionButton
              }
            >
              <Text
                style={
                  styles.actionText
                }
              >
                Download
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}

      <GSTBottomBar />
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        "#F5F5F5",
    },

    header: {
      height: 78,

      backgroundColor:
        "#4A7BEA",

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal: 14,

      paddingTop:
        Platform.OS ===
        "ios"
          ? 18
          : 10,
    },

    headerTitle: {
      color: "#FFFFFF",

      fontSize: 16,

      fontWeight: "600",

      marginLeft: 10,
    },

    content: {
      paddingHorizontal: 12,

      paddingTop: 14,
    },

    mainTitle: {
      fontSize: 14,

      color: "#333",

      fontWeight: "500",
    },

    subTitle: {
      fontSize: 11,

      color: "#777",

      marginTop: 2,

      marginBottom: 12,
    },

    input: {
      height: 42,

      borderWidth: 1,

      borderColor: "#CCD4E0",

      borderRadius: 8,

      backgroundColor:
        "#FFFFFF",

      paddingHorizontal: 12,

      fontSize: 13,

      color: "#222",

      marginBottom: 12,
    },

    dropdownBox: {
      height: 42,

      borderWidth: 1,

      borderColor: "#CCD4E0",

      borderRadius: 8,

      backgroundColor:
        "#FFFFFF",

      paddingHorizontal: 12,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      marginBottom: 12,
    },

    dropdownPlaceholder: {
      color: "#8B8B8B",

      fontSize: 13,
    },

    dropdownValue: {
      color: "#222",

      fontSize: 13,
    },

    dropdownList: {
      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderColor: "#CCD4E0",

      borderRadius: 8,

      marginTop: -6,

      marginBottom: 12,

      overflow: "hidden",

      maxHeight: 180,
    },

    taxDropdownList: {
      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderColor: "#CCD4E0",

      borderRadius: 8,

      marginTop: -6,

      marginBottom: 12,

      overflow: "hidden",
    },

    dropdownItem: {
      height: 42,

      justifyContent:
        "center",

      paddingHorizontal: 12,

      borderBottomWidth: 1,

      borderBottomColor:
        "#EEF1F5",
    },

    dropdownItemText: {
      fontSize: 13,

      color: "#222",
    },

    buttonRow: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      marginTop: 6,
    },

    actionButton: {
      width: "47%",

      height: 46,

      backgroundColor:
        "#4A7BEA",

      borderRadius: 6,

      alignItems: "center",

      justifyContent:
        "center",
    },

    actionText: {
      color: "#FFFFFF",

      fontSize: 14,

      fontWeight: "600",
    },
  });