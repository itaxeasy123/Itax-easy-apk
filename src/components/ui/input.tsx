import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

export const Input = ({ children, style, ...props }: any) => {
  return (
    <View style={[styles.inputContainer, style]} {...props}>
      {children}
    </View>
  );
};

export const InputField = ({ style, ...props }: any) => {
  return (
    <TextInput
      style={[styles.inputField, style]}
      placeholderTextColor="#7B8190"
      {...props}
    />
  );
};

export const InputIcon = ({ as: Icon, ...props }: any) => {
  if (!Icon) return null;
  return <Icon size={16} color="#6B7280" {...props} />;
};

export const InputSlot = ({ children, style }: any) => {
  return <View style={[styles.slot, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderWidth: 1,
    borderColor: '#C9D2E3',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  inputField: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#111827',
    height: '100%',
  },
  slot: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
