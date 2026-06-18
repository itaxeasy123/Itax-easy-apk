import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { calculatorStyles } from '../../../../theme';

type Props = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export default function TdsSelectField({ label, value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={calculatorStyles.fieldGroup}>
      <Text style={calculatorStyles.fieldLabel}>{label}</Text>

      <Pressable onPress={() => setOpen((current) => !current)} style={calculatorStyles.selectField}>
        <Text style={calculatorStyles.selectText}>{value}</Text>
      </Pressable>

      {open ? (
        <View
          style={{
            borderColor: '#E6EBF2',
            borderRadius: 10,
            borderWidth: 1,
            marginTop: 6,
            overflow: 'hidden',
          }}
        >
          {options.map((option, index) => (
            <Pressable
              key={option}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              style={{
                backgroundColor: '#FFFFFF',
                borderBottomColor: '#EEF2F7',
                borderBottomWidth: index === options.length - 1 ? 0 : 1,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <Text style={{ color: '#22344A', fontSize: 14 }}>{option}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
