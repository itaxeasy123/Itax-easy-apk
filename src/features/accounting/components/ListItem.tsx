import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { accountingTheme } from "../../../theme/accounting";

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ComponentProps<typeof Ionicons>['name'];
  rightIcon?: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  badge?: string;
  disabled?: boolean;
}

export default function ListItem({
  title,
  subtitle,
  leftIcon,
  rightIcon = 'chevron-forward',
  onPress,
  style,
  badge,
  disabled = false,
}: ListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {leftIcon && (
        <Ionicons
          name={leftIcon}
          size={24}
          color="#6b7280"
          style={styles.leftIcon}
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {badge && <Text style={styles.badge}>{badge}</Text>}
      {rightIcon && (
        <Ionicons
          name={rightIcon}
          size={20}
          color="#d1d5db"
          style={styles.rightIcon}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingVertical: accountingTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: accountingTheme.colors.card,
  },
  pressed: {
    backgroundColor: '#f9fafb',
  },
  leftIcon: {
    marginRight: accountingTheme.spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.semiBold,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: accountingTheme.fontSizes.sm,
    color: '#9ca3af',
    marginTop: accountingTheme.spacing.xs,
  },
  badge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    paddingHorizontal: accountingTheme.spacing.sm,
    paddingVertical: accountingTheme.spacing.xs,
    borderRadius: 4,
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.semiBold,
    marginRight: accountingTheme.spacing.md,
  },
  rightIcon: {
    marginLeft: accountingTheme.spacing.sm,
  },
});
