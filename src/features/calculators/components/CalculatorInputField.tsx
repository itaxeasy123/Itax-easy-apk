import { Text, TextInput, View } from 'react-native';

import { calculatorStyles, colors } from '../../../theme';

type CalculatorInputFieldProps = {
  keyboardType?: 'decimal-pad' | 'default' | 'number-pad';
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

export default function CalculatorInputField({
  keyboardType = 'default',
  label,
  onChangeText,
  placeholder,
  value,
}: CalculatorInputFieldProps) {
  return (
    <View style={calculatorStyles.fieldGroup}>
      <Text style={calculatorStyles.fieldLabel}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        style={calculatorStyles.inputField}
        value={value}
      />
    </View>
  );
}
