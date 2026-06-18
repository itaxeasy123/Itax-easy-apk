import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { accountingTheme } from "../../../theme/accounting";

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
    backgroundColor: accountingTheme.colors.surfaceLight,
    borderRadius: accountingTheme.radius.full,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: accountingTheme.colors.borderMedium,
  },
  tabActive: {
    backgroundColor: accountingTheme.colors.card,
    borderColor: accountingTheme.colors.primary,
  },
  tabDisabled: {
    opacity: 0.65,
  },
  label: {
    color: accountingTheme.colors.textSecondary,
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  labelActive: {
    color: accountingTheme.colors.primary,
  },
});
