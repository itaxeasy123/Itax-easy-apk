import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export const Button = ({ children, style, variant = 'solid', size = 'md', onPress, ...props }: any) => {
  const isOutline = variant === 'outline';
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.button,
        isOutline ? styles.outline : styles.solid,
        size === 'sm' && styles.sizeSm,
        style
      ]}
      onPress={onPress}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === ButtonText) {
          return React.cloneElement(child, { isOutline } as any);
        }
        return child;
      })}
    </TouchableOpacity>
  );
};

export const ButtonText = ({ children, style, isOutline }: any) => {
  return (
    <Text style={[styles.text, isOutline ? styles.textOutline : styles.textSolid, style]}>
      {children}
    </Text>
  );
};

export const ButtonSpinner = () => <ActivityIndicator color="#FFFFFF" size="small" />;

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 6,
  },
  solid: {
    backgroundColor: '#4B83F5',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4B83F5',
  },
  sizeSm: {
    height: 36,
    paddingHorizontal: 12,
  },
  sizeMd: {
    height: 42,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  textSolid: {
    color: '#FFFFFF',
  },
  textOutline: {
    color: '#4B83F5',
  },
});
