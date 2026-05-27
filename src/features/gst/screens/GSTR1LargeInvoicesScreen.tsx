
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";

import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// IMPORT BOTTOM BAR
import GSTBottomBar from "../components/GSTBottomBar";

const { width } = Dimensions.get("window");

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  totalInvoiceValue: string;
  totalTaxableValue: string;
  integralTax: string;
  cess: string;
}

export default function GSTR1LargeInvoicesScreen() {
  const router = useRouter();

  const [records, setRecords] = useState<InvoiceItem[]>([
    {
      id: "1",
      invoiceNo: "24.00",
      invoiceDate: "2,899.00",
      totalInvoiceValue: "67.00",
      totalTaxableValue: "200.00",
      integralTax: "100.00",
      cess: "0.00",
    },
    {
      id: "2",
      invoiceNo: "32.00",
      invoiceDate: "3,899.00",
      totalInvoiceValue: "70.00",
      totalTaxableValue: "300.00",
      integralTax: "200.00",
      cess: "0.00",
    },
  ]);

  const labels = useMemo(
    () => [
      {
        key: "invoiceNo",
        label: "Invoice no.",
      },
      {
        key: "invoiceDate",
        label: "Invoice Date",
      },
      {
        key: "totalInvoiceValue",
        label: "Total invoice val",
      },
      {
        key: "totalTaxableValue",
        label: "Total Taxable val",
      },
      {
        key: "integralTax",
        label: "Integral Tax",
      },
      {
        key: "cess",
        label: "Cess",
      },
    ],
    []
  );

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
              prev.filter((item) => item.id !== id)
            );
          },
        },
      ]
    );
  };

  const handleEdit = (item: InvoiceItem) => {
    router.push({
      pathname: "/gst/edit-large-invoice" as any,
      params: {
        id: item.id,
      },
    });
  };

  const handleAddRecord = () => {
    router.push("/gst/add-5b2b" as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            router.push("/gst/gstr1-records" as any)
          }
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color="#fff"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          5A-B2C (Large Invoices)
        </Text>
      </View>

      {/* BODY */}
      <View style={styles.body}>
        {/* TOP ROW */}
        <View style={styles.topRow}>
          <Text style={styles.recordText}>
            Record Details
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.importButton}
          >
            <Text style={styles.importButtonText}>
              Import EWB Data
            </Text>
          </TouchableOpacity>
        </View>

        {/* TABLE */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.horizontalScroll
          }
        >
          <View style={styles.tableContainer}>
            <View style={styles.table}>
              {labels.map((row, rowIndex) => (
                <View
                  key={row.key}
                  style={[
                    styles.tableRow,
                    rowIndex ===
                      labels.length - 1 && {
                      borderBottomWidth: 0,
                    },
                  ]}
                >
                  {/* LEFT BLUE CELL */}
                  <View style={styles.leftCell}>
                    <Text style={styles.leftCellText}>
                      {row.label}
                    </Text>
                  </View>

                  {/* VALUE CELL */}
                  {records.map((item, index) => (
                    <View
                      key={item.id}
                      style={[
                        styles.valueCell,
                        index ===
                          records.length - 1 && {
                          borderRightWidth: 0,
                        },
                      ]}
                    >
                      <Text style={styles.valueText}>
                        {
                          item[
                            row.key as keyof InvoiceItem
                          ]
                        }
                      </Text>
                    </View>
                  ))}
                </View>
              ))}

              {/* ACTION ROW */}
              <View style={styles.tableRow}>
                <View style={styles.leftCell}>
                  <Text style={styles.leftCellText}>
                    Action
                  </Text>
                </View>

                {records.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.actionCell,
                      index ===
                        records.length - 1 && {
                        borderRightWidth: 0,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
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

                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.deleteButton}
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
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* ADD BUTTON */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.addButton}
          onPress={handleAddRecord}
        >
          <Text style={styles.addButtonText}>
            Add Record
          </Text>
        </TouchableOpacity>

        {/* BACK BUTTON */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.bottomBackButton}
          onPress={() =>
            router.push("/gst/gstr1-records" as any)
          }
        >
          <Text style={styles.bottomBackText}>
            Back
          </Text>
        </TouchableOpacity>
      </View>

      {/* IMPORTED BOTTOM BAR */}
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
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 14,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  recordText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },

  importButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 4,
  },

  importButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  horizontalScroll: {
    paddingBottom: 10,
  },

  tableContainer: {
    borderWidth: 1,
    borderColor: "#9DBCFB",
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
    overflow: "hidden",
  },

  table: {
    minWidth: width * 0.78,
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#9DBCFB",
  },

  leftCell: {
    width: 120,
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderColor: "#9DBCFB",
    backgroundColor: "#DCEBFF",
  },

  leftCellText: {
    fontSize: 11,
    color: "#1E3A8A",
    fontWeight: "600",
  },

  valueCell: {
    width: 90,
    minHeight: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: "#9DBCFB",
    backgroundColor: "#FFFFFF",
  },

  valueText: {
    fontSize: 11,
    color: "#111827",
    fontWeight: "400",
  },

  actionCell: {
    width: 90,
    minHeight: 52,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: "#9DBCFB",
    backgroundColor: "#FFFFFF",
    gap: 8,
  },

  deleteButton: {
    marginTop: 2,
  },

  addButton: {
    alignSelf: "flex-end",
    marginTop: 34,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  addButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  // BACK BUTTON JUST BELOW ADD RECORD
  bottomBackButton: {
    alignSelf: "flex-end",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#93C5FD",
    borderRadius: 7,
    paddingHorizontal: 26,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
  },

  bottomBackText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "500",
  },
});