
import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AccountingHeader, Button, Card } from "../components";
import { accountingService } from "../services/accountingService";
import { PartyType } from "../types/accountingTypes";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { accountingTheme } from "../../../theme/accounting";

const partyTypeOptions: { label: string; value: PartyType }[] = [
  { label: "Customer", value: "customer" },
  { label: "Supplier", value: "supplier" },
]; 

export default function PartyCreateScreen() {
  const insets = useSafeAreaInsets();
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

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
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
                  color={accountingTheme.colors.primary}
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
                color={accountingTheme.colors.textSecondary}
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
                  color={accountingTheme.colors.primary}
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
                color={accountingTheme.colors.textSecondary}
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

      </ScrollView>

      {/* Fixed Footer with Save Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 0) + 16 }]}>
        <Button
          title={loading ? "Saving..." : "Save"}
          onPress={handleSave}
          loading={loading}
          size="large"
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    paddingBottom: accountingTheme.spacing.xxl,
  },
  cardArea: {
    paddingHorizontal: accountingTheme.spacing.md,
    paddingVertical: 6,
  },
  sectionTitle: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: accountingTheme.spacing.sm,
  },
  sectionHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.sm,
    flex: 1,
  },
  sectionIcon: {
    marginRight: accountingTheme.spacing.xs,
  },
  expandedDivider: {
    height: 1,
    backgroundColor: "#E5EAF3",
    marginBottom: accountingTheme.spacing.sm,
  },
  field: {
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    color: "#60708A",
    marginBottom: accountingTheme.spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  input: {
    backgroundColor: accountingTheme.colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5EAF3",
    padding: 10,
    fontSize: accountingTheme.fontSizes.md,
    color: accountingTheme.colors.text,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  typeRow: {
    flexDirection: "row",
    gap: accountingTheme.spacing.sm,
    marginTop: 6,
  },
  typeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5EAF3",
    backgroundColor: accountingTheme.colors.card,
  },
  typeOptionActive: {
    backgroundColor: "#E0F2FE",
    borderColor: accountingTheme.colors.primary,
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonActive: {
    borderColor: accountingTheme.colors.primary,
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: accountingTheme.colors.primary,
  },
  typeOptionText: {
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: accountingTheme.colors.text,
  },
  errorText: {
    color: accountingTheme.colors.error,
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.semiBold,
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
});
