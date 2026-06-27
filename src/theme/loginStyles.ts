import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    height: 140,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },

  headerText: {
    color: colors.white,
    ...typography.title,
  },

 card: {
  flexGrow: 1,   // 🔥 MUST
  backgroundColor: colors.card,
  marginTop: -spacing.lg,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  padding: spacing.lg,
},

  title: {
    color: colors.primary,
    ...typography.title,
  },

  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
    ...typography.subtitle,
  },

  image: {
  width: "100%",
  height: 200,   // 🔥 increase for better visibility
  alignSelf: "center",
  marginBottom: 16,
},

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },

  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },

  passwordInput: {
    flex: 1,
    padding: spacing.md,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  caption: {
    color: colors.textSecondary,
    ...typography.caption,
  },

  link: {
    color: colors.primary,
    ...typography.caption,
  },

  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: colors.white,
    ...typography.button,
  },

  signup: {
    textAlign: "center",
    marginTop: spacing.md,
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: spacing.lg,
  },

  socialBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    borderRadius: 10,
    width: 100,
    alignItems: "center",
  },
});