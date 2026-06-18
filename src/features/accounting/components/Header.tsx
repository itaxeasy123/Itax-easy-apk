import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { accountingTheme } from "../../../theme/accounting";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightContent?: React.ReactNode;
  style?: ViewStyle;
}

export default function Header({
  title,
  subtitle,
  showBackButton = true,
  onBackPress,
  rightContent,
  style,
}: HeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        {showBackButton && (
          <Pressable onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={accountingTheme.colors.primary} />
          </Pressable>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightContent && <View style={styles.rightContent}>{rightContent}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingTop: accountingTheme.spacing.sm,
    paddingBottom: accountingTheme.spacing.sm,
    backgroundColor: accountingTheme.colors.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 6,
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: accountingTheme.fontSizes.xxl,
    fontWeight: accountingTheme.fontWeights.bold,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: accountingTheme.fontSizes.sm,
    color: '#6b7280',
    marginTop: 2,
  },
  rightContent: {
    marginLeft: accountingTheme.spacing.md,
  },
});
