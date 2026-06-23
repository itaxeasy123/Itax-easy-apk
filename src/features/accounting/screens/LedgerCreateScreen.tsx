import { useMemo, useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AccountingHeader } from "../components";
import { accountingService } from "../services/accountingService";
import { billshieldUiService, AccountGroupNode } from "../services/billshieldUiService";
import { Party } from "../types/accountingTypes";
import { accountingTheme } from "../../../theme/accounting";

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

interface FlattenedGroup {
  id: string;
  name: string;
  nature: "ASSET" | "LIABILITY" | "INCOME" | "EXPENSE";
  level: number;
}

function flattenGroups(nodes: AccountGroupNode[], level = 0): FlattenedGroup[] {
  let result: FlattenedGroup[] = [];
  for (const node of nodes) {
    result.push({
      id: node.id,
      name: node.name,
      nature: node.nature as "ASSET" | "LIABILITY" | "INCOME" | "EXPENSE",
      level,
    });
    if (node.subGroups && node.subGroups.length > 0) {
      result.push(...flattenGroups(node.subGroups, level + 1));
    }
  }
  return result;
}

function getNatureColor(nature?: string) {
  switch (nature) {
    case "ASSET": return "#3B82F6";     // Blue
    case "LIABILITY": return "#EF4444"; // Red/Rose
    case "INCOME": return "#10B981";    // Emerald
    case "EXPENSE": return "#F59E0B";   // Amber
    default: return "#64748B";          // Slate
  }
}

export default function LedgerCreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();

  // Form State
  const [ledgerName, setLedgerName] = useState("");
  const [openingBalance, setOpeningBalance] = useState("0");
  const [openingBalanceType, setOpeningBalanceType] = useState<"DR" | "CR">("DR");
  
  // Selection IDs
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedPartyId, setSelectedPartyId] = useState("");

  // Loaded Data
  const [groups, setGroups] = useState<FlattenedGroup[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  
  // Loading & Modals
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [partyModalVisible, setPartyModalVisible] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");
  const [partySearch, setPartySearch] = useState("");

  // Load Groups and Parties on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        setError(null);

        // Load account groups tree
        const groupsRes = await billshieldUiService.getGroupTree();
        let flattened: FlattenedGroup[] = [];
        if (groupsRes.success && groupsRes.data) {
          flattened = flattenGroups(groupsRes.data);
          setGroups(flattened);
        } else {
          throw new Error(groupsRes.message ?? "Failed to load account groups.");
        }

        // Load remote parties (contacts)
        const partiesRes = await accountingService.getParties();
        if (partiesRes.success && partiesRes.data) {
          setParties(partiesRes.data);
        }

        // Handle initial selection based on route params if any (e.g. from cash/bank flow)
        const routeType = Array.isArray(params.type) ? params.type[0] : params.type;
        if (routeType === "cash") {
          const cashGroup = flattened.find(g => g.name === "Cash-in-Hand");
          if (cashGroup) {
            setSelectedGroupId(cashGroup.id);
            setOpeningBalanceType("DR");
          }
        } else {
          const bankGroup = flattened.find(g => g.name === "Bank Accounts");
          if (bankGroup) {
            setSelectedGroupId(bankGroup.id);
            setOpeningBalanceType("DR");
          } else if (flattened.length > 0) {
            setSelectedGroupId(flattened[0].id);
            const nature = flattened[0].nature;
            setOpeningBalanceType(nature === "ASSET" || nature === "EXPENSE" ? "DR" : "CR");
          }
        }

      } catch (err) {
        setError(getErrorMessage(err, "Unable to initialize ledger options."));
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [params.type]);

  // Derived selections
  const selectedGroup = useMemo(() => {
    return groups.find(g => g.id === selectedGroupId);
  }, [groups, selectedGroupId]);

  const selectedParty = useMemo(() => {
    return parties.find(p => p.id === selectedPartyId);
  }, [parties, selectedPartyId]);

  // Lock status: Suppliers MUST belong to Sundry Creditors
  const isGroupLocked = useMemo(() => {
    return selectedParty?.type === "supplier";
  }, [selectedParty]);

  // Filters
  const filteredGroups = useMemo(() => {
    const q = groupSearch.toLowerCase().trim();
    if (!q) return groups;
    return groups.filter(g => g.name.toLowerCase().includes(q));
  }, [groups, groupSearch]);

  const filteredParties = useMemo(() => {
    const q = partySearch.toLowerCase().trim();
    const base = parties;
    if (!q) return base;
    return base.filter(p => p.partyName.toLowerCase().includes(q));
  }, [parties, partySearch]);

  // Handle Select actions
  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    const grp = groups.find(g => g.id === groupId);
    if (grp) {
      // Set smart DR/CR default based on Nature
      setOpeningBalanceType(grp.nature === "ASSET" || grp.nature === "EXPENSE" ? "DR" : "CR");
    }
  };

  const handleSelectParty = (partyId: string) => {
    setSelectedPartyId(partyId);
    if (!partyId) return;

    const party = parties.find(p => p.id === partyId);
    if (party) {
      if (party.type === "customer") {
        // Suggest Sundry Debtors
        const debtorsGroup = groups.find(g => g.name === "Sundry Debtors");
        if (debtorsGroup) {
          setSelectedGroupId(debtorsGroup.id);
          setOpeningBalanceType("DR");
        }
      } else if (party.type === "supplier") {
        // Lock to Sundry Creditors
        const creditorsGroup = groups.find(g => g.name === "Sundry Creditors");
        if (creditorsGroup) {
          setSelectedGroupId(creditorsGroup.id);
          setOpeningBalanceType("CR");
        }
      }
    }
  };

  async function handleSave() {
    if (loading || saving) return;
    const amount = Number(openingBalance || "0");

    if (!ledgerName.trim()) {
      setError("Ledger name is required.");
      return;
    }
    if (Number.isNaN(amount)) {
      setError("Opening balance must be a number.");
      return;
    }
    if (!selectedGroupId) {
      setError("Please select an Account Group.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await accountingService.createLedger({
        ledgerName: ledgerName.trim(),
        groupId: selectedGroupId,
        partyId: selectedPartyId || undefined,
        openingBalance: amount,
        openingBalanceType,
      });

      router.navigate("/accounting/ledgers");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to create ledger. Try again."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading ledger setup...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="New Ledger"
        showBackButton
        rightContent={
          saving ? (
            <ActivityIndicator size="small" color={accountingTheme.colors.card} />
          ) : (
            <Pressable onPress={handleSave}>
              <Text style={styles.headerSave}>Save</Text>
            </Pressable>
          )
        }
      />

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: 110 + Math.max(insets.bottom, 0) }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Ledger Name */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ledger Name</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="document-text-outline" size={18} color={accountingTheme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              value={ledgerName}
              onChangeText={setLedgerName}
              placeholder="e.g. Sales Account, Rent Expenses"
              placeholderTextColor={accountingTheme.colors.textMuted}
              style={styles.input}
            />
          </View>
        </View>

        {/* Link to Party / Contact (Optional) */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.sectionLabel}>Party / Contact (Optional)</Text>
            {selectedParty && (
              <View style={[styles.inlineBadge, { backgroundColor: selectedParty.type === "customer" ? "#EFF6FF" : "#ECFDF5" }]}>
                <Text style={[styles.inlineBadgeText, { color: selectedParty.type === "customer" ? "#2563EB" : "#059669" }]}>
                  {selectedParty.type.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Pressable
            onPress={() => setPartyModalVisible(true)}
            style={styles.pickerTrigger}
          >
            <View style={styles.pickerTriggerLeft}>
              <Ionicons
                name="person-circle-outline"
                size={22}
                color={selectedParty ? "#3B82F6" : accountingTheme.colors.textMuted}
              />
              <Text style={styles.pickerTriggerText}>
                {selectedParty ? selectedParty.partyName : "None (General Ledger)"}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={18} color={accountingTheme.colors.textMuted} />
          </Pressable>
          <Text style={styles.helperText}>
            Linking a party allows automated ledger allocation during invoicing.
          </Text>
        </View>

        {/* Account Group */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account Group (Tally System)</Text>
          <Pressable
            onPress={() => {
              if (isGroupLocked) {
                Alert.alert("Locked Group", "This ledger must sit under 'Sundry Creditors' because the linked contact is a Supplier.");
                return;
              }
              setGroupModalVisible(true);
            }}
            style={[styles.pickerTrigger, isGroupLocked && styles.pickerTriggerDisabled]}
          >
            <View style={styles.pickerTriggerLeft}>
              <View style={[styles.natureDot, { backgroundColor: getNatureColor(selectedGroup?.nature) }]} />
              <View>
                <Text style={styles.pickerTriggerText}>
                  {selectedGroup ? selectedGroup.name : "Select Group"}
                </Text>
                {selectedGroup && (
                  <Text style={styles.pickerSubText}>
                    Section: {selectedGroup.nature}
                  </Text>
                )}
              </View>
            </View>
            {isGroupLocked ? (
              <Ionicons name="lock-closed" size={16} color={accountingTheme.colors.textMuted} />
            ) : (
              <Ionicons name="chevron-down" size={18} color={accountingTheme.colors.textMuted} />
            )}
          </Pressable>
          {isGroupLocked && (
            <Text style={[styles.helperText, { color: "#EF4444", fontWeight: "600" }]}>
              Locked to Sundry Creditors since contact is a Supplier.
            </Text>
          )}
        </View>

        {/* Opening Balance */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Opening Balance</Text>
          <View style={styles.balanceRow}>
            <View style={[styles.inputWrap, { flex: 1 }]}>
              <Text style={styles.currencySign}>₹</Text>
              <TextInput
                value={openingBalance}
                onChangeText={(text) => setOpeningBalance(text.replace(/[^0-9.]/g, ""))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={accountingTheme.colors.textMuted}
                style={[styles.input, { marginLeft: accountingTheme.spacing.sm }]}
              />
            </View>
            
            <View style={styles.drCrContainer}>
              <Pressable
                onPress={() => setOpeningBalanceType("DR")}
                style={[
                  styles.drCrBtn,
                  openingBalanceType === "DR" && styles.drBtnActive,
                ]}
              >
                <Text style={[styles.drCrText, openingBalanceType === "DR" && styles.drCrTextActive]}>
                  DR
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setOpeningBalanceType("CR")}
                style={[
                  styles.drCrBtn,
                  openingBalanceType === "CR" && styles.crBtnActive,
                ]}
              >
                <Text style={[styles.drCrText, openingBalanceType === "CR" && styles.drCrTextActive]}>
                  CR
                </Text>
              </Pressable>
            </View>
          </View>
          {selectedGroup && (
            <Text style={styles.helperText}>
              Smart suggested default for {selectedGroup.name} ({selectedGroup.nature}) is{" "}
              <Text style={{ fontWeight: "700", color: getNatureColor(selectedGroup.nature) }}>
                {selectedGroup.nature === "ASSET" || selectedGroup.nature === "EXPENSE" ? "DR" : "CR"}
              </Text>.
            </Text>
          )}
        </View>

        {/* Selected Summary Card */}
        {selectedGroup && (
          <View style={[styles.summaryCard, { borderColor: getNatureColor(selectedGroup.nature) + "40" }]}>
            <Ionicons name="journal" size={20} color={getNatureColor(selectedGroup.nature)} />
            <Text style={styles.summaryText}>
              This ledger records{" "}
              <Text style={{ fontWeight: "700" }}>{selectedGroup.nature.toLowerCase()}s</Text>. It will be reported under the{" "}
              <Text style={{ fontWeight: "700" }}>
                {selectedGroup.nature === "ASSET" || selectedGroup.nature === "LIABILITY" ? "Balance Sheet" : "P&L"}
              </Text>.
            </Text>
          </View>
        )}

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={accountingTheme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Bottom Save Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={accountingTheme.colors.card} />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color={accountingTheme.colors.card} />
              <Text style={styles.saveBtnText}>Create Ledger</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Group Picker Modal */}
      <Modal visible={groupModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Account Group</Text>
              <Pressable onPress={() => setGroupModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={accountingTheme.colors.text} />
              </Pressable>
            </View>
            <View style={styles.modalSearchWrap}>
              <Ionicons name="search" size={18} color={accountingTheme.colors.textMuted} />
              <TextInput
                value={groupSearch}
                onChangeText={setGroupSearch}
                placeholder="Search groups..."
                placeholderTextColor={accountingTheme.colors.textMuted}
                style={styles.modalSearchInput}
              />
              {groupSearch ? (
                <Pressable onPress={() => setGroupSearch("")}>
                  <Ionicons name="close-circle" size={18} color={accountingTheme.colors.textMuted} />
                </Pressable>
              ) : null}
            </View>
            <FlatList
              data={filteredGroups}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.modalList}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedGroupId;
                return (
                  <Pressable
                    onPress={() => {
                      handleSelectGroup(item.id);
                      setGroupModalVisible(false);
                      setGroupSearch("");
                    }}
                    style={[
                      styles.groupItemRow,
                      { paddingLeft: 16 + item.level * 16 },
                      isSelected && styles.groupItemRowSelected,
                    ]}
                  >
                    <View style={styles.groupItemLeft}>
                      {item.level > 0 && (
                        <Ionicons
                          name="return-down-forward"
                          size={14}
                          color={accountingTheme.colors.textMuted}
                          style={{ marginRight: 6 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.groupItemName,
                          isSelected && styles.groupItemNameSelected,
                          { fontWeight: item.level === 0 ? "700" : "500" },
                        ]}
                      >
                        {item.name}
                      </Text>
                    </View>
                    <View style={[styles.natureBadge, { backgroundColor: getNatureColor(item.nature) }]}>
                      <Text style={styles.natureBadgeText}>{item.nature}</Text>
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Party Picker Modal */}
      <Modal visible={partyModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Link Party / Contact</Text>
              <Pressable onPress={() => setPartyModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={accountingTheme.colors.text} />
              </Pressable>
            </View>
            <View style={styles.modalSearchWrap}>
              <Ionicons name="search" size={18} color={accountingTheme.colors.textMuted} />
              <TextInput
                value={partySearch}
                onChangeText={setPartySearch}
                placeholder="Search contacts..."
                placeholderTextColor={accountingTheme.colors.textMuted}
                style={styles.modalSearchInput}
              />
              {partySearch ? (
                <Pressable onPress={() => setPartySearch("")}>
                  <Ionicons name="close-circle" size={18} color={accountingTheme.colors.textMuted} />
                </Pressable>
              ) : null}
            </View>
            <FlatList
              data={[null, ...filteredParties]} // null represents "None (General Ledger)"
              keyExtractor={(item, index) => item?.id ?? `none-${index}`}
              contentContainerStyle={styles.modalList}
              renderItem={({ item }) => {
                if (item === null) {
                  const isSelected = selectedPartyId === "";
                  return (
                    <Pressable
                      onPress={() => {
                        handleSelectParty("");
                        setPartyModalVisible(false);
                        setPartySearch("");
                      }}
                      style={[styles.partyItemRow, isSelected && styles.partyItemRowSelected]}
                    >
                      <View style={styles.partyItemLeft}>
                        <View style={[styles.partyAvatar, { backgroundColor: "#64748B" }]}>
                          <Ionicons name="close" size={16} color="#FFFFFF" />
                        </View>
                        <Text style={[styles.partyItemName, isSelected && styles.partyItemNameSelected]}>
                          None (General Ledger)
                        </Text>
                      </View>
                    </Pressable>
                  );
                }

                const isSelected = item.id === selectedPartyId;
                const initial = item.partyName?.trim()?.[0]?.toUpperCase() ?? "P";
                const avatarBg = item.type === "customer" ? "#3B82F6" : "#10B981";

                return (
                  <Pressable
                    onPress={() => {
                      handleSelectParty(item.id);
                      setPartyModalVisible(false);
                      setPartySearch("");
                    }}
                    style={[styles.partyItemRow, isSelected && styles.partyItemRowSelected]}
                  >
                    <View style={styles.partyItemLeft}>
                      <View style={[styles.partyAvatar, { backgroundColor: avatarBg }]}>
                        <Text style={styles.partyAvatarText}>{initial}</Text>
                      </View>
                      <View>
                        <Text style={[styles.partyItemName, isSelected && styles.partyItemNameSelected]}>
                          {item.partyName}
                        </Text>
                        {(item.phone || item.email) ? (
                          <Text style={styles.partyItemSub}>{item.phone ?? item.email}</Text>
                        ) : null}
                      </View>
                    </View>
                    <View style={[styles.inlineBadge, { backgroundColor: item.type === "customer" ? "#EFF6FF" : "#ECFDF5" }]}>
                      <Text style={[styles.inlineBadgeText, { color: item.type === "customer" ? "#2563EB" : "#059669" }]}>
                        {item.type.toUpperCase()}
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  loadingText: { marginTop: 12, fontSize: 15, color: "#64748B", fontWeight: "500" },
  headerSave: { color: accountingTheme.colors.card, fontWeight: "700", fontSize: 16 },
  content: { padding: 18 },
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  helperText: { fontSize: 11, color: "#64748B", marginTop: 6, lineHeight: 15 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: accountingTheme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: { marginRight: 10 },
  currencySign: { fontSize: 18, color: "#475569", fontWeight: "600" },
  input: { flex: 1, fontSize: 15, color: accountingTheme.colors.text },
  
  pickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: accountingTheme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 52,
  },
  pickerTriggerDisabled: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
  },
  pickerTriggerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  pickerTriggerText: {
    fontSize: 15,
    fontWeight: "600",
    color: accountingTheme.colors.text,
  },
  pickerSubText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  natureDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  inlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  inlineBadgeText: {
    fontSize: 9,
    fontWeight: "800",
  },
  balanceRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  drCrContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 3,
    height: 50,
    alignItems: "center",
  },
  drCrBtn: {
    paddingHorizontal: 14,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9,
  },
  drBtnActive: {
    backgroundColor: "#3B82F6",
  },
  crBtnActive: {
    backgroundColor: "#10B981",
  },
  drCrText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  drCrTextActive: {
    color: "#FFFFFF",
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: accountingTheme.colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  summaryText: { fontSize: 13, color: "#475569", flex: 1, lineHeight: 18 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  errorText: { color: "#EF4444", fontSize: 13, flex: 1 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: accountingTheme.colors.card,
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  saveBtn: {
    backgroundColor: "#3B82F6",
    borderRadius: 14,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: accountingTheme.colors.card, fontSize: 15, fontWeight: "700" },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: accountingTheme.colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "75%",
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: accountingTheme.colors.text,
  },
  modalCloseBtn: { padding: 4 },
  modalSearchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
    height: 42,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: accountingTheme.colors.text,
    marginLeft: 8,
  },
  modalList: { paddingHorizontal: 16, paddingBottom: 40 },
  
  // Group List Item
  groupItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  groupItemRowSelected: {
    backgroundColor: "#F1F5F9",
  },
  groupItemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  groupItemName: { fontSize: 14, color: "#1E293B" },
  groupItemNameSelected: { color: "#3B82F6", fontWeight: "700" },
  natureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  natureBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  // Party List Item
  partyItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  partyItemRowSelected: {
    backgroundColor: "#F1F5F9",
  },
  partyItemLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  partyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  partyAvatarText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
  partyItemName: { fontSize: 14, fontWeight: "600", color: "#1E293B" },
  partyItemNameSelected: { color: "#3B82F6" },
  partyItemSub: { fontSize: 11, color: "#64748B", marginTop: 2 },
});

