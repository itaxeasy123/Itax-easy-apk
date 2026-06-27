import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput , Platform, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";
import { AccountingHeader } from "../components";
import { companyService } from "../services/companyService";

export default function CompanyCreateScreen() {
    const insets = useSafeAreaInsets();
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [pan, setPan] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAddress, setShowAddress] = useState(false);
  const [showOtherInfo, setShowOtherInfo] = useState(false);

  const handleSave = async () => {
    if (Platform.OS === "web" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (!businessName.trim()) {
      setError("Business name is required.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const result = await companyService.createCompany({
        name: businessName.trim(),
        gstin: gstNumber.trim() || undefined,
        pan: pan.trim() || undefined,
        stateCode: stateCode.trim() || undefined,
      });
      if (!result.success || !result.data?.id) {
        setError("Could not create the company. Please try again.");
        return;
      }
      Alert.alert(
        "Company created",
        `"${result.data.name}" is ready — chart of accounts, voucher types and the fiscal year were set up automatically. It is now your active company.`
      );
      router.back();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not create the company.");
    } finally {
      setSaving(false);
    }
  };

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

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 + Math.max(insets.bottom, 0) }]} showsVerticalScrollIndicator={false}>
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
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="PAN (Optional)"
                value={pan}
                onChangeText={setPan}
                autoCapitalize="characters"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="State Code (e.g. 23, Optional)"
                value={stateCode}
                onChangeText={setStateCode}
                keyboardType="number-pad"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
        )}

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky Bottom Save Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 0) + 16 }]}>
        <Pressable style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? "Creating..." : "Save"}</Text>
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
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    margin: 16,
    gap: 8,
  },
  errorText: {
    color: "#DC2626",
    flex: 1,
    fontSize: 13,
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

