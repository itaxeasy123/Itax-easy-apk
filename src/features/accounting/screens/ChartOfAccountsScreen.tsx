import { useCallback, useState } from "react";
import { View, ScrollView, StyleSheet, Text, Pressable, TextInput, Alert } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card, EmptyState, Loading } from "../components";
import AccountingHeader from "../components/AccountingHeader";
import { accountingTheme } from "../../../theme/accounting";
import { billshieldUiService, AccountGroupNode } from "../services/billshieldUiService";

const NATURE_COLORS: Record<string, string> = {
  ASSET: "#16A34A",
  LIABILITY: "#DC2626",
  INCOME: "#2563EB",
  EXPENSE: "#D97706",
};

export default function ChartOfAccountsScreen() {
  const router = useRouter();
  const [tree, setTree] = useState<AccountGroupNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [addingUnder, setAddingUnder] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await billshieldUiService.getGroupTree();
    setTree(result.data);
    setError(result.success ? null : result.message ?? "Unable to load chart of accounts");
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const toggle = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddSubGroup = async (parent: AccountGroupNode) => {
    const name = newGroupName.trim();
    if (!name) return;
    const result = await billshieldUiService.createSubGroup(name, parent.id);
    if (result.success) {
      setNewGroupName("");
      setAddingUnder(null);
      setExpanded((current) => new Set(current).add(parent.id));
      void load();
    } else {
      Alert.alert("Could not create group", result.message ?? "Please try again.");
    }
  };

  const handleDeleteGroup = (group: AccountGroupNode) => {
    Alert.alert(`Delete "${group.name}"?`, "Only empty, non-system groups can be deleted.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const result = await billshieldUiService.deleteGroup(group.id);
          if (result.success) void load();
          else Alert.alert("Could not delete", result.message ?? "Please try again.");
        },
      },
    ]);
  };

  const renderGroup = (group: AccountGroupNode, depth: number) => {
    const isOpen = expanded.has(group.id);
    const childCount = group.subGroups.length + group.ledgers.length;

    return (
      <View key={group.id}>
        <Pressable
          style={[styles.groupRow, { paddingLeft: 14 + depth * 18 }]}
          onPress={() => toggle(group.id)}
          onLongPress={() => !group.isSystem && handleDeleteGroup(group)}
        >
          <Ionicons
            name={childCount === 0 ? "ellipse-outline" : isOpen ? "chevron-down" : "chevron-forward"}
            size={14}
            color="#64748B"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.groupMeta}>
              {group.isSystem ? "System group" : "Custom group"} • {childCount} item{childCount === 1 ? "" : "s"}
            </Text>
          </View>
          <View style={[styles.naturePill, { borderColor: NATURE_COLORS[group.nature] ?? "#64748B" }]}>
            <Text style={[styles.naturePillText, { color: NATURE_COLORS[group.nature] ?? "#64748B" }]}>
              {group.nature}
            </Text>
          </View>
          <Pressable
            style={styles.addBtn}
            onPress={() => {
              setAddingUnder(addingUnder === group.id ? null : group.id);
              setNewGroupName("");
            }}
          >
            <Ionicons name="add" size={16} color={accountingTheme.colors.primary} />
          </Pressable>
        </Pressable>

        {addingUnder === group.id ? (
          <View style={[styles.addRow, { marginLeft: 14 + (depth + 1) * 18 }]}>
            <TextInput
              style={styles.addInput}
              placeholder={`New sub-group under ${group.name}`}
              value={newGroupName}
              onChangeText={setNewGroupName}
              autoFocus
              placeholderTextColor="#94A3B8"
            />
            <Pressable style={styles.addConfirm} onPress={() => handleAddSubGroup(group)}>
              <Text style={styles.addConfirmText}>Add</Text>
            </Pressable>
          </View>
        ) : null}

        {isOpen ? (
          <>
            {group.subGroups.map((sub) => renderGroup(sub, depth + 1))}
            {group.ledgers.map((ledger) => (
              <Pressable
                key={ledger.id}
                style={[styles.ledgerRow, { paddingLeft: 14 + (depth + 1) * 18 }]}
                onPress={() =>
                  router.navigate({ pathname: "/accounting/ledgers/[id]", params: { id: ledger.id } })
                }
              >
                <Ionicons name="document-text-outline" size={14} color={accountingTheme.colors.primary} />
                <Text style={styles.ledgerName}>{ledger.name}</Text>
                {ledger.isSystem ? <Text style={styles.systemTag}>system</Text> : null}
              </Pressable>
            ))}
          </>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Chart of Accounts"
        subtitle="Primary groups → sub-groups → ledgers. Tap + to add a sub-group; long-press to delete."
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Loading text="Loading chart of accounts..." />
        ) : error ? (
          <View style={styles.cardArea}>
            <Card>
              <EmptyState icon="alert-circle" title="Unable to load" description={error} />
            </Card>
          </View>
        ) : (
          <View style={styles.treeCard}>{tree.map((group) => renderGroup(group, 0))}</View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    paddingBottom: accountingTheme.spacing.xxl,
  },
  cardArea: {
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: accountingTheme.spacing.md,
  },
  treeCard: {
    backgroundColor: accountingTheme.colors.card,
    marginHorizontal: accountingTheme.spacing.lg,
    marginTop: accountingTheme.spacing.lg,
    borderRadius: accountingTheme.radius.xxl,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    overflow: "hidden",
  },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingRight: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  groupName: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#111827",
  },
  groupMeta: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 1,
  },
  naturePill: {
    borderWidth: 1,
    borderRadius: accountingTheme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  naturePillText: {
    fontSize: 9,
    fontWeight: accountingTheme.fontWeights.extraBold,
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: accountingTheme.radius.full,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingRight: 12,
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    borderRadius: accountingTheme.radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: accountingTheme.fontSizes.sm,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  addConfirm: {
    backgroundColor: accountingTheme.colors.primary,
    borderRadius: accountingTheme.radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  addConfirmText: {
    color: "#FFFFFF",
    fontWeight: accountingTheme.fontWeights.bold,
    fontSize: accountingTheme.fontSizes.sm,
  },
  ledgerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingRight: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  ledgerName: {
    fontSize: accountingTheme.fontSizes.sm,
    color: "#334155",
    flex: 1,
  },
  systemTag: {
    fontSize: 9,
    color: "#94A3B8",
    fontStyle: "italic",
  },
});
