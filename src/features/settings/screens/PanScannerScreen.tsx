import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Platform,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { scanPAN } from "../../../services/ocrService";
import { extractPanDetails } from "../../../utils/panParser";
import { usePanStore } from "../../../store/panStore";
import PanCamera from "../../../components/PanCamera";

export default function PanScannerScreen() {
  const router = useRouter();

  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const { panNumber, name, fatherName, dob, setPan, loadPan } =
    usePanStore();

  useEffect(() => {
    loadPan();
  }, []);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!res.canceled) {
      setImage(res.assets[0]);
    }
  };

  const handleCapture = async (photo: any) => {
    setShowCamera(false);
    processOCR(photo);
  };

  const processOCR = async (file: any) => {
    if (!file) return;

    try {
      setLoading(true);
      const response = await scanPAN(file);
      const parsed = extractPanDetails(
        ((response as { data?: unknown }).data ?? []) as any[]
      );
      setPan(parsed);
      setImage(file);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  if (showCamera) {
    return <PanCamera onCapture={handleCapture} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* 🔙 HEADER */}
        <View style={styles.header}>
          <Pressable
            style={styles.backBtn}
            onPress={() => router.navigate("/dashboard")}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </Pressable>

          <Text style={styles.headerTitle}>PAN Scanner</Text>
        </View>

        {/* 🔥 HERO */}
        <LinearGradient colors={["#0F172A", "#1E293B"]} style={styles.hero}>
          <Text style={styles.heroTitle}>Smart OCR Scanner</Text>
          <Text style={styles.heroSub}>
            Auto extract PAN details instantly
          </Text>
        </LinearGradient>

        {/* 📸 IMAGE */}
        <View style={styles.imageBox}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.image} />
          ) : (
            <Text style={styles.placeholder}>Upload or Capture PAN</Text>
          )}
        </View>

        {/* 🔘 BUTTONS */}
        <View style={styles.row}>
          <Pressable style={styles.uploadBtn} onPress={pickImage}>
            <Text style={styles.btnText}>Upload</Text>
          </Pressable>

          <Pressable
            style={styles.cameraBtn}
            onPress={() => {
              if (Platform.OS === "web") {
                alert("Use mobile for camera");
              } else {
                setShowCamera(true);
              }
            }}
          >
            <Text style={styles.btnText}>Camera</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.scanBtn}
          onPress={() => processOCR(image)}
        >
          <Text style={styles.btnText}>Scan PAN</Text>
        </Pressable>

        {loading && <ActivityIndicator size="large" color="#2563EB" />}

        {/* 💎 FORM */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Extracted Details</Text>

          <LuxuryInput label="PAN Number" value={panNumber} />
          <LuxuryInput label="Full Name" value={name} />
          <LuxuryInput label="Father Name" value={fatherName} />
          <LuxuryInput label="DOB" value={dob} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const LuxuryInput = ({ label, value }: any) => (
  <View style={styles.inputBox}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputContainer}>
      <TextInput value={value} editable={false} style={styles.inputText} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  container: {
    padding: 16,
    paddingBottom: 40,
  },

  /* 🔙 HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  backBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

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

  /* 📸 IMAGE */
  imageBox: {
    height: 180,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  /* ❗ FIXED ERROR */
  placeholder: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },

  /* 🔘 BUTTONS */
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },

  uploadBtn: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },

  cameraBtn: {
    flex: 1,
    backgroundColor: "#7C3AED",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },

  scanBtn: {
    backgroundColor: "#16A34A",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  /* 💎 FORM */
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },

  /* ❗ FIXED ERROR */
  formTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 14,
  },

  inputBox: {
    marginBottom: 14,
  },

  inputLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },

  inputContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
  },

  inputText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },
});
