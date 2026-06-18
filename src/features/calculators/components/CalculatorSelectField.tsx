import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { calculatorStyles, colors } from '../../../theme';

type CalculatorSelectFieldProps = {
  label: string;
  onPress: () => void;
  value: string;
};

export default function CalculatorSelectField({
  label,
  onPress,
  value,
}: CalculatorSelectFieldProps) {
  return (
    <View style={calculatorStyles.fieldGroup}>
      <Text style={calculatorStyles.fieldLabel}>{label}</Text>
      <Pressable onPress={onPress} style={calculatorStyles.selectField}>
        <Text style={calculatorStyles.selectText}>{value}</Text>
        <Ionicons color={colors.textLight} name="chevron-down" size={16} />
      </Pressable>
    </View>
  );
}
