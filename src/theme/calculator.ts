import { StyleSheet } from 'react-native';

import { colors } from './colors';
import { spacing } from './metrics';
import { radius } from './radius';
import { fontSizes, fontWeights } from './typography';

export const calculatorTheme = {
  background: colors.white,
  headerGradientStart: '#4480DF',
  headerGradientEnd: '#4FD0BA',
  headerText: colors.white,
  fieldLabel: '#22344A',
  fieldText: '#455468',
  fieldBorder: '#D5DDE8',
  fieldBackground: colors.surface,
  summaryBorder: '#E6EBF2',
  summaryDivider: '#EEF2F7',
  summaryValue: colors.primary,
  chartTrack: '#BEC8BC',
  chartFill: '#53A8FF',
  legendText: colors.textMuted,
} as const;

export const calculatorStyles = StyleSheet.create({
  screenSafeArea: {
    backgroundColor: calculatorTheme.background,
    flex: 1,
  },
  screenContent: {
    flex: 1,
    paddingHorizontal: spacing.md - 4,
    paddingTop: spacing.sm - 2,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 62,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 4,
    position: 'relative',
  },
  headerIcon: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    position: 'relative',
    width: 34,
    zIndex: 1,
  },
  headerTitle: {
    color: calculatorTheme.headerText,
    fontSize: fontSizes.sm + 5,
    fontWeight: fontWeights.bold,
    position: 'relative',
    zIndex: 1,
  },
  headerRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm + 2,
    position: 'relative',
    width: 52,
    zIndex: 1,
  },
  fieldGroup: {
    marginTop: spacing.sm + 2,
  },
  fieldLabel: {
    color: calculatorTheme.fieldLabel,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    marginBottom: spacing.xs + 2,
  },
  inputField: {
    backgroundColor: calculatorTheme.fieldBackground,
    borderColor: calculatorTheme.fieldBorder,
    borderRadius: radius.sm - 3,
    borderWidth: 1,
    color: calculatorTheme.fieldText,
    fontSize: fontSizes.sm,
    height: 36,
    paddingHorizontal: spacing.sm + 2,
  },
  selectField: {
    alignItems: 'center',
    backgroundColor: calculatorTheme.fieldBackground,
    borderColor: calculatorTheme.fieldBorder,
    borderRadius: radius.sm - 3,
    borderWidth: 1,
    flexDirection: 'row',
    height: 36,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm + 2,
  },
  selectText: {
    color: calculatorTheme.fieldText,
    fontSize: fontSizes.sm,
  },
  summaryCard: {
    backgroundColor: calculatorTheme.fieldBackground,
    borderColor: calculatorTheme.summaryBorder,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginTop: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 2,
  },
  summaryRow: {
    alignItems: 'center',
    borderBottomColor: calculatorTheme.summaryDivider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  summaryLabel: {
    color: calculatorTheme.fieldLabel,
    fontSize: fontSizes.sm,
  },
  summaryValue: {
    color: calculatorTheme.summaryValue,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
});
