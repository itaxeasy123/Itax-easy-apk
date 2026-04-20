import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import PanCamera from "../../../components/PanCamera";
import { scanAadhaar } from "../../../services/aadhaarService";
import { extractAadhaarDetails } from "../../../utils/aadhaarParser";

export default function AadhaarScannerScreen() {
  const [image, setImage] = useState<any>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // ✅ ADD THIS
  const [form, setForm] = useState({
    aadhaarNumber: "",
    name: "",
    dob: "",
    gender: "",
    address: "",
  });

  // 📁 Upload Image
  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!res.canceled) {
      setImage(res.assets[0]);
    }
  };

  // 📸 Camera Capture
  const handleCapture = (photo: any) => {
    setImage(photo);
    setShowCamera(false);
  };

  // 🔍 OCR Scan
  const handleScan = async () => {
    if (!image) return;

    try {
      setLoading(true);

      const data = await scanAadhaar(image);

      console.log("OCR RESPONSE:", data);

      const parsed = extractAadhaarDetails(data);

      setForm(parsed);
    } catch (err) {
      console.log("OCR ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // 📸 Camera UI
  if (showCamera) {
    return <PanCamera onCapture={handleCapture} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backBtn}
            onPress={() => router.replace("/dashboard")}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </Pressable>

          <Text style={styles.headerTitle}>Aadhaar Scanner</Text>
        </View>

        <LinearGradient colors={["#0F172A", "#1E293B"]} style={styles.hero}>
          <Text style={styles.heroTitle}>Smart OCR Scanner</Text>
          <Text style={styles.heroSub}>
            Auto extract Aadhaar details instantly
          </Text>
        </LinearGradient>
        {/* IMAGE */}
        <View style={styles.imageBox}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.image} />
          ) : (
            <Text style={styles.placeholder}>Upload or Capture Aadhaar</Text>
          )}
        </View>

        {/* BUTTONS */}
        <View style={styles.row}>
          <Pressable style={styles.uploadBtn} onPress={pickImage}>
            <Text style={styles.btnText}>Upload</Text>
          </Pressable>

          <Pressable
            style={styles.cameraBtn}
            onPress={() => setShowCamera(true)}
          >
            <Text style={styles.btnText}>Camera</Text>
          </Pressable>
        </View>

        {/* SCAN */}
        <Pressable
          style={[styles.scanBtn, !image && { opacity: 0.5 }]}
          onPress={handleScan}
          disabled={!image}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Scan Aadhaar</Text>
          )}
        </Pressable>

        {/* FORM */}
        <View style={styles.card}>
          <Input
            label="Aadhaar Number"
            value={form.aadhaarNumber}
            onChange={(v: string) => setForm({ ...form, aadhaarNumber: v })}
          />

          <Input
            label="Name"
            value={form.name}
            onChange={(v: string) => setForm({ ...form, name: v })}
          />

          <Input
            label="DOB"
            value={form.dob}
            onChange={(v: string) => setForm({ ...form, dob: v })}
          />

          <Input
            label="Gender"
            value={form.gender}
            onChange={(v: string) => setForm({ ...form, gender: v })}
          />

          <Input
            label="Address"
            value={form.address}
            onChange={(v: string) => setForm({ ...form, address: v })}
            multiline
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 🔹 Input Component
const Input = ({ label, value, onChange, multiline = false }: any) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ fontSize: 12, color: "#64748B" }}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      multiline={multiline}
      style={{
        borderWidth: 1,
        borderColor: "#E2E8F0",
        padding: 12,
        borderRadius: 10,
        backgroundColor: "#F8FAFC",
      }}
    />
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F1F5F9" },
  container: { padding: 16 },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },

  imageBox: {
    height: 180,
    backgroundColor: "#E2E8F0",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
  },

  image: { width: "100%", height: "100%" },

  placeholder: { color: "#64748B" },

  row: { flexDirection: "row", gap: 10 },

  uploadBtn: {
    flex: 1,
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  cameraBtn: {
    flex: 1,
    backgroundColor: "#7C3AED",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  scanBtn: {
    marginTop: 10,
    backgroundColor: "#16A34A",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  card: {
    marginTop: 16,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    elevation: 4,
  },
  header: {
    flexDirection: "row", // 🔥 main fix
    alignItems: "center",
    marginBottom: 12,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 10, // arrow ke baad spacing
  },
  backBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },
  btnText: { color: "#fff", fontWeight: "600" },

  /* 🔥 HERO */
  hero: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  heroTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },

  heroSub: {
    color: "#CBD5F5",
    fontSize: 13,
  },
});
