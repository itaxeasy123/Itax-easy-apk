import React, { useState, useEffect } from "react";
import { CalendarIcon } from '../../../components/ui/icon';
import GSTHeader from "../components/GSTHeader";
import { useCDNURStore } from "../../../store/cdnurStore";
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

const NOTE_TYPE_OPTIONS = ["Credit", "Debit"];
const TYPE_OPTIONS = ["B2CL", "B2CS"];

export default function AddCDNURScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.editId ? Number(params.editId) : null;
  
  const { addRecord, updateFullRecord, records } = useCDNURStore();

  const [type, setType] = useState("B2CL");
  const [noteNo, setNoteNo] = useState("");
  const [noteDate, setNoteDate] = useState("02/01/2000");
  const [state, setState] = useState("");
  const [noteType, setNoteType] = useState("Credit");
  const [supplyTypeInput, setSupplyTypeInput] = useState("");
  const [noteValue, setNoteValue] = useState("");
  const [totalTaxable, setTotalTaxable] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [cess, setCess] = useState("");

  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [rateModalVisible, setRateModalVisible] = useState(false);

  const [noteTypeModalVisible, setNoteTypeModalVisible] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);

  useEffect(() => {
    if (editId) {
      const recordToEdit = records.find(r => r.id === editId);
      if (recordToEdit) {
        setType(recordToEdit.type || "");
        setNoteNo(recordToEdit.noteNo || "");
        setNoteDate(recordToEdit.noteDate || "");
        setState(recordToEdit.state || "");
        setNoteType(recordToEdit.noteType || "");
        setSupplyTypeInput(recordToEdit.supplyTypeInput || "");
        setNoteValue(recordToEdit.noteValue || "");
        setTotalTaxable(recordToEdit.totalTaxable || "");
        setTaxRate(recordToEdit.taxRate || "");
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
      type,
      noteNo,
      noteDate,
      state,
      noteType,
      supplyTypeInput,
      noteValue,
      taxRate,
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
      setType("");
      setNoteNo("");
      setNoteDate("");
      setState("");
      setNoteType("Credit");
      setSupplyTypeInput("");
      setNoteValue("");
      setTotalTaxable("");
      setTaxRate("");
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
        <GSTHeader title="9B-Credit/Debit Notes (UnRegistered)" />

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            {/* Title from Figma */}
            <Text style={styles.cardSubtitle}>Outward and Reverse charge Inward</Text>
            <Text style={styles.srNoText}>Sr. No 1</Text>
            
            <FormControl style={{ marginBottom: 16 }}>
              <FormControlLabel>
                <FormControlLabelText>Type</FormControlLabelText>
              </FormControlLabel>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setTypeModalVisible(true)}>
                <Input style={styles.inputBox} pointerEvents="none">
                  <InputField value={type} editable={false} placeholder="B2CL" placeholderTextColor="#9b9b9b" style={styles.inputText} />
                  <InputSlot>
                    <Ionicons name="chevron-down" size={20} color="#7d7d7d" />
                  </InputSlot>
                </Input>
              </TouchableOpacity>
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <Input style={styles.inputBox}>
                <InputField value={noteNo} onChangeText={setNoteNo} placeholder="Credit/Debit Note No." placeholderTextColor="#9b9b9b" style={styles.inputText} />
              </Input>
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <FormControlLabel>
                <FormControlLabelText>Debit/Credit Note Date</FormControlLabelText>
              </FormControlLabel>
              {Platform.OS === 'web' ? (
                <View>
                  <Text style={{ fontSize: fontSizes.sm, color: '#666', marginBottom: 6, marginLeft: 4, fontWeight: fontWeights.medium }}>
                    02/01/2000
                  </Text>
                  {/* @ts-ignore */}
                  <input
                    type="date"
                    value={noteDate ? noteDate : ''}
                    onChange={(e: any) => setNoteDate(e.target.value)}
                    style={{ height: 48, width: '100%', borderColor: '#B0B5C1', borderWidth: 1, borderRadius: 8, padding: '0 12px', boxSizing: 'border-box', backgroundColor: '#FFFFFF', color: '#333', fontSize: fontSizes.md, fontFamily: 'sans-serif', outline: 'none' }}
                  />
                </View>
              ) : (
                <Datepicker
                  date={noteDate ? new Date(noteDate) : undefined}
                  onSelect={nextDate => setNoteDate(nextDate.toISOString().split('T')[0])}
                  placeholder="02/01/2000"
                  style={{ height: 48, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#B0B5C1' }}
                 min={new Date(1990, 0, 1)} max={new Date(2050, 11, 31)} accessoryRight={() => (<View style={{ paddingRight: 8 }}><CalendarIcon size={20} color="#64748b" /></View>)} />
              )}
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setStateModalVisible(true)}>
                <Input style={styles.inputBox} pointerEvents="none">
                  <InputField value={state} editable={false} placeholder="Select State (POS)" placeholderTextColor="#9b9b9b" style={styles.inputText} />
                  <InputSlot>
                    <Ionicons name="chevron-down" size={20} color="#7d7d7d" />
                  </InputSlot>
                </Input>
              </TouchableOpacity>
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <FormControlLabel>
                <FormControlLabelText>Note Type</FormControlLabelText>
              </FormControlLabel>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setNoteTypeModalVisible(true)}>
                <Input style={styles.inputBox} pointerEvents="none">
                  <InputField value={noteType} editable={false} placeholder="Credit" placeholderTextColor="#9b9b9b" style={styles.inputText} />
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
                <InputField value={noteValue} onChangeText={setNoteValue} placeholder="Total Note Value" placeholderTextColor="#9b9b9b" style={styles.inputText} keyboardType="numeric" />
              </Input>
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <Input style={styles.inputBox}>
                <InputField value={totalTaxable} onChangeText={setTotalTaxable} placeholder="Taxable Value" placeholderTextColor="#9b9b9b" style={styles.inputText} keyboardType="numeric" />
              </Input>
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setRateModalVisible(true)}>
                <Input style={styles.inputBox} pointerEvents="none">
                  <InputField value={taxRate} editable={false} placeholder="Select Rate" placeholderTextColor="#9b9b9b" style={styles.inputText} />
                  <InputSlot>
                    <Ionicons name="chevron-down" size={20} color="#7d7d7d" />
                  </InputSlot>
                </Input>
              </TouchableOpacity>
            </FormControl>
            <FormControl style={{ marginBottom: 16 }}>
              <Input style={styles.inputBox}>
                <InputField value={cess} onChangeText={setCess} placeholder="Cess" placeholderTextColor="#9b9b9b" style={styles.inputText} keyboardType="numeric" />
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
        </ScrollView>        <Modal visible={stateModalVisible} transparent animationType="fade">
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
                  <TouchableOpacity key={idx} activeOpacity={0.8} style={styles.dropdownItem} onPress={() => { setTaxRate(item); setRateModalVisible(false); }}>
                    <Text style={styles.dropdownText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>     <Modal visible={noteTypeModalVisible} transparent animationType="fade">
          <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={() => setNoteTypeModalVisible(false)}>
            <View style={styles.dropdownBox}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {NOTE_TYPE_OPTIONS.map((item, idx) => (
                  <TouchableOpacity key={idx} activeOpacity={0.8} style={styles.dropdownItem} onPress={() => { setNoteType(item); setNoteTypeModalVisible(false); }}>
                    <Text style={styles.dropdownText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal visible={typeModalVisible} transparent animationType="fade">
          <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={() => setTypeModalVisible(false)}>
            <View style={styles.dropdownBox}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {TYPE_OPTIONS.map((item, idx) => (
                  <TouchableOpacity key={idx} activeOpacity={0.8} style={styles.dropdownItem} onPress={() => { setType(item); setTypeModalVisible(false); }}>
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
