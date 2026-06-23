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
import { AccountingHeader, Button } from "../components";
import { accountingService } from "../services/accountingService";
import { useAccountingSessionStore } from "../../../store/accountingSessionStore";
import { accountingTheme } from "../../../theme/accounting";

// Values MUST match the backend `ItemUnit` enum exactly (lowercase).
const ITEM_UNITS: { label: string; value: string }[] = [
  { label: "Pieces (PCS)", value: "pieces" },
  { label: "Dozen (DOZ)", value: "dozen" },
  { label: "Pack", value: "pack" },
  { label: "Carton", value: "carton" },
  { label: "Box", value: "box" },
  { label: "Roll", value: "roll" },
  { label: "Bundle", value: "bundle" },
  { label: "Pair (PRS)", value: "pair" },
  { label: "Set (SET)", value: "set" },
  { label: "Grams (g)", value: "grams" },
  { label: "Kilograms (kg)", value: "kilograms" },
  { label: "Liters (L)", value: "liters" },
  { label: "Milliliters (ml)", value: "milliliters" },
  { label: "Meters (m)", value: "meters" },
  { label: "Centimeters (cm)", value: "centimeters" },
  { label: "Inches (in)", value: "inches" },
  { label: "Feet (ft)", value: "feet" },
  { label: "Square Meters (m²)", value: "squareMeters" },
  { label: "Square Feet (ft²)", value: "squareFeet" },
  { label: "Cubic Meters (m³)", value: "cubicMeters" },
  { label: "Cubic Feet (ft³)", value: "cubicFeet" },
];

export default function ItemCreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const setDraftItem = useAccountingSessionStore((state) => state.setDraftItem);
  const clearDraftItem = useAccountingSessionStore((state) => state.clearDraftItem);
  const [draftItem] = useState(() => useAccountingSessionStore.getState().draftItem);

  // Core Form State
  const [itemName, setItemName] = useState(draftItem?.itemName ?? "");
  const [hsnSac, setHsnSac] = useState(draftItem?.hsnSac ?? "");
  const [unit, setUnit] = useState(draftItem?.unit ?? "");
  const [itemType, setItemType] = useState<"item" | "service">(draftItem?.itemType ?? "item");
  const [salePrice, setSalePrice] = useState(draftItem?.salePrice ?? "");
  const [purchasePrice, setPurchasePrice] = useState(draftItem?.purchasePrice ?? "");
  const [taxRate, setTaxRate] = useState(draftItem?.taxRate ?? "");

  // Advanced Optional Fields (collapsible accordion)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [description, setDescription] = useState("");
  const [openingStock, setOpeningStock] = useState("");

  // UI States
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [unitSearchQuery, setUnitSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync Draft
  useEffect(() => {
    setDraftItem({
      itemName,
      hsnSac,
      unit,
      itemType,
      salePrice,
      purchasePrice,
      taxRate,
    });
  }, [itemName, hsnSac, unit, itemType, salePrice, purchasePrice, taxRate, setDraftItem]);

  // Handle Save
  async function handleSave() {
    if (!itemName.trim()) {
      setError("Item name is required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Map UI state to backend payload
      await accountingService.createItem({
        itemName: itemName.trim(),
        unit: unit.trim() || "pieces",
        description: description.trim() || undefined,
        quantity: openingStock ? Number(openingStock) : undefined,
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

  // Instant Unit Filter
  const filteredUnits = ITEM_UNITS.filter((u) =>
    u.label.toLowerCase().includes(unitSearchQuery.toLowerCase()) ||
    u.value.toLowerCase().includes(unitSearchQuery.toLowerCase())
  );

  // Helper renderer for decorated form inputs
  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    iconName: keyof typeof Ionicons.glyphMap,
    keyboardType: "default" | "numeric" = "default",
    fieldName: string,
    required: boolean = false,
    multiline: boolean = false,
    numberOfLines?: number
  ) => {
    const isFocused = focusedField === fieldName;
    return (
      <View style={styles.inputOuterContainer}>
        <Text style={styles.inputLabel}>
          {label} {required && <Text style={styles.requiredAsterisk}>*</Text>}
        </Text>
        <View style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          multiline && styles.inputWrapperMultiline,
        ]}>
          <Ionicons 
            name={iconName} 
            size={18} 
            color={isFocused ? accountingTheme.colors.primary : accountingTheme.colors.textSecondary} 
            style={[styles.inputIcon, multiline && styles.inputIconMultiline]} 
          />
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={accountingTheme.colors.textMuted}
            keyboardType={keyboardType}
            onFocus={() => setFocusedField(fieldName)}
            onBlur={() => setFocusedField(null)}
            multiline={multiline}
            numberOfLines={numberOfLines}
            style={[
              styles.textInput,
              multiline && styles.textInputMultiline,
            ]}
          />
        </View>
      </View>
    );
  };

  // Helper renderer for unit selector (styled exactly like text input)
  const renderPicker = (
    label: string,
    value: string,
    onPress: () => void,
    placeholder: string,
    iconName: keyof typeof Ionicons.glyphMap,
    fieldName: string,
    required: boolean = false
  ) => {
    const isFocused = focusedField === fieldName;
    const displayLabel = ITEM_UNITS.find((u) => u.value === value)?.label || placeholder;
    return (
      <View style={styles.inputOuterContainer}>
        <Text style={styles.inputLabel}>
          {label} {required && <Text style={styles.requiredAsterisk}>*</Text>}
        </Text>
        <Pressable 
          onPress={() => {
            setFocusedField(fieldName);
            onPress();
          }}
          style={[
            styles.inputWrapper,
            isFocused && styles.inputWrapperFocused,
          ]}
        >
          <View style={styles.pickerLeft}>
            <Ionicons 
              name={iconName} 
              size={18} 
              color={isFocused ? accountingTheme.colors.primary : accountingTheme.colors.textSecondary} 
              style={styles.inputIcon} 
            />
            <Text style={[styles.pickerValueText, !value && styles.placeholderText]}>
              {displayLabel}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={accountingTheme.colors.textSecondary} />
        </Pressable>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AccountingHeader
        title="Create Item / Service"
        showBackButton
        rightContent={
          <Pressable style={styles.importBtn}>
            <Ionicons name="arrow-down-circle-outline" size={18} color={accountingTheme.colors.card} />
            <Text style={styles.importText}>Import</Text>
          </Pressable>
        }
      />

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 0) + 120 }]} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          
          {/* Card 1: Basic Product Information */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle-outline" size={20} color={accountingTheme.colors.primary} />
              <Text style={styles.cardTitle}>Basic Details</Text>
            </View>

            {/* Premium Item Type Segmented Switch */}
            <View style={styles.inputOuterContainer}>
              <Text style={styles.inputLabel}>Item Type</Text>
              <View style={styles.segmentedContainer}>
                <Pressable 
                  style={[
                    styles.segmentButton,
                    itemType === "item" && styles.segmentButtonActive,
                  ]} 
                  onPress={() => setItemType("item")}
                >
                  <Ionicons 
                    name={itemType === "item" ? "cube" : "cube-outline"} 
                    size={18} 
                    color={itemType === "item" ? accountingTheme.colors.primary : accountingTheme.colors.textSecondary} 
                  />
                  <Text style={[
                    styles.segmentText,
                    itemType === "item" && styles.segmentTextActive,
                  ]}>
                    Product
                  </Text>
                </Pressable>
                
                <Pressable 
                  style={[
                    styles.segmentButton,
                    itemType === "service" && styles.segmentButtonActive,
                  ]} 
                  onPress={() => setItemType("service")}
                >
                  <Ionicons 
                    name={itemType === "service" ? "construct" : "construct-outline"} 
                    size={18} 
                    color={itemType === "service" ? accountingTheme.colors.primary : accountingTheme.colors.textSecondary} 
                  />
                  <Text style={[
                    styles.segmentText,
                    itemType === "service" && styles.segmentTextActive,
                  ]}>
                    Service
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Inputs */}
            {renderInput(
              "Item/Service Name",
              itemName,
              setItemName,
              "e.g. Wireless Mouse, Tax Consulting",
              "pricetag-outline",
              "default",
              "itemName",
              true
            )}

            {renderInput(
              "HSN/SAC Code",
              hsnSac,
              setHsnSac,
              "e.g. 84713010 (Optional)",
              "barcode-outline",
              "default",
              "hsnSac"
            )}

            {renderPicker(
              "Unit of Measurement",
              unit,
              () => setShowUnitModal(true),
              "Select Item Unit (e.g. Pieces, Box)",
              "options-outline",
              "unit",
              true
            )}
          </View>

          {/* Card 2: Pricing & Taxation */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="cash-outline" size={20} color={accountingTheme.colors.primary} />
              <Text style={styles.cardTitle}>Pricing & Tax</Text>
            </View>

            {/* Row Layout for Sale and Purchase Prices */}
            <View style={styles.gridRow}>
              <View style={styles.gridColumn}>
                {renderInput(
                  "Sale Price",
                  salePrice,
                  setSalePrice,
                  "0.00",
                  "logo-usd",
                  "numeric",
                  "salePrice"
                )}
              </View>

              <View style={styles.gridColumn}>
                {renderInput(
                  "Purchase Price",
                  purchasePrice,
                  setPurchasePrice,
                  "0.00",
                  "wallet-outline",
                  "numeric",
                  "purchasePrice"
                )}
              </View>
            </View>

            {renderInput(
              "Tax Rate (%)",
              taxRate,
              setTaxRate,
              "e.g. 18 (Optional)",
              "calculator-outline",
              "numeric",
              "taxRate"
            )}
          </View>

          {/* Card 3: Advanced Options (Accordion) */}
          <View style={styles.formCard}>
            <Pressable 
              style={styles.accordionHeader} 
              onPress={() => setShowAdvanced(!showAdvanced)}
            >
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="add-circle-outline" size={20} color={accountingTheme.colors.primary} />
                <Text style={styles.cardTitle}>Advanced / Inventory Options</Text>
              </View>
              <Ionicons 
                name={showAdvanced ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={accountingTheme.colors.textSecondary} 
              />
            </Pressable>

            {showAdvanced && (
              <View style={styles.accordionContent}>
                <View style={styles.divider} />
                
                {renderInput(
                  "Opening Stock (Quantity)",
                  openingStock,
                  setOpeningStock,
                  "e.g. 100",
                  "layers-outline",
                  "numeric",
                  "openingStock"
                )}

                {renderInput(
                  "Description",
                  description,
                  setDescription,
                  "Write product specifications, unit specifics, or details...",
                  "reader-outline",
                  "default",
                  "description",
                  false,
                  true,
                  3
                )}
              </View>
            )}
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color={accountingTheme.colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 0) + 16 }]}>
        <Button
          title={loading ? "Saving Item..." : "Save Product"}
          onPress={handleSave}
          loading={loading}
          size="large"
          fullWidth
          style={styles.saveBtn}
        />
      </View>

      {/* Premium Searchable Bottom Sheet Modal for Units */}
      <Modal
        visible={showUnitModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowUnitModal(false);
          setFocusedField(null);
        }}
      >
        <View style={styles.modalBackdrop}>
          <Pressable 
            style={styles.modalDismiss} 
            onPress={() => {
              setShowUnitModal(false);
              setFocusedField(null);
            }} 
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderBar} />
              <View style={styles.sheetTitleRow}>
                <Text style={styles.sheetTitle}>Select Item Unit</Text>
                <Pressable 
                  style={styles.closeBtn} 
                  onPress={() => {
                    setShowUnitModal(false);
                    setFocusedField(null);
                  }}
                >
                  <Ionicons name="close" size={22} color={accountingTheme.colors.textSecondary} />
                </Pressable>
              </View>
            </View>

            {/* Bottom Sheet Search Bar */}
            <View style={styles.searchBarWrapper}>
              <Ionicons name="search" size={18} color={accountingTheme.colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                value={unitSearchQuery}
                onChangeText={setUnitSearchQuery}
                placeholder="Search units (e.g. Box, Kg, Pcs)..."
                placeholderTextColor={accountingTheme.colors.textMuted}
                clearButtonMode="while-editing"
                style={styles.searchInput}
              />
              {unitSearchQuery ? (
                <Pressable onPress={() => setUnitSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color={accountingTheme.colors.textMuted} />
                </Pressable>
              ) : null}
            </View>

            {/* Units Scroll List */}
            <ScrollView style={styles.sheetOptions} showsVerticalScrollIndicator={false}>
              {filteredUnits.length > 0 ? (
                filteredUnits.map((u) => {
                  const isSelected = unit === u.value;
                  return (
                    <Pressable
                      key={u.value}
                      style={[
                        styles.optionRow,
                        isSelected && styles.optionRowActive,
                      ]}
                      onPress={() => {
                        setUnit(u.value);
                        setUnitSearchQuery("");
                        setShowUnitModal(false);
                        setFocusedField(null);
                      }}
                    >
                      <Text style={[
                        styles.optionText,
                        isSelected && styles.optionTextActive,
                      ]}>
                        {u.label}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color={accountingTheme.colors.primary} />
                      )}
                    </Pressable>
                  );
                })
              ) : (
                <View style={styles.emptySearchContainer}>
                  <Ionicons name="alert-circle-outline" size={48} color={accountingTheme.colors.textMuted} />
                  <Text style={styles.emptySearchTitle}>No Units Found</Text>
                  <Text style={styles.emptySearchSubtitle}>
                    We couldn't find any unit matching "{unitSearchQuery}"
                  </Text>
                </View>
              )}
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
    backgroundColor: accountingTheme.colors.background,
  },
  importBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.xs,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  importText: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  content: {
    paddingTop: accountingTheme.spacing.md,
  },
  formContainer: {
    paddingHorizontal: accountingTheme.spacing.md,
    gap: accountingTheme.spacing.md,
  },
  formCard: {
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.xl,
    padding: accountingTheme.spacing.lg,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    boxShadow: "0px 2px 8px rgba(37, 99, 235, 0.04)",
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.sm,
    marginBottom: accountingTheme.spacing.lg,
    paddingBottom: accountingTheme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.sm,
  },
  cardTitle: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: "700",
    color: "#1E293B",
  },
  inputOuterContainer: {
    marginBottom: accountingTheme.spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: accountingTheme.colors.error,
  },
  inputWrapper: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: accountingTheme.radius.md,
    paddingHorizontal: accountingTheme.spacing.md,
    backgroundColor: "#FFFFFF",
  },
  inputWrapperFocused: {
    borderColor: accountingTheme.colors.primary,
    backgroundColor: "#FFFFFF",
  },
  inputWrapperMultiline: {
    height: "auto",
    minHeight: 80,
    alignItems: "flex-start",
    paddingVertical: accountingTheme.spacing.md,
  },
  inputIcon: {
    marginRight: accountingTheme.spacing.sm,
  },
  inputIconMultiline: {
    marginTop: 2,
  },
  textInput: {
    flex: 1,
    fontSize: accountingTheme.fontSizes.md,
    color: "#1E293B",
    padding: 0,
    height: "100%",
  },
  textInputMultiline: {
    height: "auto",
    textAlignVertical: "top",
  },
  pickerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pickerValueText: {
    fontSize: accountingTheme.fontSizes.md,
    color: "#1E293B",
  },
  placeholderText: {
    color: accountingTheme.colors.textMuted,
  },
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: accountingTheme.radius.lg,
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: accountingTheme.radius.md,
    backgroundColor: "transparent",
  },
  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.15)",
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  segmentTextActive: {
    color: accountingTheme.colors.primary,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: accountingTheme.spacing.md,
  },
  gridColumn: {
    flex: 1,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accordionContent: {
    marginTop: accountingTheme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: accountingTheme.spacing.lg,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: accountingTheme.radius.md,
    padding: accountingTheme.spacing.md,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    gap: accountingTheme.spacing.sm,
    marginTop: accountingTheme.spacing.xs,
  },
  errorText: {
    color: accountingTheme.colors.error,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  footer: {
    backgroundColor: accountingTheme.colors.card,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingHorizontal: accountingTheme.spacing.xl,
    paddingTop: accountingTheme.spacing.md,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    boxShadow: "0px -4px 10px rgba(0, 0, 0, 0.03)",
    elevation: 10,
  },
  saveBtn: {
    shadowColor: accountingTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modalDismiss: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: accountingTheme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    boxShadow: "0px -8px 24px rgba(0, 0, 0, 0.15)",
    elevation: 15,
  },
  sheetHeader: {
    paddingTop: 10,
    paddingHorizontal: accountingTheme.spacing.xl,
    paddingBottom: accountingTheme.spacing.md,
  },
  sheetHeaderBar: {
    width: 36,
    height: 4,
    backgroundColor: "#CBD5E1",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  sheetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  closeBtn: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    marginHorizontal: accountingTheme.spacing.xl,
    paddingHorizontal: accountingTheme.spacing.md,
    height: 44,
    borderRadius: 22,
    marginBottom: accountingTheme.spacing.md,
  },
  searchIcon: {
    marginRight: accountingTheme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#0F172A",
    padding: 0,
  },
  sheetOptions: {
    paddingHorizontal: accountingTheme.spacing.lg,
    marginBottom: 24,
    maxHeight: 280,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: accountingTheme.spacing.md,
    borderRadius: accountingTheme.radius.md,
    marginBottom: 2,
  },
  optionRowActive: {
    backgroundColor: "#EFF6FF",
  },
  optionText: {
    fontSize: 15,
    color: "#475569",
    fontWeight: "500",
  },
  optionTextActive: {
    color: accountingTheme.colors.primary,
    fontWeight: "700",
  },
  emptySearchContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptySearchTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
    marginTop: 4,
  },
  emptySearchSubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
