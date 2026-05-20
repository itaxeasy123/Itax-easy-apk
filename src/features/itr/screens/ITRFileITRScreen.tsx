import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ITRBottomNav, ITRHeader } from "../components";
import { itrColors, itrSpacing, itrShadows } from "../../../theme/itr";

type FormOption = {
  key: "dept" | "custom";
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  accent: string;
};

const FORM_OPTIONS: FormOption[] = [
  {
    key: "dept",
    title: "Provided By IT Dept",
    icon: "shield-checkmark",
    accent: "#2563EB",
  },
  {
    key: "custom",
    title: "Custom",
    icon: "create",
    accent: "#10B981",
  },
];

export default function ITRFileITRScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<FormOption["key"] | null>(null);

  return (
    <View style={styles.screen}>
      <ITRHeader title="File ITR" titleVariant="plain" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Smart Tax Filling made easy - upload your Form-16 and let our AI do the rest!
        </Text>

        <Text style={styles.sectionLabel}>Select Form 16 Type</Text>

        <View style={styles.optionsWrap}>
          {FORM_OPTIONS.map((option) => {
            const isSelected = selected === option.key;

            return (
              <Pressable
                key={option.key}
                onPress={() => {
                  setSelected(option.key);
                  if (option.key === "dept") {
                    router.push("/itr/form-16");
                  } else {
                    router.push("/itr/manual");
                  }
                }}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
              >
                <View style={[styles.iconBox, { borderColor: option.accent }]}>
                  <Ionicons name={option.icon} size={34} color={option.accent} />
                </View>
                <Text style={styles.optionTitle}>{option.title}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <ITRBottomNav activeRoute="/itr" />
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
    paddingHorizontal: itrSpacing.md + 4,
    paddingTop: itrSpacing.lg,
    paddingBottom: 110,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: itrSpacing.lg,
  },
  sectionLabel: {
    color: itrColors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: itrSpacing.md,
  },
  optionsWrap: {
    alignItems: "center",
    gap: itrSpacing.xl,
    paddingTop: itrSpacing.xs,
  },
  optionCard: {
    alignItems: "center",
    backgroundColor: itrColors.surface,
    borderColor: itrColors.borderSoft,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    paddingVertical: 18,
    width: 160,
    ...itrShadows.card,
  },
  optionCardSelected: {
    borderColor: itrColors.primary,
    backgroundColor: "#F8FBFF",
  },
  iconBox: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    height: 86,
    marginBottom: itrSpacing.sm,
    width: 120,
  },
  optionTitle: {
    color: itrColors.primary,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
