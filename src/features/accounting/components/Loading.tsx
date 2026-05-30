import React from 'react';
import { accountingTheme } from "../../../theme/accounting";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  Text,
} from 'react-native';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
}

export default function Loading({
  size = 'large',
  color = accountingTheme.colors.primary,
  text,
  style,
  fullScreen = false,
}: LoadingProps) {
  if (fullScreen) {
    return (
      <View style={[styles.fullScreenContainer, style]}>
        <ActivityIndicator size={size} color={color} />
        {text && <Text style={styles.loadingText}>{text}</Text>}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.loadingText}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accountingTheme.colors.card,
  },
  loadingText: {
    marginTop: accountingTheme.spacing.md,
    fontSize: accountingTheme.fontSizes.lg,
    color: '#6b7280',
    fontWeight: accountingTheme.fontWeights.medium,
  },
});
