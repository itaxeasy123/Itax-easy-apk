import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { calculatorStyles, calculatorTheme, colors } from '../../../theme';

type CalculatorHeaderProps = {
  onBackPress: () => void;
  title: string;
  hideIcons?: boolean;
};

function hexToRgb(hex: string) {
  const value = hex.replace('#', '');
  return {
    b: parseInt(value.slice(4, 6), 16),
    g: parseInt(value.slice(2, 4), 16),
    r: parseInt(value.slice(0, 2), 16),
  };
}

function interpolateColor(start: string, end: string, progress: number) {
  const first = hexToRgb(start);
  const second = hexToRgb(end);
  const channel = (from: number, to: number) =>
    Math.round(from + (to - from) * progress);

  return `rgb(${channel(first.r, second.r)}, ${channel(first.g, second.g)}, ${channel(first.b, second.b)})`;
}

function HeaderGradient() {
  return (
    <View style={StyleSheet.absoluteFillObject}>
      {Array.from({ length: 18 }, (_, index) => {
        const progress = index / 17;
        return (
          <View
            key={`calculator-gradient-${index}`}
            style={{
              backgroundColor: interpolateColor(
                calculatorTheme.headerGradientStart,
                calculatorTheme.headerGradientEnd,
                progress
              ),
              flex: 1,
            }}
          />
        );
      })}
    </View>
  );
}

export default function CalculatorHeader({
  onBackPress,
  title,
  hideIcons,
}: CalculatorHeaderProps) {
  return (
    <View style={calculatorStyles.header}>
      <HeaderGradient />

      <Pressable onPress={onBackPress} style={calculatorStyles.headerIcon}>
        <Ionicons color={colors.white} name="chevron-back" size={24} />
      </Pressable>

      <Text style={calculatorStyles.headerTitle}>{title}</Text>

      <View style={calculatorStyles.headerRight}>
        {!hideIcons && (
          <>
            <Ionicons color={colors.white} name="share-social-outline" size={19} />
            <Ionicons color={colors.white} name="download-outline" size={19} />
          </>
        )}
      </View>
    </View>
  );
}
