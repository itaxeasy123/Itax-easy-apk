import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { accountingTheme } from "../../../theme/accounting";

interface EmptyStateProps {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  style?: ViewStyle;
  iconColor?: string;
}

export default function EmptyState({
  icon = 'archive-outline',
  title,
  description,
  actionText,
  onAction,
  style,
  iconColor = '#d1d5db',
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={icon} size={64} color={iconColor} />
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionText && onAction && (
        <Text style={styles.actionText} onPress={onAction}>
          {actionText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: accountingTheme.spacing.lg,
  },
  title: {
    fontSize: accountingTheme.fontSizes.xxl,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: '#1f2937',
    marginTop: accountingTheme.spacing.lg,
    textAlign: 'center',
  },
  description: {
    fontSize: accountingTheme.fontSizes.lg,
    color: '#6b7280',
    marginTop: accountingTheme.spacing.sm,
    textAlign: 'center',
    maxWidth: 300,
  },
  actionText: {
    fontSize: accountingTheme.fontSizes.lg,
    color: accountingTheme.colors.primary,
    marginTop: accountingTheme.spacing.lg,
    fontWeight: accountingTheme.fontWeights.semiBold,
  },
});
