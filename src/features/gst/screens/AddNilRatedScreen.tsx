import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import GSTHeader from "../components/GSTHeader";
import { useRouter } from "expo-router";

export default function AddNilRatedScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <GSTHeader title="Add Nil Rated Record" />
      <View style={styles.container}>
        <Text style={styles.text}>Add Nil Rated Record Screen (Placeholder)</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f2f5" },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 16, marginBottom: 20 },
  btn: { backgroundColor: "#4B7BE5", padding: 10, borderRadius: 6 },
  btnText: { color: "#fff", fontWeight: "bold" },
});
