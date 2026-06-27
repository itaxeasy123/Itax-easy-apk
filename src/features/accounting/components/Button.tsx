import React from 'react';
import { accountingTheme } from "../../../theme/accounting";
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        styles[`${variant}Button`],
        styles[`${size}Button`],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? accountingTheme.colors.primary : accountingTheme.colors.card} size="small" />
      ) : (
        <>
          {icon && icon}
          <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingHorizontal: accountingTheme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: accountingTheme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: accountingTheme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: accountingTheme.colors.border,
  },
  outlineButton: {
    backgroundColor: accountingTheme.colors.card,
    borderWidth: 1,
    borderColor: accountingTheme.colors.primary,
  },
  dangerButton: {
    backgroundColor: accountingTheme.colors.danger,
  },
  smallButton: {
    paddingVertical: accountingTheme.spacing.sm,
    paddingHorizontal: accountingTheme.spacing.md,
  },
  mediumButton: {
    paddingVertical: accountingTheme.spacing.md,
    paddingHorizontal: accountingTheme.spacing.lg,
  },
  largeButton: {
    paddingVertical: accountingTheme.spacing.lg,
    paddingHorizontal: accountingTheme.spacing.xxl,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
  primaryText: {
    color: accountingTheme.colors.card,
  },
  secondaryText: {
    color: '#1f2937',
  },
  outlineText: {
    color: accountingTheme.colors.primary,
  },
  dangerText: {
    color: accountingTheme.colors.card,
  },
});
