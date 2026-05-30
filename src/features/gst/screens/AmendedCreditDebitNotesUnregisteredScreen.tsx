import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";

import {
  Picker,
} from "@react-native-picker/picker";

import {
  ArrowLeft,
  Trash2,
  Pencil,
  ChevronLeft,
} from "lucide-react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import GSTBottomBar from "../components/GSTBottomBar";
import { safeParseJson } from "../utils/gstHelpers";

interface InvoiceRecord {
  id: number;
  invoiceNo: string;
  invoiceDate: string;
  totalInvoiceValue: number;
  taxableValue: number;
  integratedTax: number;
  centralTax: number;
  stateTax: number;
  cess: number;
}

export default function AmendedCreditDebitNotesUnregisteredScreen() {

  const params =
    useLocalSearchParams();

  // YEARS
  const years = [
    "2022",
    "2023",
    "2024",
    "2025",
    "2026",
  ];

  // TABLE DATA
  const [records, setRecords] =
    useState<InvoiceRecord[]>([
      {
        id: 1,
        invoiceNo: "SSE/24-25/010",
        invoiceDate: "05/07/2024",
        totalInvoiceValue: 5034422,
        taxableValue: 4266460,
        integratedTax: 0,
        centralTax: 383081.4,
        stateTax: 383081.4,
        cess: 0,
      },
    ]);

  // UPDATE TABLE
  useEffect(() => {

    if (
      params?.updatedInvoice
    ) {

      const updatedInvoice =
        safeParseJson<InvoiceRecord>(
          params.updatedInvoice
        );

      if (!updatedInvoice) {
        return;
      }

      setRecords((prev) =>
        prev.map((item) =>
          item.id ===
          updatedInvoice.id
            ? updatedInvoice
            : item
        )
      );

    }

  }, [params?.updatedInvoice]);

  const [selectedYear, setSelectedYear] =
    useState("");

  const [searchInvoice, setSearchInvoice] =
    useState("");

  // FILTER
  const filteredRecords =
    useMemo(() => {

      return records.filter(
        (item) => {

          const yearMatch =
            selectedYear === ""
              ? true
              : item.invoiceDate.includes(
                  selectedYear
                );

          const invoiceMatch =
            searchInvoice.trim() ===
            ""
              ? true
              : item.invoiceNo
                  .toLowerCase()
                  .includes(
                    searchInvoice.toLowerCase()
                  );

          return (
            yearMatch &&
            invoiceMatch
          );

        }
      );

    }, [
      selectedYear,
      searchInvoice,
      records,
    ]);

  // DELETE
  const handleDelete = (
    id: number
  ) => {

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
                (item) =>
                  item.id !== id
              )
            );

          },
        },
      ]
    );

  };

  // EDIT
  const handleEdit = (
    item: InvoiceRecord
  ) => {

    router.push({
      pathname:
        "/gst/editamendedcreditdebitnotesunregistered",

      params: {
        invoiceData:
          JSON.stringify(item),
      },
    });

  };

  // FORMAT
  const formatCurrency = (
    value: number
  ) => {

    return value.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <TouchableOpacity
          style={
            styles.headerBackButton
          }
          onPress={() =>
            router.push(
              "/gst/gstr1-ammed"
            )
          }
        >

          <ArrowLeft
            size={18}
            color="#ffffff"
          />

        </TouchableOpacity>

        <Text
          style={
            styles.headerTitle
          }
        >
          9A-Amended Credit/Debit Notes
          {"\n"}
          (Not-Registered)
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

        {/* FILTER */}
        <View style={styles.filterBox}>

          <View
            style={styles.filterRow}
          >

            {/* YEAR */}
            <View
              style={
                styles.filterItem
              }
            >

              <Text
                style={styles.label}
              >
                Financial Year
              </Text>

              <View
                style={
                  styles.pickerWrapper
                }
              >

                <Picker
                  selectedValue={
                    selectedYear
                  }
                  onValueChange={(
                    value
                  ) =>
                    setSelectedYear(
                      value
                    )
                  }
                  style={
                    styles.picker
                  }
                  dropdownIconColor="#555"
                >

                  <Picker.Item
                    label="Select year"
                    value=""
                  />

                  {years.map(
                    (year) => (

                      <Picker.Item
                        key={year}
                        label={`${year}-${Number(
                          year
                        ) + 1}`}
                        value={year}
                      />

                    )
                  )}

                </Picker>

              </View>

            </View>

            {/* SEARCH */}
            <View
              style={
                styles.filterItem
              }
            >

              <Text
                style={styles.label}
              >
                Invoice no.
              </Text>

              <TextInput
                placeholder="Search..."
                placeholderTextColor="#777"
                value={
                  searchInvoice
                }
                onChangeText={
                  setSearchInvoice
                }
                style={
                  styles.searchInput
                }
              />

            </View>

          </View>

        </View>

        {/* TITLE */}
        <Text
          style={
            styles.processedText
          }
        >
          Processed Records
        </Text>

        {/* TABLE */}
        {filteredRecords.map(
          (item) => (

            <View
              key={item.id}
              style={
                styles.tableContainer
              }
            >

              {[
                [
                  "Revised Invoice No.",
                  item.invoiceNo,
                  true,
                ],

                [
                  "Revised/Original Invoice Date",
                  item.invoiceDate,
                ],

                [
                  "Total Invoice value (₹)",
                  formatCurrency(
                    item.totalInvoiceValue
                  ),
                ],

                [
                  "Total Taxable value (₹)",
                  formatCurrency(
                    item.taxableValue
                  ),
                ],

                [
                  "Integrated tax (₹)",
                  formatCurrency(
                    item.integratedTax
                  ),
                ],

                [
                  "Central tax (₹)",
                  formatCurrency(
                    item.centralTax
                  ),
                ],

                [
                  "State/UT tax (₹)",
                  formatCurrency(
                    item.stateTax
                  ),
                ],

                [
                  "Cess (₹)",
                  formatCurrency(
                    item.cess
                  ),
                ],

              ].map(
                (
                  row: any,
                  index
                ) => (

                  <View
                    key={index}
                    style={
                      styles.row
                    }
                  >

                    <View
                      style={
                        styles.leftCell
                      }
                    >

                      <Text
                        style={
                          styles.leftText
                        }
                      >
                        {row[0]}
                      </Text>

                    </View>

                    <View
                      style={
                        styles.rightCell
                      }
                    >

                      <Text
                        style={
                          row[2]
                            ? styles.blueText
                            : styles.rightText
                        }
                      >
                        {row[1]}
                      </Text>

                    </View>

                  </View>

                )
              )}

              {/* ACTIONS */}
              <View style={styles.row}>

                <View
                  style={
                    styles.leftCell
                  }
                >

                  <Text
                    style={
                      styles.leftText
                    }
                  >
                    Actions
                  </Text>

                </View>

                <View
                  style={
                    styles.rightCell
                  }
                >

                  <View
                    style={
                      styles.actionRow
                    }
                  >

                    {/* DELETE */}
                    <TouchableOpacity
                      onPress={() =>
                        handleDelete(
                          item.id
                        )
                      }
                      activeOpacity={0.7}
                      style={
                        styles.iconButton
                      }
                    >

                      <Trash2
                        size={14}
                        color="#2563eb"
                      />

                    </TouchableOpacity>

                    {/* EDIT */}
                    <TouchableOpacity
                      onPress={() =>
                        handleEdit(
                          item
                        )
                      }
                      activeOpacity={0.7}
                      style={
                        styles.iconButton
                      }
                    >

                      <Pencil
                        size={14}
                        color="#d62828"
                      />

                    </TouchableOpacity>

                  </View>

                </View>

              </View>

            </View>

          )
        )}

        {/* BACK BUTTON */}
        <View
          style={
            styles.bottomBackContainer
          }
        >

          <TouchableOpacity
            style={
              styles.bottomBackButton
            }
            onPress={() =>
              router.push(
                "/gst/gstr1-ammed"
              )
            }
          >

            <ChevronLeft
              size={16}
              color="#2563eb"
            />

            <Text
              style={
                styles.bottomBackText
              }
            >
              Back
            </Text>

          </TouchableOpacity>

        </View>

      </ScrollView>

      {/* BOTTOM BAR */}
      <GSTBottomBar />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#eeeeee",
  },

  header: {
    height: 72,
    backgroundColor: "#4d84dc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingTop: 10,
  },

  headerBackButton: {
    position: "absolute",
    left: 14,
    top: 28,
  },

  headerTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
  },

  filterBox: {
    marginHorizontal: 10,
    marginTop: 10,
    backgroundColor: "#dfe9d4",
    borderWidth: 1,
    borderColor: "#c8d0c2",
    padding: 10,
  },

  filterRow: {
    flexDirection: "row",
    gap: 10,
  },

  filterItem: {
    flex: 1,
  },

  label: {
    fontSize: 10,
    color: "#333333",
    marginBottom: 5,
    fontWeight: "500",
  },

  pickerWrapper: {
    height: 36,
    borderWidth: 1,
    borderColor: "#b9b9b9",
    backgroundColor: "#f4f4f4",
    justifyContent: "center",
  },

  picker: {
    height: 38,
    width: "100%",
    color: "#000000",
    marginTop: -2,
  },

  searchInput: {
    height: 36,
    borderWidth: 1,
    borderColor: "#b9b9b9",
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 10,
    fontSize: 11,
    color: "#000000",
  },

  processedText: {
    marginTop: 12,
    marginHorizontal: 12,
    marginBottom: 6,
    fontSize: 11,
    color: "#555555",
    fontWeight: "500",
  },

  tableContainer: {
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "#b8b8b8",
    backgroundColor: "#efefef",
  },

  row: {
    flexDirection: "row",
  },

  leftCell: {
    width: "42%",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#b8b8b8",
    backgroundColor: "#efefef",
    paddingHorizontal: 7,
    paddingVertical: 8,
    justifyContent: "center",
  },

  rightCell: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: "#b8b8b8",
    backgroundColor: "#efefef",
    paddingHorizontal: 7,
    paddingVertical: 8,
    justifyContent: "center",
  },

  leftText: {
    fontSize: 9,
    color: "#2d2d2d",
    lineHeight: 13,
    fontWeight: "500",
  },

  rightText: {
    fontSize: 9,
    color: "#1f1f1f",
    lineHeight: 13,
    fontWeight: "500",
  },

  blueText: {
    fontSize: 9,
    color: "#2a5eb8",
    fontWeight: "500",
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  iconButton: {
    padding: 2,
  },

  bottomBackContainer: {
    alignItems: "flex-end",
    marginTop: 16,
    marginRight: 12,
  },

  bottomBackButton: {
    height: 34,
    borderWidth: 1,
    borderColor: "#7da3eb",
    backgroundColor: "#ffffff",
    borderRadius: 6,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  bottomBackText: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 2,
  },

});
