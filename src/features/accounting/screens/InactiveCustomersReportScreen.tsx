import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AccountingHeader } from "../components";

const format = (value: number) =>
  `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function InactiveCustomersReportScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [inactiveCustomers, setInactiveCustomers] = useState<any[]>([]);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState("All");

  const totalReceivables = inactiveCustomers.reduce((sum, item) => sum + item.receivables, 0);

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Inactive Customers"
        showBackButton
        rightContent={
          <Pressable style={styles.pdfBtn}>
            <Ionicons name="document-text" size={16} color="#DC2626" />
          </Pressable>
        }
        headerContent={
          <View style={styles.statsRow}>
            <View style={styles.statsCol}>
              <Text style={styles.statsValue}>{format(totalReceivables)}</Text>
              <Text style={styles.statsLabel}>Receivables</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statsCol}>
              <Text style={styles.statsValue}>{inactiveCustomers.length}</Text>
              <Text style={styles.statsLabel}>Inactive Customers</Text>
            </View>
          </View>
        }
      />

      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94A3B8"
          />
        </View>
        <Pressable style={styles.filterBtn} onPress={() => setShowSortModal(true)}>
          <Ionicons name="filter" size={20} color="#64748B" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {inactiveCustomers.map((customer) => (
          <View key={customer.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{customer.initial}</Text>
              </View>
              <Text style={styles.name}>{customer.name}</Text>
              <Pressable style={styles.callBtn}>
                <Ionicons name="call-outline" size={14} color="#3B82F6" />
                <Text style={styles.callText}>Call</Text>
              </Pressable>
            </View>

            <View style={styles.cardBottom}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Receivables</Text>
                <Text style={styles.infoValue}>{format(customer.receivables)}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Last Sales Date</Text>
                <Text style={styles.infoValue}>{customer.lastSales}</Text>
              </View>
              <View style={[styles.infoCol, { alignItems: "flex-end" }]}>
                <Text style={styles.infoLabel}>Inactive Since</Text>
                <Text style={styles.dangerValue}>{customer.inactiveSince} Days</Text>
              </View>
            </View>
          </View>
        ))}
        {inactiveCustomers.length === 0 && (
          <Text style={styles.emptyText}>No inactive customers found</Text>
        )}
      </ScrollView>

      {/* Sort By Modal */}
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
              <Pressable onPress={() => setSortBy("All")}>
                <Text style={styles.resetText}>Reset</Text>
              </Pressable>
            </View>

            <View style={styles.sheetOptions}>
              {["All", "30 days", "60 days", "120 days", "180 days", "365 & above days"].map((option) => (
                <Pressable
                  key={option}
                  style={[styles.sortOptionRow, sortBy === option && styles.sortOptionRowActive]}
                  onPress={() => {
                    setSortBy(option);
                    setShowSortModal(false);
                  }}
                >
                  <Text style={[styles.sortOptionText, sortBy === option && styles.sortOptionTextActive]}>
                    {option}
                  </Text>
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
    backgroundColor: "#F8FAFC",
  },
  pdfBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 24,
    alignItems: "center",
  },
  statsCol: {
    flex: 1,
    alignItems: "center",
  },
  statsValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statsLabel: {
    fontSize: 12,
    color: "#E2E8F0",
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  searchSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#0F172A",
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 16,
  },
  callText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3B82F6",
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  dangerValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#DC2626",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
    color: "#64748B",
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
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  resetText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  sheetOptions: {
    marginTop: 8,
  },
  sortOptionRow: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  sortOptionRowActive: {
    backgroundColor: "#F1F5F9",
  },
  sortOptionText: {
    fontSize: 14,
    color: "#475569",
  },
  sortOptionTextActive: {
    color: "#0F172A",
    fontWeight: "600",
  },
});
