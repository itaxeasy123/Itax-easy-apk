import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ITRHeader } from "../components";
import { itrColors, itrRadius, itrSpacing, itrShadows } from "../../../theme/itr";

export default function ITRWizardScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ITRHeader title="ITR Filing" />

      <View style={styles.content}>
        <View style={styles.card}>
          <Ionicons name="sparkles-outline" size={44} color={itrColors.primary} />
          <Text style={styles.title}>ITR wizard coming next</Text>
          <Text style={styles.subtitle}>
            This screen is ready for the step-by-step frontend flow.
          </Text>

          <Pressable style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: itrColors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: itrSpacing.xl,
  },
  card: {
    alignItems: "center",
    backgroundColor: itrColors.surface,
    borderColor: itrColors.borderSoft,
    borderRadius: itrRadius.xl,
    borderWidth: 1,
    padding: itrSpacing.xl,
    ...itrShadows.card,
  },
  title: {
    color: itrColors.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: itrSpacing.md,
    textAlign: "center",
  },
  subtitle: {
    color: itrColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: itrSpacing.sm,
    textAlign: "center",
  },
  button: {
    alignItems: "center",
    backgroundColor: itrColors.primary,
    borderRadius: itrRadius.pill,
    marginTop: itrSpacing.lg,
    minHeight: 46,
    justifyContent: "center",
    paddingHorizontal: itrSpacing.xl,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
