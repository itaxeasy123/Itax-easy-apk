import React, { useCallback, useRef, useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { accountingTheme } from "../../../theme/accounting";
import { billshieldUiService, FiscalYearInfo } from "../services/billshieldUiService";

const fmt = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });
};

interface FiscalYearBarProps {
  /** Called with the selected fiscal year (also fired once on load with the current FY). */
  onChange: (fy: FiscalYearInfo) => void;
}

/**
 * "Financial Year (…) — Change" bar used on report screens.
 * Lists the company's real fiscal years; selecting one re-runs the
 * report as of that year.
 */
export default function FiscalYearBar({ onChange }: FiscalYearBarProps) {
  const [years, setYears] = useState<FiscalYearInfo[]>([]);
  const [selected, setSelected] = useState<FiscalYearInfo | null>(null);
  const [open, setOpen] = useState(false);
  const initialised = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const result = await billshieldUiService.listFiscalYears();
        if (cancelled || !result.data.length) return;
        setYears(result.data);
        if (initialised.current) return; // keep the user's selection on refocus
        initialised.current = true;
        // default: the FY containing today, else the latest one
        const today = new Date().toISOString();
        const current =
          result.data.find((f) => f.startDate <= today && today <= f.endDate) ??
          result.data[result.data.length - 1];
        setSelected(current);
        onChange(current);
      })();
      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const pick = (fy: FiscalYearInfo) => {
    setSelected(fy);
    setOpen(false);
    onChange(fy);
  };

  return (
    <View style={styles.periodBar}>
      <View style={styles.periodLeft}>
        <Ionicons name="calendar-outline" size={16} color={accountingTheme.colors.primary} />
        <Text style={styles.periodText}>
          Financial Year{" "}
          <Text style={styles.periodSubText}>
            {selected ? `(${fmt(selected.startDate)} to ${fmt(selected.endDate)})` : "(loading…)"}
            {selected?.isClosed ? " • closed" : ""}
          </Text>
        </Text>
      </View>
      <Pressable onPress={() => setOpen(true)} disabled={years.length === 0}>
        <Text style={styles.changeText}>Change</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Select Financial Year</Text>
            {years.map((fy) => (
              <Pressable
                key={fy.id}
                style={[styles.option, selected?.id === fy.id && styles.optionActive]}
                onPress={() => pick(fy)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>{fy.label}</Text>
                  <Text style={styles.optionMeta}>
                    {fmt(fy.startDate)} – {fmt(fy.endDate)}
                  </Text>
                </View>
                {fy.isClosed ? (
                  <View style={styles.closedPill}>
                    <Ionicons name="lock-closed" size={11} color="#991B1B" />
                    <Text style={styles.closedText}>CLOSED</Text>
                  </View>
                ) : null}
                {selected?.id === fy.id ? (
                  <Ionicons name="checkmark-circle" size={20} color={accountingTheme.colors.primary} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  periodBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: accountingTheme.colors.card,
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: accountingTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: accountingTheme.colors.borderMedium,
  },
  periodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.sm,
    flex: 1,
  },
  periodText: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: "#1E293B",
  },
  periodSubText: {
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.regular,
    color: accountingTheme.colors.textSecondary,
  },
  changeText: {
    fontSize: accountingTheme.fontSizes.md,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: accountingTheme.colors.primary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  sheetTitle: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: "#111827",
    marginBottom: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  optionActive: {
    backgroundColor: "#F8FAFC",
  },
  optionLabel: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#111827",
  },
  optionMeta: {
    fontSize: accountingTheme.fontSizes.sm,
    color: accountingTheme.colors.textSecondary,
    marginTop: 2,
  },
  closedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEE2E2",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  closedText: {
    color: "#991B1B",
    fontSize: 9,
    fontWeight: accountingTheme.fontWeights.extraBold,
  },
});
