import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Ionicons } from "@expo/vector-icons";

import { router, useLocalSearchParams } from "expo-router";


import GSTBottomBar from "../components/GSTBottomBar";
import { useGSTBusinessProfileStore } from "../store/gstBusinessProfileStore";
import useGSTDashboard from "../hooks/useGSTDashboard";

import GSTR1RecordSection from "../components/GSTR1RecordSection";
import GSTR1AmmendRecordSection from "../components/GSTR1AmmendRecordSection";
import GSTR1EInvoiceSection from "../components/GSTR1EInvoiceSection";
import GSTHeader from "../components/GSTHeader";
import { fontSizes, fontWeights } from "../../../theme/typography";
export default function GSTR1Screen() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { businessProfile } = useGSTBusinessProfileStore();
  const { assessmentYear: defaultYear } = useGSTDashboard();

  const assessmentYear = businessProfile?.financialYear || defaultYear;

  const profile = {
    name: businessProfile?.id || "N/A",
    gstin: businessProfile?.gstin || "N/A",
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}

      <GSTHeader title="GSTR-1 / IFF" />

      {/* BODY */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* PROFILE */}

        <LinearGradient 
          colors={["#C8F1BF", "#E1F3DD", "#DCF3D9"]} 
          style={styles.profileCard}
        >
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
        </LinearGradient>

        {/* RECORD SECTION */}

        <GSTR1RecordSection
          isExpanded={activeSection === 'record'}
          onToggle={() => setActiveSection(activeSection === 'record' ? null : 'record')}
        />

        <GSTR1AmmendRecordSection
          isExpanded={activeSection === 'ammend'}
          onToggle={() => setActiveSection(activeSection === 'ammend' ? null : 'ammend')}
        />

        {/* OTHER DROPDOWNS */}

        <GSTR1EInvoiceSection
          isExpanded={activeSection === 'einvoice'}
          onToggle={() => setActiveSection(activeSection === 'einvoice' ? null : 'einvoice')}
        />

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

    fontSize: fontSizes.lg,

    fontWeight: fontWeights.semibold,

    marginLeft: 12,
  },

  profileCard: {
    backgroundColor: "#DDEFD8",

    marginTop: 0,

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

    fontSize: fontSizes.sm,

    fontWeight: fontWeights.bold,

    color: "#222",
  },

  value: {
    fontSize: fontSizes.sm,

    color: "#222",
  },

  yearText: {
    marginTop: 2,

    fontSize: fontSizes.sm,

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
    fontSize: fontSizes.md,

    color: "#444",

    fontWeight: fontWeights.medium,
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

    fontWeight: fontWeights.semibold,

    fontSize: fontSizes.md,
  },

  bottomWrap: {
    position: "absolute",

    width: "100%",

    bottom: 0,
  },
});
