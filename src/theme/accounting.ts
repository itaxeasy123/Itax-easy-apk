import { fontSizes, fontWeights } from './typography';

export const accountingTheme = {
  colors: {
    primary: '#2563EB',
    primaryLight: '#DBEAFE',
    background: '#F5F9FF',
    card: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    error: '#DC2626',
    purple: '#8B5CF6',
    white: '#FFFFFF',
    black: '#000000',
    borderLight: '#F1F5F9',
    borderMedium: '#E2E8F0',
    surfaceLight: '#EEF2F7',
    successLight: '#DCFCE7',
    warningLight: '#FEF3C7',
    dangerLight: '#FEF2F2',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 12,
    xl: 14,
    xxl: 16,
    full: 9999,
  },
  typography: {
    eyebrow: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.bold,
      letterSpacing: 0.4,
    },
    title: {
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.extraBold,
    },
    sectionTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
    },
    body: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
    },
    caption: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.regular,
    },
    small: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
    },
  },
  fontSizes: {
    ...fontSizes,
    xxxl: 20,
  },
  fontWeights: {
    ...fontWeights,
    semiBold: fontWeights.semibold,
  },
};
