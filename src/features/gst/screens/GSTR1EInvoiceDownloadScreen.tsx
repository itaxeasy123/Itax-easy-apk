
import React, {
  useMemo,
  useState,
} from "react";

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  router,
} from "expo-router";

import * as FileSystem from "expo-file-system";

import * as Sharing from "expo-sharing";

import * as XLSX from "xlsx";

import GSTBottomBar from "../components/GSTBottomBar";

interface InvoiceItem {
  id: string;

  invoiceNumber: string;

  invoiceDate: string;

  customerName: string;

  amount: number;

  status:
    | "Generated"
    | "Pending";

  irn: string;
}

export default function GSTR1EInvoiceDownloadScreen() {
  /*
  |--------------------------------------------------------------------------
  | DYNAMIC DATA
  |--------------------------------------------------------------------------
  */

  const [
    invoices,
  ] = useState<
    InvoiceItem[]
  >([]);

  /*
  |--------------------------------------------------------------------------
  | TOTAL AMOUNT
  |--------------------------------------------------------------------------
  */

  const totalAmount =
    useMemo(() => {
      return invoices.reduce(
        (
          total,
          item
        ) =>
          total +
          item.amount,
        0
      );
    }, [invoices]);

  /*
  |--------------------------------------------------------------------------
  | BACK
  |--------------------------------------------------------------------------
  */

  const handleBack = () => {
    router.push(
      "/gst/gstr1" as any
    );
  };

  /*
  |--------------------------------------------------------------------------
  | DOWNLOAD EXCEL
  |--------------------------------------------------------------------------
  */

  const handleDownloadExcel =
    async () => {
      try {
        /*
        |--------------------------------------------------------------------------
        | EXCEL DATA
        |--------------------------------------------------------------------------
        */

        const excelData =
          invoices.length > 0
            ? invoices.map(
                (
                  item
                ) => ({
                  "Invoice Number":
                    item.invoiceNumber,

                  Date:
                    item.invoiceDate,

                  Customer:
                    item.customerName,

                  Amount:
                    item.amount,

                  Status:
                    item.status,

                  IRN:
                    item.irn,
                })
              )
            : [
                {
                  Message:
                    "No files available for download",
                },
              ];

        /*
        |--------------------------------------------------------------------------
        | WORKBOOK
        |--------------------------------------------------------------------------
        */

        const workbook =
          XLSX.utils.book_new();

        const worksheet =
          XLSX.utils.json_to_sheet(
            excelData
          );

        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          "E-Invoices"
        );

        /*
        |--------------------------------------------------------------------------
        | WRITE EXCEL
        |--------------------------------------------------------------------------
        */

        const excelBinary =
          XLSX.write(
            workbook,
            {
              type: "base64",

              bookType:
                "xlsx",
            }
          );

        /*
        |--------------------------------------------------------------------------
        | FILE PATH
        |--------------------------------------------------------------------------
        */

        const fileUri =
          `${FileSystem.Paths.document.uri}gstr1-einvoice-history.xlsx`;

        /*
        |--------------------------------------------------------------------------
        | SAVE FILE
        |--------------------------------------------------------------------------
        */

        await FileSystem.writeAsStringAsync(
          fileUri,
          excelBinary,
          {
            encoding:
              "base64",
          }
        );

        /*
        |--------------------------------------------------------------------------
        | OPEN / SHARE
        |--------------------------------------------------------------------------
        */

        await Sharing.shareAsync(
          fileUri,
          {
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

            dialogTitle:
              "Download E-Invoice Excel",
          }
        );

        Alert.alert(
          "Success",
          "Excel downloaded successfully"
        );
      } catch (error) {
        console.log(
          "Excel Download Error",
          error
        );
      }
    };

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={
            handleBack
          }
          style={
            styles.backButton
          }
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text
          style={
            styles.headerTitle
          }
        >
          GSTR-1 / IFF
        </Text>
      </View>

      {/* BODY */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContainer
        }
      >
        {/* EMPTY */}

        {invoices.length ===
        0 ? (
          <View
            style={
              styles.emptyContainer
            }
          >
            <Text
              style={
                styles.emptyText
              }
            >
              No files available
              for download
            </Text>
          </View>
        ) : (
          <>
            {/* SUMMARY */}

            <View
              style={
                styles.summaryCard
              }
            >
              <View
                style={
                  styles.summaryRow
                }
              >
                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  Total Invoices
                </Text>

                <Text
                  style={
                    styles.summaryValue
                  }
                >
                  {
                    invoices.length
                  }
                </Text>
              </View>

              <View
                style={
                  styles.divider
                }
              />

              <View
                style={
                  styles.summaryRow
                }
              >
                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  Total Amount
                </Text>

                <Text
                  style={
                    styles.summaryValue
                  }
                >
                  ₹
                  {totalAmount.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* INVOICE LIST */}

            {invoices.map(
              (
                invoice
              ) => (
                <View
                  key={
                    invoice.id
                  }
                  style={
                    styles.invoiceCard
                  }
                >
                  {/* TOP */}

                  <View
                    style={
                      styles.invoiceTop
                    }
                  >
                    <View>
                      <Text
                        style={
                          styles.invoiceNo
                        }
                      >
                        {
                          invoice.invoiceNumber
                        }
                      </Text>

                      <Text
                        style={
                          styles.invoiceDate
                        }
                      >
                        {
                          invoice.invoiceDate
                        }
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,

                        invoice.status ===
                        "Generated"
                          ? styles.generatedBadge
                          : styles.pendingBadge,
                      ]}
                    >
                      <Text
                        style={
                          styles.statusText
                        }
                      >
                        {
                          invoice.status
                        }
                      </Text>
                    </View>
                  </View>

                  {/* CUSTOMER */}

                  <Text
                    style={
                      styles.customerText
                    }
                  >
                    {
                      invoice.customerName
                    }
                  </Text>

                  {/* IRN */}

                  <Text
                    style={
                      styles.irnText
                    }
                  >
                    IRN :
                    {" "}
                    {
                      invoice.irn
                    }
                  </Text>

                  {/* AMOUNT */}

                  <View
                    style={
                      styles.amountRow
                    }
                  >
                    <Text
                      style={
                        styles.amountLabel
                      }
                    >
                      Invoice Amount
                    </Text>

                    <Text
                      style={
                        styles.amountValue
                      }
                    >
                      ₹
                      {invoice.amount.toLocaleString()}
                    </Text>
                  </View>

                  {/* DOWNLOAD */}

                  <TouchableOpacity
                    activeOpacity={
                      0.9
                    }
                    style={
                      styles.downloadButton
                    }
                    onPress={
                      handleDownloadExcel
                    }
                  >
                    <Ionicons
                      name="download"
                      size={16}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.downloadButtonText
                      }
                    >
                      Download
                      Invoice
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          </>
        )}
      </ScrollView>

      {/* FOOTER */}

      <View
        style={
          styles.footer
        }
      >
        {/* DOWNLOAD */}

        <TouchableOpacity
          activeOpacity={0.9}
          style={
            styles.excelButton
          }
          onPress={
            handleDownloadExcel
          }
        >
          <Text
            style={
              styles.excelButtonText
            }
          >
            Download
            E-Invoice Details
            (Excel)
          </Text>
        </TouchableOpacity>

        {/* BACK */}

        <TouchableOpacity
          activeOpacity={0.9}
          style={
            styles.backFooterButton
          }
          onPress={
            handleBack
          }
        >
          <Text
            style={
              styles.backFooterButtonText
            }
          >
            Back
          </Text>
        </TouchableOpacity>
      </View>

      {/* BOTTOM BAR */}

      <View
        style={
          styles.bottomWrap
        }
      >
        <GSTBottomBar />
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    /*
    |--------------------------------------------------------------------------
    | CONTAINER
    |--------------------------------------------------------------------------
    */

    container: {
      flex: 1,
      backgroundColor:
        "#F4F4F4",
    },

    /*
    |--------------------------------------------------------------------------
    | HEADER
    |--------------------------------------------------------------------------
    */

    header: {
      height: 72,
      backgroundColor:
        "#3D7BEA",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
    },

    backButton: {
      width: 34,
      height: 34,
      borderRadius: 999,
      alignItems: "center",
      justifyContent:
        "center",
    },

    headerTitle: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
      marginLeft: 12,
    },

    /*
    |--------------------------------------------------------------------------
    | SCROLL
    |--------------------------------------------------------------------------
    */

    scrollContainer: {
      flexGrow: 1,
      paddingBottom: 170,
    },

    /*
    |--------------------------------------------------------------------------
    | EMPTY
    |--------------------------------------------------------------------------
    */

    emptyContainer: {
      marginTop: 14,
      marginHorizontal: 14,
      backgroundColor:
        "#EEF2F7",
      paddingVertical: 10,
      paddingHorizontal: 10,
    },

    emptyText: {
      color: "#000000",
      fontSize: 10,
      fontWeight: "500",
    },

    /*
    |--------------------------------------------------------------------------
    | SUMMARY
    |--------------------------------------------------------------------------
    */

    summaryCard: {
      marginTop: 14,
      marginHorizontal: 14,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 14,
      padding: 14,
    },

    summaryRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    summaryLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: "#555",
    },

    summaryValue: {
      fontSize: 14,
      fontWeight: "700",
      color: "#111",
    },

    divider: {
      height: 1,
      backgroundColor:
        "#E5E7EB",
      marginVertical: 12,
    },

    /*
    |--------------------------------------------------------------------------
    | INVOICE CARD
    |--------------------------------------------------------------------------
    */

    invoiceCard: {
      marginTop: 14,
      marginHorizontal: 14,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      padding: 14,
    },

    invoiceTop: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    invoiceNo: {
      fontSize: 14,
      fontWeight: "700",
      color: "#111827",
    },

    invoiceDate: {
      marginTop: 4,
      fontSize: 12,
      color: "#666",
    },

    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
    },

    generatedBadge: {
      backgroundColor:
        "#DCFCE7",
    },

    pendingBadge: {
      backgroundColor:
        "#FEE2E2",
    },

    statusText: {
      fontSize: 11,
      fontWeight: "700",
      color: "#111827",
    },

    customerText: {
      marginTop: 14,
      fontSize: 13,
      fontWeight: "700",
      color: "#111827",
    },

    irnText: {
      marginTop: 8,
      fontSize: 12,
      color: "#666",
    },

    amountRow: {
      marginTop: 14,
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    amountLabel: {
      fontSize: 13,
      color: "#555",
      fontWeight: "600",
    },

    amountValue: {
      fontSize: 16,
      fontWeight: "700",
      color: "#111827",
    },

    downloadButton: {
      height: 42,
      borderRadius: 10,
      backgroundColor:
        "#3D7BEA",
      marginTop: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
    },

    downloadButtonText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700",
    },

    /*
    |--------------------------------------------------------------------------
    | FOOTER
    |--------------------------------------------------------------------------
    */

    footer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 62,
      backgroundColor:
        "#F4F4F4",
      paddingHorizontal: 14,
      paddingBottom: 8,
    },

    excelButton: {
      height: 38,
      borderRadius: 6,
      backgroundColor:
        "#3D7BEA",
      alignItems: "center",
      justifyContent:
        "center",
    },

    excelButtonText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "600",
    },

    backFooterButton: {
      width: 82,
      height: 30,
      borderRadius: 6,
      borderWidth: 1,
      borderColor:
        "#3D7BEA",
      alignItems: "center",
      justifyContent:
        "center",
      alignSelf: "center",
      marginTop: 10,
      backgroundColor:
        "#FFFFFF",
    },

    backFooterButtonText: {
      color: "#3D7BEA",
      fontSize: 11,
      fontWeight: "600",
    },

    /*
    |--------------------------------------------------------------------------
    | BOTTOM BAR
    |--------------------------------------------------------------------------
    */

    bottomWrap: {
      position: "absolute",
      bottom: 0,
      width: "100%",
    },
  });