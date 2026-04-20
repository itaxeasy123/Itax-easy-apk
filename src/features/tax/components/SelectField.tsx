import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import { calculatorStyles } from "../../../theme";

type Props = {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
};

export default function SelectField({
  label,
  value,
  options,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={calculatorStyles.fieldGroup}>
      <Text style={calculatorStyles.fieldLabel}>{label}</Text>

      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={calculatorStyles.selectField}
      >
        <Text style={calculatorStyles.selectText}>{value}</Text>
      </TouchableOpacity>

      {open && (
        <View
          style={{
            borderWidth: 1,
            borderColor: "#E6EBF2",
            borderRadius: 10,
            marginTop: 6,
            overflow: "hidden",
          }}
        >
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => {
                onChange(opt);
                setOpen(false);
              }}
              style={{
                backgroundColor: "#fff",
                borderBottomWidth: opt === options[options.length - 1] ? 0 : 1,
                borderBottomColor: "#EEF2F7",
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <Text style={{ color: "#22344A", fontSize: 14 }}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
