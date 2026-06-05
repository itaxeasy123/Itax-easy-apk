import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../../../theme/dashboardStyles";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../store/authStore";

const DashboardHeader = ({ user, initials }: any) => {
  const router = useRouter();
  const profileImage = useAuthStore((state) => state.profileImage);

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
          <View style={[styles.profileIconWrap, profileImage && { padding: 0, overflow: 'hidden' }, !profileImage && { justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEF2FF' }]}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%' }} />
            ) : initials ? (
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#347BE5' }}>{initials}</Text>
            ) : (
              <Ionicons name="person" size={20} color="#347BE5" />
            )}
          </View>
        </Pressable>
      </View>

    </View>
  );
};

export default DashboardHeader;