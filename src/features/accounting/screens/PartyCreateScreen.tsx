import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert, FlatList, ActivityIndicator, Modal, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AccountingHeader, Button, Card } from "../components";
import { accountingService } from "../services/accountingService";
import { PartyType } from "../types/accountingTypes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { accountingTheme } from "../../../theme/accounting";

// Safely require expo-contacts to prevent app crashes in environments without the native module
let Contacts: any = null;
let isContactsAvailable = false;
try {
  Contacts = require("expo-contacts");
  isContactsAvailable = !!Contacts && typeof Contacts.requestPermissionsAsync === "function";
} catch (e) {
  console.warn("expo-contacts is not compiled/available in this build:", e);
}

const partyTypeOptions: { label: string; value: PartyType }[] = [
  { label: "Customer", value: "customer" },
  { label: "Supplier", value: "supplier" },
];

const AVATAR_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#8B5CF6", // Violet
  "#EF4444", // Red
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#14B8A6", // Teal
];

const getAvatarBg = (name: string) => {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

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

  // Contacts states
  const [contacts, setContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);

  const handleImportContact = () => {
    if (!isContactsAvailable || !Contacts) {
      Alert.alert(
        "Build Update Required",
        "The native Contacts module is not yet compiled in your current app development build.\n\nPlease rebuild your app (e.g. run 'npx expo run:android' or 'npm run android') to bundle this new native feature."
      );
      return;
    }

    Alert.alert(
      "Allow Contacts Access?",
      "Would you like to connect with your contacts to easily import client details?",
      [
        {
          text: "Disallow",
          style: "cancel"
        },
        {
          text: "Allow",
          onPress: async () => {
            try {
              setContactsLoading(true);
              const { status } = await Contacts.requestPermissionsAsync();
              if (status !== "granted") {
                Alert.alert(
                  "Permission Denied",
                  "Contacts permission is required to import details. Please enable contact permissions in your device settings."
                );
                return;
              }

              const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
              });

              if (data && data.length > 0) {
                // Sort contacts alphabetically by name
                const sorted = data.sort((a: any, b: any) => {
                  const nameA = a.name || "";
                  const nameB = b.name || "";
                  return nameA.localeCompare(nameB);
                });
                setContacts(sorted);
                setFilteredContacts(sorted);
                setSearchQuery("");
                setContactsModalVisible(true);
              } else {
                Alert.alert("No Contacts", "No contacts found on your device.");
              }
            } catch (err) {
              console.error("Error loading contacts:", err);
              Alert.alert("Error", "Could not load contacts from your device.");
            } finally {
              setContactsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSearchContacts = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredContacts(contacts);
      return;
    }
    const query = text.toLowerCase();
    const filtered = contacts.filter((c: any) => {
      const nameMatch = c.name?.toLowerCase().includes(query);
      const phoneMatch = c.phoneNumbers?.some((p: any) => p.number?.includes(query));
      const emailMatch = c.emails?.some((e: any) => e.email?.toLowerCase().includes(query));
      return nameMatch || phoneMatch || emailMatch;
    });
    setFilteredContacts(filtered);
  };

  const handleSelectContact = (contact: any) => {
    if (contact.name) {
      setPartyName(contact.name);
    }

    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      // Clean up number (remove spaces, hyphens, and parentheses)
      const rawNum = contact.phoneNumbers[0].number || "";
      const cleanedNum = rawNum.replace(/[\s\-()]/g, "");
      setPhone(cleanedNum);
    } else {
      setPhone("");
    }

    if (contact.emails && contact.emails.length > 0) {
      setEmail(contact.emails[0].email || "");
    } else {
      setEmail("");
    }

    setContactsModalVisible(false);
  };

  async function handleSave() {
    const trimmedName = partyName.trim();

    if (!trimmedName) {
      setError("Party name is required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await accountingService.createParty({
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

      // Auto-create a ledger linked to this party so invoices post to its own
      // account. Best-effort: don't fail party creation if the local ledger
      // engine is unavailable (e.g. on web).
      const createdParty = result.data;
      if (createdParty?.id) {
        try {
          await accountingService.ensurePartyLedger({
            id: createdParty.id,
            partyName: trimmedName,
            type,
          });
        } catch (ledgerError) {
          console.warn("Could not create ledger for party:", ledgerError);
        }
      }

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
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Basic Details</Text>
              <Pressable
                onPress={handleImportContact}
                style={styles.importBtn}
                disabled={contactsLoading}
              >
                {contactsLoading ? (
                  <ActivityIndicator size="small" color={accountingTheme.colors.primary} />
                ) : (
                  <>
                    <Ionicons name="people" size={16} color={accountingTheme.colors.primary} />
                    <Text style={styles.importBtnText}>From Contacts</Text>
                  </>
                )}
              </Pressable>
            </View>

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
              <Text style={styles.label}>Mobile Number (Optional)</Text>
              <TextInput
                placeholder="Enter mobile number"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email (Optional)</Text>
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

      {/* Contacts Picker Modal */}
      <Modal visible={contactsModalVisible} animationType="slide" onRequestClose={() => setContactsModalVisible(false)}>
        <View style={[styles.modalContainer, { paddingTop: Math.max(insets.top, 16) }]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setContactsModalVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#334155" />
            </Pressable>
            <Text style={styles.modalTitle}>Import Contact</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              placeholder="Search by name, number, or email..."
              value={searchQuery}
              onChangeText={handleSearchContacts}
              style={styles.searchBarInput}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => handleSearchContacts("")}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </Pressable>
            )}
          </View>

          {/* Contacts List */}
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id || ""}
            renderItem={({ item }) => {
              const firstLetter = (item.name || "?").charAt(0).toUpperCase();
              const avatarBg = getAvatarBg(item.name || "?");
              const primaryPhone = item.phoneNumbers?.[0]?.number;
              const primaryEmail = item.emails?.[0]?.email;

              return (
                <Pressable onPress={() => handleSelectContact(item)} style={styles.contactRow}>
                  <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                    <Text style={styles.avatarText}>{firstLetter}</Text>
                  </View>
                  <View style={styles.contactDetails}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    {(primaryPhone || primaryEmail) && (
                      <Text style={styles.contactSub} numberOfLines={1}>
                        {primaryPhone || ""}{primaryPhone && primaryEmail ? " • " : ""}{primaryEmail || ""}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                </Pressable>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyText}>No matching contacts found</Text>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </Modal>
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
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
  },
  importBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  importBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: accountingTheme.colors.primary,
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  closeBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },
  listContent: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  contactSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
    fontWeight: "500",
  },
});
