import React from 'react';
import { accountingTheme } from "../../../theme/accounting";
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
  GestureResponderEvent,
} from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: (event: GestureResponderEvent) => void;
  pressable?: boolean;
}

export default function Card({
  children,
  style,
  onPress,
  pressable = false,
}: CardProps) {
  if (pressable && onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [
        styles.card,
        styles.pressableCard,
        pressed && styles.pressed,
        style,
      ]}>
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: accountingTheme.colors.card,
    borderRadius: accountingTheme.radius.xl,
    borderWidth: 1,
    borderColor: accountingTheme.colors.border,
    padding: accountingTheme.spacing.md,
    marginBottom: accountingTheme.spacing.sm,
    // Use boxShadow (cross-platform) instead of deprecated shadow* props
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  pressableCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: '#f9fafb',
  },
});
