import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import GSTBottomBar from "../components/GSTBottomBar";

const invoiceSections = [
  {
    title: "9A Amended B2B Invoices",
    count: 0,
    route: "/gst/amended-b2b-invoices",
  },

  {
    title: "9A Amended B2C(Large) Invoices",
    count: 0,
    route: "/gst/amended-b2c-large-invoices",
  },
  {
    title: "9A Amended Export Invoices",
    count: 0,
    route: "/gst/amended-export-invoices",
  },
  {
    title: "9A Amended Credit/Debit Notes(Registered)",
    count: 0,
    route: "/gst/amended-credit-debit-notes",
  },
  {
    title: "9A Amended Credit/Debit Notes(Not Registered)",
    count: 0,
    route: "/gst/amended-credit-debit-notes-unregistered",
  },

];

export default function GSTR1AmendRecordsScreen() {
  const params = useLocalSearchParams();

  const assessmentYear = params.assessmentYear || "2024-25";

  const profile = {
    name: "Shabaz Alam",

    gstin: "22AAAAA0000A1Z5",
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/gst/gstr1")}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>GSTR-1 / IFF</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* PROFILE */}

        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color="#FFF" />
            </View>

            <View>
              <View style={styles.profileRow}>
                <Text style={styles.label}>ID</Text>

                <Text style={styles.value}>: {profile.name}</Text>
              </View>

              <View style={styles.profileRow}>
                <Text style={styles.label}>GSTIN</Text>

                <Text style={styles.value}>: {profile.gstin}</Text>
              </View>

              <Text style={styles.yearText}>
                Financial year : {assessmentYear}
              </Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#333" />
        </View>

        {/* ADD RECORD */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.dropdown}
          onPress={() => router.replace("/gst/gstr1")}
        >
          <Text style={styles.dropdownText}>Amend Records Details</Text>

          <Ionicons name="chevron-up" size={20} color="#555" />
        </TouchableOpacity>

        {/* RECORD CARDS */}

        {invoiceSections.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.85}
            style={styles.invoiceCard}
            onPress={() =>
              router.push({
                pathname: item.route as any,

                params: {
                  assessmentYear: params.assessmentYear,

                  quarter: params.quarter,

                  month: params.month,
                },
              })
            }
          >
            <View style={styles.invoiceTop}>
              <Text style={styles.invoiceTitle}>{item.title}</Text>

              <Ionicons name="chevron-forward" size={18} color="#555" />
            </View>

            <View style={styles.invoiceBottom}>
              <Ionicons name="alert-circle-outline" size={14} color="#666" />

              <Text style={styles.invoiceCount}>{item.count}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* BUTTONS */}

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* BOTTOM */}

      <View style={styles.bottomWrap}>
        <GSTBottomBar />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,

    backgroundColor: "#F3F4F6",
  },

  header: {
    height: 78,

    backgroundColor: "#3D7BEA",

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 14,
  },

  headerTitle: {
    color: "#FFF",

    fontSize: 16,

    fontWeight: "600",

    marginLeft: 12,
  },

  profileCard: {
    backgroundColor: "#DDEFD8",

    marginTop: 10,

    padding: 12,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  profileLeft: {
    flexDirection: "row",

    alignItems: "center",
  },

  avatar: {
    width: 44,

    height: 44,

    borderRadius: 22,

    backgroundColor: "#3D7BEA",

    alignItems: "center",

    justifyContent: "center",

    marginRight: 10,
  },

  profileRow: {
    flexDirection: "row",

    marginBottom: 2,
  },

  label: {
    width: 52,

    fontSize: 12,

    fontWeight: "700",

    color: "#222",
  },

  value: {
    fontSize: 12,

    color: "#222",
  },

  yearText: {
    marginTop: 2,

    fontSize: 12,

    color: "#222",
  },

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

  btnRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    marginHorizontal: 10,

    marginTop: 30,
  },

  actionBtn: {
    width: "47%",

    height: 42,

    backgroundColor: "#3D7BEA",

    borderRadius: 6,

    alignItems: "center",

    justifyContent: "center",
  },

  actionText: {
    color: "#FFF",

    fontWeight: "600",

    fontSize: 13,
  },

  bottomWrap: {
    position: "absolute",

    width: "100%",

    bottom: 0,
  },
});
