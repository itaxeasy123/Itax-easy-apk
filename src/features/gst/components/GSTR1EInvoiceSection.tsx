import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function GSTR1EInvoiceSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.dropdown}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.dropdownText}>
          E-Invoice Download History
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-forward"}
          size={20}
          color="#555"
        />
      </TouchableOpacity>

      {expanded && (
        <View>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.invoiceCard}
            onPress={() => router.push("/gst/gstr1-einvoice-download" as any)}
          >
            <View style={styles.invoiceTop}>
              <Text style={styles.invoiceTitle}>
                Available for Download
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#555"
              />
            </View>
            <View style={styles.invoiceBottom}>
              <Ionicons
                name="alert-circle-outline"
                size={14}
                color="#666"
              />
              <Text style={styles.invoiceCount}>0</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    height: 58,
    backgroundColor: "#E8EDF5",
    borderRadius: 8,
    marginHorizontal: 10,
    marginTop: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: 13,
    color: "#444",
    fontWeight: "500",
  },
  invoiceCard: {
    backgroundColor: "#F4F6FB",
    marginHorizontal: 10,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#D6DDE8",
  },
  invoiceTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  invoiceTitle: {
    fontSize: 12,
    color: "#333",
    flex: 1,
    paddingRight: 8,
  },
  invoiceBottom: {
    borderTopWidth: 1,
    borderColor: "#E1E7EF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  invoiceCount: {
    marginLeft: 6,
    fontSize: 12,
    color: "#444",
  },
});
