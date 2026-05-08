import { useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { accountingService } from "../services/accountingService";
import { BillReceivable } from "../types/accountingTypes";

const BILL_RECEIVABLE_CACHE_KEY = "accounting_bill_receivables_cache";

export default function BillReceivableCreateScreen() {
  const router = useRouter();
  const [billNumber, setBillNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [contact, setContact] = useState("");
  const [amount, setAmount] = useState("");
  const [tax, setTax] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusOptions = ["unpaid", "paid", "overdue"];

  async function handleSave() {
    if (!billNumber.trim() || !customerName.trim() || !customerAddress.trim() || !contact.trim()) {
      setError("Bill number, customer name, address and contact are required.");
      return;
    }

    if (!amount.trim() || !itemPrice.trim()) {
      setError("Amount and item price are required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      await accountingService.createBillReceivable({
        billNumber: billNumber.trim(),
        amount: amount.trim(),
        tax: tax.trim() || undefined,
        customerName: customerName.trim(),
        customerAddress: customerAddress.trim(),
        contact: contact.trim(),
        itemQuantity: itemQuantity.trim() || undefined,
        itemPrice: itemPrice.trim(),
        itemDescription: description.trim() || undefined,
        dueDate: dueDate.trim() || undefined,
        paymentStatus,
        paymentMethod: paymentMethod.trim() || undefined,
        comment: comment.trim() || undefined,
      });

      const cachedValue = await AsyncStorage.getItem(BILL_RECEIVABLE_CACHE_KEY);
      const cachedBills: BillReceivable[] = cachedValue ? JSON.parse(cachedValue) : [];
      const createdBill: BillReceivable = {
        id: Date.now(),
        billNumber: billNumber.trim(),
        amount: Number(amount.trim()),
        tax: tax.trim() ? Number(tax.trim()) : undefined,
        customerName: customerName.trim(),
        customerAddress: customerAddress.trim(),
        contact: contact.trim(),
        itemQuantity: itemQuantity.trim() ? Number(itemQuantity.trim()) : undefined,
        itemPrice: itemPrice.trim() ? Number(itemPrice.trim()) : undefined,
        itemDescription: description.trim() || undefined,
        paymentStatus,
        dueDate: dueDate.trim() || undefined,
        paymentMethod: paymentMethod.trim() || undefined,
        comment: comment.trim() || undefined,
      };
      await AsyncStorage.setItem(
        BILL_RECEIVABLE_CACHE_KEY,
        JSON.stringify([createdBill, ...cachedBills])
      );

      setSuccessMessage("Invoice created successfully.");
      setBillNumber("");
      setCustomerName("");
      setCustomerAddress("");
      setContact("");
      setAmount("");
      setTax("");
      setItemQuantity("");
      setItemPrice("");
      setDescription("");
      setDueDate("");
      setPaymentStatus("unpaid");
      setPaymentMethod("");
      setComment("");
      router.replace("/accounting/bill-receivable");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to create invoice. Try again.";
      setError(message);
      setSuccessMessage(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#347BE5" />
          </Pressable>
          <Text style={styles.headline}>Create Invoice</Text>
        </View>

        <Text style={styles.subtitle}>Create a new customer invoice</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Bill Number *</Text>
          <TextInput
            value={billNumber}
            onChangeText={setBillNumber}
            placeholder="e.g., INV-001"
            style={styles.input}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Customer Name *</Text>
          <TextInput
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="e.g., Acme Corp"
            style={styles.input}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Customer Address *</Text>
          <TextInput
            value={customerAddress}
            onChangeText={setCustomerAddress}
            placeholder="Customer address"
            style={[styles.input, styles.multilineInput]}
            multiline
            numberOfLines={3}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Contact *</Text>
          <TextInput
            value={contact}
            onChangeText={setContact}
            placeholder="9876543210"
            style={styles.input}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Amount *</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              style={styles.input}
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Tax</Text>
            <TextInput
              value={tax}
              onChangeText={setTax}
              placeholder="0"
              style={styles.input}
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Item Quantity</Text>
            <TextInput
              value={itemQuantity}
              onChangeText={setItemQuantity}
              placeholder="1"
              style={styles.input}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Item Price *</Text>
            <TextInput
              value={itemPrice}
              onChangeText={setItemPrice}
              placeholder="0.00"
              style={styles.input}
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Due Date</Text>
          <TextInput
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
            style={styles.input}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Invoice details"
            style={[styles.input, styles.multilineInput]}
            multiline
            numberOfLines={3}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Payment Status</Text>
          <View style={styles.statusRow}>
            {statusOptions.map((status) => (
              <Pressable
                key={status}
                onPress={() => setPaymentStatus(status)}
                style={[
                  styles.statusButton,
                  paymentStatus === status && styles.statusButtonActive,
                ]}
              >
                <Text
                  style={
                    paymentStatus === status
                      ? styles.statusButtonTextActive
                      : styles.statusButtonText
                  }
                >
                  {status}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Payment Method</Text>
          <TextInput
            value={paymentMethod}
            onChangeText={setPaymentMethod}
            placeholder="Cash / UPI / Bank Transfer"
            style={styles.input}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Comment</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Optional note"
            style={[styles.input, styles.multilineInput]}
            multiline
            numberOfLines={2}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        <Pressable
          style={[styles.primaryButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Creating..." : "Create Invoice"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F9FF",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  headline: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    color: "#60708A",
    marginTop: 4,
    marginBottom: 24,
  },
  field: {
    marginBottom: 18,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5EAF3",
    padding: 14,
    fontSize: 14,
    color: "#0F172A",
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5EAF3",
    backgroundColor: "#FFFFFF",
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#60708A",
  },
  statusButtonActive: {
    backgroundColor: "#347BE5",
    borderColor: "#347BE5",
  },
  statusButtonTextActive: {
    color: "#FFFFFF",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: "#EF4444",
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    fontSize: 13,
    color: "#16A34A",
    marginLeft: 8,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: "#347BE5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: "#E5EAF3",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#347BE5",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
