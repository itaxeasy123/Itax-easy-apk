import React, { useState, useEffect } from "react";
import GSTHeader from "../components/GSTHeader";
import { useTaxLiabilityStore } from "../../../store/taxLiabilityStore";
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
import { Input, InputField, InputSlot } from "../../../components/ui/input";
import { Datepicker } from '@ui-kitten/components';;

import { fontSizes, fontWeights } from "../../../theme/typography";
const { height } = Dimensions.get("window");

const STATE_OPTIONS = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Punjab","Rajasthan","Tamil Nadu","Uttar Pradesh","Uttarakhand","West Bengal"];
const RATE_OPTIONS = ["0%","0.1%","0.25%","1%","1.5%","3%","5%","12%","18%","28%"];






export default function AddTaxLiabilityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.editId ? Number(params.editId) : null;
  
  const { addRecord, updateFullRecord, records } = useTaxLiabilityStore();

  const [state, setState] = useState("");
  const [grossAdvance, setGrossAdvance] = useState("");
  const [rate, setRate] = useState("");
  const [supplyTypeInput, setSupplyTypeInput] = useState("");
  const [cess, setCess] = useState("");

  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [rateModalVisible, setRateModalVisible] = useState(false);






  useEffect(() => {
    if (editId) {
      const recordToEdit = records.find(r => r.id === editId);
      if (recordToEdit) {
        setState(recordToEdit.state || "");
        setGrossAdvance(recordToEdit.grossAdvance || "");
        setRate(recordToEdit.rate || "");
        setSupplyTypeInput(recordToEdit.supplyTypeInput || "");
        setCess(recordToEdit.cess || "");
      }
    }
  }, [editId, records]);

  const handleSave = () => {
    let val = 0;
    // @ts-ignore
    try { if (typeof invoiceValue !== 'undefined') val = parseFloat(invoiceValue) || 0; } catch(e){}
    // @ts-ignore
    try { if (typeof totalTaxable !== 'undefined') val = parseFloat(totalTaxable) || 0; } catch(e){}
    // @ts-ignore
    try { if (typeof noteValue !== 'undefined') val = parseFloat(noteValue) || 0; } catch(e){}
    // @ts-ignore
    try { if (typeof grossAdvance !== 'undefined') val = parseFloat(grossAdvance) || 0; } catch(e){}
    
    let r = 0;
    // @ts-ignore
    try { if (typeof rate !== 'undefined') r = parseFloat(rate) || 0; } catch(e){}
    // @ts-ignore
    try { if (typeof taxRate !== 'undefined') r = parseFloat(taxRate) || 0; } catch(e){}
    // @ts-ignore
    try { if (typeof gst !== 'undefined') r = parseFloat(gst) || 0; } catch(e){}
    
    let taxAmt = (val * r) / 100;
    let cgst = 0, sgst = 0, igst = 0;
    
    let st = "";
    // @ts-ignore
    try { if (typeof state !== 'undefined') st = state; } catch(e){}
    // @ts-ignore
    try { if (typeof place !== 'undefined') st = place; } catch(e){}
    
    if (!st || st.toLowerCase().includes("delhi")) {
      cgst = taxAmt / 2;
      sgst = taxAmt / 2;
    } else {
      igst = taxAmt;
    }

    const payload = {
      state,
      place: state,
      grossAdvance,
      rate,
      supplyTypeInput,
      cess,
      totalTaxable: val.toFixed(2),
      centralTax: cgst.toFixed(2),
      stateTax: sgst.toFixed(2),
      integrated: igst.toFixed(2),
      integratedTax: igst.toFixed(2),
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
      setState("");
      setGrossAdvance("");
      setRate("");
      setSupplyTypeInput("");
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
        <GSTHeader title="11A(1),11A(2)-Tax Liability (advances Received)" />

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            {/* Title from Figma */}
            <Text style={styles.cardSubtitle}>Outward and Reverse charge Inward</Text>
            <Text style={styles.srNoText}>Sr. No 1</Text>
            
            <FormControl style={{ marginBottom: 16 }}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setStateModalVisible(true)}>
                <Input style={styles.inputBox} pointerEvents="none">
                  <InputField value={state} editable={false} placeholder="Select State" placeholderTextColor="#9b9b9b" style={styles.inputText} />
                  <InputSlot>
                    <Ionicons name="chevron-down" size={20} color="#7d7d7d" />
                  </InputSlot>
                </Input>
              </TouchableOpacity>
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <Input style={styles.inputBox}>
                <InputField value={grossAdvance} onChangeText={setGrossAdvance} placeholder="Gross Advance" placeholderTextColor="#9b9b9b" style={styles.inputText} />
              </Input>
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setRateModalVisible(true)}>
                <Input style={styles.inputBox} pointerEvents="none">
                  <InputField value={rate} editable={false} placeholder="Rate" placeholderTextColor="#9b9b9b" style={styles.inputText} />
                  <InputSlot>
                    <Ionicons name="chevron-down" size={20} color="#7d7d7d" />
                  </InputSlot>
                </Input>
              </TouchableOpacity>
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <Input style={[styles.inputBox, { backgroundColor: "#f8fafc" }]} pointerEvents="none">
                <InputField value={state ? (state === "Delhi" ? "Intrastate" : "Interstate") : ""} editable={false} placeholder="Supply Type (Auto-filled)" placeholderTextColor="#9b9b9b" style={[styles.inputText, { color: "#475569" }]} />
              </Input>
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <Input style={styles.inputBox}>
                <InputField value={cess} onChangeText={setCess} placeholder="Cess" placeholderTextColor="#9b9b9b" style={styles.inputText} />
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

        <Modal visible={stateModalVisible} transparent animationType="fade">
          <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={() => setStateModalVisible(false)}>
            <View style={styles.dropdownBox}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {STATE_OPTIONS.map((item, idx) => (
                  <TouchableOpacity key={idx} activeOpacity={0.8} style={styles.dropdownItem} onPress={() => { 
                    setState(item); 
                    setSupplyTypeInput(item === "Delhi" ? "Intrastate" : "Interstate");
                    setStateModalVisible(false); 
                  }}>
                    <Text style={styles.dropdownText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal visible={rateModalVisible} transparent animationType="fade">
          <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={() => setRateModalVisible(false)}>
            <View style={styles.dropdownBox}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {RATE_OPTIONS.map((item, idx) => (
                  <TouchableOpacity key={idx} activeOpacity={0.8} style={styles.dropdownItem} onPress={() => { setRate(item); setRateModalVisible(false); }}>
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
