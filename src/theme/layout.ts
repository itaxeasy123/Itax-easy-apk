import { useWindowDimensions } from 'react-native';

import { spacing } from './metrics';

export const layout = {
  screenMaxWidth: 480,
  screenPadding: spacing.md,
  compactScreenPadding: spacing.sm,
  bottomNavHeight: 64,
} as const;

export function useResponsiveLayout() {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 360;
  const screenPadding = isSmallDevice
    ? layout.compactScreenPadding
    : layout.screenPadding;

  return {
    isSmallDevice,
    screenPadding,
    width,
  };
}
