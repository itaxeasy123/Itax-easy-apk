import React from 'react';
import { View } from 'react-native';

export const VStack = ({ children, space = 4, style, ...props }: any) => {
  return (
    <View style={[{ flexDirection: 'column', gap: space * 4 }, style]} {...props}>
      {children}
    </View>
  );
};
