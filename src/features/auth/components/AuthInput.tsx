import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';

type AuthInputProps = TextInputProps & {
  secureToggle?: boolean;
};

export default function AuthInput({
  secureToggle = false,
  style,
  ...props
}: AuthInputProps) {
  const [hidden, setHidden] = useState(secureToggle);

  return (
    <View style={styles.container}>
      <TextInput
        placeholderTextColor="#9AA5BD"
        secureTextEntry={hidden}
        style={[styles.input, style]}
        {...props}
      />

      {secureToggle ? (
        <TouchableOpacity
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => setHidden((value) => !value)}
          style={styles.iconButton}
        >
          <Feather
            color="#9AA5BD"
            name={hidden ? 'eye-off' : 'eye'}
            size={15}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#B8C4D8',
    borderRadius: 8,
    color: '#20304B',
    fontSize: 12,
    height: 38,
    paddingHorizontal: 12,
    paddingRight: 38,
  },
  iconButton: {
    position: 'absolute',
    right: 12,
  },
});
