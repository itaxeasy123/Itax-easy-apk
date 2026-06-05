import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import GSTBottomBar from "../components/GSTBottomBar";

const returnItems = [
  { id: 1, title: "GSTR 1", subtitle: "Outward Supplies" },
  { id: 2, title: "GSTR 2B", subtitle: "Auto ITC" },
  { id: 3, title: "GSTR 2B", subtitle: "Auto ITC Quarter" },
  { id: 4, title: "GSTR 3B", subtitle: "Monthly Return" },
  { id: 5, title: "GSTR 2A", subtitle: "Auto Drafted" },
];

export default function ToolsScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Regular</Text>
      </View>

      {/* Body */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {returnItems.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => {
                    if (item.title === "GSTR 2A") {
                      router.push("/gst/gstr2a");
                    } else if (item.title === "GSTR 2B") {
                      if (item.subtitle === "Auto ITC Quarter") {
                        router.push({ pathname: "/gst/gstr2b", params: { type: "quarterly" } });
                      } else {
                        router.push({ pathname: "/gst/gstr2b", params: { type: "monthly" } });
                      }
                    }
                  }}
                >
                  <Text style={styles.actionBtnText}>Online</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>Offline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <GSTBottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 60,
    backgroundColor: "#3574E2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // extra space for bottom bar
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 11,
    color: "#4B5563",
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#3574E2",
    borderRadius: 6,
    paddingVertical: 6,
    marginHorizontal: 4,
    alignItems: "center",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
});
