import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ITRBottomNav, ITRHeader } from "../components";
import { itrColors, itrRadius, itrSpacing, itrShadows, itrTypography } from "../../../theme/itr";

function SubmissionEmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="document-outline" size={56} color={itrColors.emptyIcon} />
      </View>
      <Text style={styles.emptyTitle}>No Record Found</Text>
    </View>
  );
}

export default function ITRDashboardScreen() {
  const router = useRouter();
  const [showFileOptions, setShowFileOptions] = useState(false);

  const openFileITR = (route: "/itr/file-itr" | "/itr/manual" | "/itr/challan") => {
    setShowFileOptions(false);
    router.navigate(route);
  };

  return (
    <View style={styles.screen}>
      <ITRHeader title="ITR" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroSubtext}>Existing the tax filing process with AI</Text>

          <Text style={styles.heroHeadline}>
            Upload your ITR form 16 to get started quickly!
          </Text>

          <Pressable style={styles.primaryButton} onPress={() => setShowFileOptions(true)}>
            <Text style={styles.primaryButtonText}>File ITR</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Submissions</Text>
          <View style={styles.sectionUnderline} />
        </View>

        <View style={styles.submissionsCard}>
          <SubmissionEmptyState />
        </View>

      </ScrollView>

      <ITRBottomNav activeRoute="/itr" />

      <Modal
        visible={showFileOptions}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFileOptions(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setShowFileOptions(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>File ITR</Text>

            <Pressable style={styles.sheetOption} onPress={() => openFileITR("/itr/file-itr")}>
              <Text style={styles.sheetOptionText}>Upload Form-16</Text>
            </Pressable>

            <Pressable style={styles.sheetOption} onPress={() => openFileITR("/itr/manual")}>
              <Text style={styles.sheetOptionText}>File Manually</Text>
            </Pressable>

            <Pressable style={styles.sheetOption} onPress={() => openFileITR("/itr/challan")}>
              <Text style={styles.sheetOptionText}>Challan Entry</Text>
            </Pressable>
          </View>
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
    paddingHorizontal: itrSpacing.md + 4,
    paddingTop: itrSpacing.lg,
    paddingBottom: 110,
  },
  heroCard: {
    backgroundColor: itrColors.surface,
    borderColor: itrColors.borderSoft,
    borderRadius: itrRadius.xl,
    borderWidth: 1,
    paddingHorizontal: itrSpacing.lg,
    paddingVertical: itrSpacing.xl,
    ...itrShadows.card,
  },
  heroSubtext: {
    color: itrColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  heroHeadline: {
    color: itrColors.text,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 26,
    marginTop: itrSpacing.md,
    textAlign: "center",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: itrColors.primary,
    borderRadius: itrRadius.pill,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: itrSpacing.xl,
    minHeight: 48,
    gap: 6,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: itrTypography.button.fontSize,
    fontWeight: itrTypography.button.fontWeight,
  },
  sectionHeaderRow: {
    marginTop: itrSpacing.xl + 2,
    marginBottom: itrSpacing.sm,
  },
  sectionTitle: {
    color: itrColors.text,
    fontSize: itrTypography.sectionTitle.fontSize,
    fontWeight: itrTypography.sectionTitle.fontWeight,
    textDecorationLine: "underline",
  },
  sectionUnderline: {
    width: 58,
    height: 2,
    backgroundColor: itrColors.primary,
    marginTop: 4,
    borderRadius: 999,
  },
  submissionsCard: {
    backgroundColor: itrColors.surface,
    borderColor: itrColors.borderSoft,
    borderRadius: itrRadius.xl,
    borderWidth: 1,
    minHeight: 220,
    justifyContent: "center",
    padding: itrSpacing.xl,
    ...itrShadows.card,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
  },
  emptyIconWrap: {
    alignItems: "center",
    backgroundColor: "#F6F8FC",
    borderRadius: 18,
    justifyContent: "center",
    height: 84,
    marginBottom: itrSpacing.md,
    width: 84,
  },
  emptyTitle: {
    color: itrColors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: itrSpacing.lg,
    paddingBottom: itrSpacing.xl + 4,
    paddingTop: itrSpacing.sm,
    ...itrShadows.floating,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "#CBD5E1",
    borderRadius: 999,
    height: 4,
    marginBottom: itrSpacing.md,
    width: 44,
  },
  sheetTitle: {
    color: itrColors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: itrSpacing.md,
  },
  sheetOption: {
    backgroundColor: "#fff",
    borderColor: "#E5E7EB",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: "center",
    marginBottom: itrSpacing.md,
    paddingHorizontal: itrSpacing.md,
    ...itrShadows.card,
  },
  sheetOptionText: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "500",
  },
});
