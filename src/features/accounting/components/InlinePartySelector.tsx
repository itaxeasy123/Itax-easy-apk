import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Keyboard,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { accountingTheme } from "../../../theme/accounting";
import { Party } from "../types/accountingTypes";

interface InlinePartySelectorProps {
  parties: Party[];
  selectedPartyId: string;
  onSelect: (partyId: string) => void;
  placeholder?: string;
}

export default function InlinePartySelector({
  parties,
  selectedPartyId,
  onSelect,
  placeholder = "Search",
}: InlinePartySelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [search, setSearch] = useState("");
  
  // Find the initially selected party
  const selectedParty = useMemo(
    () => parties.find((p) => p.id === selectedPartyId),
    [parties, selectedPartyId]
  );

  // When a party is selected, we want the input text to show the selected party's name.
  // But when they click to search, we want it empty or filterable.
  // We'll manage the display value via `search` state, but if not expanded, show selected.
  const displayValue = isExpanded
    ? search
    : selectedParty
    ? selectedParty.partyName
    : "";

  const visibleParties = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return parties;
    return parties.filter(
      (party) =>
        party.partyName?.toLowerCase().includes(query) ||
        party.type?.toLowerCase().includes(query)
    );
  }, [parties, search]);

  const handleSelect = (partyId: string) => {
    onSelect(partyId);
    setSearch("");
    setIsExpanded(false);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputBox, isExpanded && styles.inputBoxExpanded]}>
        <Ionicons
          name="search"
          size={18}
          color={accountingTheme.colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          value={displayValue}
          onChangeText={(val) => {
            setSearch(val);
            if (!isExpanded) setIsExpanded(true);
          }}
          onFocus={() => {
            setIsExpanded(true);
            setSearch(""); // clear so they can search fresh
          }}
          placeholder={placeholder}
          placeholderTextColor={accountingTheme.colors.textMuted}
          style={styles.input}
        />
        {isExpanded && (
          <Pressable onPress={() => {
            setIsExpanded(false);
            setSearch("");
            Keyboard.dismiss();
          }}>
            <Ionicons name="close-circle" size={18} color={accountingTheme.colors.textMuted} />
          </Pressable>
        )}
      </View>

      {isExpanded && (
        <View style={styles.dropdownContainer}>
          <ScrollView
            style={styles.dropdownList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {visibleParties.length === 0 ? (
              <View style={styles.emptyItem}>
                <Text style={styles.emptyText}>No parties found.</Text>
              </View>
            ) : (
              visibleParties.map((party) => {
                const initial = party.partyName?.trim()?.[0]?.toUpperCase() ?? "P";
                return (
                  <Pressable
                    key={party.id}
                    style={styles.itemRow}
                    onPress={() => handleSelect(party.id)}
                  >
                    <View style={styles.itemLeft}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initial}</Text>
                      </View>
                      <Text style={styles.partyName}>{party.partyName}</Text>
                    </View>
                    <Text style={styles.partyType}>
                      {party.type ? party.type.toLowerCase() : ""}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Dropdown expands naturally
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: accountingTheme.radius.lg,
    paddingHorizontal: 12,
    height: 44,
  },
  inputBoxExpanded: {
    borderColor: accountingTheme.colors.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: accountingTheme.fontSizes.md,
    color: accountingTheme.colors.text,
  },
  dropdownContainer: {
    backgroundColor: accountingTheme.colors.card,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderTopWidth: 0,
    borderBottomLeftRadius: accountingTheme.radius.lg,
    borderBottomRightRadius: accountingTheme.radius.lg,
    maxHeight: 250,
  },
  dropdownList: {
    flexGrow: 0,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
  },
  partyName: {
    fontSize: accountingTheme.fontSizes.md,
    color: "#111827",
    fontWeight: "500",
  },
  partyType: {
    fontSize: accountingTheme.fontSizes.xs,
    color: "#6B7280",
    textTransform: "lowercase",
  },
  emptyItem: {
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    color: accountingTheme.colors.textMuted,
    fontSize: accountingTheme.fontSizes.sm,
  },
});
