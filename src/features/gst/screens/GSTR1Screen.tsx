import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { router, useLocalSearchParams } from "expo-router";

import GSTBottomBar from "../components/GSTBottomBar";

import GSTR1RecordSection from "../components/GSTR1RecordSection";
import GSTR1AmmendRecordSection from "../components/GSTR1AmmendRecordSection";
export default function GSTR1Screen() {
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
        <TouchableOpacity
          onPress={() => router.replace("/gst/returns")}
        >
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>GSTR-1 / IFF</Text>
      </View>

      {/* BODY */}

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
              <Ionicons name="person" size={24} color="#FFF" />
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

          <Ionicons name="chevron-forward" size={20} color="#333" />
        </View>

        {/* RECORD SECTION */}

        <GSTR1RecordSection />

        <GSTR1AmmendRecordSection />

        {/* OTHER DROPDOWNS */}


        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>E-Invoice Download History</Text>

          <Ionicons name="chevron-down" size={20} color="#555" />
        </TouchableOpacity>

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

