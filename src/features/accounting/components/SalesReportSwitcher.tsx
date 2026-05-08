import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type SalesReportSwitcherProps = {
  active: "monthly" | "customers" | "item";
  onMonthlyPress: () => void;
  onCustomersPress: () => void;
  thirdLabel?: string;
  onThirdPress?: () => void;
};

export default function SalesReportSwitcher({
  active,
  onMonthlyPress,
  onCustomersPress,
  thirdLabel,
  onThirdPress,
}: SalesReportSwitcherProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onMonthlyPress}
        style={[styles.tab, active === "monthly" && styles.tabActive]}
      >
        <Text style={[styles.label, active === "monthly" && styles.labelActive]}>
          Monthly
        </Text>
      </Pressable>
      <Pressable
        onPress={onCustomersPress}
        style={[styles.tab, active === "customers" && styles.tabActive]}
      >
        <Text style={[styles.label, active === "customers" && styles.labelActive]}>
          Customers
        </Text>
      </Pressable>
      {thirdLabel ? (
        <Pressable
          onPress={onThirdPress}
          disabled={!onThirdPress}
          style={[
            styles.tab,
            active === "item" && styles.tabActive,
            !onThirdPress && styles.tabDisabled,
          ]}
        >
          <Text style={[styles.label, active === "item" && styles.labelActive]}>
            {thirdLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
  },
  tab: {
    flex: 1,
    backgroundColor: "#EEF2F7",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#2563EB",
  },
  tabDisabled: {
    opacity: 0.65,
  },
  label: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
  },
  labelActive: {
    color: "#2563EB",
  },
});
