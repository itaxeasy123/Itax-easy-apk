import React, { useState } from "react";
import { View, Text, Pressable, Platform, StyleSheet, StyleProp, ViewStyle } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

export const DATE_FORMAT = "YYYY-MM-DD";

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export const isValidIsoDate = (value: string) => {
  if (!ISO_RE.test(value)) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
};

const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const displayDate = (iso: string) => {
  if (!isValidIsoDate(iso)) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

interface DateFieldProps {
  /** ISO date string (YYYY-MM-DD) or "" */
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

/**
 * Shared date input for the accounting section.
 *  - Native (iOS/Android): opens the system calendar picker — letters or
 *    malformed dates are impossible by construction.
 *  - Web: typed input restricted to digits/dashes, validated as
 *    YYYY-MM-DD (real calendar dates only) with an inline error.
 * Value is always stored as ISO YYYY-MM-DD; shown as DD/MM/YYYY.
 */
export default function DateField({ value, onChange, placeholder = "Select date", style, disabled }: DateFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [webText, setWebText] = useState(value);
  const [webError, setWebError] = useState<string | null>(null);

  if (Platform.OS === "web") {
    // Native HTML date input: shows the browser's small calendar popup
    // and makes letters / malformed dates impossible by construction.
    const handleWebChange = (e: any) => {
      const picked = String(e?.target?.value ?? "");
      setWebText(picked);
      if (picked === "" || isValidIsoDate(picked)) {
        setWebError(null);
        onChange(picked);
      } else {
        setWebError(`Enter a valid date as ${DATE_FORMAT}`);
      }
    };
    return (
      <View style={style}>
        <View style={[styles.inputRow, webError ? styles.inputRowError : null]}>
          {React.createElement("input", {
            type: "date",
            value: isValidIsoDate(value) ? value : webText,
            onChange: handleWebChange,
            disabled,
            "aria-label": placeholder,
            style: {
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 14,
              color: "#0F172A",
              backgroundColor: "transparent",
              fontFamily: "inherit",
              padding: 0,
            },
          })}
        </View>
        {webError ? <Text style={styles.errorText}>{webError}</Text> : null}
      </View>
    );
  }

  const current = isValidIsoDate(value) ? new Date(value) : new Date();

  const handlePicked = (event: DateTimePickerEvent, picked?: Date) => {
    setShowPicker(false);
    if (event.type === "set" && picked) {
      onChange(toIso(picked));
    }
  };

  return (
    <View style={style}>
      <Pressable
        style={styles.inputRow}
        onPress={() => !disabled && setShowPicker(true)}
        accessibilityRole="button"
        accessibilityLabel={placeholder}
      >
        <Text style={value ? styles.valueText : styles.placeholderText}>
          {value ? displayDate(value) : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={16} color="#64748B" />
      </Pressable>
      {showPicker ? (
        <DateTimePicker value={current} mode="date" display="default" onChange={handlePicked} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 46,
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  inputRowError: {
    borderColor: "#DC2626",
  },
  webInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },
  valueText: {
    fontSize: 14,
    color: "#0F172A",
  },
  placeholderText: {
    fontSize: 14,
    color: "#94A3B8",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 11,
    marginTop: 4,
  },
});
