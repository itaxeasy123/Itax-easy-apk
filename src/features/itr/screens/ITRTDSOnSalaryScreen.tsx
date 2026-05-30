import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useITRStore, type TDSSalaryEntry } from "../../../store/itrStore";
import { ITRBottomNav, ITRHeader, ITRSaveButton } from "../components";
import { itrColors, itrRadius, itrSpacing, itrShadows } from "../../../theme/itr";
import { exportITRData } from "../services/itrExport.service";

type FieldConfig = {
  id: string;
  placeholder: string;
  value: string;
};

const INITIAL_FIELDS: FieldConfig[] = [
  { id: "tan", placeholder: "Enter TAN of Employer", value: "" },
  { id: "name", placeholder: "Name of Employer", value: "" },
  { id: "salary", placeholder: "Income chargeable under Salaries", value: "" },
  { id: "tax", placeholder: "Total Tax Deducted", value: "" },
];

export default function ITRTDSOnSalaryScreen() {
  const { taxesPaid, setTaxesPaid, form16 } = useITRStore();
  
  const cleanEmployerName = (name?: string) => {
    if (!name) return "";
    // Split by newline and take the first line to avoid address/email bleeding into the name field
    return name.split("\n")[0].trim();
  };
  
  const initialFields = taxesPaid.tdsSalaryEntries.length === 0 && form16 ? [
    { id: "tan", placeholder: "Enter TAN of Employer", value: form16.tan || "" },
    { id: "name", placeholder: "Name of Employer", value: cleanEmployerName(form16.employerName) },
    { id: "salary", placeholder: "Income chargeable under Salaries", value: form16.salaryChargeable ? String(form16.salaryChargeable) : "" },
    { id: "tax", placeholder: "Total Tax Deducted", value: form16.totalTaxDeducted ? String(form16.totalTaxDeducted) : "" },
  ] : INITIAL_FIELDS;

  const [fields, setFields] = useState<FieldConfig[]>(initialFields);
  const [editingId, setEditingId] = useState<string | null>(null);

  const updateFieldValue = (id: string, value: string) => {
    setFields((current) =>
      current.map((field) => (field.id === id ? { ...field, value } : field)),
    );
  };

  const resetForm = () => {
    setFields(INITIAL_FIELDS);
    setEditingId(null);
  };

  const handleSave = () => {
    const tan = fields.find(f => f.id === "tan")?.value || "";
    const name = fields.find(f => f.id === "name")?.value || "";
    const salary = fields.find(f => f.id === "salary")?.value || "";
    const taxValue = fields.find(f => f.id === "tax")?.value || "";
    const tax = parseFloat(taxValue) || 0;

    if (!taxValue || !tan) {
      Alert.alert("Error", "Please enter TAN and Tax amount");
      return;
    }

    let updatedEntries = [...taxesPaid.tdsSalaryEntries];
    
    if (editingId) {
      updatedEntries = updatedEntries.map(entry => 
        entry.id === editingId 
          ? { ...entry, tan, employerName: name, salaryIncome: salary, taxAmount: tax }
          : entry
      );
    } else {
      updatedEntries.push({
        id: Date.now().toString(),
        tan,
        employerName: name,
        salaryIncome: salary,
        taxAmount: tax
      });
    }

    const totalTDS = updatedEntries.reduce((sum, e) => sum + e.taxAmount, 0);
    setTaxesPaid({ tdsSalaryEntries: updatedEntries, tdsSalary: totalTDS });

    Alert.alert("Success", editingId ? "TDS Record updated!" : "TDS Record added!");
    resetForm();
  };

  const handleEdit = (entry: TDSSalaryEntry) => {
    setEditingId(entry.id);
    setFields([
      { id: "tan", placeholder: "Enter TAN of Employer", value: entry.tan },
      { id: "name", placeholder: "Name of Employer", value: entry.employerName },
      { id: "salary", placeholder: "Income chargeable under Salaries", value: entry.salaryIncome },
      { id: "tax", placeholder: "Total Tax Deducted", value: entry.taxAmount.toString() },
    ]);
  };

  const handleDelete = (id: string) => {
    const updatedEntries = taxesPaid.tdsSalaryEntries.filter(e => e.id !== id);
    const totalTDS = updatedEntries.reduce((sum, e) => sum + e.taxAmount, 0);
    setTaxesPaid({ tdsSalaryEntries: updatedEntries, tdsSalary: totalTDS });
  };

  const handleDownloadJSON = async () => {
    if (taxesPaid.tdsSalaryEntries.length === 0) {
      Alert.alert("Empty", "No records to download.");
      return;
    }
    await exportITRData({ 
        type: "TDS_Salary_Details", 
        entries: taxesPaid.tdsSalaryEntries,
        totalTDS: taxesPaid.tdsSalary 
    });
  };

  return (
    <View style={styles.screen}>
      <ITRHeader title="TDS on Salary" titleVariant="plain" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{editingId ? "Edit Salary TDS" : "Add New Salary TDS"}</Text>
            {editingId && <Pressable onPress={resetForm}><Text style={styles.cancelLink}>Cancel Edit</Text></Pressable>}
        </View>

        <View style={styles.formSection}>
          {fields.map((field) => (
            <View key={field.id} style={styles.inputWrap}>
              <TextInput
                value={field.value}
                keyboardType={field.id === "tax" || field.id === "salary" ? "numeric" : "default"}
                onChangeText={(text) => updateFieldValue(field.id, text)}
                placeholder={field.placeholder}
                placeholderTextColor="#8A96A8"
                style={styles.input}
              />
            </View>
          ))}
        </View>

        <ITRSaveButton title={editingId ? "Update TDS" : "Save TDS"} onPress={handleSave} />

        {taxesPaid.tdsSalaryEntries.length > 0 && (
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Saved Salary TDS Records</Text>
            {taxesPaid.tdsSalaryEntries.map((entry) => (
              <Pressable key={entry.id} style={styles.recordItem} onPress={() => handleEdit(entry)}>
                <View style={styles.recordMain}>
                  <Text style={styles.recordTitle}>TAN: {entry.tan}</Text>
                  <Text style={styles.recordSubtitle}>{entry.employerName}</Text>
                </View>
                <View style={styles.recordEnd}>
                  <Text style={styles.recordVal}>₹ {entry.taxAmount.toLocaleString()}</Text>
                  <Pressable onPress={() => handleDelete(entry.id)}>
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </Pressable>
                </View>
              </Pressable>
            ))}
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total Salary TDS</Text>
              <Text style={styles.totalValue}>₹ {taxesPaid.tdsSalary.toLocaleString()}</Text>
            </View>

            <View style={{marginTop: 20}}>
                <ITRSaveButton title="Download JSON" onPress={handleDownloadJSON} />
            </View>
          </View>
        )}
      </ScrollView>

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
  inputWrap: { marginBottom: 10 },
  input: { backgroundColor: "#fff", borderColor: "#CDD6E4", borderRadius: 8, borderWidth: 1, color: "#111827", fontSize: 14, height: 44, paddingHorizontal: 12, ...itrShadows.card },
  listContainer: { marginTop: 32 },
  listTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  recordItem: { backgroundColor: '#fff', borderRadius: 10, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', ...itrShadows.card },
  recordMain: { flex: 1 },
  recordTitle: { fontSize: 14, fontWeight: '700', color: '#334155' },
  recordSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  recordEnd: { alignItems: 'flex-end', flexDirection: 'row', gap: 12 },
  recordVal: { fontSize: 14, fontWeight: '800', color: itrColors.primary },
  totalBox: { backgroundColor: "#EEF2FF", borderRadius: 10, padding: 16, marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: '#C7D2FE' },
  totalLabel: { fontSize: 13, fontWeight: "700", color: "#475569" },
  totalValue: { fontSize: 16, fontWeight: "900", color: "#1E293B" },
});
