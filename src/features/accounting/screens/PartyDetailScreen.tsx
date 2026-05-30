import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { AccountingHeader, Button, Card, EmptyState, Loading } from "../components";
import { accountingService } from "../services/accountingService";
import { Ledger, Party, PartyType } from "../types/accountingTypes";
import { accountingTheme } from "../../../theme/accounting";

const partyTypeOptions: { label: string; value: PartyType }[] = [
  { label: "Customer", value: "customer" },
  { label: "Supplier", value: "supplier" },
];

const formatCurrency = (value: number) =>
  `Rs ${Math.abs(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

export default function PartyDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const partyId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [party, setParty] = useState<Party | null>(null);
  const [partyName, setPartyName] = useState("");
  const [type, setType] = useState<PartyType>("customer");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [tan, setTan] = useState("");
  const [upi, setUpi] = useState("");
  const [address, setAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [selectedTab, setSelectedTab] = useState<"all" | "paid" | "unpaid">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState("Amount (Low-High)");

  useEffect(() => {
    if (!partyId) {
      setError("Missing party id.");
      setLoading(false);
      return;
    }

    async function loadParty() {
      try {
        setLoading(true);
        const result = await accountingService.getPartyById(partyId);
        const currentParty = result.data ?? null;
        if (currentParty) {
          setParty(currentParty);
          setPartyName(currentParty.partyName);
          setType(currentParty.type);
          setPhone(currentParty.phone ?? "");
          setEmail(currentParty.email ?? "");
          setGstin(currentParty.gstin ?? "");
          setPan(currentParty.pan ?? "");
          setTan(currentParty.tan ?? "");
          setUpi(currentParty.upi ?? "");
          setAddress(currentParty.address ?? "");
          setBankName(currentParty.bankName ?? "");
          setBankAccountNumber(currentParty.bankAccountNumber ?? "");
          setBankIfsc(currentParty.bankIfsc ?? "");
          setBankBranch(currentParty.bankBranch ?? "");
        } else {
          setError("Party not found.");
        }
      } catch {
        setError("Unable to load party details.");
      } finally {
        setLoading(false);
      }
    }

    loadParty();
  }, [partyId]);

  const balance = useMemo(
    () => (party?.ledgers ?? []).reduce((sum, ledger) => sum + Number(ledger.balance || 0), 0),
    [party]
  );

  const linkedLedgers = party?.ledgers ?? [];
  const isCustomer = type === "customer";

  async function handleSave() {
    if (!partyId) {
      setError("Missing party id.");
      return;
    }

    if (!partyName.trim()) {
      setError("Party name is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const result = await accountingService.updateParty(partyId, {
        partyName: partyName.trim(),
        type,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        gstin: gstin.trim() || undefined,
        pan: pan.trim() || undefined,
        tan: tan.trim() || undefined,
        upi: upi.trim() || undefined,
        address: address.trim() || undefined,
        bankName: bankName.trim() || undefined,
        bankAccountNumber: bankAccountNumber.trim() || undefined,
        bankIfsc: bankIfsc.trim() || undefined,
        bankBranch: bankBranch.trim() || undefined,
      });
      setParty(result.data ?? party);
      setIsEditing(false);
    } catch {
      setError("Unable to save party. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!partyId) {
      setError("Missing party id.");
      return;
    }

    Alert.alert("Delete Party", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setSaving(true);
            await accountingService.deleteParty(partyId);
            router.replace("/accounting/parties");
          } catch {
            setError("Unable to delete party. Try again.");
            setSaving(false);
          }
        },
      },
    ]);
  }

  const onContactPress = (kind: "call" | "whatsapp" | "email") => {
    if (!party) return;

    if (kind === "call" && party.phone) {
      void Linking.openURL(`tel:${party.phone}`);
      return;
    }

    if (kind === "whatsapp" && party.phone) {
      void Linking.openURL(`https://wa.me/${party.phone.replace(/\D/g, "")}`);
      return;
    }

    if (kind === "email" && party.email) {
      void Linking.openURL(`mailto:${party.email}`);
    }
  };

  const handleMoreOptions = () => {
    setShowActionModal(true);
  };

  // ── Filter + Sort ────────────────────────────────────────────────────────
  const displayedLedgers = useMemo(() => {
    const ledgers = party?.ledgers ?? [];

    // 1. Tab filter
    const filtered = ledgers.filter((l: Ledger) => {
      const isUnpaid = Number(l.balance || 0) > 0;
      if (selectedTab === "paid") return !isUnpaid;
      if (selectedTab === "unpaid") return isUnpaid;
      return true; // "all"
    });

    // 2. Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case "Amount (High-Low)":
        sorted.sort((a, b) => Number(b.balance || 0) - Number(a.balance || 0));
        break;
      case "Amount (Low-High)":
        sorted.sort((a, b) => Number(a.balance || 0) - Number(b.balance || 0));
        break;
      case "Most recent":
        sorted.sort((a, b) => {
          const ay = `${a.year ?? 0}-${String(a.month ?? 0).padStart(2, "0")}`;
          const by = `${b.year ?? 0}-${String(b.month ?? 0).padStart(2, "0")}`;
          return by.localeCompare(ay);
        });
        break;
      case "By Name (A-Z)":
        sorted.sort((a, b) => (a.ledgerName ?? "").localeCompare(b.ledgerName ?? ""));
        break;
      case "By Name (Z-A)":
        sorted.sort((a, b) => (b.ledgerName ?? "").localeCompare(a.ledgerName ?? ""));
        break;
      default:
        break;
    }
    return sorted;
  }, [party, selectedTab, sortBy]);

  // ── PDF Generation (A4) ──────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    setShowActionModal(false);
    if (!party) return;

    const rows = displayedLedgers
      .map((l: Ledger) => {
        const isUnpaid = Number(l.balance || 0) > 0;
        const status = isUnpaid ? "Unpaid" : "Paid";
        const statusColor = isUnpaid ? accountingTheme.colors.error : "#16A34A";
        const period = `${l.year ?? "-"}/${String(l.month ?? "-")}`;
        const amt = `Rs ${Math.abs(Number(l.balance || 0)).toLocaleString("en-IN")}`;
        return `
          <tr>
            <td>#${l.ledgerName ?? "-"}</td>
            <td>${period}</td>
            <td style="color:${statusColor};font-weight:700">${status}</td>
            <td style="text-align:right;font-weight:700">${amt}</td>
          </tr>`;
      })
      .join("");

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 20mm 15mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11pt; color: #1E293B; }
  .header { background: #1E3A5F; color: #fff; padding: 20px 24px; border-radius: 6px 6px 0 0; }
  .header h1 { font-size: 20pt; font-weight: 800; }
  .header p  { font-size: 10pt; margin-top: 4px; opacity: 0.85; }
  .meta { display: flex; gap: 32px; padding: 16px 24px; background: #F8FAFC; border: 1px solid #E2E8F0; }
  .meta-item label { font-size: 9pt; color: #64748B; display: block; }
  .meta-item span  { font-size: 11pt; font-weight: 700; }
  .balance-box { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 6px;
                 padding: 12px 24px; margin: 16px 0; display:flex; justify-content:space-between; align-items:center; }
  .balance-box .lbl { font-size: 10pt; color: #1E40AF; }
  .balance-box .val { font-size: 16pt; font-weight: 800; color: #1E40AF; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  thead th { background: #1E3A5F; color: #fff; padding: 10px 12px; font-size: 10pt; text-align: left; }
  thead th:last-child { text-align: right; }
  tbody tr:nth-child(even) { background: #F8FAFC; }
  tbody td { padding: 10px 12px; font-size: 10pt; border-bottom: 1px solid #E2E8F0; vertical-align: middle; }
  .footer { margin-top: 24px; font-size: 9pt; color: #94A3B8; text-align: center; }
  .filter-note { font-size: 9pt; color: #64748B; margin-bottom: 8px; }
</style>
</head>
<body>
  <div class="header">
    <h1>${party.partyName}</h1>
    <p>${isCustomer ? "Customer" : "Supplier"} Details Report &nbsp;|&nbsp; Generated ${new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</p>
  </div>

  <div class="meta">
    <div class="meta-item"><label>Phone</label><span>${party.phone ?? "—"}</span></div>
    <div class="meta-item"><label>Email</label><span>${party.email ?? "—"}</span></div>
    <div class="meta-item"><label>GSTIN</label><span>${party.gstin ?? "—"}</span></div>
    <div class="meta-item"><label>PAN</label><span>${party.pan ?? "—"}</span></div>
  </div>

  <div class="balance-box">
    <span class="lbl">${isCustomer ? "Total Receivables" : "Total Payables"}</span>
    <span class="val">Rs ${Math.abs(balance).toLocaleString("en-IN")}</span>
  </div>

  <p class="filter-note">Filter: <strong>${selectedTab.toUpperCase()}</strong> &nbsp;|&nbsp; Sort: <strong>${sortBy}</strong> &nbsp;|&nbsp; Records: <strong>${displayedLedgers.length}</strong></p>

  <table>
    <thead>
      <tr>
        <th>Ledger / Invoice</th>
        <th>Period</th>
        <th>Status</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rows || "<tr><td colspan='4' style='text-align:center;padding:24px;color:#94A3B8'>No records found</td></tr>"}
    </tbody>
  </table>

  <div class="footer">This report was generated by iTaxEasy &bull; Confidential</div>
</body>
</html>`;

    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Save or Share PDF" });
      } else {
        Alert.alert("PDF Ready", `Saved to: ${uri}`);
      }
    } catch {
      Alert.alert("Error", "Could not generate PDF. Please try again.");
    }
  };

  // ── CSV Download ─────────────────────────────────────────────────────────
  const handleDownloadCSV = async () => {
    setShowActionModal(false);
    if (!party) return;
    const header = "Ledger,Period,Status,Amount\n";
    const rows = displayedLedgers
      .map((l: Ledger) => {
        const isUnpaid = Number(l.balance || 0) > 0;
        return `${l.ledgerName ?? ""},${l.year ?? ""}/${l.month ?? ""},${isUnpaid ? "Unpaid" : "Paid"},${Math.abs(Number(l.balance || 0))}`;
      })
      .join("\n");
    const csv = header + rows;
    try {
      const FileSystem = await import("expo-file-system/legacy");
      const path = `${FileSystem.documentDirectory}${party.partyName.replace(/\s+/g, "_")}_export.csv`;
      await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: "text/csv", dialogTitle: "Save or Share CSV" });
      } else {
        Alert.alert("CSV Ready", `Saved to: ${path}`);
      }
    } catch {
      Alert.alert("Error", "Could not generate CSV. Please try again.");
    }
  };

  const handleDownload = (format: string) => {
    setShowActionModal(false);
    Alert.alert("Coming Soon", `${format} download will be available soon.`);
  };

  if (loading) {
    return <Loading text="Loading party..." fullScreen />;
  }

  if (!partyId || error || !party) {
    return (
      <View style={styles.container}>
        <AccountingHeader title="Customer Details" subtitle="View and edit party information." />
        <View style={styles.formArea}>
          <Card>
            <EmptyState
              icon="alert-circle"
              title="Unable to open party"
              description={error ?? "Party not found."}
            />
          </Card>
        </View>
      </View>
    );
  }

  if (isEditing) {
    return (
      <View style={styles.container}>
        <AccountingHeader
          title="Edit Party"
          showBackButton
          onBackPress={() => setIsEditing(false)}
        />
        <ScrollView contentContainerStyle={styles.formArea} showsVerticalScrollIndicator={false}>
          <Card>
            <Text style={styles.sectionCardTitle}>Edit Information</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Party Name</Text>
              <TextInput value={partyName} onChangeText={setPartyName} style={styles.input} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Phone</Text>
              <TextInput value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>GSTIN</Text>
              <TextInput value={gstin} onChangeText={setGstin} style={styles.input} autoCapitalize="characters" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>PAN</Text>
              <TextInput value={pan} onChangeText={setPan} style={styles.input} autoCapitalize="characters" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>TAN</Text>
              <TextInput value={tan} onChangeText={setTan} style={styles.input} autoCapitalize="characters" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>UPI</Text>
              <TextInput value={upi} onChangeText={setUpi} style={styles.input} autoCapitalize="none" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Address</Text>
              <TextInput value={address} onChangeText={setAddress} style={styles.input} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Bank Name</Text>
              <TextInput value={bankName} onChangeText={setBankName} style={styles.input} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Bank Account Number</Text>
              <TextInput value={bankAccountNumber} onChangeText={setBankAccountNumber} style={styles.input} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Bank IFSC</Text>
              <TextInput value={bankIfsc} onChangeText={setBankIfsc} style={styles.input} autoCapitalize="characters" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Bank Branch</Text>
              <TextInput value={bankBranch} onChangeText={setBankBranch} style={styles.input} />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Button title={saving ? "Saving..." : "Save Changes"} onPress={handleSave} loading={saving} />
            <View style={styles.deleteWrap}>
              <Button title="Cancel" onPress={() => setIsEditing(false)} variant="secondary" />
            </View>
          </Card>
        </ScrollView>
      </View>
    );
  }

  const initial = party.partyName?.trim()?.[0]?.toUpperCase() ?? "P";

  return (
    <View style={styles.container}>
      <AccountingHeader
        title={isCustomer ? "Customer Details" : "Supplier Details"}
        showBackButton
        rightContent={
          <View style={styles.headerRightIcons}>
            <Ionicons name="search" size={20} color={accountingTheme.colors.card} />
            <Pressable onPress={() => setShowSortModal(true)}>
              <Ionicons name="filter" size={20} color={accountingTheme.colors.card} />
            </Pressable>
          </View>
        }
        headerContent={
          <View style={styles.headerProfileArea}>
            <View style={styles.profileRow}>
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>{initial}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{party.partyName}</Text>
                <Text style={styles.profileBalance}>
                  {formatCurrency(balance)}{" "}
                  <Text style={styles.profileBalanceLabel}>
                    ({isCustomer ? "Receivables" : "Payables"})
                  </Text>
                </Text>
              </View>
            </View>

            <View style={styles.headerActionRow}>
              <Pressable style={styles.headerActionBtn} onPress={() => onContactPress("whatsapp")}>
                <Ionicons name="logo-whatsapp" size={20} color={accountingTheme.colors.card} />
                <Text style={styles.headerActionText}>WhatsApp</Text>
              </Pressable>
              <Pressable style={styles.headerActionBtn} onPress={() => onContactPress("call")}>
                <Ionicons name="call" size={20} color={accountingTheme.colors.card} />
                <Text style={styles.headerActionText}>Call</Text>
              </Pressable>
              <Pressable style={styles.headerActionBtn} onPress={() => onContactPress("email")}>
                <Ionicons name="mail" size={20} color={accountingTheme.colors.card} />
                <Text style={styles.headerActionText}>Email</Text>
              </Pressable>
              <Pressable style={styles.headerActionBtn} onPress={handleMoreOptions}>
                <Ionicons name="ellipsis-horizontal" size={20} color={accountingTheme.colors.card} />
                <Text style={styles.headerActionText}>More</Text>
              </Pressable>
            </View>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tabContainer}>
          <Pressable
            onPress={() => setSelectedTab("all")}
            style={[styles.tabButton, selectedTab === "all" && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, selectedTab === "all" && styles.tabTextActive]}>All</Text>
          </Pressable>
          <Pressable
            onPress={() => setSelectedTab("paid")}
            style={[styles.tabButton, selectedTab === "paid" && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, selectedTab === "paid" && styles.tabTextActive]}>Paid</Text>
          </Pressable>
          <Pressable
            onPress={() => setSelectedTab("unpaid")}
            style={[styles.tabButton, selectedTab === "unpaid" && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, selectedTab === "unpaid" && styles.tabTextActive]}>Unpaid</Text>
          </Pressable>
        </View>

        <View style={styles.yearRow}>
          <View style={styles.yearLeft}>
            <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
            <Text style={styles.yearText}>Financial Year (1 Apr 24 to 31 Mar 25)</Text>
          </View>
          <Text style={styles.changeText}>Change</Text>
        </View>

        <View style={styles.listArea}>
          {displayedLedgers.length === 0 ? (
            <EmptyState
              icon="document-text"
              title="No invoices"
              description={`No ${selectedTab !== "all" ? selectedTab : ""} invoices found for this ${isCustomer ? "customer" : "supplier"}.`}
            />
          ) : (
            displayedLedgers.map((ledger: Ledger) => {
              const isUnpaid = Number(ledger.balance || 0) > 0;
              const statusText = isUnpaid ? "Unpaid" : "Paid";

              return (
                <View key={ledger.id} style={styles.invoiceRowClean}>
                  <View style={styles.invoiceLeft}>
                    <View style={styles.invoiceTitleRow}>
                      <Text style={styles.invoiceNumber}>#{ledger.ledgerName}</Text>
                      <View style={[styles.statusBadge, isUnpaid ? styles.statusUnpaid : styles.statusPaid]}>
                        <Text style={[styles.statusBadgeText, isUnpaid ? styles.statusBadgeTextUnpaid : styles.statusBadgeTextPaid]}>
                          {statusText}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.invoiceDate}>{ledger.year}/{ledger.month}</Text>
                  </View>
                  <View style={styles.invoiceRight}>
                    <Text style={styles.invoiceAmount}>{formatCurrency(Number(ledger.balance || 0))}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
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
                <Text style={styles.optionText}>Download (Excel)</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={handleDownloadPDF}>
                <Ionicons name="document-outline" size={18} color="#E03131" style={styles.optionIcon} />
                <Text style={styles.optionText}>Download (PDF)</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={handleDownloadCSV}>
                <Ionicons name="grid-outline" size={18} color={accountingTheme.colors.primary} style={styles.optionIcon} />
                <Text style={styles.optionText}>Download (CSV)</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={() => { setShowActionModal(false); setIsEditing(true); }}>
                <Ionicons name="pencil-outline" size={18} color="#475569" style={styles.optionIcon} />
                <Text style={styles.optionText}>Edit Customer Details</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={() => { setShowActionModal(false); handleDelete(); }}>
                <Ionicons name="trash" size={18} color={accountingTheme.colors.error} style={styles.optionIcon} />
                <Text style={[styles.optionText, styles.dangerText]}>Delete Customer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sort By Popup */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowSortModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Sort by</Text>
              <Pressable onPress={() => { setSortBy("Amount (Low-High)"); setShowSortModal(false); }}>
                <Text style={styles.resetText}>Reset</Text>
              </Pressable>
            </View>

            <View style={styles.sheetOptions}>
              {["Amount (High-Low)", "Amount (Low-High)", "Most recent", "By Name (A-Z)", "By Name (Z-A)"].map((opt) => (
                <Pressable
                  key={opt}
                  style={[styles.sortOptionRow, sortBy === opt && styles.sortOptionRowActive]}
                  onPress={() => {
                    setSortBy(opt);
                    setShowSortModal(false);
                  }}
                >
                  <Text style={[styles.sortOptionText, sortBy === opt && styles.sortOptionTextActive]}>{opt}</Text>
                </Pressable>
              ))}
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
    backgroundColor: accountingTheme.colors.card,
  },
  content: {
    paddingBottom: accountingTheme.spacing.xxl,
  },
  headerRightIcons: {
    flexDirection: "row",
    gap: accountingTheme.spacing.lg,
    alignItems: "center",
  },
  headerProfileArea: {
    marginTop: accountingTheme.spacing.xs,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: accountingTheme.colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: "#334155",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.bold,
    color: accountingTheme.colors.card,
  },
  profileBalance: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.card,
    marginTop: 2,
  },
  profileBalanceLabel: {
    fontSize: 11,
    fontWeight: accountingTheme.fontWeights.medium,
    color: "rgba(255, 255, 255, 0.8)",
  },
  headerActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: accountingTheme.spacing.md,
    marginBottom: accountingTheme.spacing.xs,
  },
  headerActionBtn: {
    alignItems: "center",
    gap: 2,
  },
  headerActionText: {
    fontSize: accountingTheme.fontSizes.xs,
    color: accountingTheme.colors.card,
    fontWeight: accountingTheme.fontWeights.medium,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: accountingTheme.colors.borderLight,
    borderRadius: accountingTheme.radius.full,
    padding: 2,
    marginHorizontal: accountingTheme.spacing.md,
    marginTop: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: accountingTheme.spacing.sm,
    alignItems: "center",
    borderRadius: accountingTheme.radius.full,
  },
  tabButtonActive: {
    backgroundColor: accountingTheme.colors.card,
    shadowColor: accountingTheme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.textSecondary,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  tabTextActive: {
    color: accountingTheme.colors.primary,
  },
  yearRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: accountingTheme.spacing.md,
    marginTop: accountingTheme.spacing.md,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.borderLight,
  },
  yearLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.xs,
  },
  yearText: {
    fontSize: 11,
    color: accountingTheme.colors.textSecondary,
    fontWeight: accountingTheme.fontWeights.medium,
  },
  changeText: {
    fontSize: 11,
    color: "#3B82F6",
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  listArea: {
    marginTop: 0,
  },
  invoiceRowClean: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: accountingTheme.spacing.md,
    paddingHorizontal: accountingTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.borderLight,
  },
  invoiceLeft: {
    flex: 1,
  },
  invoiceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: accountingTheme.spacing.xs,
  },
  invoiceNumber: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#1E293B",
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPaid: {
    backgroundColor: accountingTheme.colors.successLight,
  },
  statusUnpaid: {
    backgroundColor: "#FEE2E2",
  },
  statusBadgeText: {
    fontSize: accountingTheme.fontSizes.xs,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  statusBadgeTextPaid: {
    color: "#16A34A",
  },
  statusBadgeTextUnpaid: {
    color: accountingTheme.colors.error,
  },
  invoiceDate: {
    fontSize: 11,
    color: accountingTheme.colors.textMuted,
  },
  invoiceRight: {
    alignItems: "flex-end",
  },
  invoiceAmount: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: accountingTheme.colors.text,
    marginBottom: accountingTheme.spacing.xs,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 6,
  },
  eInvoiceBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eInvoiceText: {
    fontSize: accountingTheme.fontSizes.xs,
    color: "#3B82F6",
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  eWayBadge: {
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eWayText: {
    fontSize: accountingTheme.fontSizes.xs,
    color: accountingTheme.colors.warning,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  formArea: {
    paddingHorizontal: accountingTheme.spacing.md,
    paddingTop: accountingTheme.spacing.md,
    paddingBottom: 40,
  },
  sectionCardTitle: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: "#1E293B",
    marginBottom: accountingTheme.spacing.md,
  },
  field: {
    marginBottom: accountingTheme.spacing.md,
  },
  label: {
    fontSize: 11,
    color: accountingTheme.colors.textSecondary,
    marginBottom: accountingTheme.spacing.xs,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  input: {
    height: 42,
    backgroundColor: accountingTheme.colors.card,
    borderWidth: 1,
    borderColor: accountingTheme.colors.borderMedium,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: accountingTheme.fontSizes.md,
    color: accountingTheme.colors.text,
  },
  errorText: {
    color: accountingTheme.colors.error,
    marginBottom: accountingTheme.spacing.md,
    fontSize: accountingTheme.fontSizes.md,
  },
  deleteWrap: {
    marginTop: accountingTheme.spacing.md,
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
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: accountingTheme.spacing.xxl,
    marginBottom: accountingTheme.spacing.sm,
  },
  sheetTitle: {
    fontSize: accountingTheme.fontSizes.xxl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: "#1E293B",
  },
  resetText: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#3B82F6",
  },
  sortOptionRow: {
    paddingVertical: 14,
    paddingHorizontal: accountingTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E5EAF3",
  },
  sortOptionRowActive: {
    backgroundColor: accountingTheme.colors.borderLight,
  },
  sortOptionText: {
    fontSize: accountingTheme.fontSizes.lg,
    color: accountingTheme.colors.textSecondary,
  },
  sortOptionTextActive: {
    color: accountingTheme.colors.text,
    fontWeight: accountingTheme.fontWeights.bold,
  },
});
