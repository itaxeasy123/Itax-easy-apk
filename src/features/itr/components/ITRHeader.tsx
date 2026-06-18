import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { itrColors, itrSpacing, itrTypography } from "../../../theme/itr";

type ITRHeaderProps = {
  title: string;
  titleVariant?: "badge" | "plain";
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightContent?: React.ReactNode;
};


function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function interpolateColor(start: string, end: string, progress: number) {
  const first = hexToRgb(start);
  const second = hexToRgb(end);
  const channel = (from: number, to: number) =>
    Math.round(from + (to - from) * progress);
  return `rgb(${channel(first.r, second.r)}, ${channel(first.g, second.g)}, ${channel(first.b, second.b)})`;
}

function GradientPanel() {
  return (
    <View style={StyleSheet.absoluteFillObject}>
      {Array.from({ length: 18 }, (_, index) => {
        const progress = index / 17;
        return (
          <View
            key={`itr-gradient-${index}`}
            style={{
              backgroundColor: interpolateColor(
                itrColors.headerGradientStart,
                itrColors.headerGradientEnd,
                progress
              ),
              flex: 1,
            }}
          />
        );
      })}
    </View>
  );
}

export default function ITRHeader({
  title,
  titleVariant = "plain",
  showBackButton = true,
  onBackPress,
  rightContent,
}: ITRHeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <GradientPanel />
        <View style={styles.row}>
          <View style={styles.leftGroup}>
            {showBackButton ? (
              <Pressable onPress={handleBackPress} style={styles.backButton}>
                <Ionicons name="chevron-back" size={18} color="#fff" />
              </Pressable>
            ) : (
              <View style={styles.backSpacer} />
            )}

            <View style={styles.titleWrap}>
              <Text style={styles.plainTitle}>{title}</Text>
            </View>
          </View>

          <View style={styles.rightSlot}>{rightContent}</View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: itrColors.headerGradientStart,
    overflow: "hidden",
    shadowColor: "#1E4FC7",
  },
  safeArea: {
    paddingHorizontal: itrSpacing.md + 2,
    paddingTop: 4,
    paddingBottom: itrSpacing.md + 1,
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
    gap: itrSpacing.sm,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 0,
    justifyContent: "center",
    marginLeft: -2,
    padding: 2,
  },
  backSpacer: {
    height: 24,
    width: 24,
  },
  titleWrap: {
    flexShrink: 1,
    maxWidth: "82%",
  },
  plainTitle: {
    color: itrColors.headerText,
    fontSize: itrTypography.pageTitle.fontSize,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  rightSlot: {
    alignItems: "flex-end",
    minWidth: 24,
  },
});
