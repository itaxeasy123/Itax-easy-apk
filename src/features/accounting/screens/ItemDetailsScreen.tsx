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
import { accountingTheme } from "../../../theme/accounting";
import { exportCsv, exportExcel, exportPdf, buildPdfHtml } from "../utils/exportFile";

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
  taxRate: number;
}

/** The API sends price/hsnCode/openingStock/closingStock — map to screen fields. */
const normalizeItem = (raw: any): Item => ({
  id: String(raw?.id ?? ""),
  itemName: String(raw?.itemName ?? ""),
  unit: String(raw?.unit ?? "pieces"),
  description: raw?.description ?? undefined,
  unitPrice: Number(raw?.price ?? raw?.unitPrice ?? 0),
  purchasePrice: raw?.purchasePrice != null ? Number(raw.purchasePrice) : undefined,
  hsn: raw?.hsnCode ?? raw?.hsn ?? undefined,
  sac: raw?.sac ?? undefined,
  currentStock: Number(raw?.closingStock ?? raw?.openingStock ?? raw?.currentStock ?? 0),
  quantity: Number(raw?.closingStock ?? raw?.openingStock ?? 0),
  taxRate: Number(raw?.cgst ?? 0) + Number(raw?.sgst ?? 0) + Number(raw?.igst ?? 0),
});

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
          setItem(normalizeItem(result.data));
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
      const newStock =
        action === "in"
          ? (item?.currentStock || 0) + quantity
          : Math.max((item?.currentStock || 0) - quantity, 0);

      // persist on the server, then reflect locally
      await accountingService.updateItem(itemId!, { closingStock: newStock } as any);
      if (item) {
        setItem({ ...item, currentStock: newStock, quantity: newStock });
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
          try {
            await accountingService.deleteItem(itemId!);
            router.replace("/accounting/items");
          } catch {
            Alert.alert("Error", "Unable to delete this item (it may be used on an invoice).");
          }
        },
      },
    ]);
  };

  // ---- edit sheet ----
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editPurchasePrice, setEditPurchasePrice] = useState("");
  const [editHsn, setEditHsn] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const handleEditItem = () => {
    setShowActionModal(false);
    setEditName(item?.itemName ?? "");
    setEditPrice(String(item?.unitPrice ?? ""));
    setEditPurchasePrice(item?.purchasePrice != null ? String(item.purchasePrice) : "");
    setEditHsn(item?.hsn ?? "");
    setEditDescription(item?.description ?? "");
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      Alert.alert("Invalid input", "Item name is required.");
      return;
    }
    const price = Number(editPrice);
    if (Number.isNaN(price) || price < 0) {
      Alert.alert("Invalid input", "Sale price must be a valid number.");
      return;
    }
    try {
      setSavingEdit(true);
      await accountingService.updateItem(itemId!, {
        itemName: editName.trim(),
        price,
        ...(editPurchasePrice.trim() !== "" ? { purchasePrice: Number(editPurchasePrice) } : {}),
        hsnCode: editHsn.trim(),
        description: editDescription.trim(),
      } as any);
      setItem((current) =>
        current
          ? {
              ...current,
              itemName: editName.trim(),
              unitPrice: price,
              purchasePrice: editPurchasePrice.trim() !== "" ? Number(editPurchasePrice) : current.purchasePrice,
              hsn: editHsn.trim() || current.hsn,
              description: editDescription.trim() || current.description,
            }
          : current
      );
      setShowEditModal(false);
      Alert.alert("Saved", "Item details updated.");
    } catch {
      Alert.alert("Error", "Unable to update the item. Please try again.");
    } finally {
      setSavingEdit(false);
    }
  };

  // ---- downloads (real exports) ----
  const itemRows = (): (string | number)[][] => [
    ["Field", "Value"],
    ["Item Name", item?.itemName ?? ""],
    ["Unit", item?.unit ?? ""],
    ["Sale Price", item?.unitPrice ?? 0],
    ["Purchase Price", item?.purchasePrice ?? 0],
    ["Current Stock", item?.currentStock ?? 0],
    ["Stock Value", (item?.currentStock || 0) * (item?.unitPrice || 0)],
    ["HSN/SAC Code", item?.hsn ?? item?.sac ?? ""],
    ["Tax Rate (%)", item?.taxRate ?? 0],
    ["Description", item?.description ?? ""],
  ];

  const handleDownload = async (format: string) => {
    setShowActionModal(false);
    const filename = `item-${(item?.itemName ?? "details").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
    const rows = itemRows();
    if (format === "CSV") await exportCsv(filename, rows);
    else if (format === "Excel") await exportExcel(filename, item?.itemName ?? "Item", rows);
    else if (format === "PDF")
      await exportPdf(filename, buildPdfHtml(item?.itemName ?? "Item", `Item details — exported from iTaxEasy`, rows));
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
            <Ionicons name="ellipsis-horizontal" size={20} color={accountingTheme.colors.card} />
          </Pressable>
        }
        headerContent={
          <View style={styles.headerProfileArea}>
            <View style={styles.profileRow}>
              <View style={styles.itemIconCircle}>
                <Ionicons name="cube" size={28} color={accountingTheme.colors.warning} />
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
              <Text style={styles.detailValue}>{item?.taxRate ?? 0}%</Text>
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
                <Ionicons name="trash" size={18} color={accountingTheme.colors.error} style={styles.optionIcon} />
                <Text style={[styles.optionText, styles.dangerText]}>Delete Item</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Item Bottom Sheet */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowEditModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>

            <ScrollView style={{ maxHeight: 480 }} contentContainerStyle={styles.sheetOptions}>
              <Text style={styles.editTitle}>Edit Item Details</Text>

              <View style={styles.field}>
                <Text style={styles.label}>Item Name</Text>
                <TextInput value={editName} onChangeText={setEditName} style={styles.input} placeholder="Item name" />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Sale Price</Text>
                <TextInput
                  value={editPrice}
                  onChangeText={(t) => setEditPrice(t.replace(/[^\d.]/g, ""))}
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Purchase Price</Text>
                <TextInput
                  value={editPurchasePrice}
                  onChangeText={(t) => setEditPurchasePrice(t.replace(/[^\d.]/g, ""))}
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>HSN/SAC Code</Text>
                <TextInput
                  value={editHsn}
                  onChangeText={(t) => setEditHsn(t.replace(/[^\dA-Za-z]/g, ""))}
                  style={styles.input}
                  placeholder="e.g. 8471"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  value={editDescription}
                  onChangeText={setEditDescription}
                  style={styles.input}
                  placeholder="Description"
                  multiline
                />
              </View>

              <View style={styles.actionButtons}>
                <Pressable
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.confirmButton, savingEdit && { opacity: 0.6 }]}
                  onPress={handleSaveEdit}
                  disabled={savingEdit}
                >
                  <Text style={styles.confirmButtonText}>{savingEdit ? "Saving..." : "Save"}</Text>
                </Pressable>
              </View>
            </ScrollView>
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
    marginTop: accountingTheme.spacing.sm,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.lg,
    marginBottom: accountingTheme.spacing.xl,
  },
  itemIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: accountingTheme.colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: accountingTheme.fontSizes.xxxl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.card,
  },
  itemPriceText: {
    fontSize: accountingTheme.fontSizes.xxl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.card,
    marginTop: accountingTheme.spacing.xs,
  },
  itemPriceLabel: {
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.medium,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: accountingTheme.spacing.sm,
    paddingBottom: accountingTheme.spacing.sm,
  },
  statColumn: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: accountingTheme.spacing.xs,
  },
  statValue: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.card,
  },
  headerSection: {
    paddingBottom: accountingTheme.spacing.xxl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: 48,
    marginBottom: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: accountingTheme.radius.lg,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    fontSize: accountingTheme.fontSizes.xxl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.card,
  },
  itemHeaderCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    marginHorizontal: accountingTheme.spacing.lg,
    borderRadius: 24,
    padding: accountingTheme.spacing.lg,
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: 0,
    paddingTop: accountingTheme.spacing.xxl,
  },
  sectionArea: {
    paddingHorizontal: accountingTheme.spacing.lg,
    marginBottom: accountingTheme.spacing.lg,
  },
  detailCard: {
    borderRadius: 24,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: accountingTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E5EAF3",
  },
  detailRowFull: {
    paddingVertical: 14,
    paddingHorizontal: accountingTheme.spacing.lg,
  },
  detailLabel: {
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.textSecondary,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  detailValue: {
    fontSize: accountingTheme.fontSizes.md,
    color: accountingTheme.colors.text,
    fontWeight: accountingTheme.fontWeights.bold,
    textAlign: "right",
    flex: 1,
  },
  descriptionText: {
    marginTop: accountingTheme.spacing.sm,
    lineHeight: 18,
    textAlign: "right",
  },
  actionsBottom: {
    flexDirection: "row",
    gap: accountingTheme.spacing.md,
    paddingHorizontal: accountingTheme.spacing.lg,
    marginBottom: accountingTheme.spacing.md,
  },
  bottomButton: {
    flex: 1,
    paddingVertical: accountingTheme.spacing.lg,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  stockOutButton: {
    backgroundColor: accountingTheme.colors.error,
  },
  stockInButton: {
    backgroundColor: "#22C55E",
  },
  bottomButtonText: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.card,
  },
  actionCard: {
    borderRadius: 20,
    padding: accountingTheme.spacing.lg,
  },
  formArea: {
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: accountingTheme.spacing.lg,
  },
  actionTitle: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
    marginBottom: accountingTheme.spacing.lg,
  },
  field: {
    marginBottom: accountingTheme.spacing.lg,
  },
  label: {
    fontSize: accountingTheme.fontSizes.sm,
    color: "#60708A",
    marginBottom: accountingTheme.spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  input: {
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.xl,
    borderWidth: 1,
    borderColor: "#E5EAF3",
    padding: 14,
    fontSize: accountingTheme.fontSizes.lg,
    color: accountingTheme.colors.text,
  },
  actionButtons: {
    flexDirection: "row",
    gap: accountingTheme.spacing.md,
    marginTop: accountingTheme.spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: accountingTheme.radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#E5EAF3",
  },
  cancelButtonText: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#475569",
  },
  confirmButton: {
    backgroundColor: accountingTheme.colors.primary,
  },
  confirmButtonText: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.card,
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
    paddingBottom: 30,
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
    marginTop: accountingTheme.spacing.sm,
  },
  editTitle: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: "#111827",
    paddingHorizontal: accountingTheme.spacing.xxl,
    marginBottom: accountingTheme.spacing.md,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: accountingTheme.spacing.lg,
    paddingHorizontal: accountingTheme.spacing.xxl,
  },
  optionIcon: {
    marginRight: accountingTheme.spacing.md,
  },
  optionText: {
    fontSize: accountingTheme.fontSizes.lg,
    color: "#475569",
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  dangerText: {
    color: accountingTheme.colors.error,
  },
});

