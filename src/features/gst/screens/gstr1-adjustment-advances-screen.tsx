import React, { useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";

import { useRouter } from "expo-router";

import {
  Ionicons,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";

import GSTBottomBar from "../components/GSTBottomBar";

const { width } = Dimensions.get("window");

interface RecordItem {
  id: number;
  place: string;
  rate: string;
  totalTaxable: string;
  integrated: string;
  centralTax: string;
  stateTax: string;
  cess: string;
}

const GSTR1AdjustmentAdvancesScreen =
  () => {
    const router = useRouter();

    const [records, setRecords] =
      useState<RecordItem[]>([
        {
          id: 1,
          place: "24.00",
          rate: "2,899.00",
          totalTaxable: "273.00",
          integrated: "67.00",
          centralTax: "200.00",
          stateTax: "100.00",
          cess: "0.00",
        },
      ]);

    const handleDelete = (
      id: number
    ) => {
      setRecords((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );
    };

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
                  "/gst/gstr1-records"
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
              {/* TOP */}
              <View
                style={styles.topRow}
              >
                <Text
                  style={styles.recordText}
                >
                  Record Details
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={
                    styles.importButton
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
              {records.map((item) => (
                <View
                  key={item.id}
                  style={styles.table}
                >
                  {[
                    [
                      "Place of Supply",
                      item.place,
                    ],
                    ["Rate", item.rate],
                    [
                      "Total Taxable",
                      item.totalTaxable,
                    ],
                    [
                      "Integrated",
                      item.integrated,
                    ],
                    [
                      "Central Tax",
                      item.centralTax,
                    ],
                    [
                      "State Tax",
                      item.stateTax,
                    ],
                    ["Cess", item.cess],
                  ].map(
                    ([label, value]) => (
                      <View
                        key={label}
                        style={
                          styles.tableRow
                        }
                      >
                        <View
                          style={
                            styles.leftCell
                          }
                        >
                          <Text
                            style={
                              styles.cellLabel
                            }
                          >
                            {label}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.rightCell
                          }
                        >
                          <Text
                            style={
                              styles.cellValue
                            }
                          >
                            {value}
                          </Text>
                        </View>
                      </View>
                    )
                  )}

                  {/* ACTION */}
                  <View
                    style={styles.tableRow}
                  >
                    <View
                      style={
                        styles.leftCell
                      }
                    >
                      <Text
                        style={
                          styles.cellLabel
                        }
                      >
                        Action
                      </Text>
                    </View>

                    <View
                      style={
                        styles.actionCell
                      }
                    >
                      {/* EDIT */}
                      <TouchableOpacity
                        onPress={() =>
                          router.push(
                            `/gst/gstr1-adjustment-advances-add?id=${item.id}`
                          )
                        }
                      >
                        <Feather
                          name="edit"
                          size={15}
                          color="#2962ff"
                        />
                      </TouchableOpacity>

                      {/* DELETE */}
                      <TouchableOpacity
                        style={{
                          marginTop: 6,
                        }}
                        onPress={() =>
                          handleDelete(
                            item.id
                          )
                        }
                      >
                        <MaterialIcons
                          name="delete-outline"
                          size={17}
                          color="#ff3b30"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}

              {/* ADD BUTTON */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.addButton}
                onPress={() =>
                  router.push(
                    "/gst/gstr1-adjustment-advances-add"
                  )
                }
              >
                <Text
                  style={styles.addText}
                >
                  Add Record
                </Text>
              </TouchableOpacity>

              {/* BACK BUTTON */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.backBtn}
                onPress={() =>
                  router.push(
                    "/gst/gstr1-records"
                  )
                }
              >
                <Text
                  style={styles.backText}
                >
                  Back
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* BOTTOM BAR */}
          <GSTBottomBar />
        </View>
      </SafeAreaView>
    );
  };

export default
  GSTR1AdjustmentAdvancesScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f3f3",
  },

  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

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

  body: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  topRow: {
    flexDirection: "row",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 12,
  },

  recordText: {
    fontSize: 13,

    color: "#222",

    fontWeight: "500",
  },

  importButton: {
    backgroundColor: "#4B7BE5",

    paddingHorizontal: 10,

    height: 24,

    borderRadius: 4,

    justifyContent: "center",
  },

  importText: {
    color: "#fff",

    fontSize: 10,

    fontWeight: "600",
  },

  table: {
    width: width * 0.52,
  },

  tableRow: {
    flexDirection: "row",
  },

  leftCell: {
    width: "58%",

    borderWidth: 1,

    borderColor: "#c8d0db",

    backgroundColor: "#eef1f5",

    justifyContent: "center",

    paddingHorizontal: 6,

    height: 40,
  },

  rightCell: {
    width: "42%",

    borderWidth: 1,

    borderColor: "#c8d0db",

    backgroundColor: "#fff",

    justifyContent: "center",

    paddingHorizontal: 6,

    height: 40,
  },

  actionCell: {
    width: "42%",

    borderWidth: 1,

    borderColor: "#c8d0db",

    backgroundColor: "#fff",

    justifyContent: "center",

    alignItems: "center",

    height: 40,
  },

  cellLabel: {
    fontSize: 10,
    color: "#222",
  },

  cellValue: {
    fontSize: 10,
    color: "#444",
  },

  addButton: {
    width: 110,

    height: 34,

    backgroundColor: "#4B7BE5",

    borderRadius: 18,

    justifyContent: "center",

    alignItems: "center",

    alignSelf: "flex-end",

    marginTop: 24,
  },

  addText: {
    color: "#fff",

    fontSize: 12,

    fontWeight: "600",
  },

  backBtn: {
    width: 70,

    height: 26,

    borderWidth: 1,

    borderColor: "#4B7BE5",

    borderRadius: 5,

    justifyContent: "center",

    alignItems: "center",

    alignSelf: "flex-end",

    marginTop: 10,
  },

  backText: {
    color: "#4B7BE5",

    fontSize: 11,

    fontWeight: "500",
  },
});