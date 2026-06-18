import React, { useState, useEffect } from "react";
import GSTHeader from "../components/GSTHeader";
import { useHSNStore } from "../../../store/hsnStore";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Platform,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import GSTBottomBar from "../components/GSTBottomBar";
import { FormControl, FormControlLabel, FormControlLabelText } from "../../../components/ui/form-control";
import { Input, InputField, InputSlot } from "../../../components/ui/input";;

import { fontSizes, fontWeights } from "../../../theme/typography";
const { height } = Dimensions.get("window");

const UQC_OPTIONS = ["BGS - BAGS", "BAL - BALE", "BOU - BILLION OF UNITS", "BOX - BOX", "BTL - BOTTLES", "BUN - BUNCHES", "CAN - CANS", "CBM - CUBIC METERS", "CCM - CUBIC CENTIMETERS", "CMS - CENTIMETERS", "CTN - CARTONS", "DOZ - DOZENS", "DRM - DRUMS", "GGK - GREAT GROSS", "GMS - GRAMS", "GRS - GROSS", "GYD - GROSS YARDS", "KGS - KILOGRAMS", "KLR - KILOLITRE", "KME - KILOMETRE", "MLT - MILLILITRE", "MTR - METERS", "NOS - NUMBERS", "PAC - PACKS", "PCS - PIECES", "PRS - PAIRS", "QTL - QUINTAL", "ROL - ROLLS", "SET - SETS", "SQF - SQUARE FEET", "SQM - SQUARE METERS", "SQY - SQUARE YARDS", "TBS - TABLETS", "TGM - TEN GROSS", "THD - THOUSANDS", "TON - TONNES", "TUB - TUBES", "UGS - US GALLONS", "YDS - YARDS", "OTH - OTHERS"];






export default function GSTR1HSNSummaryAddScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.editId ? Number(params.editId) : null;
  
  const { addRecord, updateFullRecord, records } = useHSNStore();

  const [hsnCode, setHsnCode] = useState("");
  const [description, setDescription] = useState("");
  const [uqc, setUqc] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("");
  const [totalValue, setTotalValue] = useState("");
  const [taxableValue, setTaxableValue] = useState("");
  const [integratedTax, setIntegratedTax] = useState("");
  const [centralTax, setCentralTax] = useState("");
  const [stateTax, setStateTax] = useState("");
  const [cess, setCess] = useState("");

  const [uqcModalVisible, setUqcModalVisible] = useState(false);






  useEffect(() => {
    if (editId) {
      const recordToEdit = records.find(r => r.id === editId);
      if (recordToEdit) {
        setHsnCode(recordToEdit.hsnCode || "");
        setDescription(recordToEdit.description || "");
        setUqc(recordToEdit.uqc || "");
        setTotalQuantity(recordToEdit.totalQuantity || "");
        setTotalValue(recordToEdit.totalValue || "");
        setTaxableValue(recordToEdit.taxableValue || "");
        setIntegratedTax(recordToEdit.integratedTax || "");
        setCentralTax(recordToEdit.centralTax || "");
        setStateTax(recordToEdit.stateTax || "");
        setCess(recordToEdit.cess || "");
      }
    }
  }, [editId, records]);

  const handleSave = () => {
    const payload = {
      hsnCode,
      description,
      uqc,
      totalQuantity,
      totalValue,
      taxableValue,
      integratedTax,
      centralTax,
      stateTax,
      cess,
    };

    if (editId) {
      updateFullRecord(editId, payload);
      if (Platform.OS === 'web') {
        window.alert("Record Updated Successfully!");
      } else {
        Alert.alert("Success", "Record Updated Successfully!");
      }
      router.back();
    } else {
      // @ts-ignore
    addRecord({
        id: Date.now(),
        ...payload
      });
      
      // Clear fields after adding
      setHsnCode("");
      setDescription("");
      setUqc("");
      setTotalQuantity("");
      setTotalValue("");
      setTaxableValue("");
      setIntegratedTax("");
      setCentralTax("");
      setStateTax("");
      setCess("");

      if (Platform.OS === 'web') {
        window.alert("Record Added! You can add another or go back.");
      } else {
        Alert.alert("Success", "Record Added! You can add another or go back.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
        <GSTHeader title="12-HSN-wise summary of outward supplies" />

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            {/* Title from Figma */}
            <Text style={styles.cardSubtitle}>Outward and Reverse charge Inward</Text>
            <Text style={styles.srNoText}>Sr. No 1</Text>
            
            <FormControl style={{ marginBottom: 16 }}>
              <Input style={styles.inputBox}>
                <InputField value={hsnCode} onChangeText={setHsnCode} placeholder="HSN/SAC Code" placeholderTextColor="#9b9b9b" style={styles.inputText} />
              </Input>
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <Input style={styles.inputBox}>
                <InputField value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor="#9b9b9b" style={styles.inputText} />
              </Input>
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setUqcModalVisible(true)}>
                <Input style={styles.inputBox} pointerEvents="none">
                  <InputField value={uqc} editable={false} placeholder="Select UQC" placeholderTextColor="#9b9b9b" style={styles.inputText} />
                  <InputSlot>
                    <Ionicons name="chevron-down" size="sm" color="#7d7d7d" />
                  </InputSlot>
                </Input>
              </TouchableOpacity>
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <Input style={styles.inputBox}>
                <InputField value={totalQuantity} onChangeText={setTotalQuantity} placeholder="Total Quantity" placeholderTextColor="#9b9b9b" style={styles.inputText} keyboardType="numeric" />
              </Input>
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <Input style={styles.inputBox}>
                <InputField value={totalValue} onChangeText={setTotalValue} placeholder="Total Value (₹)" placeholderTextColor="#9b9b9b" style={styles.inputText} keyboardType="numeric" />
              </Input>
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <Input style={styles.inputBox}>
                <InputField value={taxableValue} onChangeText={setTaxableValue} placeholder="Total Taxable Value (₹)" placeholderTextColor="#9b9b9b" style={styles.inputText} keyboardType="numeric" />
              </Input>
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <Input style={styles.inputBox}>
                <InputField value={integratedTax} onChangeText={setIntegratedTax} placeholder="Integrated Tax (₹)" placeholderTextColor="#9b9b9b" style={styles.inputText} keyboardType="numeric" />
              </Input>
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <Input style={styles.inputBox}>
                <InputField value={centralTax} onChangeText={setCentralTax} placeholder="Central Tax (₹)" placeholderTextColor="#9b9b9b" style={styles.inputText} keyboardType="numeric" />
              </Input>
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <Input style={styles.inputBox}>
                <InputField value={stateTax} onChangeText={setStateTax} placeholder="State/UT Tax (₹)" placeholderTextColor="#9b9b9b" style={styles.inputText} keyboardType="numeric" />
              </Input>
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <Input style={styles.inputBox}>
                <InputField value={cess} onChangeText={setCess} placeholder="Cess (₹)" placeholderTextColor="#9b9b9b" style={styles.inputText} keyboardType="numeric" />
              </Input>
            </FormControl>
          </View>

          

          {/* Buttons placed inside ScrollView at the bottom so they flow naturally and don't overlap */}
          <View style={styles.bottomButtons}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.back()}>
              <Text style={styles.btnText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleSave}>
              <Text style={styles.btnText}>{editId ? "Save" : "Add"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal visible={uqcModalVisible} transparent animationType="fade">
          <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={() => setUqcModalVisible(false)}>
            <View style={styles.dropdownBox}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {UQC_OPTIONS.map((item, idx) => (
                  <TouchableOpacity key={idx} activeOpacity={0.8} style={styles.dropdownItem} onPress={() => { setUqc(item); setUqcModalVisible(false); }}>
                    <Text style={styles.dropdownText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>











        <View style={styles.bottomNavWrapper}>
          <GSTBottomBar />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f2f5" },
  container: { flex: 1 },
  header: { 
    backgroundColor: "#3D7BEA", 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 14, 
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 45) : 45, 
    paddingBottom: 16 
  },
  backButton: { marginRight: 8 },
  headerTitle: { color: "#fff", fontSize: fontSizes.lg, fontWeight: fontWeights.semibold },
  scrollContent: { padding: 16, paddingBottom: 40 }, // Breathing room below buttons
  card: { backgroundColor: "#fff", borderRadius: 8, padding: 16, marginBottom: 24, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardSubtitle: { fontSize: fontSizes.md, color: "#333", fontWeight: fontWeights.semibold, marginBottom: 8, textAlign: "center" },
  srNoText: { fontSize: fontSizes.md, color: "#3D7BEA", fontWeight: fontWeights.semibold, marginBottom: 16 },
  cardTitle: { fontSize: fontSizes.lg, color: "#333", fontWeight: fontWeights.semibold, marginBottom: 16 },
  
  // Figma input field styles
  inputBox: { height: 48, borderWidth: 1, borderColor: "#B0B5C1", borderRadius: 8, paddingHorizontal: 0, marginBottom: 0, backgroundColor: "#fff" },
  inputText: { fontSize: fontSizes.md, color: "#333", height: "100%", paddingHorizontal: 14 },
  
  // Blue View and Download style buttons from Figma
  bottomButtons: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  actionBtn: { flex: 1, height: 48, backgroundColor: "#3D7BEA", borderRadius: 8, justifyContent: "center", alignItems: "center" },
  btnText: { color: "#fff", fontSize: fontSizes.lg, fontWeight: fontWeights.semibold },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", paddingHorizontal: 16, paddingTop: height * 0.3 },
  dropdownBox: { width: "100%", maxHeight: height * 0.4, backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", elevation: 5 },
  dropdownItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  dropdownText: { fontSize: fontSizes.md, color: "#333" },
  
  bottomNavWrapper: { backgroundColor: "#fff" }
});
