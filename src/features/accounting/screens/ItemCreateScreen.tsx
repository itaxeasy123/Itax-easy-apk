import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  Alert,
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AccountingHeader, Button, Card } from "../components";
import { accountingService } from "../services/accountingService";

const ITEM_UNITS = [
  "PIECE - PCS",
  "NUMBER - NOS",
  "KILO LITRE - KLR",
  "TONNES - TON",
  "BOTTLES - BTL",
  "CANS - CAN",
  "DOZENS - DOZ",
  "PAIRS - PRS",
  "ROLLS - ROL",
  "SETS - SET",
  "US GALLONS - USG",
];

export default function ItemCreateScreen() {
  const router = useRouter();
  const [itemName, setItemName] = useState("");
  const [hsnSac, setHsnSac] = useState("");
  const [unit, setUnit] = useState("");
  const [itemType, setItemType] = useState<"item" | "service">("item");
  
  const [salePrice, setSalePrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [taxRate, setTaxRate] = useState("");

  const [showUnitModal, setShowUnitModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!itemName.trim()) {
      setError("Item name is required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Map new UI state to backend payload
      await accountingService.createItem({
        itemName: itemName.trim(),
        unit: unit.trim() || "PCS",
        description: "",
        quantity: 0,
        unitPrice: Number(salePrice || "0"),
        hsn: hsnSac.trim() || undefined,
        sac: hsnSac.trim() || undefined,
      });

      router.push("/accounting/items");
    } catch (err) {
      setError("Unable to create item. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AccountingHeader
        title="Add New Item"
        showBackButton
        rightContent={
          <Pressable style={styles.importBtn}>
            <Ionicons name="arrow-down-circle-outline" size={16} color="#fff" />
            <Text style={styles.importText}>Import</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formArea}>
          
          {/* Item Details Section */}
          <Text style={styles.sectionTitle}>Item Details</Text>
          
          <TextInput
            value={itemName}
            onChangeText={setItemName}
            placeholder="Item Name"
            style={styles.input}
          />
          
          <TextInput
            value={hsnSac}
            onChangeText={setHsnSac}
            placeholder="HSN/SAC Code(Optional)"
            style={styles.input}
          />
          
          <Pressable style={styles.pickerInput} onPress={() => setShowUnitModal(true)}>
            <Text style={[styles.pickerText, !unit && styles.placeholderText]}>
              {unit || "Item Unit"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#94A3B8" />
          </Pressable>

          <View style={styles.radioGroup}>
            <Text style={styles.radioLabel}>Item Type</Text>
            <View style={styles.radioOptions}>
              <Pressable style={styles.radioOption} onPress={() => setItemType("item")}>
                <Ionicons 
                  name={itemType === "item" ? "radio-button-on" : "radio-button-off"} 
                  size={20} 
                  color={itemType === "item" ? "#3B82F6" : "#94A3B8"} 
                />
                <Text style={styles.radioText}>Item</Text>
              </Pressable>
              <Pressable style={styles.radioOption} onPress={() => setItemType("service")}>
                <Ionicons 
                  name={itemType === "service" ? "radio-button-on" : "radio-button-off"} 
                  size={20} 
                  color={itemType === "service" ? "#3B82F6" : "#94A3B8"} 
                />
                <Text style={styles.radioText}>Service</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Pricing Section */}
          <Text style={styles.sectionTitle}>Pricing</Text>
          
          <TextInput
            value={salePrice}
            onChangeText={setSalePrice}
            placeholder="Sale Price"
            keyboardType="numeric"
            style={styles.input}
          />
          
          <TextInput
            value={purchasePrice}
            onChangeText={setPurchasePrice}
            placeholder="Purchase Price"
            keyboardType="numeric"
            style={styles.input}
          />
          
          <TextInput
            value={taxRate}
            onChangeText={setTaxRate}
            placeholder="Tax Rate%"
            keyboardType="numeric"
            style={styles.input}
          />

          <View style={styles.divider} />

          {/* Other Info Section */}
          <Pressable style={styles.otherInfoBtn}>
            <Ionicons name="add-circle" size={20} color="#1E293B" />
            <Text style={styles.otherInfoText}>Other Info(Optional)</Text>
          </Pressable>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

        </View>
      </ScrollView>

      {/* Fixed Save Button */}
      <View style={styles.footer}>
        <Pressable 
          style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]} 
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? "Saving..." : "Save"}
          </Text>
        </Pressable>
      </View>

      {/* Unit Filter Popup */}
      <Modal
        visible={showUnitModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUnitModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowUnitModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>

            <ScrollView style={styles.sheetOptions} showsVerticalScrollIndicator={false}>
              {ITEM_UNITS.map((u) => (
                <Pressable
                  key={u}
                  style={styles.optionRow}
                  onPress={() => {
                    setUnit(u.split("-")[0].trim());
                    setShowUnitModal(false);
                  }}
                >
                  <Text style={styles.optionText}>{u}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  importBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  importText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    paddingBottom: 40,
  },
  formArea: {
    backgroundColor: "#FFFFFF",
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1E293B",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  pickerInput: {
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerText: {
    fontSize: 14,
    color: "#1E293B",
  },
  placeholderText: {
    color: "#94A3B8",
  },
  radioGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  radioOptions: {
    flexDirection: "row",
    gap: 16,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  radioText: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
  },
  divider: {
    height: 4,
    backgroundColor: "#F1F5F9",
  },
  otherInfoBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 8,
  },
  otherInfoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  saveButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonPressed: {
    opacity: 0.8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalDismiss: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
  },
  sheetHandleWrap: {
    alignItems: "center",
    paddingVertical: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
  },
  sheetOptions: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  optionRow: {
    paddingVertical: 16,
  },
  optionText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
});
