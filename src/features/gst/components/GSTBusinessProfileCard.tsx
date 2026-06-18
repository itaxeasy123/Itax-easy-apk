import React, { memo } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { GSTBusinessProfile } from "../types/gstProfile.types";

import { fontSizes, fontWeights } from "../../../theme/typography";
interface GSTBusinessProfileCardProps {
  profile: GSTBusinessProfile;
  onPress?: () => void;
}

const GSTBusinessProfileCard = ({
  profile,
  onPress,
}: GSTBusinessProfileCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.touchable}
    >
      <LinearGradient
        colors={["#C8F1BF", "#E1F3DD", "#DCF3D9"]}
        style={styles.card}
      >
        <View style={styles.content}>
          {/* LEFT SECTION */}
          <View style={styles.leftSection}>
            {/* PROFILE ICON */}
            <View style={styles.avatar}>
              <Ionicons name="person" size={34} color="#FFFFFF" />
            </View>

            {/* PROFILE CONTENT */}
            <View style={styles.detailsContainer}>
              {/* ID */}
              <View style={styles.row}>
                <Text style={styles.label}>ID</Text>
                <Text numberOfLines={1} style={styles.value}>
                  : {profile?.id || "N/A"}
                </Text>
              </View>

              {/* GSTIN */}
              <View style={styles.rowMb}>
                <Text style={styles.label}>GSTIN</Text>
                <Text numberOfLines={1} style={styles.value}>
                  : {profile?.gstin || "N/A"}
                </Text>
              </View>

              {/* FINANCIAL YEAR */}
              <Text style={styles.fyText}>
                Financial year :{" "}
                <Text style={styles.fyValue}>
                  {profile?.financialYear || "N/A"}
                </Text>
              </Text>
            </View>
          </View>

          {/* RIGHT ARROW */}
          <Ionicons name="chevron-forward" size={28} color="#111827" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    borderRadius: 24,
    padding: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    height: 72,
    width: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 36,
    backgroundColor: "#3E7BFA",
  },
  detailsContainer: {
    marginLeft: 16,
    flex: 1,
  },
  row: {
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  rowMb: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    width: 80,
    fontSize: fontSizes.lg, // using 16px instead of 18px so it fits well
    fontWeight: fontWeights.bold,
    color: "#1F2937",
  },
  value: {
    flex: 1,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: "#374151",
  },
  fyText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: "#1F2937",
  },
  fyValue: {
    fontWeight: fontWeights.semibold,
    color: "#374151",
  },
});

export default memo(GSTBusinessProfileCard);
