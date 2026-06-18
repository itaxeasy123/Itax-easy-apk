import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { calculatorTheme } from "../../../theme";
import { accountingTheme } from "../../../theme/accounting";

type AccountingHeaderProps = {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightContent?: React.ReactNode;
  children?: React.ReactNode;
  headerContent?: React.ReactNode;
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
            key={`accounting-gradient-${index}`}
            style={{
              backgroundColor: interpolateColor(
                calculatorTheme.headerGradientStart,
                calculatorTheme.headerGradientEnd,
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

export default function AccountingHeader({
  title,
  subtitle,
  showBackButton = true,
  onBackPress,
  rightContent,
  children,
  headerContent,
}: AccountingHeaderProps) {
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
      {/* Outer view is position:relative and sizes from its children */}
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Gradient fills behind all content */}
        <GradientPanel />
        <View style={styles.row}>
          <View style={styles.leftGroup}>
            {showBackButton ? (
              <Pressable onPress={handleBackPress} style={styles.backButton}>
                <Ionicons name="chevron-back" size={18} color={accountingTheme.colors.card} />
              </Pressable>
            ) : null}

            <View style={styles.titleWrap}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          </View>

          <View style={styles.rightSlot}>{rightContent}</View>
        </View>

        {headerContent ? <View style={styles.body}>{headerContent}</View> : null}
        {children ? <View style={styles.body}>{children}</View> : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Background color shown briefly during layout before gradient renders
    backgroundColor: "#45B8B6",
    overflow: "hidden",
  },
  safeArea: {
    // No fixed height — let content (title, tabs, search) drive the height
    // GradientPanel uses absoluteFillObject so it fills this measured container
    paddingHorizontal: 14,
    paddingTop: 2,
    paddingBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: accountingTheme.radius.xxl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  backSpacer: {
    width: 32,
    height: 32,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.extraBold,
  },
  subtitle: {
    color: "#EAFDFC",
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
  },
  rightSlot: {
    minWidth: 24,
    alignItems: "flex-end",
  },
  body: {
    marginTop: accountingTheme.spacing.sm,
    paddingBottom: accountingTheme.spacing.xs,
  },
});
