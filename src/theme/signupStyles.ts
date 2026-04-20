import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const signupStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ✅ HEADER (Gradient area)
  header: {
    height: 160,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerText: {
    color: colors.white,
    textAlign: "center",
    ...typography.title,
  },

  // ✅ CARD (Main white box)
  card: {
    flex: 1,
    backgroundColor: colors.card,
    marginTop: -spacing.xl,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,

    // shadow (Android + iOS)
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  // ✅ TEXTS
  title: {
    color: colors.primary,
    marginBottom: 4,
    ...typography.title,
  },

  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
    ...typography.subtitle,
  },

  // ✅ IMAGE
  image: {
    width: "100%",
    height: 130,
    alignSelf: "center",
    marginBottom: spacing.md,
  },

  // ✅ INPUT (fallback if used directly)
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },

  // ✅ TERMS ROW
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    flexWrap: "wrap",
  },

  checkbox: {
    marginRight: 8,
    fontSize: 16,
  },

  caption: {
    flex: 1,
    color: colors.textSecondary,
    ...typography.caption,
  },

  link: {
    color: colors.primary,
    fontWeight: "600",
  },

  // ✅ BUTTON
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",

    // shadow
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  buttonText: {
    color: colors.white,
    ...typography.button,
  },

  // ✅ LOGIN TEXT
  loginText: {
    textAlign: "center",
    marginTop: spacing.md,
    color: colors.textSecondary,
    ...typography.caption,
  },

  genderRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginVertical: 10,
},

genderBtn: {
  flex: 1,
  padding: 10,
  borderRadius: 8,
  backgroundColor: "#eee",
  alignItems: "center",
  marginHorizontal: 5,
},

genderActive: {
  backgroundColor: "#4facfe",
},
});