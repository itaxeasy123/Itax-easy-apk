import React, { createContext, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FormControlContext = createContext({ isInvalid: false, isRequired: false });

export const FormControl = ({ isInvalid, isRequired, children, style, ...props }: any) => {
  return (
    <FormControlContext.Provider value={{ isInvalid, isRequired }}>
      <View style={[styles.container, style]} {...props}>
        {children}
      </View>
    </FormControlContext.Provider>
  );
};

export const FormControlLabel = ({ children }: any) => <View style={styles.labelContainer}>{children}</View>;

export const FormControlLabelText = ({ children }: any) => {
  const { isRequired } = useContext(FormControlContext);
  return (
    <Text style={styles.labelText}>
      {children} {isRequired && <Text style={{ color: 'red' }}>*</Text>}
    </Text>
  );
};

export const FormControlError = ({ children }: any) => {
  const { isInvalid } = useContext(FormControlContext);
  if (!isInvalid) return null;
  return <View style={styles.errorContainer}>{children}</View>;
};

export const FormControlErrorText = ({ children }: any) => <Text style={styles.errorText}>{children}</Text>;

export const FormControlErrorIcon = ({ as: Icon, ...props }: any) => {
  if (!Icon) return null;
  return <Icon size={14} color="#EF4444" {...props} />;
};

export const FormControlHelper = ({ children }: any) => <View style={styles.helperContainer}>{children}</View>;

export const FormControlHelperText = ({ children }: any) => <Text style={styles.helperText}>{children}</Text>;

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  labelContainer: {
    marginBottom: 4,
  },
  labelText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    marginLeft: 4,
  },
  helperContainer: {
    marginTop: 4,
  },
  helperText: {
    color: '#6B7280',
    fontSize: 11,
  },
});
