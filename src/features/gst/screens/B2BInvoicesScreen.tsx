import React, {
  useState,
} from "react";

import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import {
  Ionicons,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import GSTBottomBar from "../components/GSTBottomBar";

export default function B2BInvoicesScreen() {
  const params =
    useLocalSearchParams();

  const assessmentYear =
    params.assessmentYear ||
    "2024-25";

  const [records, setRecords] =
    useState([
      {
        id: 1,

        gstin:
          "23AAAAA0000A1ZD",

        party:
          "Accounts Officer Municipal Corporation Indore",

        type: "TDS",
      },

      {
        id: 2,

        gstin:
          "23AHBPD9838N1ZV",

        party:
          "Omkar Construction",

        type:
          "Regular Taxpayer",
      },
    ]);

 const handleAddRecord =
  () => {
    router.push({
      pathname:
        "/gst/add-b2b-record",

      params: {
        assessmentYear:
          params.assessmentYear,
      },
    });
  };

  const handleEdit =
    (id: number) => {
      router.push({
        pathname:
          "/gst/edit-b2b-record" as any,

        params: {
          id,
        },
      });
    };

  const handleDelete =
    (id: number) => {
      Alert.alert(
        "Delete Invoice",
        "Are you sure want to delete this invoice?",
        [
          {
            text: "Cancel",

            style: "cancel",
          },

          {
            text: "Delete",

            style:
              "destructive",

            onPress: () => {
              setRecords(
                prev =>
                  prev.filter(
                    item =>
                      item.id !== id
                  )
              );
            },
          },
        ]
      );
    };

  return (
    <SafeAreaView
      style={styles.safe}
    >
      {/* HEADER */}

      <View
        style={styles.header}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#FFF"
          />
        </TouchableOpacity>

        <Text
          style={styles.headerTitle}
        >
          4A,4B,6B,6C-B2B
          Invoices
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* TOP */}

        <View
          style={
            styles.topAction
          }
        >
          <Text
            style={
              styles.recordTitle
            }
          >
            Record Details
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={
              styles.importBtn
            }
          >
            <Text
              style={
                styles.importText
              }
            >
              Import EWB Data
            </Text>
          </TouchableOpacity>
        </View>

        {/* TABLE */}

        <View
          style={
            styles.tableContainer
          }
        >
          {/* HEADER ROW */}

          <View
            style={styles.row}
          >
            <View
              style={
                styles.leftCell
              }
            >
              <Text
                style={
                  styles.leftTitle
                }
              >
                Recipient Details
              </Text>
            </View>

            <View
              style={
                styles.cell
              }
            >
              <Text
                style={
                  styles.cellText
                }
              >
                {
                  records[0]
                    ?.gstin
                }
              </Text>
            </View>

            <View
              style={
                styles.cell
              }
            >
              <Text
                style={
                  styles.cellText
                }
              >
                {
                  records[1]
                    ?.gstin
                }
              </Text>
            </View>
          </View>

          {/* TRADE NAME */}

          <View
            style={styles.row}
          >
            <View
              style={
                styles.leftCell
              }
            >
              <Text
                style={
                  styles.leftTitle
                }
              >
                Trade/legal Name
              </Text>
            </View>

            <View
              style={
                styles.cell
              }
            >
              <Text
                style={
                  styles.cellText
                }
              >
                {
                  records[0]
                    ?.party
                }
              </Text>
            </View>

            <View
              style={
                styles.cell
              }
            >
              <Text
                style={
                  styles.cellText
                }
              >
                {
                  records[1]
                    ?.party
                }
              </Text>
            </View>
          </View>

          {/* TAX TYPE */}

          <View
            style={styles.row}
          >
            <View
              style={
                styles.leftCell
              }
            >
              <Text
                style={
                  styles.leftTitle
                }
              >
                Taxpayer Type
              </Text>
            </View>

            <View
              style={
                styles.cell
              }
            >
              <Text
                style={
                  styles.cellText
                }
              >
                {
                  records[0]
                    ?.type
                }
              </Text>
            </View>

            <View
              style={
                styles.cell
              }
            >
              <Text
                style={
                  styles.cellText
                }
              >
                {
                  records[1]
                    ?.type
                }
              </Text>
            </View>
          </View>

          {/* PROCESSED */}

          <View
            style={styles.row}
          >
            <View
              style={
                styles.leftCell
              }
            >
              <Text
                style={
                  styles.leftTitle
                }
              >
                Processed Records
              </Text>
            </View>

            <View
              style={
                styles.cell
              }
            >
              <Text
                style={
                  styles.countText
                }
              >
                1
              </Text>
            </View>

            <View
              style={
                styles.cell
              }
            >
              <Text
                style={
                  styles.countText
                }
              >
                1
              </Text>
            </View>
          </View>

          {/* PENDING */}

          <View
            style={styles.row}
          >
            <View
              style={
                styles.leftCell
              }
            >
              <Text
                style={
                  styles.leftTitle
                }
              >
                Pending Erroneous
                invoices
              </Text>
            </View>

            <View
              style={
                styles.cell
              }
            >
              <Text
                style={
                  styles.countText
                }
              >
                0
              </Text>
            </View>

            <View
              style={
                styles.cell
              }
            >
              <Text
                style={
                  styles.countText
                }
              >
                0
              </Text>
            </View>
          </View>

          {/* ADD */}

          <View
            style={styles.row}
          >
            <View
              style={
                styles.leftCell
              }
            >
              <Text
                style={
                  styles.leftTitle
                }
              >
                Add Invoice
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={
                styles.iconCell
              }
              onPress={
                handleAddRecord
              }
            >
              <Ionicons
                name="add-circle"
                size={20}
                color="#4B5563"
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={
                styles.iconCell
              }
              onPress={
                handleAddRecord
              }
            >
              <Ionicons
                name="add-circle"
                size={20}
                color="#4B5563"
              />
            </TouchableOpacity>
          </View>

          {/* DELETE */}

          <View
            style={styles.row}
          >
            <View
              style={
                styles.leftCell
              }
            >
              <Text
                style={
                  styles.leftTitle
                }
              >
                Delete Invoice
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={
                styles.iconCell
              }
              onPress={() =>
                handleDelete(1)
              }
            >
              <MaterialIcons
                name="delete"
                size={18}
                color="#2563EB"
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={
                styles.iconCell
              }
              onPress={() =>
                handleDelete(2)
              }
            >
              <MaterialIcons
                name="delete"
                size={18}
                color="#2563EB"
              />
            </TouchableOpacity>
          </View>

          {/* EDIT */}

          <View
            style={styles.row}
          >
            <View
              style={
                styles.leftCell
              }
            >
              <Text
                style={
                  styles.leftTitle
                }
              >
                Edit Invoice
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={
                styles.iconCell
              }
              onPress={() =>
                handleEdit(1)
              }
            >
              <Feather
                name="edit-2"
                size={15}
                color="red"
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={
                styles.iconCell
              }
              onPress={() =>
                handleEdit(2)
              }
            >
              <Feather
                name="edit-2"
                size={15}
                color="red"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* BUTTONS */}

        <View
          style={
            styles.buttonWrapper
          }
        >
          <TouchableOpacity
            activeOpacity={0.85}
            style={
              styles.addBtn
            }
            onPress={
              handleAddRecord
            }
          >
            <Text
              style={
                styles.addBtnText
              }
            >
              Add Record
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={
              styles.backBtn
            }
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={
                styles.backText
              }
            >
              Back
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <GSTBottomBar />
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,

      backgroundColor:
        "#F3F4F6",
    },

    header: {
      height: 72,

      backgroundColor:
        "#437AE8",

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal: 12,
    },

    headerTitle: {
      color: "#FFF",

      fontSize: 14,

      fontWeight: "700",

      marginLeft: 10,
    },

    topAction: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      marginTop: 14,

      paddingHorizontal: 10,
    },

    recordTitle: {
      fontSize: 13,

      fontWeight: "700",

      color: "#222",
    },

    importBtn: {
      backgroundColor:
        "#437AE8",

      paddingHorizontal: 10,

      height: 30,

      borderRadius: 5,

      alignItems: "center",

      justifyContent:
        "center",
    },

    importText: {
      color: "#FFF",

      fontSize: 10,

      fontWeight: "700",
    },

    tableContainer: {
      marginHorizontal: 10,

      marginTop: 10,

      borderWidth: 1,

      borderColor: "#D1D5DB",

      backgroundColor:
        "#FFFFFF",
    },

    row: {
      flexDirection: "row",

      borderBottomWidth: 1,

      borderColor: "#D1D5DB",
    },

    leftCell: {
      width: "33%",

      padding: 8,

      borderRightWidth: 1,

      borderColor: "#D1D5DB",

      justifyContent:
        "center",
    },

    cell: {
      width: "33.5%",

      padding: 8,

      borderRightWidth: 1,

      borderColor: "#D1D5DB",

      justifyContent:
        "center",
    },

    iconCell: {
      width: "33.5%",

      alignItems: "center",

      justifyContent:
        "center",

      paddingVertical: 10,

      borderRightWidth: 1,

      borderColor: "#D1D5DB",
    },

    leftTitle: {
      fontSize: 9,

      color: "#444",

      fontWeight: "600",
    },

    cellText: {
      fontSize: 8,

      color: "#333",

      lineHeight: 12,
    },

    countText: {
      fontSize: 10,

      color: "#333",

      fontWeight: "600",
    },

    buttonWrapper: {
      alignItems: "flex-end",

      marginTop: 26,

      paddingRight: 12,
    },

    addBtn: {
      width: 120,

      height: 40,

      borderRadius: 22,

      backgroundColor:
        "#437AE8",

      alignItems: "center",

      justifyContent:
        "center",
    },

    addBtnText: {
      color: "#FFF",

      fontSize: 12,

      fontWeight: "700",
    },

    backBtn: {
      width: 72,

      height: 28,

      borderWidth: 1,

      borderColor: "#A5B4FC",

      borderRadius: 6,

      alignItems: "center",

      justifyContent:
        "center",

      marginTop: 14,
    },

    backText: {
      color: "#437AE8",

      fontSize: 11,

      fontWeight: "500",
    },
  });