import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AccountingHeader } from "../components";

export default function CompanyCreateScreen() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");

  const [showAddress, setShowAddress] = useState(false);
  const [showOtherInfo, setShowOtherInfo] = useState(false);

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Add New Company"
        showBackButton
        rightContent={
          <Pressable style={styles.importBtn}>
            <Ionicons name="download-outline" size={16} color="#FFFFFF" />
            <Text style={styles.importText}>Import</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Details</Text>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Business Name"
              value={businessName}
              onChangeText={setBusinessName}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="GST Number(Optional)"
              value={gstNumber}
              onChangeText={setGstNumber}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* Business Address Accordion */}
        <Pressable 
          style={styles.accordionHeader} 
          onPress={() => setShowAddress(!showAddress)}
        >
          <Ionicons 
            name={showAddress ? "remove-circle" : "add-circle"} 
            size={20} 
            color="#334155" 
          />
          <Text style={styles.accordionTitle}>Business Address</Text>
        </Pressable>
        {showAddress && (
          <View style={styles.accordionContent}>
            {/* Address fields placeholder if needed later */}
            <Text style={styles.placeholderText}>Address fields will go here</Text>
          </View>
        )}

        {/* Other Info Accordion */}
        <Pressable 
          style={styles.accordionHeader} 
          onPress={() => setShowOtherInfo(!showOtherInfo)}
        >
          <Ionicons 
            name={showOtherInfo ? "remove-circle" : "add-circle"} 
            size={20} 
            color="#334155" 
          />
          <Text style={styles.accordionTitle}>Other Info(Optional)</Text>
        </Pressable>
        {showOtherInfo && (
          <View style={styles.accordionContent}>
            {/* Other info fields placeholder if needed later */}
            <Text style={styles.placeholderText}>Other Info fields will go here</Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Save Button */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.saveBtn} onPress={() => router.back()}>
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  importBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  importText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 16,
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    justifyContent: "center",
    marginBottom: 16,
  },
  input: {
    fontSize: 14,
    color: "#0F172A",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 12,
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  accordionContent: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  placeholderText: {
    color: "#94A3B8",
    fontStyle: "italic",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  saveBtn: {
    backgroundColor: "#3B82F6",
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
