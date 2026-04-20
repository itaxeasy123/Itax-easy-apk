import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../../../theme/dashboardStyles";
import { useRouter } from "expo-router";

const DashboardHeader = ({ user, initials }: any) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      
      {/* LEFT */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../../assets/images/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>TaxShax</Text>
      </View>

      {/* RIGHT */}
      <View style={styles.headerRight}>
        <Ionicons name="notifications-outline" size={22} color="#111" />

        <Pressable onPress={() => router.push("/profile")}>
          {user ? (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {initials || "U"}
              </Text>
            </View>
          ) : (
            <Image
              source={{ uri: "https://i.pravatar.cc/100" }}
              style={styles.avatar}
            />
          )}
        </Pressable>
      </View>

    </View>
  );
};

export default DashboardHeader;