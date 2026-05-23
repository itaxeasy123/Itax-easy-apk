import { Text, TextInput, View } from 'react-native';

import { calculatorStyles, colors } from '../../../theme';
import { sanitizeNumberInput } from '../../../utils/formatters';

type CalculatorInputFieldProps = {
  keyboardType?: 'decimal-pad' | 'default' | 'number-pad';
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
  infoText?: string;
  editable?: boolean;
};

export default function CalculatorInputField({
  keyboardType = 'default',
  label,
  onChangeText,
  placeholder,
  value,
  infoText,
  editable = true,
}: CalculatorInputFieldProps) {
  const handleTextChange = (text: string) => {
    // Only apply sanitization for numeric pads
    if (keyboardType === 'decimal-pad' || keyboardType === 'number-pad') {
      onChangeText(sanitizeNumberInput(text));
    } else {
      onChangeText(text);
    }
  };

  return (
    <View style={[calculatorStyles.fieldGroup, !editable && { opacity: 0.6 }]}>
      <Text style={calculatorStyles.fieldLabel}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        style={calculatorStyles.inputField}
        value={value}
        editable={editable}
      />
      {infoText && (
        <Text style={{ fontSize: 11, color: colors.textLight, marginTop: 4, marginLeft: 4 }}>
          {infoText}
        </Text>
      )}
    </View>
  );
}
