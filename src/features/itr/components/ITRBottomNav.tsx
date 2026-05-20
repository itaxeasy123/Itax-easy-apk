import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { itrColors, itrRadius, itrSpacing } from "../../../theme/itr";

type NavItem = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  route: Href;
};

type ITRBottomNavProps = {
  activeRoute?: string;
};

const navItems: NavItem[] = [
  { label: "Home", icon: "home", route: "/itr" },
  { label: "Tools", icon: "construct", route: "/itr/tools" },
  { label: "Blogs", icon: "document-text", route: "/itr/blogs" },
  { label: "More", icon: "grid", route: "/itr/more" },
];

export default function ITRBottomNav({ activeRoute = "/itr" }: ITRBottomNavProps) {
  const router = useRouter();
  
  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <View style={styles.navBar}>
        {navItems.map((item) => {
          const isActive = activeRoute === item.route;
          return (
            <Pressable
              key={item.label}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => router.push(item.route)}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={isActive ? itrColors.primary : itrColors.textMuted}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopColor: itrColors.border,
    borderTopWidth: 1,
  },
  navBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: itrSpacing.sm,
    paddingHorizontal: itrSpacing.xl,
    paddingTop: itrSpacing.sm,
  },
  navItem: {
    alignItems: "center",
    borderRadius: itrRadius.md,
    flex: 1,
    gap: 4,
    justifyContent: "center",
    paddingVertical: 6,
  },
  navItemActive: {
    backgroundColor: itrColors.primarySoft,
  },
  label: {
    color: itrColors.textMuted,
    fontSize: 11,
    fontWeight: "500",
  },
  labelActive: {
    color: itrColors.primary,
    fontWeight: "700",
  },
});
