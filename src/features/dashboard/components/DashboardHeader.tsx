import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../../../theme/dashboardStyles";
import { useRouter } from "expo-router";

const DashboardHeader = ({ user, initials }: any) => {
  const router = useRouter();

  return (
    <View style={styles.header}>

      {/* LEFT — Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../../assets/images/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>TaxShax</Text>
      </View>

      {/* RIGHT — Notification + Profile, flush to right edge */}
      <View style={styles.headerRight}>
        <Pressable hitSlop={8}>
          <Ionicons name="notifications-outline" size={22} color="#111" />
        </Pressable>

        <Pressable onPress={() => router.navigate("/profile")} hitSlop={8}>
          <View style={styles.profileIconWrap}>
            <Ionicons name="person" size={20} color="#111" />
          </View>
        </Pressable>
      </View>

    </View>
  );
};

export default DashboardHeader;