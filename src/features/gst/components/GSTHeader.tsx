import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { fontSizes, fontWeights } from "../../../theme/typography";

interface GSTHeaderProps {
  title: string;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
}

export default function GSTHeader({ title, onBack, rightComponent }: GSTHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.row}>
          <View style={styles.leftGroup}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.8}
              onPress={handleBack}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.titleWrap}>
              <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
                {title}
              </Text>
            </View>
          </View>

          {rightComponent && (
            <View style={styles.rightSlot}>{rightComponent}</View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#3D7BEA",
    width: "100%",
  },
  safeArea: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 17,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 44,
  },
  leftGroup: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    gap: 8,
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
    marginLeft: -2,
  },
  titleWrap: {
    flexShrink: 1,
    maxWidth: "90%",
  },
  headerTitle: {
    color: "#fff",
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
  },
  rightSlot: {
    alignItems: "flex-end",
    minWidth: 24,
  },
});
