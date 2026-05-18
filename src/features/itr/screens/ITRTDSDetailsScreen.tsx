import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useITRStore, type TDSEntry } from "../../../store/itrStore";
import { ITRBottomNav, ITRHeader, ITRSaveButton } from "../components";
import { itrColors, itrRadius, itrSpacing, itrShadows } from "../../../theme/itr";
import { exportITRData } from "../services/itrExport.service";

type FieldConfig = {
  id: string;
  placeholder: string;
  value: string;
};

const INITIAL_FIELDS: FieldConfig[] = [
  { id: "tan", placeholder: "Enter TAN Number", value: "" },
  { id: "name", placeholder: "Name of Deductor", value: "" },
  { id: "purchase", placeholder: "Purchases of assets", value: "" },
  { id: "tax", placeholder: "Total Tax Deducted", value: "" },
];

export default function ITRTDSDetailsScreen() {
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
    const tan = fields.find(f => f.id === "tan")?.value || "";
    const name = fields.find(f => f.id === "name")?.value || "";
    const purchase = fields.find(f => f.id === "purchase")?.value || "";
    const taxValue = fields.find(f => f.id === "tax")?.value || "";
    const tax = parseFloat(taxValue) || 0;

    if (!taxValue || !tan) {
      Alert.alert("Error", "Please enter TAN and Tax amount");
      return;
    }

    let updatedEntries = [...taxesPaid.tdsEntries];
    
    if (editingId) {
      updatedEntries = updatedEntries.map(entry => 
        entry.id === editingId 
          ? { ...entry, tan, deductorName: name, purchaseAmount: purchase, taxAmount: tax }
          : entry
      );
    } else {
      updatedEntries.push({
        id: Date.now().toString(),
        tan,
        deductorName: name,
        purchaseAmount: purchase,
        taxAmount: tax
      });
    }

    const totalTDS = updatedEntries.reduce((sum, e) => sum + e.taxAmount, 0);
    setTaxesPaid({ tdsEntries: updatedEntries, tdsOther: totalTDS });

    Alert.alert("Success", editingId ? "TDS Record updated!" : "TDS Record added!");
    resetForm();
  };

  const handleEdit = (entry: TDSEntry) => {
    setEditingId(entry.id);
    setFields([
      { id: "tan", placeholder: "Enter TAN Number", value: entry.tan },
      { id: "name", placeholder: "Name of Deductor", value: entry.deductorName },
      { id: "purchase", placeholder: "Purchases of assets", value: entry.purchaseAmount },
      { id: "tax", placeholder: "Total Tax Deducted", value: entry.taxAmount.toString() },
    ]);
  };

  const handleDelete = (id: string) => {
    const updatedEntries = taxesPaid.tdsEntries.filter(e => e.id !== id);
    const totalTDS = updatedEntries.reduce((sum, e) => sum + e.taxAmount, 0);
    setTaxesPaid({ tdsEntries: updatedEntries, tdsOther: totalTDS });
  };

  const handleDownloadJSON = async () => {
    if (taxesPaid.tdsEntries.length === 0) {
      Alert.alert("Empty", "No records to download.");
      return;
    }
    await exportITRData({ 
        type: "TDS_Other_Details", 
        entries: taxesPaid.tdsEntries,
        totalTDS: taxesPaid.tdsOther 
    });
  };

  return (
    <View style={styles.screen}>
      <ITRHeader title="TDS Details" titleVariant="plain" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{editingId ? "Edit TDS Record" : "Add New TDS Record"}</Text>
            {editingId && <Pressable onPress={resetForm}><Text style={styles.cancelLink}>Cancel Edit</Text></Pressable>}
        </View>

        <View style={styles.formSection}>
          {fields.map((field) => (
            <View key={field.id} style={styles.inputWrap}>
              <TextInput
                value={field.value}
                keyboardType={field.id === "tax" || field.id === "purchase" ? "numeric" : "default"}
                onChangeText={(text) => updateFieldValue(field.id, text)}
                placeholder={field.placeholder}
                placeholderTextColor="#8A96A8"
                style={styles.input}
              />
            </View>
          ))}
        </View>

        <ITRSaveButton title={editingId ? "Update TDS" : "Save TDS"} onPress={handleSave} />

        {taxesPaid.tdsEntries.length > 0 && (
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Saved TDS Records</Text>
            {taxesPaid.tdsEntries.map((entry) => (
              <Pressable key={entry.id} style={styles.recordItem} onPress={() => handleEdit(entry)}>
                <View style={styles.recordMain}>
                  <Text style={styles.recordTitle}>TAN: {entry.tan}</Text>
                  <Text style={styles.recordSubtitle}>{entry.deductorName}</Text>
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
              <Text style={styles.totalLabel}>Total TDS</Text>
              <Text style={styles.totalValue}>₹ {taxesPaid.tdsOther.toLocaleString()}</Text>
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
