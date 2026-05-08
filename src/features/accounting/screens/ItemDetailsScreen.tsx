import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, EmptyState, Loading, AccountingHeader } from "../components";
import { accountingService } from "../services/accountingService";

const formatCurrency = (value: number) =>
  `₹ ${Math.abs(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

interface Item {
  id: string;
  itemName: string;
  unit: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  hsn?: string;
  sac?: string;
  purchasePrice?: number;
  currentStock?: number;
}

export default function ItemDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const itemId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockChange, setStockChange] = useState("");
  const [stockAction, setStockAction] = useState<"in" | "out" | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  useEffect(() => {
    if (!itemId) {
      setError("Missing item id.");
      setLoading(false);
      return;
    }

    async function loadItem() {
      try {
        setLoading(true);
        const result = await accountingService.getItemById?.(itemId);
        if (result?.data) {
          setItem(result.data);
        } else {
          setError("Item not found.");
        }
      } catch {
        setError("Unable to load item details.");
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [itemId]);

  const handleStockUpdate = async (action: "in" | "out") => {
    if (!stockChange.trim() || Number.isNaN(Number(stockChange))) {
      Alert.alert("Invalid Input", "Please enter a valid stock quantity.");
      return;
    }

    const quantity = Number(stockChange);
    if (quantity <= 0) {
      Alert.alert("Invalid Input", "Quantity must be greater than 0.");
      return;
    }

    try {
      // API call to update stock would go here
      const newStock =
        action === "in"
          ? (item?.currentStock || 0) + quantity
          : Math.max((item?.currentStock || 0) - quantity, 0);

      if (item) {
        setItem({
          ...item,
          currentStock: newStock,
          quantity: newStock,
        });
      }

      setStockChange("");
      setStockAction(null);
      Alert.alert("Success", `Stock ${action === "in" ? "added" : "removed"} successfully.`);
    } catch {
      Alert.alert("Error", "Unable to update stock. Please try again.");
    }
  };

  const handleDeleteItem = () => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          router.replace("/accounting/items");
        }
      }
    ]);
  };

  const handleEditItem = () => {
    setShowActionModal(false);
    Alert.alert("Edit", "Navigate to item edit screen.");
  };

  const handleDownload = (format: string) => {
    setShowActionModal(false);
    Alert.alert("Download", `Downloading item as ${format}`);
  };

  if (loading) {
    return <Loading text="Loading item..." fullScreen />;
  }

  if (!itemId || (error && !item)) {
    return (
      <View style={styles.container}>
        <AccountingHeader title="Item Details" showBackButton />
        <View style={styles.formArea}>
          <Card>
            <EmptyState
              icon="alert-circle"
              title="Unable to open item"
              description={error ?? "Item id is missing."}
            />
          </Card>
        </View>
      </View>
    );
  }

  const stockValue = ((item?.currentStock || 0) * (item?.unitPrice || 0));

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Item Details"
        showBackButton
        rightContent={
          <Pressable onPress={() => setShowActionModal(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
          </Pressable>
        }
        headerContent={
          <View style={styles.headerProfileArea}>
            <View style={styles.profileRow}>
              <View style={styles.itemIconCircle}>
                <Ionicons name="cube" size={28} color="#F59E0B" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.itemTitle}>{item?.itemName || "Item Name"}</Text>
                <Text style={styles.itemPriceText}>
                  {formatCurrency(item?.unitPrice || 0)}{" "}
                  <Text style={styles.itemPriceLabel}>(Sale Price)</Text>
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statColumn}>
                <Text style={styles.statLabel}>Purchase Price</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(item?.purchasePrice ?? item?.unitPrice ?? 0)}
                </Text>
              </View>
              <View style={styles.statColumn}>
                <Text style={styles.statLabel}>Current Stock</Text>
                <Text style={styles.statValue}>{item?.currentStock || item?.quantity || 0}</Text>
              </View>
              <View style={styles.statColumn}>
                <Text style={styles.statLabel}>Stock Value</Text>
                <Text style={styles.statValue}>{formatCurrency(stockValue)}</Text>
              </View>
            </View>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionArea}>
          <Card style={styles.detailCard}>
            <Text style={styles.sectionTitle}>Basic Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>Item</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Unit</Text>
              <Text style={styles.detailValue}>{item?.unit || "PCS"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>HSN/SAC Code</Text>
              <Text style={styles.detailValue}>{item?.hsn || item?.sac || "00000"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tax Rate</Text>
              <Text style={styles.detailValue}>0%</Text>
            </View>
            <View style={styles.detailRowFull}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={[styles.detailValue, styles.descriptionText]}>
                {item?.description ?? "New item added for sale"}
              </Text>
            </View>
          </Card>
        </View>

        <View style={styles.actionsBottom}>
          <Pressable style={[styles.bottomButton, styles.stockOutButton]} onPress={() => setStockAction("out")}> 
            <Text style={styles.bottomButtonText}>Stock Out</Text>
          </Pressable>
          <Pressable style={[styles.bottomButton, styles.stockInButton]} onPress={() => setStockAction("in")}> 
            <Text style={styles.bottomButtonText}>Stock In</Text>
          </Pressable>
        </View>

        {stockAction && (
          <View style={styles.sectionArea}>
            <Card style={styles.actionCard}>
              <Text style={styles.actionTitle}>
                {stockAction === "in" ? "Stock In" : "Stock Out"}
              </Text>
              <View style={styles.field}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  placeholder="Enter quantity"
                  value={stockChange}
                  onChangeText={setStockChange}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
              <View style={styles.actionButtons}>
                <Pressable
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => {
                    setStockChange("");
                    setStockAction(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.confirmButton]}
                  onPress={() => handleStockUpdate(stockAction)}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </Pressable>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Action Bottom Sheet */}
      <Modal
        visible={showActionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowActionModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>

            <View style={styles.sheetOptions}>
              <Pressable style={styles.optionRow} onPress={() => handleDownload("Excel")}>
                <Ionicons name="document-text-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Download Item(Excel)</Text>
              </Pressable>
              
              <Pressable style={styles.optionRow} onPress={() => handleDownload("PDF")}>
                <Ionicons name="document-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Download Item(PDF)</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={() => handleDownload("CSV")}>
                <Ionicons name="grid-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Download Item(CSV)</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={handleEditItem}>
                <Ionicons name="pencil-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Edit Item Details</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={() => { setShowActionModal(false); handleDeleteItem(); }}>
                <Ionicons name="trash" size={18} color="#DC2626" style={styles.optionIcon} />
                <Text style={[styles.optionText, styles.dangerText]}>Delete Item</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F7FA",
  },
  headerProfileArea: {
    marginTop: 8,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  itemIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  itemPriceText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 4,
  },
  itemPriceLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingBottom: 8,
  },
  statColumn: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerSection: {
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 48,
    marginBottom: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },
  itemHeaderCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 16,
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: 0,
    paddingTop: 24,
  },
  sectionArea: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  detailCard: {
    borderRadius: 24,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5EAF3",
  },
  detailRowFull: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "700",
    textAlign: "right",
    flex: 1,
  },
  descriptionText: {
    marginTop: 8,
    lineHeight: 18,
    textAlign: "right",
  },
  actionsBottom: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  bottomButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  stockOutButton: {
    backgroundColor: "#DC2626",
  },
  stockInButton: {
    backgroundColor: "#22C55E",
  },
  bottomButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },
  actionCard: {
    borderRadius: 20,
    padding: 16,
  },
  formArea: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: "#60708A",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5EAF3",
    padding: 14,
    fontSize: 14,
    color: "#0F172A",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#E5EAF3",
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  confirmButton: {
    backgroundColor: "#2563EB",
  },
  confirmButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
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
    paddingBottom: 30,
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
    marginTop: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },
  dangerText: {
    color: "#DC2626",
  },
});

