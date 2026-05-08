
import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AccountingHeader, Button, Card } from "../components";
import { accountingService } from "../services/accountingService";
import { PartyType } from "../types/accountingTypes";

const partyTypeOptions: { label: string; value: PartyType }[] = [
  { label: "Customer", value: "customer" },
  { label: "Supplier", value: "supplier" },
]; 

export default function PartyCreateScreen() {
  const router = useRouter();
  const [partyName, setPartyName] = useState("");
  const [type, setType] = useState<PartyType>("customer");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [tan, setTan] = useState("");
  const [upi, setUpi] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [address, setAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [expandedSection, setExpandedSection] = useState<"business" | "billing" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const trimmedName = partyName.trim();

    if (!trimmedName) {
      setError("Party name is required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await accountingService.createParty({
        partyName: trimmedName,
        type,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        gstin: gstin.trim() || undefined,
        pan: pan.trim() || undefined,
        tan: tan.trim() || undefined,
        upi: upi.trim() || undefined,
        openingBalance: openingBalance.trim() ? Number(openingBalance.trim()) : undefined,
        address: address.trim() || undefined,
        bankName: bankName.trim() || undefined,
        bankAccountNumber: bankAccountNumber.trim() || undefined,
        bankIfsc: bankIfsc.trim() || undefined,
        bankBranch: bankBranch.trim() || undefined,
      });

      Alert.alert("Success", `${trimmedName} added as ${type}!`);
      router.replace("/accounting/parties");
    } catch {
      setError("Error creating party. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Add New Party"
        showBackButton
        subtitle="Enter party details"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Details Card */}
        <View style={styles.cardArea}>
          <Card>
            <Text style={styles.sectionTitle}>Basic Details</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Party Name</Text>
              <TextInput
                placeholder="Enter party name"
                value={partyName}
                onChangeText={setPartyName}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                placeholder="Enter mobile number"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="Enter email address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </Card>
        </View>

        {/* Party Type Selection */}
        <View style={styles.cardArea}>
          <Card>
            <Text style={styles.sectionTitle}>Who are they?</Text>
            <View style={styles.typeRow}>
              {partyTypeOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setType(option.value)}
                  style={[
                    styles.typeOption,
                    type === option.value && styles.typeOptionActive,
                  ]}
                >
                  <View
                    style={[
                      styles.radioButton,
                      type === option.value && styles.radioButtonActive,
                    ]}
                  >
                    {type === option.value && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text style={styles.typeOptionText}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </View>

        {/* Business Info - Collapsible */}
        <View style={styles.cardArea}>
          <Card>
            <Pressable
              onPress={() =>
                setExpandedSection(
                  expandedSection === "business" ? null : "business"
                )
              }
              style={styles.sectionHeader}
            >
              <View style={styles.sectionHeaderContent}>
                <Ionicons
                  name="briefcase"
                  size={18}
                  color="#2563EB"
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionTitle}>Business Info (Optional)</Text>
              </View>
              <Ionicons
                name={
                  expandedSection === "business"
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={18}
                color="#64748B"
              />
            </Pressable>

            {expandedSection === "business" && (
              <>
                <View style={styles.expandedDivider} />
                <View style={styles.field}>
                  <Text style={styles.label}>GSTIN</Text>
                  <TextInput
                    placeholder="Optional GSTIN"
                    value={gstin}
                    onChangeText={setGstin}
                    style={styles.input}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>PAN</Text>
                  <TextInput
                    placeholder="Optional PAN"
                    value={pan}
                    onChangeText={setPan}
                    style={styles.input}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>TAN</Text>
                  <TextInput
                    placeholder="Optional TAN"
                    value={tan}
                    onChangeText={setTan}
                    style={styles.input}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>UPI ID</Text>
                  <TextInput
                    placeholder="Optional UPI"
                    value={upi}
                    onChangeText={setUpi}
                    style={styles.input}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Opening Balance</Text>
                  <TextInput
                    placeholder="Optional opening balance"
                    value={openingBalance}
                    onChangeText={setOpeningBalance}
                    style={styles.input}
                    keyboardType="decimal-pad"
                  />
                </View>
              </>
            )}
          </Card>
        </View>

        {/* Billing Address - Collapsible */}
        <View style={styles.cardArea}>
          <Card>
            <Pressable
              onPress={() =>
                setExpandedSection(
                  expandedSection === "billing" ? null : "billing"
                )
              }
              style={styles.sectionHeader}
            >
              <View style={styles.sectionHeaderContent}>
                <Ionicons
                  name="location"
                  size={18}
                  color="#2563EB"
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionTitle}>Billing Address</Text>
              </View>
              <Ionicons
                name={
                  expandedSection === "billing"
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={18}
                color="#64748B"
              />
            </Pressable>

            {expandedSection === "billing" && (
              <>
                <View style={styles.expandedDivider} />
                <View style={styles.field}>
                  <Text style={styles.label}>Address</Text>
                  <TextInput
                    placeholder="Enter address"
                    value={address}
                    onChangeText={setAddress}
                    style={[styles.input, styles.multilineInput]}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Bank Name</Text>
                  <TextInput
                    placeholder="Optional bank name"
                    value={bankName}
                    onChangeText={setBankName}
                    style={styles.input}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Bank Account Number</Text>
                  <TextInput
                    placeholder="Optional account number"
                    value={bankAccountNumber}
                    onChangeText={setBankAccountNumber}
                    style={styles.input}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Bank IFSC</Text>
                  <TextInput
                    placeholder="Optional IFSC"
                    value={bankIfsc}
                    onChangeText={setBankIfsc}
                    style={styles.input}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Bank Branch</Text>
                  <TextInput
                    placeholder="Optional branch"
                    value={bankBranch}
                    onChangeText={setBankBranch}
                    style={styles.input}
                  />
                </View>
              </>
            )}
          </Card>
        </View>

        {error ? (
          <View style={styles.cardArea}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Save Button */}
        <View style={styles.cardArea}>
          <Button
            title={loading ? "Saving..." : "Save"}
            onPress={handleSave}
            loading={loading}
            size="large"
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    paddingBottom: 24,
  },
  cardArea: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  sectionHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  sectionIcon: {
    marginRight: 4,
  },
  expandedDivider: {
    height: 1,
    backgroundColor: "#E5EAF3",
    marginBottom: 12,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    color: "#60708A",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5EAF3",
    padding: 12,
    fontSize: 13,
    color: "#0F172A",
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  typeRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  typeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5EAF3",
    backgroundColor: "#fff",
  },
  typeOptionActive: {
    backgroundColor: "#E0F2FE",
    borderColor: "#2563EB",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonActive: {
    borderColor: "#2563EB",
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
  },
});
