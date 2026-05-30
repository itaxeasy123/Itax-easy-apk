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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AccountingHeader, Button, Card } from "../components";
import { accountingService } from "../services/accountingService";
import { useAccountingSessionStore } from "../../../store/accountingSessionStore";
import { accountingTheme } from "../../../theme/accounting";

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
    const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const { draftItem, setDraftItem, clearDraftItem } = useAccountingSessionStore();

  const [itemName, setItemName] = useState(draftItem?.itemName ?? "");
  const [hsnSac, setHsnSac] = useState(draftItem?.hsnSac ?? "");
  const [unit, setUnit] = useState(draftItem?.unit ?? "");
  const [itemType, setItemType] = useState<"item" | "service">(draftItem?.itemType ?? "item");
  
  const [salePrice, setSalePrice] = useState(draftItem?.salePrice ?? "");
  const [purchasePrice, setPurchasePrice] = useState(draftItem?.purchasePrice ?? "");
  const [taxRate, setTaxRate] = useState(draftItem?.taxRate ?? "");
  
  useEffect(() => {
    setDraftItem({
      itemName,
      hsnSac,
      unit,
      itemType,
      salePrice,
      purchasePrice,
      taxRate
    });
  }, [itemName, hsnSac, unit, itemType, salePrice, purchasePrice, taxRate, setDraftItem]);

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

      clearDraftItem();
      router.navigate("/accounting/items");
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
            <Ionicons name="arrow-down-circle-outline" size={16} color={accountingTheme.colors.card} />
            <Text style={styles.importText}>Import</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
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
            <Ionicons name="chevron-down" size={20} color={accountingTheme.colors.textMuted} />
          </Pressable>

          <View style={styles.radioGroup}>
            <Text style={styles.radioLabel}>Item Type</Text>
            <View style={styles.radioOptions}>
              <Pressable style={styles.radioOption} onPress={() => setItemType("item")}>
                <Ionicons 
                  name={itemType === "item" ? "radio-button-on" : "radio-button-off"} 
                  size={20} 
                  color={itemType === "item" ? "#3B82F6" : accountingTheme.colors.textMuted} 
                />
                <Text style={styles.radioText}>Item</Text>
              </Pressable>
              <Pressable style={styles.radioOption} onPress={() => setItemType("service")}>
                <Ionicons 
                  name={itemType === "service" ? "radio-button-on" : "radio-button-off"} 
                  size={20} 
                  color={itemType === "service" ? "#3B82F6" : accountingTheme.colors.textMuted} 
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
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 0) + 16 }]}>
        <Button
          title={loading ? "Saving..." : "Save"}
          onPress={handleSave}
          loading={loading}
          size="large"
          fullWidth
        />
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
    gap: accountingTheme.spacing.xs,
  },
  importText: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  content: {
    paddingBottom: 40,
  },
  formArea: {
    backgroundColor: accountingTheme.colors.card,
    marginTop: accountingTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: "#1E293B",
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: 14,
    paddingBottom: 10,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: accountingTheme.fontSizes.md,
    color: "#1E293B",
    marginHorizontal: accountingTheme.spacing.lg,
    marginBottom: accountingTheme.spacing.md,
    backgroundColor: accountingTheme.colors.card,
  },
  pickerInput: {
    height: 42,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginHorizontal: accountingTheme.spacing.lg,
    marginBottom: accountingTheme.spacing.md,
    backgroundColor: accountingTheme.colors.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerText: {
    fontSize: accountingTheme.fontSizes.md,
    color: "#1E293B",
  },
  placeholderText: {
    color: accountingTheme.colors.textMuted,
  },
  radioGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: accountingTheme.spacing.lg,
    marginBottom: accountingTheme.spacing.lg,
  },
  radioLabel: {
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#334155",
  },
  radioOptions: {
    flexDirection: "row",
    gap: accountingTheme.spacing.lg,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.xs,
  },
  radioText: {
    fontSize: accountingTheme.fontSizes.sm,
    color: "#1E293B",
    fontWeight: accountingTheme.fontWeights.medium,
  },
  divider: {
    height: 4,
    backgroundColor: accountingTheme.colors.borderLight,
  },
  otherInfoBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: accountingTheme.spacing.md,
    paddingHorizontal: accountingTheme.spacing.lg,
    gap: 6,
  },
  otherInfoText: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#334155",
  },
  errorText: {
    color: accountingTheme.colors.error,
    fontSize: accountingTheme.fontSizes.md,
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingBottom: accountingTheme.spacing.lg,
  },
  footer: {
    backgroundColor: accountingTheme.colors.card,
    borderTopWidth: 1,
    borderTopColor: "#E5EAF3",
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: accountingTheme.spacing.lg,
    elevation: 8,
    shadowColor: accountingTheme.colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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
    backgroundColor: accountingTheme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
  },
  sheetHandleWrap: {
    alignItems: "center",
    paddingVertical: accountingTheme.spacing.md,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: accountingTheme.colors.borderMedium,
    borderRadius: 2,
  },
  sheetOptions: {
    paddingHorizontal: accountingTheme.spacing.xxl,
    paddingBottom: 30,
  },
  optionRow: {
    paddingVertical: accountingTheme.spacing.lg,
  },
  optionText: {
    fontSize: accountingTheme.fontSizes.lg,
    color: "#475569",
    fontWeight: accountingTheme.fontWeights.medium,
  },
});
