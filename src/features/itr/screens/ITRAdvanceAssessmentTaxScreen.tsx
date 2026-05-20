import React, { useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useITRStore, type AdvanceTaxEntry } from "../../../store/itrStore";
import { ITRBottomNav, ITRHeader, ITRSaveButton } from "../components";
import { itrColors, itrRadius, itrSpacing, itrShadows } from "../../../theme/itr";
import { exportITRData } from "../services/itrExport.service";

type FieldConfig = {
  id: string;
  placeholder: string;
  value: string;
  isDate?: boolean;
};

const INITIAL_FIELDS: FieldConfig[] = [
  { id: "bsr", placeholder: "Enter BSR Code", value: "" },
  { id: "bank", placeholder: "Bank Name", value: "" },
  { id: "date", placeholder: "Date", value: "", isDate: true },
  { id: "challan", placeholder: "Challan Sr. No", value: "" },
  { id: "tax", placeholder: "Tax", value: "" },
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ITRAdvanceAssessmentTaxScreen() {
  const { taxesPaid, setTaxesPaid } = useITRStore();
  const [fields, setFields] = useState<FieldConfig[]>(INITIAL_FIELDS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const updateFieldValue = (id: string, value: string) => {
    if (id === "challan") {
      const clean = value.replace(/[^0-9]/g, "");
      if (clean.length > 5) return;
      value = clean;
    }
    setFields((current) =>
      current.map((field) => (field.id === id ? { ...field, value } : field)),
    );
  };

  const resetForm = () => {
    setFields(INITIAL_FIELDS);
    setEditingId(null);
    setSelectedDate(null);
  };

  // Calendar Logic
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Padding for first day
    for (let i = 0; i < firstDay; i++) days.push(null);
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    
    return days;
  }, [currentDate]);

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    const formatted = `${day.toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
    updateFieldValue("date", formatted);
    setShowCalendar(false);
  };

  const changeMonth = (offset: number) => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(next);
  };

  const handleSave = () => {
    const bsr = fields.find(f => f.id === "bsr")?.value || "";
    const bank = fields.find(f => f.id === "bank")?.value || "";
    const date = fields.find(f => f.id === "date")?.value || "";
    const challan = fields.find(f => f.id === "challan")?.value || "";
    const taxValue = fields.find(f => f.id === "tax")?.value || "";
    const tax = parseFloat(taxValue) || 0;

    if (!taxValue || !bsr) {
      Alert.alert("Error", "Please enter BSR Code and Tax amount");
      return;
    }

    let updatedEntries = [...taxesPaid.advanceTaxEntries];
    if (editingId) {
      updatedEntries = updatedEntries.map(entry => entry.id === editingId ? { ...entry, bsrCode: bsr, bankName: bank, date, challanNo: challan, amount: tax } : entry);
    } else {
      updatedEntries.push({ id: Date.now().toString(), bsrCode: bsr, bankName: bank, date, challanNo: challan, amount: tax });
    }

    const totalAmount = updatedEntries.reduce((sum, e) => sum + e.amount, 0);
    setTaxesPaid({ advanceTaxEntries: updatedEntries, advanceTax: totalAmount });
    Alert.alert("Success", editingId ? "Record updated!" : "Record added!");
    resetForm();
  };

  const handleEdit = (entry: AdvanceTaxEntry) => {
    setEditingId(entry.id);
    setFields([
      { id: "bsr", placeholder: "Enter BSR Code", value: entry.bsrCode },
      { id: "bank", placeholder: "Bank Name", value: entry.bankName },
      { id: "date", placeholder: "Date", value: entry.date, isDate: true },
      { id: "challan", placeholder: "Challan Sr. No", value: entry.challanNo },
      { id: "tax", placeholder: "Tax", value: entry.amount.toString() },
    ]);
  };

  const handleDelete = (id: string) => {
    const updatedEntries = taxesPaid.advanceTaxEntries.filter(e => e.id !== id);
    const totalAmount = updatedEntries.reduce((sum, e) => sum + e.amount, 0);
    setTaxesPaid({ advanceTaxEntries: updatedEntries, advanceTax: totalAmount });
  };

  const handleDownloadJSON = async () => {
    if (taxesPaid.advanceTaxEntries.length === 0) {
      Alert.alert("Empty", "No records to download.");
      return;
    }
    await exportITRData({ 
        type: "AdvanceTax", 
        entries: taxesPaid.advanceTaxEntries,
        totalAmount: taxesPaid.advanceTax 
    });
  };

  return (
    <View style={styles.screen}>
      <ITRHeader title="Advance & Assessment Tax" titleVariant="plain" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{editingId ? "Edit Record" : "Add New Record"}</Text>
            {editingId && <Pressable onPress={resetForm}><Text style={styles.cancelLink}>Cancel Edit</Text></Pressable>}
        </View>

        <View style={styles.formSection}>
          {fields.map((field) => (
            <View key={field.id} style={styles.fieldWrap}>
              {field.isDate ? (
                <Pressable onPress={() => setShowCalendar(true)} style={styles.dateInputContainer}>
                  <View pointerEvents="none" style={{flex: 1}}>
                    <TextInput 
                        value={field.value} 
                        placeholder={field.placeholder} 
                        placeholderTextColor="#8A96A8" 
                        style={styles.input} 
                        editable={false} 
                    />
                  </View>
                  <Ionicons name="calendar-outline" size={18} color={itrColors.primary} style={styles.dateIconInside} />
                </Pressable>
              ) : (
                <TextInput value={field.value} keyboardType={(field.id === "tax" || field.id === "challan" || field.id === "bsr") ? "numeric" : "default"} onChangeText={(text) => updateFieldValue(field.id, text)} placeholder={field.placeholder} placeholderTextColor="#8A96A8" style={styles.input} maxLength={field.id === "challan" ? 5 : undefined} />
              )}
            </View>
          ))}
        </View>

        <ITRSaveButton title={editingId ? "Update Details" : "Save Details"} onPress={handleSave} />

        {taxesPaid.advanceTaxEntries.length > 0 && (
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Saved Tax Records</Text>
            {taxesPaid.advanceTaxEntries.map((entry) => (
              <Pressable key={entry.id} style={styles.recordItem} onPress={() => handleEdit(entry)}>
                <View style={styles.recordMain}>
                  <Text style={styles.recordTitle}>BSR: {entry.bsrCode}</Text>
                  <Text style={styles.recordSubtitle}>{entry.bankName} | {entry.date}</Text>
                </View>
                <View style={styles.recordEnd}>
                  <Text style={styles.recordVal}>₹ {entry.amount.toLocaleString()}</Text>
                  <Pressable onPress={() => handleDelete(entry.id)}><Ionicons name="trash-outline" size={18} color="#EF4444" /></Pressable>
                </View>
              </Pressable>
            ))}

            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total Advance Tax</Text>
              <Text style={styles.totalValue}>₹ {taxesPaid.advanceTax.toLocaleString()}</Text>
            </View>

            <View style={{marginTop: 20}}>
                <ITRSaveButton title="Download JSON" onPress={handleDownloadJSON} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Proper Calendar Modal */}
      <Modal visible={showCalendar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Pressable onPress={() => changeMonth(-1)}><Ionicons name="chevron-back" size={24} color={itrColors.primary} /></Pressable>
              <Text style={styles.calendarMonthTitle}>{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</Text>
              <Pressable onPress={() => changeMonth(1)}><Ionicons name="chevron-forward" size={24} color={itrColors.primary} /></Pressable>
            </View>
            
            <View style={styles.weekDaysRow}>
              {DAYS.map(d => <Text key={d} style={styles.weekDayText}>{d}</Text>)}
            </View>

            <View style={styles.daysGrid}>
              {calendarData.map((day, idx) => (
                <Pressable 
                    key={idx} 
                    style={[styles.dayCell, day === selectedDate?.getDate() && currentDate.getMonth() === selectedDate?.getMonth() && styles.selectedDayCell]}
                    onPress={() => day && handleDateSelect(day)}
                    disabled={!day}
                >
                  <Text style={[styles.dayText, !day && styles.emptyDayText, day === selectedDate?.getDate() && currentDate.getMonth() === selectedDate?.getMonth() && styles.selectedDayText]}>
                    {day}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable onPress={() => setShowCalendar(false)} style={styles.closeCalendarBtn}>
              <Text style={styles.closeCalendarBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ITRBottomNav activeRoute="/itr" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: itrColors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: itrSpacing.md, paddingTop: itrSpacing.sm + 2, paddingBottom: 112 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: "#475569", fontSize: 13, fontWeight: "700", textTransform: "uppercase" },
  cancelLink: { color: "#EF4444", fontSize: 12, fontWeight: "600" },
  formSection: { marginBottom: 12 },
  fieldWrap: { marginBottom: 8 },
  input: { backgroundColor: "#fff", borderColor: "#C9D3E1", borderRadius: 8, borderWidth: 1, color: "#111827", fontSize: 14, height: 44, paddingHorizontal: 12 },
  dateInputContainer: { position: 'relative', justifyContent: 'center' },
  dateIconInside: { position: 'absolute', right: 12 },
  listContainer: { marginTop: 32 },
  listTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  recordItem: { backgroundColor: '#fff', borderRadius: 10, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', ...itrShadows.card },
  recordMain: { flex: 1 },
  recordTitle: { fontSize: 14, fontWeight: '700', color: '#334155' },
  recordSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  recordEnd: { alignItems: 'flex-end', flexDirection: 'row', gap: 12 },
  recordVal: { fontSize: 14, fontWeight: '800', color: itrColors.primary },
  
  // Total Box
  totalBox: { backgroundColor: "#EEF2FF", borderRadius: 10, padding: 16, marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: '#C7D2FE' },
  totalLabel: { fontSize: 13, fontWeight: "700", color: "#475569" },
  totalValue: { fontSize: 16, fontWeight: "900", color: "#1E293B" },

  // Proper Calendar Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  calendarCard: { backgroundColor: '#fff', width: '90%', borderRadius: 20, padding: 20, elevation: 20 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  calendarMonthTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  weekDaysRow: { flexDirection: 'row', marginBottom: 10 },
  weekDayText: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#94A3B8' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  selectedDayCell: { backgroundColor: itrColors.primary },
  dayText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  selectedDayText: { color: '#fff' },
  emptyDayText: { color: 'transparent' },
  closeCalendarBtn: { marginTop: 20, alignSelf: 'flex-end', padding: 10 },
  closeCalendarBtnText: { color: itrColors.primary, fontWeight: '700', fontSize: 14 }
});
