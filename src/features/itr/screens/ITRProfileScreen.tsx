import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuthStore, type AuthUser } from "../../../store/authStore";
import { useITRStore } from "../../../store/itrStore";
import { itrColors, itrRadius, itrShadows, itrSpacing } from "../../../theme/itr";
import { ITRBottomNav, ITRHeader } from "../components";

type YearOption = {
  label: string;
  value: string;
};

type YearKey = "assessment" | "financial";

const ASSESSMENT_YEAR_OPTIONS: YearOption[] = [
  { label: "2026-27", value: "2026-27" },
  { label: "2025-26", value: "2025-26" },
  { label: "2024-25", value: "2024-25" },
];

const FINANCIAL_YEAR_OPTIONS: YearOption[] = [
  { label: "2025-26", value: "2025-26" },
  { label: "2024-25", value: "2024-25" },
  { label: "2023-24", value: "2023-24" },
];

type YearFieldProps = {
  label: string;
  value: string;
  onPress?: () => void;
};

function YearField({ label, value, onPress }: YearFieldProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <Pressable style={[styles.yearField, !onPress && styles.yearFieldDisabled]} onPress={onPress}>
        <Text style={styles.yearFieldText}>{value || "Select Year"}</Text>
        {onPress && <Ionicons name="chevron-down" size={18} color="#64748B" />}
      </Pressable>
    </View>
  );
}

function getFullName(user: AuthUser | null) {
  if (!user) return "User";
  if (user.fullName?.trim()) return user.fullName.trim();

  const fallbackName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fallbackName || "User";
}

function getFinancialYearLabel(assessmentYear: string) {
  if (!assessmentYear || assessmentYear === "Select Year") return "";
  const parts = assessmentYear.split("-");
  if (parts.length === 2) {
    const start = parseInt(parts[0], 10);
    const end = parseInt(parts[1], 10);
    if (!isNaN(start) && !isNaN(end)) {
      return `${start - 1}-${end - 1}`;
    }
  }
  return assessmentYear;
}

export default function ITRProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const { assessmentYear: selectedAssessmentYear, setAssessmentYear: setSelectedAssessmentYear, resetITR } = useITRStore();
  
  const fullName = useMemo(() => getFullName(user), [user]);
  const initials =
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  const selectedFinancialYear = useMemo(() => getFinancialYearLabel(selectedAssessmentYear), [selectedAssessmentYear]);
  const [activePicker, setActivePicker] = useState<YearKey | null>(null);

  const activeOptions =
    activePicker === "assessment"
      ? ASSESSMENT_YEAR_OPTIONS
      : activePicker === "financial"
        ? FINANCIAL_YEAR_OPTIONS
        : [];

  const selectedLabel =
    activePicker === "assessment"
      ? selectedAssessmentYear
      : activePicker === "financial"
        ? selectedFinancialYear
        : "";

  const chooseYear = (year: string) => {
    if (activePicker === "assessment") {
      if (year !== selectedAssessmentYear && selectedAssessmentYear) {
        Alert.alert(
          "Change Assessment Year?",
          "Changing the Assessment Year will clear all your imported Form-16 and manually filled data. Are you sure you want to proceed?",
          [
            { text: "Cancel", style: "cancel", onPress: () => setActivePicker(null) },
            { 
              text: "Yes, Reset Data", 
              style: "destructive", 
              onPress: () => {
                resetITR();
                setSelectedAssessmentYear(year);
                setActivePicker(null);
              }
            }
          ]
        );
        return;
      } else {
        setSelectedAssessmentYear(year);
      }
    }
    setActivePicker(null);
  };

  return (
    <View style={styles.screen}>
      <ITRHeader title="Profile ITR" titleVariant="plain" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Name</Text>
              <Text style={styles.profileValueText}>{fullName}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Assessment Year</Text>
              <Text style={styles.profileValueText}>{selectedAssessmentYear}</Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#334155" />
        </View>

        <Text style={styles.chooseYearTitle}>Choose year</Text>

        <View style={styles.dropdownGroup}>
          <YearField
            label="Assessment Year"
            value={selectedAssessmentYear}
            onPress={() => setActivePicker("assessment")}
          />
          <YearField
            label="Financial Year"
            value={selectedFinancialYear}
            onPress={undefined}
          />
        </View>
      </ScrollView>

      <ITRBottomNav activeRoute="/itr" />

      <Modal
        visible={activePicker !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActivePicker(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setActivePicker(null)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>
            {activePicker === "assessment" ? "Assessment Year" : "Financial Year"}
          </Text>

          {activeOptions.map((year) => {
            const isActive = selectedLabel === year.value;
            return (
              <Pressable
                key={year.value}
                onPress={() => chooseYear(year.value)}
                style={[styles.yearOption, isActive && styles.yearOptionActive]}
              >
                <Text style={[styles.yearOptionText, isActive && styles.yearOptionTextActive]}>
                  {year.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: itrColors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: itrSpacing.md + 2,
    paddingTop: itrSpacing.lg,
    paddingBottom: 112,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: "#D6F0D0",
    borderColor: "#B1D7A9",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: itrSpacing.md,
    marginBottom: itrSpacing.lg,
    paddingHorizontal: itrSpacing.md,
    paddingVertical: itrSpacing.md,
    ...itrShadows.card,
  },
  avatarWrap: {
    alignItems: "center",
    backgroundColor: "#EFFAF0",
    borderColor: "#B7D8B9",
    borderRadius: 999,
    borderWidth: 1,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  avatarText: {
    color: "#2E6EFD",
    fontSize: 18,
    fontWeight: "800",
  },
  profileInfo: {
    flex: 1,
    gap: 8,
  },
  profileRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  profileLabel: {
    color: "#344054",
    fontSize: 14,
    fontWeight: "700",
    minWidth: 122,
  },
  profileValueText: {
    color: "#344054",
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  chooseYearTitle: {
    color: "#344054",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: itrSpacing.md,
  },
  dropdownGroup: {
    gap: itrSpacing.md,
  },
  dropdownLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginLeft: 4,
  },
  yearField: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#B8CCF0",
    borderRadius: itrRadius.md,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: itrSpacing.md,
    ...itrShadows.card,
  },
  yearFieldDisabled: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
  },
  yearFieldText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.28)",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    bottom: 0,
    left: 0,
    paddingHorizontal: itrSpacing.lg,
    paddingVertical: itrSpacing.lg,
    position: "absolute",
    right: 0,
  },
  modalTitle: {
    color: itrColors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: itrSpacing.sm,
  },
  yearOption: {
    borderColor: "#E5E7EB",
    borderRadius: 10,
    borderWidth: 1,
    marginTop: itrSpacing.sm,
    paddingHorizontal: itrSpacing.md,
    paddingVertical: itrSpacing.md,
  },
  yearOptionActive: {
    backgroundColor: "#EAF1FF",
    borderColor: itrColors.primary,
  },
  yearOptionText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  yearOptionTextActive: {
    color: itrColors.primary,
  },
});
