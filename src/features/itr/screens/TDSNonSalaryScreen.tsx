import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useITRStore, type TDSNonSalaryEntry } from "../../../store/itrStore";
import { ITRBottomNav, ITRHeader, ITRSaveButton } from "../components";
import { itrColors, itrRadius, itrSpacing, itrShadows } from "../../../theme/itr";
import { exportITRData } from "../services/itrExport.service";

type FieldConfig = {
  id: string;
  placeholder: string;
  value: string;
  isDropdown?: boolean;
};

const INITIAL_FIELDS: FieldConfig[] = [
  { id: "business", placeholder: "Business", value: "", isDropdown: true },
  { id: "section", placeholder: "Section (2)", value: "", isDropdown: true },
  { id: "name", placeholder: "Name", value: "" },
  { id: "tan", placeholder: "TAN/PAN", value: "" },
  { id: "amount-paid", placeholder: "Amount Paid/Credit Income offered", value: "" },
  { id: "payment-date", placeholder: "Date of Payment/Credited", value: "" },
  { id: "tax-deduction", placeholder: "Tax Deduction inclu.surcharge/Edu.cess", value: "" },
  { id: "credit-amount", placeholder: "Amount out of to be allowed as Credit", value: "" },
  { id: "certificate", placeholder: "Unique Certificate Number(Optional)", value: "" },
];

function InputRow({
  field,
  onChange,
}: {
  field: FieldConfig;
  onChange: (id: string, value: string) => void;
}) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        value={field.value}
        keyboardType={(field.id === "amount-paid" || field.id === "tax-deduction" || field.id === "credit-amount") ? "numeric" : "default"}
        onChangeText={(text) => onChange(field.id, text)}
        placeholder={field.placeholder}
        placeholderTextColor="#8A96A8"
        style={styles.input}
      />
      {field.isDropdown && (
        <View style={styles.dropdownIconWrap}>
          <Text style={styles.dropdownIconText}>⌄</Text>
        </View>
      )}
    </View>
  );
}

export default function TDSNonSalaryScreen() {
  const { taxesPaid, setTaxesPaid } = useITRStore();
  const [fields, setFields] = useState<FieldConfig[]>(INITIAL_FIELDS);
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
    const business = fields.find(f => f.id === "business")?.value || "";
    const section = fields.find(f => f.id === "section")?.value || "";
    const name = fields.find(f => f.id === "name")?.value || "";
    const tanPan = fields.find(f => f.id === "tan")?.value || "";
    const amountPaid = fields.find(f => f.id === "amount-paid")?.value || "";
    const paymentDate = fields.find(f => f.id === "payment-date")?.value || "";
    const taxValue = fields.find(f => f.id === "tax-deduction")?.value || "";
    const tax = parseFloat(taxValue) || 0;
    const creditAmount = fields.find(f => f.id === "credit-amount")?.value || "";
    const certificateNo = fields.find(f => f.id === "certificate")?.value || "";

    if (!taxValue || !tanPan) {
      Alert.alert("Error", "Please enter TAN/PAN and Tax amount");
      return;
    }

    let updatedEntries = [...taxesPaid.tdsNonSalaryEntries];
    
    if (editingId) {
      updatedEntries = updatedEntries.map(entry => 
        entry.id === editingId 
          ? { ...entry, business, section, name, tanPan, amountPaid, paymentDate, taxAmount: tax, creditAmount, certificateNo }
          : entry
      );
    } else {
      updatedEntries.push({
        id: Date.now().toString(),
        business, section, name, tanPan, amountPaid, paymentDate, taxAmount: tax, creditAmount, certificateNo
      });
    }

    const totalTDS = updatedEntries.reduce((sum, e) => sum + e.taxAmount, 0);
    setTaxesPaid({ tdsNonSalaryEntries: updatedEntries, tdsNonSalary: totalTDS });

    Alert.alert("Success", editingId ? "TDS Record updated!" : "TDS Record added!");
    resetForm();
  };

  const handleEdit = (entry: TDSNonSalaryEntry) => {
    setEditingId(entry.id);
    setFields([
      { id: "business", placeholder: "Business", value: entry.business, isDropdown: true },
      { id: "section", placeholder: "Section (2)", value: entry.section, isDropdown: true },
      { id: "name", placeholder: "Name", value: entry.name },
      { id: "tan", placeholder: "TAN/PAN", value: entry.tanPan },
      { id: "amount-paid", placeholder: "Amount Paid/Credit Income offered", value: entry.amountPaid },
      { id: "payment-date", placeholder: "Date of Payment/Credited", value: entry.paymentDate },
      { id: "tax-deduction", placeholder: "Tax Deduction inclu.surcharge/Edu.cess", value: entry.taxAmount.toString() },
      { id: "credit-amount", placeholder: "Amount out of to be allowed as Credit", value: entry.creditAmount },
      { id: "certificate", placeholder: "Unique Certificate Number(Optional)", value: entry.certificateNo },
    ]);
  };

  const handleDelete = (id: string) => {
    const updatedEntries = taxesPaid.tdsNonSalaryEntries.filter(e => e.id !== id);
    const totalTDS = updatedEntries.reduce((sum, e) => sum + e.taxAmount, 0);
    setTaxesPaid({ tdsNonSalaryEntries: updatedEntries, tdsNonSalary: totalTDS });
  };

  const handleDownloadJSON = async () => {
    if (taxesPaid.tdsNonSalaryEntries.length === 0) {
      Alert.alert("Empty", "No records to download.");
      return;
    }
    await exportITRData({ 
        type: "TDS_NonSalary_Details", 
        entries: taxesPaid.tdsNonSalaryEntries,
        totalTDS: taxesPaid.tdsNonSalary 
    });
  };

  return (
    <View style={styles.screen}>
      <ITRHeader title="TDS Non Salary" titleVariant="plain" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{editingId ? "Edit Non-Salary TDS" : "Add New Non-Salary TDS"}</Text>
            {editingId && <Pressable onPress={resetForm}><Text style={styles.cancelLink}>Cancel Edit</Text></Pressable>}
        </View>

        <View style={styles.formSection}>
          {fields.map((field) => (
            <View key={field.id} style={styles.fieldBlock}>
              <InputRow field={field} onChange={updateFieldValue} />
            </View>
          ))}
        </View>

        <ITRSaveButton title={editingId ? "Update Record" : "Save Record"} onPress={handleSave} />

        {taxesPaid.tdsNonSalaryEntries.length > 0 && (
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Saved Non-Salary TDS Records</Text>
            {taxesPaid.tdsNonSalaryEntries.map((entry) => (
              <Pressable key={entry.id} style={styles.recordItem} onPress={() => handleEdit(entry)}>
                <View style={styles.recordMain}>
                  <Text style={styles.recordTitle}>{entry.tanPan}</Text>
                  <Text style={styles.recordSubtitle}>{entry.name} | {entry.section}</Text>
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
              <Text style={styles.totalLabel}>Total Non-Salary TDS</Text>
              <Text style={styles.totalValue}>₹ {taxesPaid.tdsNonSalary.toLocaleString()}</Text>
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
  fieldBlock: { marginBottom: 10 },
  inputContainer: { position: 'relative', width: '100%' },
  input: { backgroundColor: "#fff", borderColor: "#C9D3E1", borderRadius: 8, borderWidth: 1, color: "#111827", fontSize: 13.5, height: 44, paddingHorizontal: 12, width: '100%' },
  dropdownIconWrap: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' },
  dropdownIconText: { color: "#374151", fontSize: 18, fontWeight: "700" },
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
