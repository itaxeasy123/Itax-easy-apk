// ===============================================
// SCREEN FILE
// app/gst/gstr1-hsn-summary-screen.tsx
// ===============================================

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

const GSTR1HSNSummaryScreen = () => {
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

      {
        id: 2,
        place: "32.00",
        rate: "3,899.00",
        totalTaxable: "250.00",
        integrated: "70.00",
        centralTax: "300.00",
        stateTax: "200.00",
        cess: "0.00",
      },

      {
        id: 3,
        place: "70.00",
        rate: "2,499.00",
        totalTaxable: "200.00",
        integrated: "69.00",
        centralTax: "250.00",
        stateTax: "50.00",
        cess: "0.00",
      },
    ]);

  const handleDelete = (id: number) => {
    setRecords((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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

          <Text style={styles.headerTitle}>
            12-HSN-wise summary of outward
            {"\n"}
            supplies
          </Text>
        </View>

        {/* BODY */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
        >
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
              <View style={styles.topRow}>
                <Text style={styles.recordText}>
                  Record Details
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.importButton}
                >
                  <Text
                    style={styles.importText}
                  >
                    Import EWB Data
                  </Text>
                </TouchableOpacity>
              </View>

              {/* TABLE */}
              <View style={styles.table}>
                {/* HEADER ROW */}
                <View
                  style={styles.headerRow}
                >
                  <View
                    style={styles.leftHeader}
                  >
                    <Text
                      style={
                        styles.headerCellText
                      }
                    >
                      Place of Supply
                    </Text>
                  </View>

                  {records.map((item) => (
                    <View
                      key={item.id}
                      style={
                        styles.rightHeader
                      }
                    >
                      <Text
                        style={
                          styles.headerCellText
                        }
                      >
                        {item.place}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* RATE */}
                <View style={styles.row}>
                  <View
                    style={styles.leftCell}
                  >
                    <Text
                      style={
                        styles.cellText
                      }
                    >
                      Rate
                    </Text>
                  </View>

                  {records.map((item) => (
                    <View
                      key={item.id}
                      style={
                        styles.rightCell
                      }
                    >
                      <Text
                        style={
                          styles.cellValue
                        }
                      >
                        {item.rate}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* TOTAL TAXABLE */}
                <View style={styles.row}>
                  <View
                    style={styles.leftCell}
                  >
                    <Text
                      style={
                        styles.cellText
                      }
                    >
                      Total Taxable
                    </Text>
                  </View>

                  {records.map((item) => (
                    <View
                      key={item.id}
                      style={
                        styles.rightCell
                      }
                    >
                      <Text
                        style={
                          styles.cellValue
                        }
                      >
                        {
                          item.totalTaxable
                        }
                      </Text>
                    </View>
                  ))}
                </View>

                {/* INTEGRATED */}
                <View style={styles.row}>
                  <View
                    style={styles.leftCell}
                  >
                    <Text
                      style={
                        styles.cellText
                      }
                    >
                      Integrated
                    </Text>
                  </View>

                  {records.map((item) => (
                    <View
                      key={item.id}
                      style={
                        styles.rightCell
                      }
                    >
                      <Text
                        style={
                          styles.cellValue
                        }
                      >
                        {
                          item.integrated
                        }
                      </Text>
                    </View>
                  ))}
                </View>

                {/* CENTRAL TAX */}
                <View style={styles.row}>
                  <View
                    style={styles.leftCell}
                  >
                    <Text
                      style={
                        styles.cellText
                      }
                    >
                      Central Tax
                    </Text>
                  </View>

                  {records.map((item) => (
                    <View
                      key={item.id}
                      style={
                        styles.rightCell
                      }
                    >
                      <Text
                        style={
                          styles.cellValue
                        }
                      >
                        {
                          item.centralTax
                        }
                      </Text>
                    </View>
                  ))}
                </View>

                {/* STATE TAX */}
                <View style={styles.row}>
                  <View
                    style={styles.leftCell}
                  >
                    <Text
                      style={
                        styles.cellText
                      }
                    >
                      State Tax
                    </Text>
                  </View>

                  {records.map((item) => (
                    <View
                      key={item.id}
                      style={
                        styles.rightCell
                      }
                    >
                      <Text
                        style={
                          styles.cellValue
                        }
                      >
                        {
                          item.stateTax
                        }
                      </Text>
                    </View>
                  ))}
                </View>

                {/* CESS */}
                <View style={styles.row}>
                  <View
                    style={styles.leftCell}
                  >
                    <Text
                      style={
                        styles.cellText
                      }
                    >
                      Cess
                    </Text>
                  </View>

                  {records.map((item) => (
                    <View
                      key={item.id}
                      style={
                        styles.rightCell
                      }
                    >
                      <Text
                        style={
                          styles.cellValue
                        }
                      >
                        {item.cess}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* ACTION */}
                <View style={styles.row}>
                  <View
                    style={styles.leftCell}
                  >
                    <Text
                      style={
                        styles.cellText
                      }
                    >
                      Action
                    </Text>
                  </View>

                  {records.map((item) => (
                    <View
                      key={item.id}
                      style={
                        styles.actionCell
                      }
                    >
                      {/* DELETE */}
                      <TouchableOpacity
                        onPress={() =>
                          handleDelete(
                            item.id
                          )
                        }
                      >
                        <MaterialIcons
                          name="delete-outline"
                          size={16}
                          color="#2962ff"
                        />
                      </TouchableOpacity>

                      {/* EDIT */}
                      <TouchableOpacity
                        style={{
                          marginTop: 6,
                        }}
                        onPress={() =>
                          router.push(
                            `/gst/gstr1-hsn-summary-add?id=${item.id}`
                          )
                        }
                      >
                        <Feather
                          name="edit-2"
                          size={13}
                          color="#ff3b30"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              {/* ADD BUTTON */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.addButton}
                onPress={() =>
                  router.push(
                    "/gst/gstr1-hsn-summary-add"
                  )
                }
              >
                <Text style={styles.addText}>
                  Add Record
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ScrollView>

        {/* BOTTOM BAR */}
        <GSTBottomBar />
      </View>
    </SafeAreaView>
  );
};

export default GSTR1HSNSummaryScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f4f4",
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

    fontSize: 13,

    fontWeight: "600",

    marginLeft: 8,

    lineHeight: 18,
  },

  /* BODY */
  body: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  topRow: {
    flexDirection: "row",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 14,
  },

  recordText: {
    fontSize: 13,

    color: "#222",

    fontWeight: "500",
  },

  importButton: {
    backgroundColor: "#4B7BE5",

    height: 24,

    paddingHorizontal: 10,

    borderRadius: 4,

    justifyContent: "center",
  },

  importText: {
    color: "#fff",

    fontSize: 10,

    fontWeight: "600",
  },

  /* TABLE */
  table: {
    borderWidth: 1,
    borderColor: "#cfd5df",
  },

  headerRow: {
    flexDirection: "row",
  },

  row: {
    flexDirection: "row",
  },

  leftHeader: {
    width: 95,

    height: 42,

    backgroundColor: "#eef1f5",

    borderRightWidth: 1,

    borderBottomWidth: 1,

    borderColor: "#cfd5df",

    justifyContent: "center",

    paddingHorizontal: 6,
  },

  rightHeader: {
    width: 70,

    height: 42,

    backgroundColor: "#fff",

    borderRightWidth: 1,

    borderBottomWidth: 1,

    borderColor: "#cfd5df",

    justifyContent: "center",

    alignItems: "center",
  },

  leftCell: {
    width: 95,

    height: 42,

    backgroundColor: "#eef1f5",

    borderRightWidth: 1,

    borderBottomWidth: 1,

    borderColor: "#cfd5df",

    justifyContent: "center",

    paddingHorizontal: 6,
  },

  rightCell: {
    width: 70,

    height: 42,

    backgroundColor: "#fff",

    borderRightWidth: 1,

    borderBottomWidth: 1,

    borderColor: "#cfd5df",

    justifyContent: "center",

    alignItems: "center",
  },

  actionCell: {
    width: 70,

    height: 42,

    backgroundColor: "#fff",

    borderRightWidth: 1,

    borderBottomWidth: 1,

    borderColor: "#cfd5df",

    justifyContent: "center",

    alignItems: "center",
  },

  headerCellText: {
    fontSize: 9,

    color: "#222",
  },

  cellText: {
    fontSize: 9,

    color: "#222",
  },

  cellValue: {
    fontSize: 9,

    color: "#222",
  },

  /* ADD BUTTON */
  addButton: {
    width: 110,

    height: 36,

    backgroundColor: "#4B7BE5",

    borderRadius: 18,

    justifyContent: "center",

    alignItems: "center",

    alignSelf: "flex-end",

    marginTop: 20,
  },

  addText: {
    color: "#fff",

    fontSize: 12,

    fontWeight: "600",
  },
});