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
  Alert
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { scanPAN } from "../../../services/ocrService";
import { extractPanDetails } from "../../../utils/panParser";
import { usePanStore } from "../../../store/panStore";
import PanCamera from "../../../components/PanCamera";
import CalculatorHeader from "../../calculators/components/CalculatorHeader";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const DOB_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;

export default function PanScannerScreen() {
  const router = useRouter();

  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const { panNumber: storePan, name: storeName, fatherName: storeFather, dob: storeDob, setPan, loadPan } = usePanStore();
  
  const [form, setForm] = useState({
    panNumber: "",
    name: "",
    fatherName: "",
    dob: "",
  });

  const [errors, setErrors] = useState({
    panNumber: "",
    name: "",
    dob: "",
  });

  useEffect(() => {
    loadPan();
  }, []);

  useEffect(() => {
    // Populate form if store data exists (optional, keeping it clean for new scans)
    setForm({
      panNumber: storePan || "",
      name: storeName || "",
      fatherName: storeFather || "",
      dob: storeDob || "",
    });
  }, [storePan, storeName, storeFather, storeDob]);

  const validateForm = (updatedForm = form) => {
    let newErrors = { panNumber: "", name: "", dob: "" };
    let isValid = true;

    if (!updatedForm.panNumber) {
      newErrors.panNumber = "PAN Number is required.";
      isValid = false;
    } else if (!PAN_REGEX.test(updatedForm.panNumber.toUpperCase())) {
      newErrors.panNumber = "Invalid PAN format. E.g. ABCDE1234F";
      isValid = false;
    }

    if (!updatedForm.name || updatedForm.name.trim() === "") {
      newErrors.name = "Full Name is required.";
      isValid = false;
    }

    if (!updatedForm.dob) {
      newErrors.dob = "DOB is required.";
      isValid = false;
    } else if (!DOB_REGEX.test(updatedForm.dob)) {
      newErrors.dob = "Invalid DOB format. Use DD/MM/YYYY";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleFormChange = (key: string, value: string) => {
    let updatedValue = value;
    if (key === "panNumber") updatedValue = value.toUpperCase();
    
    const updatedForm = { ...form, [key]: updatedValue };
    setForm(updatedForm);
    validateForm(updatedForm);
  };

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
    setImage(photo);
  };

  const processOCR = async () => {
    if (!image) return;

    try {
      setLoading(true);
      const response = await scanPAN(image);
      const parsed = extractPanDetails(
        ((response as { data?: unknown }).data ?? []) as any[]
      );
      
      const newForm = {
        panNumber: parsed.panNumber || "",
        name: parsed.name || "",
        fatherName: parsed.fatherName || "",
        dob: parsed.dob || "",
      };
      
      setForm(newForm);
      validateForm(newForm);
    } catch (e) {
      console.log(e);
      if (Platform.OS === 'web') {
        window.alert("Failed to scan PAN. Please check the image and try again.");
      } else {
        Alert.alert("Scan Failed", "Failed to scan PAN. Please check the image and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (validateForm()) {
      setPan(form);
      if (Platform.OS === 'web') {
        window.alert("PAN Details saved successfully!");
      } else {
        Alert.alert("Success", "PAN Details saved successfully!");
      }
      router.back();
    } else {
      if (Platform.OS === 'web') {
        window.alert("Please fix the validation errors before saving.");
      } else {
        Alert.alert("Validation Error", "Please fix the validation errors before saving.");
      }
    }
  };

  if (showCamera) {
    return <PanCamera onCapture={handleCapture} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <CalculatorHeader onBackPress={() => router.back()} title="PAN Scanner" hideIcons={true} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <Text style={styles.instructionText}>
          Scan your PAN card to automatically extract details, or enter them manually.
        </Text>

        {/* 📸 SCANNING AREA */}
        <View style={styles.scannerBox}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={styles.scannerPlaceholder}>
              <Ionicons name="scan-outline" size={48} color="#94A3B8" />
              <Text style={styles.placeholderText}>Place your PAN card within the frame</Text>
            </View>
          )}

          {/* Scanner Reticles (Corners) */}
          <View style={[styles.reticle, styles.reticleTL]} />
          <View style={[styles.reticle, styles.reticleTR]} />
          <View style={[styles.reticle, styles.reticleBL]} />
          <View style={[styles.reticle, styles.reticleBR]} />
        </View>

        {/* 🔘 ACTION BUTTONS */}
        {image ? (
          <View style={styles.row}>
             <Pressable style={styles.secondaryBtn} onPress={() => setImage(null)}>
              <Ionicons name="trash-outline" size={18} color="#64748B" />
              <Text style={styles.secondaryBtnText}>Clear</Text>
            </Pressable>

            <Pressable
              style={[styles.primaryBtn, { flex: 2 }]}
              onPress={processOCR}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="scan-circle-outline" size={20} color="#fff" />
                  <Text style={styles.primaryBtnText}>Extract Details</Text>
                </>
              )}
            </Pressable>
          </View>
        ) : (
          <View style={styles.row}>
            <Pressable style={styles.actionBtn} onPress={pickImage}>
              <Ionicons name="image-outline" size={20} color="#3B82F6" />
              <Text style={styles.actionBtnText}>Upload Photo</Text>
            </Pressable>

            <Pressable
              style={styles.actionBtn}
              onPress={() => {
                if (Platform.OS === "web") {
                  window.alert("Please upload a photo from your device.");
                } else {
                  setShowCamera(true);
                }
              }}
            >
              <Ionicons name="camera-outline" size={20} color="#3B82F6" />
              <Text style={styles.actionBtnText}>Open Camera</Text>
            </Pressable>
          </View>
        )}

        {/* 💎 EDITABLE FORM */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>PAN Details</Text>

          <ValidatedInput 
            label="PAN Number" 
            value={form.panNumber} 
            onChange={(text: string) => handleFormChange('panNumber', text)}
            placeholder="ABCDE1234F"
            error={errors.panNumber}
          />
          <ValidatedInput 
            label="Full Name *" 
            value={form.name} 
            onChange={(text: string) => handleFormChange('name', text)}
            placeholder="Enter full name"
            error={errors.name}
          />
          <ValidatedInput 
            label="Father's Name" 
            value={form.fatherName} 
            onChange={(text: string) => handleFormChange('fatherName', text)}
            placeholder="Enter father's name"
          />
          <ValidatedInput 
            label="Date of Birth" 
            value={form.dob} 
            onChange={(text: string) => handleFormChange('dob', text)}
            placeholder="DD/MM/YYYY"
            error={errors.dob}
          />

          <Pressable 
            style={[styles.saveBtn, (!form.panNumber || !form.name || !form.dob || !!errors.panNumber || !!errors.name || !!errors.dob) && styles.saveBtnDisabled]} 
            onPress={handleSave}
            disabled={!form.panNumber || !form.name || !form.dob || !!errors.panNumber || !!errors.name || !!errors.dob}
          >
            <Text style={styles.saveBtnText}>Save Details</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ValidatedInput = ({ label, value, onChange, placeholder, error }: any) => (
  <View style={styles.inputBox}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={[styles.inputContainer, error && styles.inputErrorBorder]}>
      <TextInput 
        value={value} 
        onChangeText={onChange} 
        placeholder={placeholder}
        style={styles.inputText} 
        placeholderTextColor="#94A3B8"
      />
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  instructionText: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
    marginTop: 4,
  },
  
  /* 📸 SCANNER AREA */
  scannerBox: {
    height: 220,
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
    borderWidth: 2,
    borderColor: "#C7D2FE",
    borderStyle: "dashed",
    overflow: "hidden",
  },
  scannerPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  placeholderText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 12,
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
  },
  
  /* Reticles */
  reticle: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#3B82F6",
  },
  reticleTL: { top: 10, left: 10, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  reticleTR: { top: 10, right: 10, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  reticleBL: { bottom: 10, left: 10, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  reticleBR: { bottom: 10, right: 10, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },

  /* 🔘 ACTION BUTTONS */
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  actionBtnText: {
    color: "#3B82F6",
    fontWeight: "600",
    fontSize: 14,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryBtnText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 15,
  },

  /* 💎 FORM */
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  inputBox: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
    marginBottom: 4,
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    height: 44,
    justifyContent: "center",
  },
  inputErrorBorder: {
    borderColor: "#EF4444",
    borderWidth: 1.5,
  },
  inputText: {
    fontSize: 14,
    color: "#0F172A",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  saveBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnDisabled: {
    backgroundColor: "#94A3B8",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
