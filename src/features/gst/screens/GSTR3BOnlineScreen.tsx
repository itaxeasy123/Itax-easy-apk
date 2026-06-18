import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GSTHeader from "../components/GSTHeader";
import { router } from "expo-router";
import { useGSTBusinessProfileStore } from "../store/gstBusinessProfileStore";
import useGSTDashboard from "../hooks/useGSTDashboard";
import { LinearGradient } from "expo-linear-gradient";

import GSTBottomBar from "../components/GSTBottomBar";

import { fontSizes, fontWeights } from "../../../theme/typography";
const sections = [
{
    id: "3.1",
    title:
      "Tax on outward and reverse charge inward supplies",
    route: "/gst/gstr3b-31",
  },
  {
    id: "3.1.1",
    title: "Supplies notified under section 9(5) of the CGST Act",
    route: "/gst/gstr3b-311",
  },
  {
    id: "3.2",
    title: "Inter-state supplies",
    route: "/gst/gstr3b-32",
  },  
  {
    id: "4",
    title: "Eligible ITC",
    route: "/gst/gstr3b4",
  },
  {
    id: "5.1",
    title: "Interest and Late Fee for previous tax periods",
    route: "/gst/gstr3b51",
  },
   {
    id: " 3B -5 (inword supplies)",
    title: "value of empty, nil rated and non GST outward supplies",
    route: "/gst/gstr3b5",
  },

  {
    id: "6.1",
    title: "Payment of tax",
    route: "/gst/gstr3b61",
  }
];

export default function GSTR3BOnlineScreen() {
  const { businessProfile } = useGSTBusinessProfileStore();
  const { assessmentYear: defaultYear } = useGSTDashboard();

  const assessmentYear = businessProfile?.financialYear || defaultYear;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#3F7BF3" barStyle="light-content" />

      {/* HEADER */}
      <GSTHeader title="GSTR-3B Monthly Return" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 140,
          flexGrow: 1,
        }}
      >
        {/* PROFILE CARD */}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/gst/businessprofile")}
        >
          <LinearGradient
            colors={["#C8F1BF", "#E1F3DD", "#DCF3D9"]}
            style={styles.profileCard}
          >
            <View style={styles.profileLeft}>
              <View style={[styles.avatar, { backgroundColor: "#3D7BEA", justifyContent: "center", alignItems: "center" }]}>
                <Ionicons name="person" size="sm" color="#FFF" />
              </View>

              <View>
                <View style={styles.profileRow}>
                  <Text style={styles.profileLabel}>ID</Text>

                  <Text style={styles.profileValue}>
                    : {businessProfile?.id || "N/A"}
                  </Text>
                </View>

                <View style={styles.profileRow}>
                  <Text style={styles.profileLabel}>GSTIN</Text>

                  <Text style={styles.profileValue}>
                    : {businessProfile?.gstin || "N/A"}
                  </Text>
                </View>

                <View style={styles.profileRow}>
                  <Text
                    style={[
                      styles.profileLabel,
                      {
                        fontWeight: fontWeights.semibold,
                      },
                    ]}
                  >
                    Financial year
                  </Text>

                  <Text
                    style={[
                      styles.profileValue,
                      {
                        fontWeight: fontWeights.semibold,
                      },
                    ]}
                  >
                    : {assessmentYear}
                  </Text>
                </View>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={16} color="#666" />
          </LinearGradient>
        </TouchableOpacity>

        {/* RETURN CARDS */}

        {sections.map((item, index) => (
          <TouchableOpacity
            key={`${item.id}-${index}`}
            activeOpacity={0.9}
            style={styles.card}
            onPress={() => {
              if (item.route) {
                router.push(item.route as any);
              }
            }}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {item.id} {item.title}
              </Text>

              <Ionicons name="chevron-forward" size={14} color="#444" />
            </View>

            <View style={styles.cardBody}>
              <View style={styles.leftColumn}>
                <Text style={styles.taxLabel}>Integrated Central Tax</Text>

                <Text style={styles.taxAmount}>₹0.0</Text>

                <Text
                  style={[
                    styles.taxLabel,
                    {
                      marginTop: 6,
                    },
                  ]}
                >
                  State/UT Tax
                </Text>

                <Text style={styles.taxAmount}>₹0.0</Text>
              </View>

              <View style={styles.rightColumn}>
                <Text style={styles.taxLabel}>CESS ₹</Text>

                <Text style={styles.taxAmount}>₹0.0</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* BUTTONS */}

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>Save 3B</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>Download</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>Generated</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <GSTBottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    width: "100%",
    alignSelf: "center",
    maxWidth: 500,
  },

  header: {
    height: 56,
    backgroundColor: "#3F7BF3",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    marginLeft: 8,
  },

  profileCard: {
    backgroundColor: "#D9EACF",
    minHeight: 68,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },

  profileRow: {
    flexDirection: "row",
    marginBottom: 2,
  },

  profileLabel: {
    width: 80,
    fontSize: fontSizes.xs,
    color: "#222",
  },

  profileValue: {
    fontSize: fontSizes.xs,
    color: "#333",
    flexShrink: 1,
  },

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#AEBFDD",
    overflow: "hidden",

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },

  cardHeader: {
    backgroundColor: "#E9EDF3",
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardTitle: {
    flex: 1,
    color: "#333",
    fontSize: fontSizes.xs,
    lineHeight: 14,
    paddingRight: 10,
  },

  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 14,
    minHeight: 70,
  },

  leftColumn: {
    flex: 1,
    paddingRight: 10,
  },

  rightColumn: {
    width: 70,
  },

  taxLabel: {
    fontSize: fontSizes.xs,
    color: "#444",
  },

  taxAmount: {
    fontSize: fontSizes.xs,
    color: "#222",
    marginTop: 2,
  },

  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginTop: 14,
    marginBottom: 10,
  },

  btn: {
    backgroundColor: "#4D7FF7",
    height: 32,
    flex: 1,
    marginHorizontal: 3,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  btnText: {
    color: "#FFFFFF",
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  },
});
